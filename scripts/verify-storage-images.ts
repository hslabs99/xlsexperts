import { readFileSync } from 'node:fs'

async function main() {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
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
  process.env.GOOGLE_CLOUD_PROJECT =
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  const { getAdminDb } = await import('../lib/firebase-admin')

  const blogs = await getAdminDb().collection('blogPosts').limit(3).get()
  for (const d of blogs.docs) {
    console.log('BLOG', d.id, String(d.data().image || '').slice(0, 100))
  }
  const cs = await getAdminDb().collection('caseStudies').limit(3).get()
  for (const d of cs.docs) {
    console.log('CS', d.id, String(d.data().image || '').slice(0, 100))
  }
  const home = await getAdminDb()
    .collection('Site Content')
    .doc('case-studies-home')
    .get()
  const items = (home.data()?.items as { image?: string }[]) || []
  console.log('HOME0', String(items[0]?.image || '').slice(0, 100))

  const sample = String(blogs.docs[0]?.data()?.image || '')
  if (!sample.startsWith('http')) {
    console.error('FAIL: blog image is not a Storage URL')
    process.exit(1)
  }
  const res = await fetch(sample)
  const bytes = (await res.arrayBuffer()).byteLength
  console.log('READ_OK', res.status, res.headers.get('content-type'), bytes)
  if (!res.ok || bytes < 100) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
