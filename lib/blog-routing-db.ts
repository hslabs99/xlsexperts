import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  NOT_FOUND_LOG_COLLECTION,
  REDIRECTS_COLLECTION,
} from '@/lib/firebase'
import { isMarketId } from '@/lib/market'
import { normalizePathname } from '@/lib/regions'
import {
  blogShowNz,
  blogShowUk,
  blogShowUsa,
  type BlogPrimaryRegion,
} from '@/lib/blog-shared'
import {
  type RoutingPost,
  type RoutingPostState,
} from '@/lib/blog-routing'
import { BLOG_POSTS_COLLECTION } from '@/lib/firebase'

export type StoredRedirect = {
  fromPath: string
  toUrl: string
  source: 'manual' | 'promoted'
  hits: number
  createdAt: number | null
}

export type RoutingIndexEntry = RoutingPost & { state: RoutingPostState }

const INDEX_TTL_MS = 20_000
const REDIRECT_TTL_MS = 5_000

let indexCache: { at: number; entries: RoutingIndexEntry[] } | null = null
let redirectCache: { at: number; rows: StoredRedirect[] } | null = null

function toIndexEntry(
  id: string,
  data: Record<string, unknown>
): RoutingIndexEntry {
  const showUsa = blogShowUsa(data.showUsa)
  const deleted = data.status === 'deleted'
  const published = !deleted && data.published !== false
  return {
    slug: String(data.slug ?? id),
    title: String(data.title ?? ''),
    excerpt: String(data.excerpt ?? ''),
    category: String(data.category ?? ''),
    showNz: blogShowNz(data.showNz),
    showUsa,
    showUk: blogShowUk(data.showUk, data.showUsa),
    primaryRegion: isMarketId(data.primaryRegion)
      ? data.primaryRegion
      : (null as BlogPrimaryRegion),
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 9999,
    state: deleted ? 'deleted' : published ? 'published' : 'draft',
  }
}

export async function getRoutingIndex(): Promise<RoutingIndexEntry[]> {
  const now = Date.now()
  if (indexCache && now - indexCache.at < INDEX_TTL_MS) return indexCache.entries
  const snap = await getAdminDb().collection(BLOG_POSTS_COLLECTION).get()
  const entries = snap.docs.map((doc) =>
    toIndexEntry(doc.id, doc.data() as Record<string, unknown>)
  )
  indexCache = { at: now, entries }
  return entries
}

export function clearRoutingCaches(): void {
  indexCache = null
  redirectCache = null
}

function mapRedirect(id: string, data: Record<string, unknown>): StoredRedirect | null {
  const fromPath = normalizePathname(
    typeof data.fromPath === 'string' ? data.fromPath : id
  )
  const toUrl = typeof data.toUrl === 'string' ? data.toUrl.trim() : ''
  if (!fromPath || !toUrl) return null
  const source = data.source === 'promoted' ? 'promoted' : 'manual'
  return {
    fromPath,
    toUrl,
    source,
    hits: typeof data.hits === 'number' ? data.hits : 0,
    createdAt: typeof data.createdAtMs === 'number' ? data.createdAtMs : null,
  }
}

export async function getRedirectRows(): Promise<StoredRedirect[]> {
  const now = Date.now()
  if (redirectCache && now - redirectCache.at < REDIRECT_TTL_MS) {
    return redirectCache.rows
  }
  const snap = await getAdminDb().collection(REDIRECTS_COLLECTION).get()
  const rows = snap.docs
    .map((doc) => mapRedirect(doc.id, doc.data() as Record<string, unknown>))
    .filter((row): row is StoredRedirect => Boolean(row))
  redirectCache = { at: now, rows }
  return rows
}

export async function incrementRedirectHit(fromPath: string): Promise<void> {
  const id = encodeURIComponent(normalizePathname(fromPath))
  await getAdminDb()
    .collection(REDIRECTS_COLLECTION)
    .doc(id)
    .set({ hits: FieldValue.increment(1) }, { merge: true })
}

