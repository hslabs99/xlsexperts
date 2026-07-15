/**
 * Blog data access layer.
 *
 * Currently backed by the static `blogPosts` array in `lib/blog-posts.ts`.
 *
 * TO MIGRATE TO SANITY in Cursor:
 *   1. Replace the import below with your Sanity client import.
 *   2. Replace each function body with a `sanity.fetch(groq`...`)` call.
 *   3. The rest of the app (pages, sitemap, JSON-LD) touches only this file.
 */

import type { BlogPost } from '@/lib/types'
import { blogPosts } from '@/lib/blog-posts'

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}
