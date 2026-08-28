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
  applySiteOrigins,
  defaultMarketCopyBundle,
  DEFAULT_HERO_BACKGROUND_HOLD_SECONDS,
  normalizeHeroBackgroundHoldSeconds,
  normalizeMarketCopyBundle,
  pickHeroBackgroundHoldSeconds,
  type MarketCopyBundle,
  type PublishedMarketCopyFile,
} from '@/lib/market-copy'
import {
  parseGeneratedPublishedJson,
  writeGeneratedFile,
} from '@/lib/write-generated-file'

const GENERATED_RELATIVE = path.join('data', 'market-copy.generated.ts')

/**
 * Load draft market copy from Firestore.
 * Falls back to built-in defaults (missing markets seeded from defaults) if missing.
 */
export async function fetchMarketCopyDraft(): Promise<{
  markets: MarketCopyBundle
  heroBackgroundHoldSeconds: number
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
      heroBackgroundHoldSeconds: DEFAULT_HERO_BACKGROUND_HOLD_SECONDS,
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

  return {
    markets,
    heroBackgroundHoldSeconds: pickHeroBackgroundHoldSeconds(data),
    publishedAt,
    updatedAt,
  }
}

/** Save draft market copy to Firestore (does not publish the static file). */
export async function saveMarketCopyDraft(
  markets: MarketCopyBundle,
  extras?: { heroBackgroundHoldSeconds?: unknown }
): Promise<{
  markets: MarketCopyBundle
  heroBackgroundHoldSeconds: number
}> {
  const normalized = normalizeMarketCopyBundle(markets)
  const existing = await fetchMarketCopyDraft()
  const heroBackgroundHoldSeconds =
    extras && 'heroBackgroundHoldSeconds' in extras
      ? normalizeHeroBackgroundHoldSeconds(extras.heroBackgroundHoldSeconds)
      : existing.heroBackgroundHoldSeconds
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(MARKET_COPY_DOC_ID)
    .set(
      {
        markets: normalized,
        heroBackgroundHoldSeconds,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return { markets: normalized, heroBackgroundHoldSeconds }
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
  markets?: MarketCopyBundle,
  extras?: { heroBackgroundHoldSeconds?: unknown }
): Promise<{
  markets: MarketCopyBundle
  heroBackgroundHoldSeconds: number
  publishedAt: string
  filePath: string
}> {
  const draft = await fetchMarketCopyDraft()
  const bundle =
    markets != null ? normalizeMarketCopyBundle(markets) : draft.markets
  const heroBackgroundHoldSeconds =
    extras && 'heroBackgroundHoldSeconds' in extras
      ? normalizeHeroBackgroundHoldSeconds(extras.heroBackgroundHoldSeconds)
      : draft.heroBackgroundHoldSeconds

  const publishedAt = new Date().toISOString()
  const payload: PublishedMarketCopyFile = {
    version: 1,
    publishedAt,
    markets: bundle,
    heroBackgroundHoldSeconds,
  }

  await writeGeneratedFile(GENERATED_RELATIVE, serializeGeneratedFile(payload))

  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(MARKET_COPY_DOC_ID)
    .set(
      {
        markets: bundle,
        heroBackgroundHoldSeconds,
        publishedAt,
        updatedAt: publishedAt,
      },
      { merge: true }
    )

  return {
    markets: bundle,
    heroBackgroundHoldSeconds,
    publishedAt,
    filePath: GENERATED_RELATIVE,
  }
}

/**
 * Update canonical origins in draft + published market copy without publishing
 * other marketing strings. Used by Settings → Domains.
 */
export async function patchPublishedSiteOrigins(origins: {
  nz: string
  intl: string
  uk: string
}): Promise<void> {
  const draft = await fetchMarketCopyDraft()
  await saveMarketCopyDraft(applySiteOrigins(draft.markets, origins))

  const published = await readPublishedMarketCopyFromDisk()
  const markets = applySiteOrigins(
    published?.markets ?? draft.markets,
    origins
  )
  const heroBackgroundHoldSeconds = pickHeroBackgroundHoldSeconds(
    published ?? { heroBackgroundHoldSeconds: draft.heroBackgroundHoldSeconds }
  )
  const payload: PublishedMarketCopyFile = {
    version: 1,
    publishedAt:
      published?.publishedAt ?? draft.publishedAt ?? new Date().toISOString(),
    markets,
    heroBackgroundHoldSeconds,
  }
  await writeGeneratedFile(GENERATED_RELATIVE, serializeGeneratedFile(payload))
}

async function readPublishedMarketCopyFromDisk(): Promise<PublishedMarketCopyFile | null> {
  try {
    const text = await fs.readFile(
      path.join(process.cwd(), GENERATED_RELATIVE),
      'utf8'
    )
    const parsed = parseGeneratedPublishedJson(text)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as PublishedMarketCopyFile
  } catch {
    return null
  }
}
