/**
 * Backfill the UK market onto existing Firestore Site Content docs and blog posts.
 *
 * Usage (from project root, with .env.local configured):
 *   pnpm ensure:uk-market
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'

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

async function main() {
  await loadEnvLocal()
  if (
    !process.env.GOOGLE_CLOUD_PROJECT &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ) {
    process.env.GOOGLE_CLOUD_PROJECT =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  }

  const { ensureUkMarketStructures } = await import('../lib/ensure-uk-market')
  const result = await ensureUkMarketStructures()
  console.log('UK market Firestore backfill complete:')
  console.log(`  market-copy:     ${result.marketCopy}`)
  console.log(`  page-seo:        ${result.pageSeo}`)
  console.log(`  analytics-tags:  ${result.siteTags}`)
  console.log(`  crawl-documents: ${result.crawlDocs}`)
  console.log(
    `  blogPosts:       ${result.blogPostsUpdated} updated / ${result.blogPostsScanned} scanned`
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
