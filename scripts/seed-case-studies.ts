/**
 * CLI: seed Firestore caseStudies from the frozen archive.
 *
 *   npm run seed:case-studies
 *   npm run seed:case-studies -- --images
 *   npm run seed:case-studies -- --skip-home
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
    // optional if env already set
  }
}

async function main() {
  await loadEnvLocal()
  if (!process.env.GOOGLE_CLOUD_PROJECT && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    process.env.GOOGLE_CLOUD_PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  }

  const { seedCaseStudiesFromArchive } = await import('../lib/case-studies-seed')
  const args = new Set(process.argv.slice(2))
  const result = await seedCaseStudiesFromArchive({
    overwrite: true,
    uploadImages: args.has('--images'),
    publishHome: !args.has('--skip-home'),
  })
  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
