import { MARKET_IDS, type MarketId } from '@/lib/market'
import { servicePageHrefs } from '@/lib/service-pages'
import { ALL_SOLUTIONS_HREF, solutionPageHrefs } from '@/lib/solutions'

/**
 * Paths that 200 on every public hostname (home, services, solutions, blog index).
 * Blog posts are NOT in this list — they follow showNz / showUsa / showUk.
 */
export const SHARED_INDEXABLE_PATHS: readonly string[] = [
  '/',
  '/enterprise',
  '/use-cases',
  '/blog',
  '/services',
  ALL_SOLUTIONS_HREF,
  ...servicePageHrefs,
  ...solutionPageHrefs,
]

const SHARED_SET = new Set(SHARED_INDEXABLE_PATHS)

export function isSharedIndexablePath(pathname: string): boolean {
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '') || '/'
  return SHARED_SET.has(path)
}

export function sharedIndexableMarkets(): readonly MarketId[] {
  return MARKET_IDS
}
