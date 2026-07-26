import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  SITE_CONTENT_COLLECTION,
  SITE_TAGS_DOC_ID,
} from '@/lib/firebase'
import { DEFAULT_MARKET, isMarketId, type MarketId } from '@/lib/market'
import {
  DEFAULT_SITE_TAGS,
  defaultSiteTagsBundle,
  normalizeSiteTags,
  normalizeSiteTagsBundle,
  pickSiteTags,
  type SiteTagsBundle,
  type SiteTagsContent,
} from '@/lib/site-tags'

export async function fetchSiteTagsBundle(): Promise<SiteTagsBundle> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(SITE_TAGS_DOC_ID)
    .get()
  if (!snap.exists) return defaultSiteTagsBundle()
  return normalizeSiteTagsBundle(snap.data() as Record<string, unknown>)
}

/** Tags for one market (public site injection). */
export async function fetchSiteTags(
  market: MarketId = DEFAULT_MARKET
): Promise<SiteTagsContent> {
  const bundle = await fetchSiteTagsBundle()
  return pickSiteTags(bundle, market)
}

export async function saveSiteTagsBundle(
  bundle: SiteTagsBundle
): Promise<SiteTagsBundle> {
  const normalized = normalizeSiteTagsBundle({ markets: bundle })
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(SITE_TAGS_DOC_ID)
    .set(
      {
        markets: normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: false }
    )
  return normalized
}

/** Save a single market's tags without clobbering the other. */
export async function saveSiteTagsForMarket(
  market: MarketId,
  content: SiteTagsContent
): Promise<SiteTagsBundle> {
  const id = isMarketId(market) ? market : DEFAULT_MARKET
  const bundle = await fetchSiteTagsBundle()
  bundle[id] = normalizeSiteTags(content)
  return saveSiteTagsBundle(bundle)
}

/** @deprecated Prefer saveSiteTagsForMarket — kept for typed callers during migration. */
export async function saveSiteTags(content: SiteTagsContent): Promise<void> {
  await saveSiteTagsForMarket(DEFAULT_MARKET, content ?? DEFAULT_SITE_TAGS)
}
