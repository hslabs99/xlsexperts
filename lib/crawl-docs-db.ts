import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  CRAWL_DOCS_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import { DEFAULT_MARKET, isMarketId, type MarketId } from '@/lib/market'
import {
  defaultCrawlDocs,
  defaultCrawlDocsBundle,
  normalizeCrawlDocs,
  normalizeCrawlDocsBundle,
  pickCrawlDocs,
  type CrawlDocsBundle,
  type CrawlDocsContent,
} from '@/lib/crawl-docs'

export async function fetchCrawlDocsBundle(): Promise<CrawlDocsBundle> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CRAWL_DOCS_DOC_ID)
    .get()
  if (!snap.exists) return defaultCrawlDocsBundle()
  return normalizeCrawlDocsBundle(snap.data() as Record<string, unknown>)
}

export async function fetchCrawlDocs(
  market: MarketId = DEFAULT_MARKET
): Promise<CrawlDocsContent> {
  const bundle = await fetchCrawlDocsBundle()
  return pickCrawlDocs(bundle, market)
}

export async function saveCrawlDocsBundle(
  bundle: CrawlDocsBundle
): Promise<CrawlDocsBundle> {
  const normalized = normalizeCrawlDocsBundle({ markets: bundle })
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CRAWL_DOCS_DOC_ID)
    .set(
      {
        markets: normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: false }
    )
  return normalized
}

export async function saveCrawlDocsForMarket(
  market: MarketId,
  content: CrawlDocsContent
): Promise<CrawlDocsBundle> {
  const id = isMarketId(market) ? market : DEFAULT_MARKET
  const bundle = await fetchCrawlDocsBundle()
  bundle[id] = normalizeCrawlDocs(content, id)
  return saveCrawlDocsBundle(bundle)
}

/** @deprecated Prefer saveCrawlDocsForMarket */
export async function saveCrawlDocs(content: CrawlDocsContent): Promise<void> {
  await saveCrawlDocsForMarket(DEFAULT_MARKET, content ?? defaultCrawlDocs('nz'))
}
