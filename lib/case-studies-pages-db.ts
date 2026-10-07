import 'server-only'

import path from 'path'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  CASE_STUDIES_PAGES_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import { fetchAllCaseStudyRecords } from '@/lib/case-studies-db'
import {
  toPublicCaseStudy,
  type CaseStudyRecord,
} from '@/lib/case-studies-shared'
import { writeGeneratedFile } from '@/lib/write-generated-file'
import type { PublishedCaseStudiesFile } from '@/lib/case-studies-pages'

const GENERATED_RELATIVE = path.join('data', 'case-studies.generated.ts')

function asIso(raw: unknown): string | null {
  if (raw && typeof raw === 'object' && 'toDate' in raw) {
    try {
      return (raw as { toDate: () => Date }).toDate().toISOString()
    } catch {
      return null
    }
  }
  return typeof raw === 'string' && raw ? raw : null
}

function serializeGeneratedFile(payload: PublishedCaseStudiesFile): string {
  const json = JSON.stringify(payload, null, 2)
  return `/**
 * PUBLISHED case study pages — one static page per published study.
 * Edit in Admin → Case Studies, then Publish case study pages (or CMS → Publish).
 *
 * Generated at ${payload.publishedAt}
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedCaseStudiesFile } from '@/lib/case-studies-pages'

const published = ${json} as PublishedCaseStudiesFile

export const PUBLISHED_CASE_STUDIES = published

export default published
`
}

function publishedRecords(records: CaseStudyRecord[]): CaseStudyRecord[] {
  return records
    .filter((record) => record.published && record.slug.trim() && record.title.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
}

export async function fetchCaseStudyPagesStatus(): Promise<{
  publishedAt: string | null
  updatedAt: string | null
  pageCount: number
}> {
  const [snap, records] = await Promise.all([
    getAdminDb()
      .collection(SITE_CONTENT_COLLECTION)
      .doc(CASE_STUDIES_PAGES_DOC_ID)
      .get(),
    fetchAllCaseStudyRecords(),
  ])
  const data = snap.exists
    ? (snap.data() as Record<string, unknown>)
    : {}
  const publishedAt =
    typeof data.publishedAt === 'string' ? data.publishedAt : null
  const studyUpdated = records
    .map((record) => asIso(record.updatedAt))
    .filter((value): value is string => Boolean(value))
    .sort()
  const latestStudy = studyUpdated.at(-1) ?? null
  const docUpdated = asIso(data.updatedAt)
  const updatedAt =
    latestStudy && docUpdated
      ? latestStudy > docUpdated
        ? latestStudy
        : docUpdated
      : latestStudy ?? docUpdated
  return {
    publishedAt,
    updatedAt,
    pageCount: publishedRecords(records).length,
  }
}

/**
 * Scan Firebase and write one catalogue entry per published case study.
 * The public `/case-studies/[slug]` route reads this file.
 */
export async function publishCaseStudyPages(
  records?: CaseStudyRecord[],
): Promise<PublishedCaseStudiesFile & { filePath: string; pageCount: number }> {
  const all = records ?? (await fetchAllCaseStudyRecords())
  const items = publishedRecords(all).map(toPublicCaseStudy)
  const publishedAt = new Date().toISOString()
  const payload: PublishedCaseStudiesFile = {
    version: 1,
    publishedAt,
    items,
  }

  await writeGeneratedFile(GENERATED_RELATIVE, serializeGeneratedFile(payload))

  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CASE_STUDIES_PAGES_DOC_ID)
    .set(
      {
        slugs: items.map((item) => item.slug),
        pageCount: items.length,
        publishedAt,
        updatedAt: publishedAt,
      },
      { merge: true },
    )

  return {
    ...payload,
    filePath: GENERATED_RELATIVE.replace(/\\/g, '/'),
    pageCount: items.length,
  }
}
