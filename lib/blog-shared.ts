/**
 * Client-safe blog types (no Firebase Admin).
 * Server DB code lives in `blog-db.ts`.
 */

import type { BlogPost, BlogSection, BlogListItem } from '@/lib/types'

export type BlogPostRecord = BlogPost & {
  published: boolean
  featured: boolean
  sortOrder: number
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
}

export type { BlogPost, BlogSection, BlogListItem }
