/**
 * Client-safe blog types (no Firebase Admin).
 * Server DB code lives in `blog-db.ts`.
 */

import type { MarketId } from '@/lib/market'
import type { BlogPost, BlogSection, BlogListItem } from '@/lib/types'

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

export type { BlogPost, BlogSection, BlogListItem }
