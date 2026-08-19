/**
 * Public façade for homepage case studies.
 * Production reads the published static file — never Firestore on first paint.
 * Localhost reads the CMS snapshot so Publish homepage previews without a deploy.
 */

import 'server-only'

import { PUBLISHED_CASE_STUDIES_HOME } from '@/data/case-studies-home.generated'
import {
  archiveHomeCaseStudies,
  normalizeHomeCaseStudiesContent,
  type HomeCaseStudiesContent,
} from '@/lib/case-studies-home'
import { getIsLocalDev } from '@/lib/market-server'
import { withTimeout } from '@/lib/with-timeout'
import { toPublicCaseStudy, type CaseStudyRecord } from '@/lib/case-studies-shared'

/** Published homepage cards — static import, zero DB. */
export function getPublishedHomeCaseStudies(): HomeCaseStudiesContent {
  try {
    return normalizeHomeCaseStudiesContent(PUBLISHED_CASE_STUDIES_HOME)
  } catch {
    return archiveHomeCaseStudies()
  }
}

/**
 * Homepage first paint.
 * Localhost: Firestore snapshot after Publish homepage.
 * Production: generated file.
 */
export async function getHomeCaseStudies(): Promise<HomeCaseStudiesContent> {
  if (await getIsLocalDev()) {
    try {
      const { fetchHomeCaseStudiesDraft } = await import(
        '@/lib/case-studies-home-db'
      )
      const draft = await withTimeout(
        fetchHomeCaseStudiesDraft(),
        6_000,
        'fetchHomeCaseStudiesDraft'
      )
      if (draft.items.length > 0) {
        return { items: draft.items, hasMore: draft.hasMore }
      }
    } catch (error) {
      console.error(
        '[case-studies] localhost snapshot unavailable, using published file',
        error instanceof Error ? error.message : error
      )
    }
  }
  return getPublishedHomeCaseStudies()
}

export function recordsToPublic(records: CaseStudyRecord[]) {
  return records.map(toPublicCaseStudy)
}
