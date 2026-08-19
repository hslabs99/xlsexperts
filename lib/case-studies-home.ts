/**
 * Homepage case studies snapshot (first-paint cards + whether “Show more” exists).
 * Public pages read the published static file — never Firestore.
 */

import { CASE_STUDIES_ARCHIVE } from '@/lib/case-studies-archive'
import { HOME_CASE_STUDIES_LIMIT } from '@/lib/case-studies-shared'
import type { CaseStudy } from '@/lib/types'

export type HomeCaseStudiesContent = {
  items: CaseStudy[]
  hasMore: boolean
}

export type PublishedCaseStudiesHomeFile = {
  version: 1
  publishedAt: string
  items: CaseStudy[]
  hasMore: boolean
}

function pickString(raw: unknown, fallback = ''): string {
  return typeof raw === 'string' ? raw.trim() : fallback
}

function pickStringList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.map(String).map((item) => item.trim()).filter(Boolean)
}

function pickSlugList(raw: unknown): string[] {
  return pickStringList(raw).map((item) => item.replace(/^\//, ''))
}

export function archiveHomeCaseStudies(): HomeCaseStudiesContent {
  const items = CASE_STUDIES_ARCHIVE.map(
    ({ localImage: _local, ...publicFields }) => publicFields
  )
  return {
    items: items.slice(0, HOME_CASE_STUDIES_LIMIT),
    hasMore: items.length > HOME_CASE_STUDIES_LIMIT,
  }
}

export function normalizeCaseStudyCard(raw: unknown): CaseStudy | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const slug = pickString(data.slug)
  const title = pickString(data.title)
  if (!slug || !title) return null
  return {
    slug,
    client: pickString(data.client),
    sector: pickString(data.sector),
    title,
    image: pickString(data.image),
    problem: pickString(data.problem),
    solution: pickString(data.solution),
    outcome: pickString(data.outcome),
    tags: pickStringList(data.tags),
    serviceSlugs: pickSlugList(data.serviceSlugs),
    solutionSlugs: pickSlugList(data.solutionSlugs),
  }
}

export function normalizeHomeCaseStudiesContent(
  raw: unknown
): HomeCaseStudiesContent {
  const fallback = archiveHomeCaseStudies()
  const wrapper =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const source =
    wrapper.content && typeof wrapper.content === 'object'
      ? (wrapper.content as Record<string, unknown>)
      : wrapper
  const itemsRaw = Array.isArray(source.items) ? source.items : []
  const items = itemsRaw
    .map(normalizeCaseStudyCard)
    .filter((item): item is CaseStudy => item !== null)
    .slice(0, HOME_CASE_STUDIES_LIMIT)
  if (items.length === 0) return fallback
  const hasMore =
    typeof source.hasMore === 'boolean'
      ? source.hasMore
      : fallback.hasMore
  return { items, hasMore }
}

export function normalizePublishedCaseStudiesHome(
  raw: unknown
): PublishedCaseStudiesHomeFile {
  const content = normalizeHomeCaseStudiesContent(raw)
  const wrapper =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const publishedAt =
    typeof wrapper.publishedAt === 'string' && wrapper.publishedAt
      ? wrapper.publishedAt
      : new Date(0).toISOString()
  return {
    version: 1,
    publishedAt,
    items: content.items,
    hasMore: content.hasMore,
  }
}