export async function saveRedirect(input: {
  fromPath: string
  toUrl: string
  source: 'manual' | 'promoted'
}): Promise<StoredRedirect> {
  const fromPath = normalizePathname(input.fromPath)
  const toUrl = input.toUrl.trim()
  if (!fromPath || fromPath === '/') throw new Error('A from-path is required.')
  if (!toUrl) throw new Error('A destination URL is required.')
  const id = encodeURIComponent(fromPath)
  const ref = getAdminDb().collection(REDIRECTS_COLLECTION).doc(id)
  const existing = await ref.get()
  const createdAtMs = existing.exists
    ? Number((existing.data() as { createdAtMs?: number })?.createdAtMs ?? Date.now())
    : Date.now()
  await ref.set(
    {
      fromPath,
      toUrl,
      source: input.source,
      createdAtMs,
      updatedAt: FieldValue.serverTimestamp(),
      ...(existing.exists ? {} : { hits: 0 }),
    },
    { merge: true }
  )
  redirectCache = null
  const saved = (await getRedirectRows()).find((row) => row.fromPath === fromPath)
  return (
    saved ?? {
      fromPath,
      toUrl,
      source: input.source,
      hits: 0,
      createdAt: createdAtMs,
    }
  )
}

export async function deleteRedirect(fromPath: string): Promise<void> {
  const id = encodeURIComponent(normalizePathname(fromPath))
  await getAdminDb().collection(REDIRECTS_COLLECTION).doc(id).delete()
  redirectCache = null
}

export type NotFoundHitInput = {
  host: string
  path: string
  referrer: string
  userAgent: string
  isBot: boolean
  matchedSlugs: string[]
  topScore: number
}

export async function recordNotFoundHit(input: NotFoundHitInput): Promise<string> {
  const ref = getAdminDb().collection(NOT_FOUND_LOG_COLLECTION).doc()
  await ref.set({
    host: input.host.slice(0, 200),
    path: input.path.slice(0, 500),
    referrer: input.referrer.slice(0, 500),
    userAgent: input.userAgent.slice(0, 400),
    isBot: input.isBot,
    matchedSlugs: input.matchedSlugs.slice(0, 5),
    topScore: input.topScore,
    clickedSuggestion: null,
    at: Date.now(),
  })
  return ref.id
}

export async function markNotFoundClick(id: string, slug: string): Promise<void> {
  const trimmed = slug.trim()
  if (!/^[a-z0-9-]{1,180}$/i.test(trimmed)) return
  await getAdminDb().collection(NOT_FOUND_LOG_COLLECTION).doc(id).set(
    { clickedSuggestion: trimmed },
    { merge: true }
  )
}

export type NotFoundLogRow = {
  id: string
  host: string
  path: string
  referrer: string
  userAgent: string
  isBot: boolean
  matchedSlugs: string[]
  topScore: number
  clickedSuggestion: string | null
  at: number
}

export async function fetchRecentNotFoundLogs(limit = 2000): Promise<NotFoundLogRow[]> {
  const snap = await getAdminDb()
    .collection(NOT_FOUND_LOG_COLLECTION)
    .orderBy('at', 'desc')
    .limit(limit)
    .get()
  return snap.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>
    return {
      id: doc.id,
      host: String(data.host ?? ''),
      path: String(data.path ?? ''),
      referrer: String(data.referrer ?? ''),
      userAgent: String(data.userAgent ?? ''),
      isBot: Boolean(data.isBot),
      matchedSlugs: Array.isArray(data.matchedSlugs)
        ? data.matchedSlugs.map(String)
        : [],
      topScore: typeof data.topScore === 'number' ? data.topScore : 0,
      clickedSuggestion:
        typeof data.clickedSuggestion === 'string' ? data.clickedSuggestion : null,
      at: typeof data.at === 'number' ? data.at : 0,
    }
  })
}
