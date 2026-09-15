import 'server-only'

import { PUBLISHED_HOME_SERVICES } from '@/data/home-services.generated'
import { getIsLocalDev, getMarket } from '@/lib/market-server'
import { withTimeout } from '@/lib/with-timeout'
import {
  defaultHomeServicesBundle,
  normalizeHomeServicesBundle,
  pickHomeServices,
  type HomeServicesContent,
} from '@/lib/home-services'

/**
 * Public homepage services for this request's market.
 * Localhost reads the CMS draft so Save draft is enough to preview.
 * Production reads the published static file.
 */
export async function getHomeServicesContent(): Promise<HomeServicesContent> {
  const market = await getMarket()
  let bundle = defaultHomeServicesBundle()
  try {
    bundle = normalizeHomeServicesBundle(PUBLISHED_HOME_SERVICES)
  } catch {
    bundle = defaultHomeServicesBundle()
  }
  if (await getIsLocalDev()) {
    try {
      const { fetchHomeServicesDraft } = await import('@/lib/home-services-db')
      const draft = await withTimeout(
        fetchHomeServicesDraft(),
        6_000,
        'fetchHomeServicesDraft'
      )
      bundle = draft.content
    } catch (error) {
      console.error(
        '[home-services] localhost CMS draft unavailable, using published copy',
        error instanceof Error ? error.message : error
      )
    }
  }
  return pickHomeServices(bundle, market)
}
