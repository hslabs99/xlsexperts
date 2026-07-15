/**
 * Public façade for homepage case studies.
 * Prefer the published Site Content snapshot (one read) for first paint.
 */

import { CASE_STUDIES_ARCHIVE } from '@/lib/case-studies-archive'
import {
  HOME_CASE_STUDIES_LIMIT,
  fetchHomeCaseStudiesSnapshot,
  toPublicCaseStudy,
  type CaseStudyRecord,
} from '@/lib/case-studies-db'
import type { CaseStudy } from '@/lib/types'

function archiveFallbackHome(): CaseStudy[] {
  return CASE_STUDIES_ARCHIVE.slice(0, HOME_CASE_STUDIES_LIMIT).map(
    ({ localImage: _local, ...publicFields }) => publicFields
  )
}

/**
 * Homepage first paint: read the pre-rendered snapshot document.
 * Falls back to the frozen archive so the section still renders before seed.
 */
export async function getHomeCaseStudies(): Promise<CaseStudy[]> {
  try {
    const snapshot = await fetchHomeCaseStudiesSnapshot()
    if (snapshot.length > 0) return snapshot
  } catch (error) {
    console.error(
      '[case-studies] Failed to load home snapshot',
      error instanceof Error ? error.message : undefined
    )
  }
  return archiveFallbackHome()
}

export function recordsToPublic(records: CaseStudyRecord[]): CaseStudy[] {
  return records.map(toPublicCaseStudy)
}
