/**
 * Client-safe types for the Wix → Firebase missing-blog harvest queue.
 */

import type { BlogSection } from '@/lib/types'

export type BlogSeedTodoStatus =
  | 'pending'
  | 'imported'
  | 'duplicate'
  | 'failed'
  | 'skipped'

export type BlogSeedTodoItem = {
  slug: string
  sourceUrl: string
  sortOrder: number
  status: BlogSeedTodoStatus
  title?: string
  category?: string
  lastError?: string
  lastHttpStatus?: number
  /** Existing published/draft post that blocked import */
  duplicateNote?: string
  lastAttemptAt?: string | null
  importedAt?: string | null
  updatedAt?: string | null
  createdAt?: string | null
}

export type BlogSeedHarvestPost = {
  slug: string
  title: string
  author: string
  date: string
  readTime: string
  excerpt: string
  image: string
  category: string
  sections: BlogSection[]
  published: boolean
  /** Original Wix post URL for side-by-side comparison */
  sourceUrl?: string
  /** Wix (or remote) hero URL before Storage upload */
  sourceImageUrl?: string
}

export type BlogSeedHarvestItemResult = {
  slug: string
  sourceUrl: string
  status: BlogSeedTodoStatus
  title?: string
  category?: string
  httpStatus?: number
  error?: string
  duplicateNote?: string
  imageUploaded?: boolean
  /** Why hero upload used a fallback / failed */
  imageNote?: string
  sourceImageUrl?: string
  sectionCount?: number
  /** Full post payload when imported (for instant preview). */
  post?: BlogSeedHarvestPost
}

export type BlogSeedHarvestResult = {
  attempted: number
  imported: number
  duplicates: number
  failed: number
  skipped: number
  items: BlogSeedHarvestItemResult[]
}
