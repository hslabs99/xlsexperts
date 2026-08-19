import 'server-only'

import path from 'path'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  CASE_STUDIES_HOME_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import { fetchAllCaseStudyRecords } from '@/lib/case-studies-db'
import {
  selectHomeCaseStudies,
  type CaseStudiesHomeSnapshot,
  type CaseStudyRecord,
} from '@/lib/case-studies-shared'
import { writeGeneratedFile } from '@/lib/write-generated-file'
import {
  archiveHomeCaseStudies,
  normalizeHomeCaseStudiesContent,
  type HomeCaseStudiesContent,
  type PublishedCaseStudiesHomeFile,
} from '@/lib/case-studies-home'

const GENERATED_RELATIVE = path.join('data', 'case-studies-home.generated.ts')

function firestoreUpdatedAt(raw: unknown): string | null {
  if (raw && typeof raw === 'object' && 'toDate' in raw) {
    try {
      return (raw as { toDate: () => Date }).toDate().toISOString()
    } catch {
      return null
    }
  }
  return typeof raw === 'string' ? raw : null
}

function serializeGeneratedFile(payload: PublishedCaseStudiesHomeFile): string {
  const json = JSON.stringify(payload, null, 2)
  return `/**
 * PUBLISHED homepage case studies — imported by the public site (no Firestore on first paint).
 * Edit in Admin → Case Studies, then Publish homepage (or CMS → Publish).
 *
 * Generated at ${payload.publishedAt}
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedCaseStudiesHomeFile } from '@/lib/case-studies-home'

const published = ${json} as PublishedCaseStudiesHomeFile

export const PUBLISHED_CASE_STUDIES_HOME = published

export default published
`
}

export type HomeCaseStudiesDraft = HomeCaseStudiesContent & {
  publishedAt: string | null
  updatedAt: string | null
}

/**
 * Load homepage case studies snapshot from Firestore (localhost preview).
 */
export async function fetchHomeCaseStudiesDraft(): Promise<HomeCaseStudiesDraft> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CASE_STUDIES_HOME_DOC_ID)
    .get()

  if (!snap.exists) {
    return {
      ...archiveHomeCaseStudies(),
      publishedAt: null,
      updatedAt: null,
    }
  }

  const data = snap.data() as Record<string, unknown>
  const content = normalizeHomeCaseStudiesContent(data)
  return {
    ...content,
    publishedAt: typeof data.publishedAt === 'string' ? data.publishedAt : null,
    updatedAt: firestoreUpdatedAt(data.updatedAt),
  }
}

/**
 * Write generated file + Firestore snapshot from the caseStudies collection.
 * Production homepage imports the file — zero database on first paint.
 */
export async function publishHomeCaseStudiesSnapshot(
  records?: CaseStudyRecord[]
): Promise<
  CaseStudiesHomeSnapshot & {
    publishedAt: string
    filePath: string
    hasMore: boolean
  }
> {
  const all = records ?? (await fetchAllCaseStudyRecords())
  const items = selectHomeCaseStudies(all)
  const publishedCount = all.filter((record) => record.published).length
  const fallback = archiveHomeCaseStudies()
  const content: HomeCaseStudiesContent =
    items.length > 0
      ? { items, hasMore: publishedCount > items.length }
      : fallback

  const publishedAt = new Date().toISOString()
  const payload: PublishedCaseStudiesHomeFile = {
    version: 1,
    publishedAt,
    items: content.items,
    hasMore: content.hasMore,
  }

  await writeGeneratedFile(GENERATED_RELATIVE, serializeGeneratedFile(payload))

  const slugs = content.items.map((item) => item.slug)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CASE_STUDIES_HOME_DOC_ID)
    .set(
      {
        items: content.items,
        slugs,
        hasMore: content.hasMore,
        publishedAt,
        updatedAt: publishedAt,
      },
      { merge: true }
    )

  return {
    items: content.items,
    slugs,
    hasMore: content.hasMore,
    publishedAt,
    updatedAt: publishedAt,
    filePath: GENERATED_RELATIVE,
  }
}
