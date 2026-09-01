import { blogSectionsToMarkdown } from '@/lib/blog-markdown'
import type { BlogPostRecord } from '@/lib/blog-shared'
import type { BlogSection } from '@/lib/types'

export type BlogExportScope = 'all' | 'selected' | 'filtered'

export type BlogExportPost = {
  slug: string
  title: string
  author: string
  date: string
  readTime: string
  excerpt: string
  image: string
  category: string
  published: boolean
  featured: boolean
  showNz: boolean
  showUsa: boolean
  showUk: boolean
  sortOrder: number
  createdAt: unknown
  updatedAt: unknown
  sourceUrl: string | null
  sourceImageUrl: string | null
  path: string
  wordCount: number
  /** Flattened article text for quality review. */
  bodyMarkdown: string
  sections: BlogSection[]
}

export type BlogExportFile = {
  exportedAt: string
  source: string
  purpose: string
  scope: BlogExportScope
  postCount: number
  posts: BlogExportPost[]
}

export function countMarkdownWords(markdown: string): number {
  return markdown.trim().split(/\s+/).filter(Boolean).length
}

export function toBlogExportPost(post: BlogPostRecord): BlogExportPost {
  const sections = post.sections ?? []
  const bodyMarkdown = blogSectionsToMarkdown(sections)
  return {
    slug: post.slug,
    title: post.title,
    author: post.author,
    date: post.date,
    readTime: post.readTime,
    excerpt: post.excerpt,
    image: post.image,
    category: post.category,
    published: post.published,
    featured: post.featured,
    showNz: post.showNz,
    showUsa: post.showUsa,
    showUk: post.showUk,
    sortOrder: post.sortOrder,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    sourceUrl: post.sourceUrl ?? null,
    sourceImageUrl: post.sourceImageUrl ?? null,
    path: `/blog/${post.slug}`,
    wordCount: countMarkdownWords(bodyMarkdown),
    bodyMarkdown,
    sections,
  }
}

export function buildBlogExport(
  posts: BlogPostRecord[],
  scope: BlogExportScope,
  exportedAt = new Date().toISOString()
): BlogExportFile {
  return {
    exportedAt,
    source: 'xlsExperts blog admin',
    purpose:
      'Full blog catalog export for quality scoring. Each post includes metadata, structured sections, and bodyMarkdown (the full article text).',
    scope,
    postCount: posts.length,
    posts: posts.map(toBlogExportPost),
  }
}

export function blogExportFilename(
  scope: BlogExportScope,
  date = new Date()
): string {
  const ymd = date.toISOString().slice(0, 10)
  return `blog-export-${scope}-${ymd}.json`
}

export function blogExportJson(file: BlogExportFile): string {
  return `${JSON.stringify(file, null, 2)}\n`
}
