import 'server-only'

import { promises as fs } from 'fs'
import path from 'path'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  PAGE_SEO_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import {
  defaultPageSeoMarkets,
  normalizePageSeoMarkets,
  type PageSeoMarkets,
  type PublishedPageSeoFile,
} from '@/lib/page-seo'

const GENERATED_RELATIVE = path.join('data', 'page-seo.generated.ts')

/**
 * Load draft page SEO from Firestore (NZ + Global).
 * Falls back to built-in defaults if missing.
 * Migrates legacy single-bundle docs to markets on read.
 */
export async function fetchPageSeoDraft(): Promise<{
  markets: PageSeoMarkets
  publishedAt: string | null
  updatedAt: string | null
}> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(PAGE_SEO_DOC_ID)
    .get()

  if (!snap.exists) {
    return {
      markets: defaultPageSeoMarkets(),
      publishedAt: null,
      updatedAt: null,
    }
  }

  const data = snap.data() as Record<string, unknown>
  const markets = normalizePageSeoMarkets(data)
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

/** Save draft page SEO to Firestore (does not publish the static file). */
export async function savePageSeoDraft(
  markets: PageSeoMarkets
): Promise<PageSeoMarkets> {
  const normalized = normalizePageSeoMarkets(markets)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(PAGE_SEO_DOC_ID)
    .set(
      {
        markets: normalized,
        // Clear legacy flat `pages` key so draft shape is unambiguous
        pages: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return normalized
}

function serializeGeneratedFile(payload: PublishedPageSeoFile): string {
  const json = JSON.stringify(payload, null, 2)
  return `/**
 * PUBLISHED page SEO (H1 + meta) by market — imported by the public site (no Firestore on first paint).
 * Edit drafts in Admin → H1 (NZ / Global mode), then click Publish to regenerate this file.
 *
 * Generated at ${payload.publishedAt}
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedPageSeoFile } from '@/lib/page-seo'

const published = ${json} as PublishedPageSeoFile

export const PUBLISHED_PAGE_SEO = published

export default published
`
}

/**
 * Write the static generated module and record publishedAt in Firestore.
 * Public pages import this file — never query Firestore for page SEO strings.
 */
export async function publishPageSeo(
  markets?: PageSeoMarkets
): Promise<{
  markets: PageSeoMarkets
  publishedAt: string
  filePath: string
}> {
  const bundle =
    markets != null
      ? normalizePageSeoMarkets(markets)
      : (await fetchPageSeoDraft()).markets

  const publishedAt = new Date().toISOString()
  const payload: PublishedPageSeoFile = {
    version: 2,
    publishedAt,
    markets: bundle,
  }

  const filePath = path.join(process.cwd(), GENERATED_RELATIVE)
  await fs.writeFile(filePath, serializeGeneratedFile(payload), 'utf8')

  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(PAGE_SEO_DOC_ID)
    .set(
      {
        markets: bundle,
        pages: FieldValue.delete(),
        publishedAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

  return { markets: bundle, publishedAt, filePath: GENERATED_RELATIVE }
}
