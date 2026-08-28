/**
 * Client-safe case study types/helpers (no Firebase Admin).
 * Server DB code lives in `case-studies-db.ts`.
 */

import type { CaseStudy } from '@/lib/types'

/** First-paint card counts the admin can choose. */
export const HOME_CASE_STUDIES_INITIAL_COUNTS = [4, 6, 8] as const
export type HomeCaseStudiesInitialCount =
  (typeof HOME_CASE_STUDIES_INITIAL_COUNTS)[number]

/** “Show more” batch sizes (even numbers, matching the 2-column grid). */
export const HOME_CASE_STUDIES_MORE_PAGE_SIZES = [2, 4, 6, 8] as const
export type HomeCaseStudiesMorePageSize =
  (typeof HOME_CASE_STUDIES_MORE_PAGE_SIZES)[number]

/** Default first-paint count (and seed). */
export const HOME_CASE_STUDIES_LIMIT: HomeCaseStudiesInitialCount = 4
/** Maximum studies that can be marked Show on home. */
export const HOME_CASE_STUDIES_MAX: HomeCaseStudiesInitialCount = 8
export const MORE_CASE_STUDIES_PAGE_SIZE: HomeCaseStudiesMorePageSize = 4

export type HomeCaseStudiesDisplay = {
  initialCount: HomeCaseStudiesInitialCount
  morePageSize: HomeCaseStudiesMorePageSize
}

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
  hasMore?: boolean
  initialCount?: HomeCaseStudiesInitialCount
  morePageSize?: HomeCaseStudiesMorePageSize
  publishedAt?: string | null
  updatedAt: unknown
}

export function isHomeCaseStudiesInitialCount(
  value: unknown,
): value is HomeCaseStudiesInitialCount {
  return (
    typeof value === 'number' &&
    (HOME_CASE_STUDIES_INITIAL_COUNTS as readonly number[]).includes(value)
  )
}

export function isHomeCaseStudiesMorePageSize(
  value: unknown,
): value is HomeCaseStudiesMorePageSize {
  return (
    typeof value === 'number' &&
    (HOME_CASE_STUDIES_MORE_PAGE_SIZES as readonly number[]).includes(value)
  )
}

export function normalizeHomeInitialCount(
  raw: unknown,
): HomeCaseStudiesInitialCount {
  const n = typeof raw === 'number' ? raw : Number(raw)
  return isHomeCaseStudiesInitialCount(n) ? n : HOME_CASE_STUDIES_LIMIT
}

export function normalizeMorePageSize(
  raw: unknown,
): HomeCaseStudiesMorePageSize {
  const n = typeof raw === 'number' ? raw : Number(raw)
  return isHomeCaseStudiesMorePageSize(n)
    ? n
    : MORE_CASE_STUDIES_PAGE_SIZE
}

export function normalizeHomeDisplaySettings(
  raw: unknown,
): HomeCaseStudiesDisplay {
  const source =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const nested =
    source.content && typeof source.content === 'object'
      ? (source.content as Record<string, unknown>)
      : source
  return {
    initialCount: normalizeHomeInitialCount(nested.initialCount),
    morePageSize: normalizeMorePageSize(nested.morePageSize),
  }
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
  records: CaseStudyRecord[],
  limit: number = HOME_CASE_STUDIES_LIMIT,
): CaseStudy[] {
  const cap = Math.max(0, Math.min(HOME_CASE_STUDIES_MAX, Math.floor(limit)))
  return [...records]
    .filter((r) => r.published && r.showOnHome)
    .sort((a, b) => a.homeOrder - b.homeOrder || a.sortOrder - b.sortOrder)
    .slice(0, cap)
    .map(toPublicCaseStudy)
}
