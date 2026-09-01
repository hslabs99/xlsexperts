import 'server-only'

import path from 'path'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  CASE_STUDIES_HOME_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import { fetchAllCaseStudyRecords } from '@/lib/case-studies-db'
import {
  normalizeHomeDisplaySettings,
  selectHomeCaseStudies,
  type CaseStudiesHomeSnapshot,
  type CaseStudyRecord,
  type HomeCaseStudiesDisplay,
} from '@/lib/case-studies-shared'
import { writeGeneratedFile } from '@/lib/write-generated-file'
import {
  archiveHomeCaseStudies,
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

async function readHomeDoc(): Promise<{
  display: HomeCaseStudiesDisplay
  publishedAt: string | null
  updatedAt: string | null
}> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CASE_STUDIES_HOME_DOC_ID)
    .get()
  if (!snap.exists) {
    return {
      display: normalizeHomeDisplaySettings(undefined),
      publishedAt: null,
      updatedAt: null,
    }
  }
  const data = snap.data() as Record<string, unknown>
  return {
    display: normalizeHomeDisplaySettings(data),
    publishedAt: typeof data.publishedAt === 'string' ? data.publishedAt : null,
    updatedAt: firestoreUpdatedAt(data.updatedAt),
  }
}

async function readHomeDisplaySettings(): Promise<HomeCaseStudiesDisplay> {
  const { display } = await readHomeDoc()
  return display
}

function snapshotFromRecords(
  records: CaseStudyRecord[],
  display: HomeCaseStudiesDisplay,
): HomeCaseStudiesContent {
  const items = selectHomeCaseStudies(records, display.initialCount)
  const publishedCount = records.filter((record) => record.published).length
  if (items.length === 0) return archiveHomeCaseStudies(display)
  return {
    items,
    hasMore: publishedCount > items.length,
    initialCount: display.initialCount,
    morePageSize: display.morePageSize,
  }
}

/**
 * Load homepage case studies for localhost preview.
 * Always re-selects from live case-study records so preload count and
 * Show-on-home toggles show up without waiting for a stale snapshot.
 */
export async function fetchHomeCaseStudiesDraft(): Promise<HomeCaseStudiesDraft> {
  const meta = await readHomeDoc()
  const all = await fetchAllCaseStudyRecords()
  const content = snapshotFromRecords(all, meta.display)
  return {
    ...content,
    publishedAt: meta.publishedAt,
    updatedAt: meta.updatedAt,
  }
}

/**
 * Save first-paint / Show more counts without writing the public generated file.
 * Localhost preview reads this draft; production still needs Publish.
 */
export async function saveHomeCaseStudiesDisplay(
  raw: unknown,
): Promise<HomeCaseStudiesDraft> {
  const meta = await readHomeDoc()
  const incoming = normalizeHomeDisplaySettings(raw)
  const display: HomeCaseStudiesDisplay = {
    initialCount:
      raw && typeof raw === 'object' && 'initialCount' in (raw as object)
        ? incoming.initialCount
        : meta.display.initialCount,
    morePageSize:
      raw && typeof raw === 'object' && 'morePageSize' in (raw as object)
        ? incoming.morePageSize
        : meta.display.morePageSize,
  }
  const all = await fetchAllCaseStudyRecords()
  const content = snapshotFromRecords(all, display)
  const updatedAt = new Date().toISOString()
  const slugs = content.items.map((item) => item.slug)

  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CASE_STUDIES_HOME_DOC_ID)
    .set(
      {
        items: content.items,
        slugs,
        hasMore: content.hasMore,
        initialCount: content.initialCount,
        morePageSize: content.morePageSize,
        updatedAt,
      },
      { merge: true },
    )

  return {
    ...content,
    publishedAt: meta.publishedAt,
    updatedAt,
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
    initialCount: HomeCaseStudiesContent['initialCount']
    morePageSize: HomeCaseStudiesContent['morePageSize']
  }
> {
  const display = await readHomeDisplaySettings()
  const all = records ?? (await fetchAllCaseStudyRecords())
  const content = snapshotFromRecords(all, display)

  const publishedAt = new Date().toISOString()
  const payload: PublishedCaseStudiesHomeFile = {
    version: 1,
    publishedAt,
    items: content.items,
    hasMore: content.hasMore,
    initialCount: content.initialCount,
    morePageSize: content.morePageSize,
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
        initialCount: content.initialCount,
        morePageSize: content.morePageSize,
        publishedAt,
        updatedAt: publishedAt,
      },
      { merge: true }
    )

  return {
    items: content.items,
    slugs,
    hasMore: content.hasMore,
    initialCount: content.initialCount,
    morePageSize: content.morePageSize,
    publishedAt,
    updatedAt: publishedAt,
    filePath: GENERATED_RELATIVE,
  }
}
