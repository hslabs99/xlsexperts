import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  BLOG_POSTS_COLLECTION,
  CRAWL_DOCS_DOC_ID,
  MARKET_COPY_DOC_ID,
  PAGE_SEO_DOC_ID,
  SITE_CONTENT_COLLECTION,
  SITE_TAGS_DOC_ID,
} from '@/lib/firebase'
import { defaultMarketCopyBundle, normalizeMarketCopyBundle } from '@/lib/market-copy'
import { defaultPageSeoMarkets, normalizePageSeoMarkets } from '@/lib/page-seo'
import { defaultSiteTagsBundle, normalizeSiteTagsBundle } from '@/lib/site-tags'
import { defaultCrawlDocsBundle, normalizeCrawlDocsBundle } from '@/lib/crawl-docs'
import { blogShowUk } from '@/lib/blog-shared'

export type EnsureUkMarketResult = {
  marketCopy: 'created' | 'updated' | 'unchanged'
  pageSeo: 'created' | 'updated' | 'unchanged'
  siteTags: 'created' | 'updated' | 'unchanged'
  crawlDocs: 'created' | 'updated' | 'unchanged'
  blogPostsUpdated: number
  blogPostsScanned: number
}

async function ensureSiteContentDoc(
  docId: string,
  hasUk: (data: Record<string, unknown> | undefined) => boolean,
  nextPayload: (data: Record<string, unknown> | undefined) => Record<string, unknown>
): Promise<'created' | 'updated' | 'unchanged'> {
  const ref = getAdminDb().collection(SITE_CONTENT_COLLECTION).doc(docId)
  const snap = await ref.get()
  const data = snap.exists
    ? (snap.data() as Record<string, unknown>)
    : undefined
  if (snap.exists && hasUk(data)) return 'unchanged'
  await ref.set(
    {
      ...nextPayload(data),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
  return snap.exists ? 'updated' : 'created'
}

function marketsHaveUk(data: Record<string, unknown> | undefined): boolean {
  if (!data) return false
  const markets =
    data.markets && typeof data.markets === 'object'
      ? (data.markets as Record<string, unknown>)
      : data
  return markets.uk != null
}

/**
 * Write the UK market key onto existing Site Content docs and backfill
 * `showUk` on blog posts (inherits International when missing).
 */
export async function ensureUkMarketStructures(): Promise<EnsureUkMarketResult> {
  const marketCopy = await ensureSiteContentDoc(
    MARKET_COPY_DOC_ID,
    marketsHaveUk,
    (data) => ({
      markets: normalizeMarketCopyBundle(data ?? defaultMarketCopyBundle()),
    })
  )

  const pageSeo = await ensureSiteContentDoc(
    PAGE_SEO_DOC_ID,
    marketsHaveUk,
    (data) => ({
      markets: normalizePageSeoMarkets(data ?? defaultPageSeoMarkets()),
      pages: FieldValue.delete(),
    })
  )

  const siteTags = await ensureSiteContentDoc(
    SITE_TAGS_DOC_ID,
    marketsHaveUk,
    (data) => ({
      markets: normalizeSiteTagsBundle(data ?? defaultSiteTagsBundle()),
    })
  )

  const crawlDocs = await ensureSiteContentDoc(
    CRAWL_DOCS_DOC_ID,
    marketsHaveUk,
    (data) => ({
      markets: normalizeCrawlDocsBundle(data ?? defaultCrawlDocsBundle()),
    })
  )

  const blogs = await getAdminDb().collection(BLOG_POSTS_COLLECTION).get()
  let blogPostsUpdated = 0
  const writes: Promise<unknown>[] = []
  for (const doc of blogs.docs) {
    const data = doc.data() as Record<string, unknown>
    if ('showUk' in data) continue
    writes.push(
      doc.ref.update({
        showUk: blogShowUk(undefined, data.showUsa),
        updatedAt: FieldValue.serverTimestamp(),
      })
    )
    blogPostsUpdated += 1
  }
  await Promise.all(writes)

  return {
    marketCopy,
    pageSeo,
    siteTags,
    crawlDocs,
    blogPostsUpdated,
    blogPostsScanned: blogs.size,
  }
}
