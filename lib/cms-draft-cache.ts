/**
 * Short in-memory cache for CMS Firestore drafts.
 *
 * Local `/usa` (and `/nz` `/uk`) plus Admin remounts otherwise each hit
 * Firestore for the same docs. In-flight loads are shared; saves bump an
 * epoch so a stale read cannot refill the cache after a write.
 */

export const CMS_DRAFT_CACHE_KEYS = {
  marketCopy: 'market-copy',
  pageSeo: 'page-seo',
  homeServices: 'home-services',
  heroTopBullets: 'hero-top-bullets',
  heroClients: 'hero-clients',
  heroProjects: 'hero-projects',
  caseStudiesHome: 'case-studies-home',
  domainRegions: 'domain-regions',
} as const

const TTL_MS = 8_000

type CacheEntry = { value: unknown; expires: number }

const store = new Map<string, CacheEntry>()
const inflight = new Map<string, Promise<unknown>>()
const epoch = new Map<string, number>()

function currentEpoch(key: string): number {
  return epoch.get(key) ?? 0
}

export function invalidateDraftCache(key: string): void {
  epoch.set(key, currentEpoch(key) + 1)
  store.delete(key)
  inflight.delete(key)
}

export async function cachedDraft<T>(
  key: string,
  load: () => Promise<T>,
  ttlMs: number = TTL_MS
): Promise<T> {
  const hit = store.get(key)
  if (hit && hit.expires > Date.now()) return hit.value as T

  const pending = inflight.get(key)
  if (pending) return pending as Promise<T>

  const started = currentEpoch(key)
  const promise = load()
    .then((value) => {
      if (currentEpoch(key) === started) {
        store.set(key, { value, expires: Date.now() + ttlMs })
      }
      return value
    })
    .finally(() => {
      if (inflight.get(key) === promise) inflight.delete(key)
    })

  inflight.set(key, promise)
  return promise
}
