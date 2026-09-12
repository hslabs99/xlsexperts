/**
 * Blog data access for public pages — Firebase only.
 *
 * LIVE source: Firestore `blogPosts` (+ image URLs in Firebase Storage).
 * The v0 archive in `lib/blog-posts.ts` is for seeding/re-import only and is
 * never used to serve the public site.
 */

import 'server-only'

import type { MarketId } from '@/lib/market'
import type { BlogListItem, BlogPost } from '@/lib/types'
import {
  fetchBlogPostRecordBySlug,
  fetchPublishedBlogList,
  fetchPublishedBlogPosts,
  fetchPublishedBlogRecords,
  toPublicBlogPost,
} from '@/lib/blog-db'
import {
  blogVisibleOnMarket,
  visibleMarketsForBlog,
  type BlogPostRecord,
} from '@/lib/blog-shared'
import { getMarket } from '@/lib/market-server'
import { applyBlogPresentation } from '@/lib/blog-presentation'

export type PublicBlogPost = BlogPost & { visibleOn: MarketId[] }

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const market = await getMarket()
  const posts = await fetchPublishedBlogPosts(market)
  return posts.map((post) => applyBlogPresentation(post, market))
}

export async function getPublishedBlogRecords(): Promise<BlogPostRecord[]> {
  const market = await getMarket()
  return fetchPublishedBlogRecords(market)
}

/** Index cards only — omits heavy article bodies. */
export async function getBlogListPosts(): Promise<BlogListItem[]> {
  const market = await getMarket()
  const posts = await fetchPublishedBlogList(market)
  return posts.map((post) => applyBlogPresentation(post, market))
}

export async function getBlogPost(
  slug: string
): Promise<PublicBlogPost | undefined> {
  const market = await getMarket()
  const record = await fetchBlogPostRecordBySlug(slug)
  if (!record || !record.published) return undefined
  if (!blogVisibleOnMarket(record, market)) return undefined
  const post = applyBlogPresentation(toPublicBlogPost(record), market)
  return { ...post, visibleOn: visibleMarketsForBlog(record) }
}
