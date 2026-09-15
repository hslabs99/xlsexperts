/**
 * Seed per-market FAQs onto Pages CMS drafts and the published snapshot.
 *
 * Usage (from project root, with .env.local configured):
 *   node -r ./scripts/stub-server-only.cjs ./node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.json scripts/seed-page-seo-faqs.ts
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  parseGeneratedPublishedJson,
  writeGeneratedFile,
} from '../lib/write-generated-file'
import { MARKET_IDS } from '../lib/market'
import {
  PAGE_SEO_CATALOG,
  normalizePageSeoMarkets,
  type PageSeoMarkets,
  type PublishedPageSeoFile,
} from '../lib/page-seo'

const GENERATED_RELATIVE = path.join('data', 'page-seo.generated.ts')

async function loadEnvLocal() {
  try {
    const raw = await readFile(path.join(process.cwd(), '.env.local'), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (process.env[key] === undefined) process.env[key] = value
    }
  } catch {
    // .env.local optional if env already set
  }
}

function serializeGeneratedFile(payload: PublishedPageSeoFile): string {
  const json = JSON.stringify(payload, null, 2)
  return `/**
 * PUBLISHED page SEO (H1 + meta) by market — imported by the public site (no Firestore on first paint).
 * Edit drafts in Admin → H1 (NZ / International / UK mode), then click Publish to regenerate this file.
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

function faqCounts(markets: PageSeoMarkets) {
  const out: Record<string, number> = {}
  for (const market of MARKET_IDS) {
    out[market] = PAGE_SEO_CATALOG.reduce(
      (n, item) => n + (markets[market][item.path]?.faqs.length ?? 0),
      0
    )
  }
  return out
}

async function main() {
  await loadEnvLocal()
  if (
    !process.env.GOOGLE_CLOUD_PROJECT &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ) {
    process.env.GOOGLE_CLOUD_PROJECT =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  }

  const generatedPath = path.join(process.cwd(), GENERATED_RELATIVE)
  const raw = await readFile(generatedPath, 'utf8')
  const fromFile = normalizePageSeoMarkets(parseGeneratedPublishedJson(raw))

  let markets = fromFile
  let firestore = 'skipped (no credentials)'
  try {
    const { FieldValue } = await import('firebase-admin/firestore')
    const { getAdminDb } = await import('../lib/firebase-admin')
    const { PAGE_SEO_DOC_ID, SITE_CONTENT_COLLECTION } = await import(
      '../lib/firebase'
    )
    const snap = await getAdminDb()
      .collection(SITE_CONTENT_COLLECTION)
      .doc(PAGE_SEO_DOC_ID)
      .get()
    const data = snap.exists
      ? (snap.data() as Record<string, unknown>)
      : undefined
    markets = normalizePageSeoMarkets(data ?? fromFile)
    await getAdminDb()
      .collection(SITE_CONTENT_COLLECTION)
      .doc(PAGE_SEO_DOC_ID)
      .set(
        {
          markets,
          pages: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
    firestore = snap.exists ? 'updated' : 'created'
  } catch (error) {
    firestore = `failed: ${error instanceof Error ? error.message : String(error)}`
    markets = fromFile
  }

  const publishedAt = new Date().toISOString()
  const payload: PublishedPageSeoFile = {
    version: 2,
    publishedAt,
    markets,
  }
  await writeGeneratedFile(GENERATED_RELATIVE, serializeGeneratedFile(payload))

  const sampleNz =
    markets.nz['/excel-spreadsheet-development']?.faqs.find((faq) =>
      /Auckland|remotely|United Kingdom|UK/i.test(`${faq.q} ${faq.a}`)
    )
  const sampleIntl =
    markets.intl['/excel-spreadsheet-development']?.faqs.find((faq) =>
      /remote|Auckland|United Kingdom|UK|New Zealand/i.test(`${faq.q} ${faq.a}`)
    )
  const sampleUk =
    markets.uk['/excel-spreadsheet-development']?.faqs.find((faq) =>
      /UK|United Kingdom|Auckland|New Zealand|remote/i.test(`${faq.q} ${faq.a}`)
    )

  console.log('FAQ seed complete')
  console.log(`  firestore:    ${firestore}`)
  console.log(`  publishedAt:  ${publishedAt}`)
  console.log(`  faq pairs:    ${JSON.stringify(faqCounts(markets))}`)
  console.log(`  NZ sample:    ${sampleNz?.q ?? '(none)'}`)
  console.log(`  Intl sample:  ${sampleIntl?.q ?? '(none)'}`)
  console.log(`  UK sample:    ${sampleUk?.q ?? '(none)'}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
