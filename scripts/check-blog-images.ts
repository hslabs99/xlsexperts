import { readFile } from 'node:fs/promises'
import path from 'node:path'

async function loadEnvLocal() {
  const raw = await readFile(path.join(process.cwd(), '.env.local'), 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq <= 0) continue
    const k = t.slice(0, eq).trim()
    let v = t.slice(eq + 1).trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    if (process.env[k] === undefined) process.env[k] = v
  }
}

async function main() {
  await loadEnvLocal()
  const { fetchAllBlogPostRecords } = await import('../lib/blog-db')
  const posts = await fetchAllBlogPostRecords()
  const local = posts.filter((p) => p.image.startsWith('/'))
  const remote = posts.filter((p) => p.image.startsWith('http'))
  console.log(
    JSON.stringify(
      {
        total: posts.length,
        localPaths: local.length,
        storageUrls: remote.length,
        sampleLocal: local.slice(0, 5).map((p) => ({
          slug: p.slug,
          image: p.image,
        })),
        sampleRemote: remote.slice(0, 5).map((p) => ({
          slug: p.slug,
          image: p.image.slice(0, 120),
        })),
      },
      null,
      2
    )
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
