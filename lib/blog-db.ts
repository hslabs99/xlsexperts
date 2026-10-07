import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { BLOG_POSTS_COLLECTION } from '@/lib/firebase'
import { MARKET_IDS, isMarketId, type MarketId } from '@/lib/market'
import type { BlogListItem, BlogPost, BlogSection } from '@/lib/types'
import {
  blogShowNz,
  blogShowUsa,
  blogShowUk,
  blogVisibleOnMarket,
  type BlogPostInput,
  type BlogPostRecord,
} from '@/lib/blog-shared'
import { primaryToStore } from '@/lib/blog-routing'
import {
  blogSerpByMarketError,
  blogSerpByMarketIsEmpty,
  blogSerpTemplateError,
  type BlogSerpByMarket,
} from '@/lib/blog-serp-copy'

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

function mapSerpByMarket(raw: unknown): BlogSerpByMarket | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const source = raw as Record<string, unknown>
  const next: BlogSerpByMarket = {}
  for (const market of MARKET_IDS) {
    const row = source[market]
    if (!row || typeof row !== 'object') continue
    const record = row as Record<string, unknown>
    next[market] = {
      title: String(record.title ?? ''),
      description: String(record.description ?? ''),
    }
  }
  return next
}

function mapPost(id: string, data: Record<string, unknown>): BlogPostRecord {
  return {
    slug: String(data.slug ?? id),
    title: String(data.title ?? ''),
    author: String(data.author ?? ''),
    date: String(data.date ?? ''),
    readTime: String(data.readTime ?? ''),
    excerpt: String(data.excerpt ?? ''),
    serpTitle: String(data.serpTitle ?? ''),
    serpDescription: String(data.serpDescription ?? ''),
    serpByMarket: mapSerpByMarket(data.serpByMarket),
    image: String(data.image ?? ''),
    category: String(data.category ?? ''),
    sections: mapSections(data.sections),
    published: data.published !== false,
    featured: Boolean(data.featured),
    showNz: blogShowNz(data.showNz),
    showUsa: blogShowUsa(data.showUsa),
    showUk: blogShowUk(data.showUk, data.showUsa),
    primaryRegion: isMarketId(data.primaryRegion) ? data.primaryRegion : null,
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
    serpTitle: record.serpTitle ?? '',
    serpDescription: record.serpDescription ?? '',
    serpByMarket: record.serpByMarket,
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
    serpTitle: record.serpTitle ?? '',
    serpDescription: record.serpDescription ?? '',
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

export async function fetchPublishedBlogRecords(
  market: MarketId
): Promise<BlogPostRecord[]> {
  return fetchSortedPublishedRecords(market)
}

export async function fetchPublishedBlogPosts(
  market: MarketId
): Promise<BlogPost[]> {
  const records = await fetchPublishedBlogRecords(market)
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
  const serpTitle = (input.serpTitle ?? '').trim()
  const serpDescription = (input.serpDescription ?? '').trim()
  const serpByMarket = input.serpByMarket
  if (serpByMarket && !blogSerpByMarketIsEmpty(serpByMarket)) {
    const marketError = blogSerpByMarketError(serpByMarket)
    if (marketError) throw new Error(marketError)
  } else if (!existing.exists || serpTitle || serpDescription) {
    const serpError = blogSerpTemplateError(serpTitle, serpDescription)
    if (serpError) throw new Error(serpError)
  }

  const payload = {
    slug,
    title: input.title.trim(),
    author: input.author.trim(),
    date: input.date.trim(),
    readTime: input.readTime.trim(),
    excerpt: input.excerpt.trim(),
    serpTitle,
    serpDescription,
    serpByMarket: serpByMarket ?? {},
    image: input.image.trim(),
    category: input.category.trim(),
    sections: input.sections,
    published: input.published !== false,
    featured: Boolean(input.featured),
    showNz: blogShowNz(input.showNz),
    showUsa: blogShowUsa(input.showUsa),
    showUk: blogShowUk(input.showUk, input.showUsa ?? input.showUk),
    primaryRegion: primaryToStore(
      {
        showNz: blogShowNz(input.showNz),
        showUsa: blogShowUsa(input.showUsa),
        showUk: blogShowUk(input.showUk, input.showUsa ?? input.showUk),
      },
      input.primaryRegion
    ),
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

/** Persist a hero URL on an existing post. Returns false if the post is not saved yet. */
export async function saveBlogPostImage(
  slug: string,
  imageUrl: string
): Promise<boolean> {
  const trimmed = slug.trim()
  const image = imageUrl.trim()
  if (!trimmed || !image) return false
  const ref = getAdminDb().collection(BLOG_POSTS_COLLECTION).doc(trimmed)
  const existing = await ref.get()
  if (!existing.exists) return false
  await updateBlogPostFields(trimmed, { image })
  return true
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
  if (patch.serpTitle !== undefined) payload.serpTitle = patch.serpTitle.trim()
  if (patch.serpDescription !== undefined) {
    payload.serpDescription = patch.serpDescription.trim()
  }
  if (
    patch.serpTitle !== undefined ||
    patch.serpDescription !== undefined
  ) {
    const serpError = blogSerpTemplateError(
      String(payload.serpTitle ?? patch.serpTitle ?? ''),
      String(payload.serpDescription ?? patch.serpDescription ?? '')
    )
    if (serpError) throw new Error(serpError)
  }
  if (patch.image !== undefined) payload.image = patch.image.trim()
  if (patch.category !== undefined) payload.category = patch.category.trim()
  if (patch.sections !== undefined) payload.sections = patch.sections
  if (patch.published !== undefined) payload.published = patch.published
  if (patch.featured !== undefined) payload.featured = patch.featured
  const regionTouch =
    patch.showNz !== undefined ||
    patch.showUsa !== undefined ||
    patch.showUk !== undefined ||
    'primaryRegion' in patch
  if (regionTouch) {
    const existing = await getAdminDb()
      .collection(BLOG_POSTS_COLLECTION)
      .doc(slug)
      .get()
    const data = (existing.data() ?? {}) as Record<string, unknown>
    const showNz =
      patch.showNz !== undefined ? Boolean(patch.showNz) : blogShowNz(data.showNz)
    const showUsa =
      patch.showUsa !== undefined
        ? Boolean(patch.showUsa)
        : blogShowUsa(data.showUsa)
    const showUk =
      patch.showUk !== undefined
        ? Boolean(patch.showUk)
        : blogShowUk(data.showUk, showUsa)
    const requested = 'primaryRegion' in patch ? patch.primaryRegion : data.primaryRegion
    payload.showNz = showNz
    payload.showUsa = showUsa
    payload.showUk = showUk
    payload.primaryRegion = primaryToStore(
      { showNz, showUsa, showUk },
      requested
    )
  }
  if (patch.sortOrder !== undefined) payload.sortOrder = patch.sortOrder

  await getAdminDb().collection(BLOG_POSTS_COLLECTION).doc(slug).update(payload)
}

export async function deleteBlogPost(slug: string): Promise<void> {
  await getAdminDb().collection(BLOG_POSTS_COLLECTION).doc(slug).delete()
}
