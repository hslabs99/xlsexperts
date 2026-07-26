import 'server-only'

import { promises as fs } from 'fs'
import path from 'path'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  MARKET_COPY_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import {
  defaultMarketCopyBundle,
  normalizeMarketCopyBundle,
  type MarketCopyBundle,
  type PublishedMarketCopyFile,
} from '@/lib/market-copy'

const GENERATED_RELATIVE = path.join('data', 'market-copy.generated.ts')

/**
 * Load draft market copy from Firestore.
 * Falls back to built-in defaults (intl = nz) if missing.
 */
export async function fetchMarketCopyDraft(): Promise<{
  markets: MarketCopyBundle
  publishedAt: string | null
  updatedAt: string | null
}> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(MARKET_COPY_DOC_ID)
    .get()

  if (!snap.exists) {
    return {
      markets: defaultMarketCopyBundle(),
      publishedAt: null,
      updatedAt: null,
    }
  }

  const data = snap.data() as Record<string, unknown>
  const markets = normalizeMarketCopyBundle(data)
  const publishedAt =
    typeof data.publishedAt === 'string' ? data.publishedAt : null
  let updatedAt: string | null = null
  const rawUpdated = data.updatedAt
  if (rawUpdated && typeof rawUpdated === 'object' && 'toDate' in rawUpdated) {
    try {
      updatedAt = (rawUpdated as { toDate: () => Date }).toDate().toISOString()
    } catch {
      updatedAt = null
    }
  } else if (typeof rawUpdated === 'string') {
    updatedAt = rawUpdated
  }

  return { markets, publishedAt, updatedAt }
}

/** Save draft market copy to Firestore (does not publish the static file). */
export async function saveMarketCopyDraft(
  markets: MarketCopyBundle
): Promise<MarketCopyBundle> {
  const normalized = normalizeMarketCopyBundle(markets)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(MARKET_COPY_DOC_ID)
    .set(
      {
        markets: normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return normalized
}

function serializeGeneratedFile(payload: PublishedMarketCopyFile): string {
  const json = JSON.stringify(payload, null, 2)
  return `/**
 * PUBLISHED market copy — imported by the public site (no Firestore on first paint).
 * Edit drafts in Admin → International, then click Publish to regenerate this file.
 *
 * Generated at ${payload.publishedAt}
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedMarketCopyFile } from '@/lib/market-copy'

const published = ${json} as PublishedMarketCopyFile

export const PUBLISHED_MARKET_COPY = published

export default published
`
}

/**
 * Write the static generated module and record publishedAt in Firestore.
 * Public pages import this file — never query Firestore for market strings.
 */
export async function publishMarketCopy(
  markets?: MarketCopyBundle
): Promise<{ markets: MarketCopyBundle; publishedAt: string; filePath: string }> {
  const bundle =
    markets != null
      ? normalizeMarketCopyBundle(markets)
      : (await fetchMarketCopyDraft()).markets

  const publishedAt = new Date().toISOString()
  const payload: PublishedMarketCopyFile = {
    version: 1,
    publishedAt,
    markets: bundle,
  }

  const filePath = path.join(process.cwd(), GENERATED_RELATIVE)
  await fs.writeFile(filePath, serializeGeneratedFile(payload), 'utf8')

  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(MARKET_COPY_DOC_ID)
    .set(
      {
        markets: bundle,
        publishedAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

  return { markets: bundle, publishedAt, filePath: GENERATED_RELATIVE }
}
