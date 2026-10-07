/**
 * Client-safe blog types (no Firebase Admin).
 * Server DB code lives in `blog-db.ts`.
 */

import type { MarketId } from '@/lib/market'
import type { BlogPost, BlogSection, BlogListItem } from '@/lib/types'

/**
 * Where cross-domain redirects and hreflang x-default send this article.
 * Null means it was never saved. Routing then assumes NZ when NZ is ticked.
 * Single-region posts do not need a saved value.
 */
export type BlogPrimaryRegion = MarketId | null

export type BlogPostRecord = BlogPost & {
  published: boolean
  featured: boolean
  sortOrder: number
  /** Show on the New Zealand site. Missing/undefined defaults to true. */
  showNz: boolean
  /** Show on the USA / international site. Missing/undefined defaults to true. */
  showUsa: boolean
  /**
   * Show on the UK site. Missing/undefined follows `showUsa` so posts that were
   * already tagged for International stay visible on UK until edited.
   */
  showUk: boolean
  /** Saved primary. Null on older posts until someone confirms it in admin. */
  primaryRegion: BlogPrimaryRegion
  createdAt: unknown
  updatedAt: unknown
  /** Present on Wix-harvested drafts */
  sourceUrl?: string
  sourceImageUrl?: string
}

export type BlogPostInput = BlogPost & {
  published?: boolean
  featured?: boolean
  sortOrder?: number
  showNz?: boolean
  showUsa?: boolean
  showUk?: boolean
  primaryRegion?: BlogPrimaryRegion
}

/** Legacy posts without the field are treated as visible on both sites. */
export function blogShowNz(value: unknown): boolean {
  return value !== false
}

/** Legacy posts without the field are treated as visible on both sites. */
export function blogShowUsa(value: unknown): boolean {
  return value !== false
}

/**
 * UK visibility. Explicit false hides the post. Missing field inherits
 * International (`showUsa`) because UK used to share that market.
 */
export function blogShowUk(value: unknown, showUsa: unknown): boolean {
  if (value === undefined || value === null) return blogShowUsa(showUsa)
  return value !== false
}

export function blogVisibleOnMarket(
  record: Pick<BlogPostRecord, 'showNz' | 'showUsa' | 'showUk'>,
  market: MarketId
): boolean {
  if (market === 'nz') return record.showNz
  if (market === 'uk') return record.showUk
  return record.showUsa
}

/** Markets where this post returns 200 (for existence-aware hreflang). */
export function visibleMarketsForBlog(
  record: Pick<BlogPostRecord, 'showNz' | 'showUsa' | 'showUk'>
): MarketId[] {
  const markets: MarketId[] = []
  if (record.showNz) markets.push('nz')
  if (record.showUsa) markets.push('intl')
  if (record.showUk) markets.push('uk')
  return markets
}

/** Same domain set, including generic (all three). Mixed sets only match that same mix. */
export function blogRegionKey(
  record: Pick<BlogPostRecord, 'showNz' | 'showUsa' | 'showUk'>
): string {
  return visibleMarketsForBlog(record).join('+') || 'hidden'
}

export function blogRegionLabel(
  record: Pick<BlogPostRecord, 'showNz' | 'showUsa' | 'showUk'>
): string {
  const markets = visibleMarketsForBlog(record)
  if (markets.length === 3) return 'Generic'
  if (markets.length === 0) return 'Hidden'
  return markets
    .map((market) => (market === 'nz' ? 'NZ' : market === 'uk' ? 'UK' : 'US'))
    .join(' + ')
}

/** Footnote links stay inside one region so crawlers do not cross markets. */
export function blogsCanLinkRegions(
  left: Pick<BlogPostRecord, 'showNz' | 'showUsa' | 'showUk'>,
  right: Pick<BlogPostRecord, 'showNz' | 'showUsa' | 'showUk'>
): boolean {
  return blogRegionKey(left) === blogRegionKey(right)
}

export type { BlogPost, BlogSection, BlogListItem }
