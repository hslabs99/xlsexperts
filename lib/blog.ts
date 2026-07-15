/**
 * Blog data access for public pages — Firebase only.
 *
 * LIVE source: Firestore `blogPosts` (+ image URLs in Firebase Storage).
 * The v0 archive in `lib/blog-posts.ts` is for seeding/re-import only and is
 * never used to serve the public site.
 */

import type { BlogListItem, BlogPost } from '@/lib/types'
import {
  fetchPublishedBlogList,
  fetchPublishedBlogPostBySlug,
  fetchPublishedBlogPosts,
} from '@/lib/blog-db'

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return fetchPublishedBlogPosts()
}

/** Index cards only — omits heavy section bodies. */
export async function getBlogListPosts(): Promise<BlogListItem[]> {
  return fetchPublishedBlogList()
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const post = await fetchPublishedBlogPostBySlug(slug)
  return post ?? undefined
}
