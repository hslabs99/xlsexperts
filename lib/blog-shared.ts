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
}

/** Legacy posts without the field are treated as visible on both sites. */
export function blogShowNz(value: unknown): boolean {
  return value !== false
}

/** Legacy posts without the field are treated as visible on both sites. */
export function blogShowUsa(value: unknown): boolean {
  return value !== false
}

export function blogVisibleOnMarket(
  record: Pick<BlogPostRecord, 'showNz' | 'showUsa'>,
  market: MarketId
): boolean {
  return market === 'nz' ? record.showNz : record.showUsa
}

export type { BlogPost, BlogSection, BlogListItem }
