/**
 * Seed Firebase from the frozen v0 blog archive.
 *
 * Usage (from project root, with .env.local configured):
 *   pnpm seed:blogs
 *   pnpm seed:blogs -- --overwrite
 *   pnpm seed:blogs -- --overwrite --images
 *   pnpm seed:blogs -- --snapshot-only   # write data/v0-blog/posts.json only
 *
 * Archive kept forever:
 *   - lib/blog-posts.ts
 *   - public/images/blog-*.png
 *   - data/v0-blog/posts.json (JSON snapshot written by this script)
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
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

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag)
}

async function main() {
  // Must load env BEFORE importing Firebase modules (config reads process.env at import).
  await loadEnvLocal()
  if (
    !process.env.GOOGLE_CLOUD_PROJECT &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ) {
    process.env.GOOGLE_CLOUD_PROJECT =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  }

  const { getV0BlogArchive, seedBlogPostsFromV0Archive } = await import(
    '../lib/blog-seed'
  )

  const posts = getV0BlogArchive()
  const dir = path.join(process.cwd(), 'data', 'v0-blog')
  await mkdir(dir, { recursive: true })
  const out = path.join(dir, 'posts.json')
  await writeFile(
    out,
    JSON.stringify(
      {
        source: 'v0 / vzero download — immutable archive snapshot',
        exportedAt: new Date().toISOString(),
        count: posts.length,
        posts,
      },
      null,
      2
    ),
    'utf8'
  )
  console.log(`v0 archive snapshot: ${posts.length} posts → ${out}`)

  if (hasFlag('--snapshot-only')) {
    console.log('Snapshot-only mode; skipping Firebase seed.')
    process.exit(0)
  }

  const overwrite = hasFlag('--overwrite')
  const uploadImages = hasFlag('--images')

  console.log(
    `Seeding Firestore blogPosts (overwrite=${overwrite}, images=${uploadImages})…`
  )
  const result = await seedBlogPostsFromV0Archive({ overwrite, uploadImages })
  console.log(JSON.stringify(result, null, 2))
  console.log(
    'Done. Original archive files were not modified. Public blog pages read from Firebase.'
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
