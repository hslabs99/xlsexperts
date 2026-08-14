/**
 * Blog data access for public pages — Firebase only.
 *
 * LIVE source: Firestore `blogPosts` (+ image URLs in Firebase Storage).
 * The v0 archive in `lib/blog-posts.ts` is for seeding/re-import only and is
 * never used to serve the public site.
 */

import 'server-only'

import type { BlogListItem, BlogPost } from '@/lib/types'
import {
  fetchPublishedBlogList,
  fetchPublishedBlogPostBySlug,
  fetchPublishedBlogPosts,
} from '@/lib/blog-db'
import { getMarket } from '@/lib/market-server'

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const market = await getMarket()
  return fetchPublishedBlogPosts(market)
}

/** Index cards only — omits heavy section bodies. */
export async function getBlogListPosts(): Promise<BlogListItem[]> {
  const market = await getMarket()
  return fetchPublishedBlogList(market)
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const market = await getMarket()
  const post = await fetchPublishedBlogPostBySlug(slug, market)
  return post ?? undefined
}
