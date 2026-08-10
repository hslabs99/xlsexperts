/**
 * Client-safe blog AI draft shape returned by the draft API.
 */
import type { BlogSection } from '@/lib/types'

export type BlogAiDraft = {
  title: string
  slug: string
  excerpt: string
  category: string
  author: string
  readTime: string
  /** Markdown body as returned by the model (for preview). */
  markdown: string
  sections: BlogSection[]
  imagePrompt: string
}
