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
}

export type BlogPostInput = BlogPost & {
  published?: boolean
  featured?: boolean
  sortOrder?: number
}

export type { BlogPost, BlogSection, BlogListItem }
