/**
 * Client-safe case study types/helpers (no Firebase Admin).
 * Server DB code lives in `case-studies-db.ts`.
 */

import type { CaseStudy } from '@/lib/types'

export const HOME_CASE_STUDIES_LIMIT = 4
export const MORE_CASE_STUDIES_PAGE_SIZE = 4

export type CaseStudyRecord = CaseStudy & {
  published: boolean
  /** Included when admin publishes the homepage snapshot */
  showOnHome: boolean
  homeOrder: number
  sortOrder: number
  createdAt: unknown
  updatedAt: unknown
  serviceSlugs: string[]
  solutionSlugs: string[]
}

export type CaseStudyInput = CaseStudy & {
  published?: boolean
  showOnHome?: boolean
  homeOrder?: number
  sortOrder?: number
}

export type CaseStudiesHomeSnapshot = {
  items: CaseStudy[]
  slugs: string[]
  updatedAt: unknown
}

export function toPublicCaseStudy(record: CaseStudyRecord): CaseStudy {
  return {
    slug: record.slug,
    client: record.client,
    sector: record.sector,
    title: record.title,
    image: record.image,
    problem: record.problem,
    solution: record.solution,
    outcome: record.outcome,
    tags: record.tags,
    serviceSlugs: record.serviceSlugs ?? [],
    solutionSlugs: record.solutionSlugs ?? [],
  }
}

export function selectHomeCaseStudies(
  records: CaseStudyRecord[]
): CaseStudy[] {
  return [...records]
    .filter((r) => r.published && r.showOnHome)
    .sort((a, b) => a.homeOrder - b.homeOrder || a.sortOrder - b.sortOrder)
    .slice(0, HOME_CASE_STUDIES_LIMIT)
    .map(toPublicCaseStudy)
}
