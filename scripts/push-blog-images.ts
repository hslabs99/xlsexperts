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
  console.log('bucket=', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
  console.log('project=', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)

  // Quick single-file Storage probe before full seed
  const { uploadBlogImage } = await import('../lib/blog-storage')
  const sample = path.join(
    process.cwd(),
    'public',
    'images',
    'blog-healthcare.png'
  )
  const buf = await readFile(sample)
  console.log('probe file bytes=', buf.byteLength)
  try {
    const url = await uploadBlogImage(
      '_storage-probe',
      new Blob([new Uint8Array(buf)], { type: 'image/png' }),
      'probe.png'
    )
    console.log('probe OK', url.slice(0, 120))
  } catch (err) {
    console.error('probe FAILED', err)
    process.exit(1)
  }

  const { seedBlogPostsFromV0Archive } = await import('../lib/blog-seed')
  const result = await seedBlogPostsFromV0Archive({
    overwrite: false,
    uploadImages: true,
  })
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.imagesFailed > 0 && result.imagesUploaded === 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
