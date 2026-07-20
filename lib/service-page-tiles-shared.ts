/**
 * Service-page example tiles (case-study style cards on individual service landings).
 * Not used on the homepage — homepage case studies stay in `caseStudies`.
 */

export type ServicePageTile = {
  slug: string
  tag: string
  title: string
  detail: string
  /** Service landing paths this tile appears on, e.g. `/excel-vba-development` */
  serviceHrefs: string[]
  published: boolean
  sortOrder: number
}

export type ServicePageTileInput = Omit<
  ServicePageTile,
  'slug'
> & {
  slug?: string
}

export type ServicePageTileRecord = ServicePageTile & {
  createdAt: string | null
  updatedAt: string | null
}

export type ServicePageTileArchiveItem = {
  slug: string
  tag: string
  title: string
  detail: string
  serviceHrefs: string[]
  sortOrder: number
}

export function slugifyServicePageTile(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Tiles assigned to a service page path, published only, sorted. */
export function selectTilesForServicePage(
  rows: readonly ServicePageTile[],
  serviceHref: string
): ServicePageTile[] {
  const href = serviceHref.startsWith('/') ? serviceHref : `/${serviceHref}`
  return rows
    .filter((r) => r.published && r.serviceHrefs.includes(href))
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
}
