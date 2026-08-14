import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { BLOG_POSTS_COLLECTION } from '@/lib/firebase'
import type { MarketId } from '@/lib/market'
import type { BlogListItem, BlogPost, BlogSection } from '@/lib/types'
import {
  blogShowNz,
  blogShowUsa,
  blogVisibleOnMarket,
  type BlogPostInput,
  type BlogPostRecord,
} from '@/lib/blog-shared'

export type { BlogPostInput, BlogPostRecord } from '@/lib/blog-shared'

function mapSections(raw: unknown): BlogSection[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const s = (item && typeof item === 'object' ? item : {}) as Record<
      string,
      unknown
    >
    const type = String(s.type ?? 'p') as BlogSection['type']
    return {
      type: (['intro', 'h2', 'h3', 'p', 'ul', 'faq'] as const).includes(
        type as BlogSection['type']
      )
        ? (type as BlogSection['type'])
        : 'p',
      heading: typeof s.heading === 'string' ? s.heading : undefined,
      text: typeof s.text === 'string' ? s.text : undefined,
      items: Array.isArray(s.items) ? s.items.map(String) : undefined,
      faqs: Array.isArray(s.faqs)
        ? s.faqs.map((f) => {
            const row = (f && typeof f === 'object' ? f : {}) as Record<
              string,
              unknown
            >
            return {
              q: String(row.q ?? ''),
              a: String(row.a ?? ''),
            }
          })
        : undefined,
    }
  })
}

function mapPost(id: string, data: Record<string, unknown>): BlogPostRecord {
  return {
    slug: String(data.slug ?? id),
    title: String(data.title ?? ''),
    author: String(data.author ?? ''),
    date: String(data.date ?? ''),
    readTime: String(data.readTime ?? ''),
    excerpt: String(data.excerpt ?? ''),
    image: String(data.image ?? ''),
    category: String(data.category ?? ''),
    sections: mapSections(data.sections),
    published: data.published !== false,
    featured: Boolean(data.featured),
    showNz: blogShowNz(data.showNz),
    showUsa: blogShowUsa(data.showUsa),
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 9999,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
    sourceUrl:
      typeof data.sourceUrl === 'string' ? data.sourceUrl : undefined,
    sourceImageUrl:
      typeof data.sourceImageUrl === 'string'
        ? data.sourceImageUrl
        : undefined,
  }
}

export function toPublicBlogPost(record: BlogPostRecord): BlogPost {
  return {
    slug: record.slug,
    title: record.title,
    author: record.author,
    date: record.date,
    readTime: record.readTime,
    excerpt: record.excerpt,
    image: record.image,
    category: record.category,
    sections: record.sections,
  }
}

export function toBlogListItem(record: BlogPostRecord): BlogListItem {
  return {
    slug: record.slug,
    title: record.title,
    author: record.author,
    date: record.date,
    readTime: record.readTime,
    excerpt: record.excerpt,
    image: record.image,
    category: record.category,
  }
}

export async function fetchAllBlogPostRecords(): Promise<BlogPostRecord[]> {
  const snap = await getAdminDb()
    .collection(BLOG_POSTS_COLLECTION)
    .orderBy('sortOrder', 'asc')
    .get()
  return snap.docs.map((d) =>
    mapPost(d.id, d.data() as Record<string, unknown>)
  )
}

function sortPublishedRecords(records: BlogPostRecord[]): BlogPostRecord[] {
  return [...records]
    .filter((p) => p.published)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1
      return a.sortOrder - b.sortOrder
    })
}

async function fetchSortedPublishedRecords(
  market: MarketId
): Promise<BlogPostRecord[]> {
  // Single-field order avoids a composite index; publish/market filters in memory.
  const snap = await getAdminDb()
    .collection(BLOG_POSTS_COLLECTION)
    .orderBy('sortOrder', 'asc')
    .get()
  return sortPublishedRecords(
    snap.docs.map((d) => mapPost(d.id, d.data() as Record<string, unknown>))
  ).filter((record) => blogVisibleOnMarket(record, market))
}

export async function fetchPublishedBlogPosts(
  market: MarketId
): Promise<BlogPost[]> {
  const records = await fetchSortedPublishedRecords(market)
  return records.map(toPublicBlogPost)
}

/** Published posts without section bodies — for /blog index filtering. */
export async function fetchPublishedBlogList(
  market: MarketId
): Promise<BlogListItem[]> {
  const records = await fetchSortedPublishedRecords(market)
  return records.map(toBlogListItem)
}

export async function fetchBlogPostRecordBySlug(
  slug: string
): Promise<BlogPostRecord | null> {
  const snap = await getAdminDb()
    .collection(BLOG_POSTS_COLLECTION)
    .doc(slug)
    .get()
  if (!snap.exists) return null
  return mapPost(snap.id, snap.data() as Record<string, unknown>)
}

export async function fetchPublishedBlogPostBySlug(
  slug: string,
  market: MarketId
): Promise<BlogPost | null> {
  const record = await fetchBlogPostRecordBySlug(slug)
  if (!record || !record.published) return null
  if (!blogVisibleOnMarket(record, market)) return null
  return toPublicBlogPost(record)
}

export async function saveBlogPost(input: BlogPostInput): Promise<void> {
  const slug = input.slug.trim()
  if (!slug) throw new Error('Slug is required.')

  const ref = getAdminDb().collection(BLOG_POSTS_COLLECTION).doc(slug)
  const existing = await ref.get()

  const payload = {
    slug,
    title: input.title.trim(),
    author: input.author.trim(),
    date: input.date.trim(),
    readTime: input.readTime.trim(),
    excerpt: input.excerpt.trim(),
    image: input.image.trim(),
    category: input.category.trim(),
    sections: input.sections,
    published: input.published !== false,
    featured: Boolean(input.featured),
    showNz: blogShowNz(input.showNz),
    showUsa: blogShowUsa(input.showUsa),
    sortOrder:
      typeof input.sortOrder === 'number'
        ? input.sortOrder
        : existing.exists
          ? Number(
              (existing.data() as Record<string, unknown> | undefined)
                ?.sortOrder ?? 9999
            )
          : 9999,
    updatedAt: FieldValue.serverTimestamp(),
    ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
  }

  await ref.set(payload, { merge: true })
}

export async function updateBlogPostFields(
  slug: string,
  patch: Partial<BlogPostInput>
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (patch.title !== undefined) payload.title = patch.title.trim()
  if (patch.author !== undefined) payload.author = patch.author.trim()
  if (patch.date !== undefined) payload.date = patch.date.trim()
  if (patch.readTime !== undefined) payload.readTime = patch.readTime.trim()
  if (patch.excerpt !== undefined) payload.excerpt = patch.excerpt.trim()
  if (patch.image !== undefined) payload.image = patch.image.trim()
  if (patch.category !== undefined) payload.category = patch.category.trim()
  if (patch.sections !== undefined) payload.sections = patch.sections
  if (patch.published !== undefined) payload.published = patch.published
  if (patch.featured !== undefined) payload.featured = patch.featured
  if (patch.showNz !== undefined) payload.showNz = Boolean(patch.showNz)
  if (patch.showUsa !== undefined) payload.showUsa = Boolean(patch.showUsa)
  if (patch.sortOrder !== undefined) payload.sortOrder = patch.sortOrder

  await getAdminDb().collection(BLOG_POSTS_COLLECTION).doc(slug).update(payload)
}

export async function deleteBlogPost(slug: string): Promise<void> {
  await getAdminDb().collection(BLOG_POSTS_COLLECTION).doc(slug).delete()
}
