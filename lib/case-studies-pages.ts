/**
 * Published case-study pages.
 * Production reads `data/case-studies.generated.ts` after Publish.
 * Until that file has items, the public site falls back to the homepage
 * snapshot plus the frozen archive so existing cards already have a URL.
 */

import { PUBLISHED_CASE_STUDIES_HOME } from '@/data/case-studies-home.generated'
import { PUBLISHED_CASE_STUDIES } from '@/data/case-studies.generated'
import { CASE_STUDIES_ARCHIVE } from '@/lib/case-studies-archive'
import { normalizeCaseStudyCard } from '@/lib/case-studies-home'
import { servicePages } from '@/lib/service-pages'
import { getSolutionBySlug } from '@/lib/solutions'
import type { CaseStudy } from '@/lib/types'

export type PublishedCaseStudiesFile = {
  version: 1
  publishedAt: string | null
  items: CaseStudy[]
}

export type CaseStudyRelatedLink = {
  href: string
  label: string
}

function fallbackItems(): CaseStudy[] {
  const bySlug = new Map<string, CaseStudy>()
  for (const item of CASE_STUDIES_ARCHIVE) {
    const { localImage: _local, ...publicFields } = item
    bySlug.set(publicFields.slug, publicFields)
  }
  for (const item of PUBLISHED_CASE_STUDIES_HOME.items) {
    bySlug.set(item.slug, item)
  }
  const homeSlugs = PUBLISHED_CASE_STUDIES_HOME.items.map((item) => item.slug)
  const archiveOnly = CASE_STUDIES_ARCHIVE.map((item) => item.slug).filter(
    (slug) => !homeSlugs.includes(slug),
  )
  return [...homeSlugs, ...archiveOnly]
    .map((slug) => bySlug.get(slug))
    .filter((item): item is CaseStudy => Boolean(item))
}

export function normalizePublishedCaseStudies(
  raw: unknown,
): PublishedCaseStudiesFile {
  const wrapper =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const itemsRaw = Array.isArray(wrapper.items) ? wrapper.items : []
  const items = itemsRaw
    .map(normalizeCaseStudyCard)
    .filter((item): item is CaseStudy => item !== null)
  const publishedAt =
    typeof wrapper.publishedAt === 'string' && wrapper.publishedAt
      ? wrapper.publishedAt
      : null
  return { version: 1, publishedAt, items }
}

/** Catalogue the public pages and sitemap read. No Firestore. */
export function getCaseStudyCatalogue(): PublishedCaseStudiesFile {
  const file = normalizePublishedCaseStudies(PUBLISHED_CASE_STUDIES)
  if (file.items.length > 0) return file
  return { version: 1, publishedAt: null, items: fallbackItems() }
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  return (
    getCaseStudyCatalogue().items.find((item) => item.slug === slug) ?? null
  )
}

export function caseStudyPath(slug: string): string {
  return `/case-studies/${slug}`
}

function hrefKeys(href: string): string[] {
  const path = href.replace(/^\//, '').replace(/\/$/, '')
  const last = path.split('/').pop() ?? path
  return path === last ? [path] : [path, last]
}

export function caseStudiesMatchingHref(href: string): CaseStudy[] {
  const keys = new Set(hrefKeys(href))
  return getCaseStudyCatalogue()
    .items.filter((item) => {
      const tagged = [...(item.serviceSlugs ?? []), ...(item.solutionSlugs ?? [])]
      return tagged.some((slug) => keys.has(slug))
    })
    .slice(0, 3)
}

/** Up to three service or solution pages tagged on this study. */
export function relatedLinksForCaseStudy(
  study: CaseStudy,
): CaseStudyRelatedLink[] {
  const links: CaseStudyRelatedLink[] = []
  const seen = new Set<string>()
  const push = (href: string, label: string) => {
    if (!href || seen.has(href) || links.length >= 3) return
    seen.add(href)
    links.push({ href, label })
  }
  for (const slug of study.serviceSlugs ?? []) {
    const page = servicePages.find((item) => item.href.replace(/^\//, '') === slug)
    if (page) push(page.href, page.label)
  }
  for (const slug of study.solutionSlugs ?? []) {
    const page = getSolutionBySlug(slug)
    if (page) push(page.href, page.navLabel)
  }
  return links
}
