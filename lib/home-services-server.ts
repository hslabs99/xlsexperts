import 'server-only'

import { PUBLISHED_HOME_SERVICES } from '@/data/home-services.generated'
import { getIsLocalDev } from '@/lib/market-server'
import { withTimeout } from '@/lib/with-timeout'
import {
  defaultHomeServicesContent,
  normalizeHomeServicesContent,
  type HomeServicesContent,
} from '@/lib/home-services'

/** Published homepage services (static import — zero DB). */
export function getPublishedHomeServices(): HomeServicesContent {
  try {
    return normalizeHomeServicesContent(PUBLISHED_HOME_SERVICES)
  } catch {
    return defaultHomeServicesContent()
  }
}

/**
 * Public homepage services for this request.
 * Localhost reads the CMS draft so Save draft is enough to preview.
 * Production reads the published static file.
 */
export async function getHomeServicesContent(): Promise<HomeServicesContent> {
  if (await getIsLocalDev()) {
    try {
      const { fetchHomeServicesDraft } = await import('@/lib/home-services-db')
      const draft = await withTimeout(
        fetchHomeServicesDraft(),
        6_000,
        'fetchHomeServicesDraft'
      )
      return draft.content
    } catch (error) {
      console.error(
        '[home-services] localhost CMS draft unavailable, using published copy',
        error instanceof Error ? error.message : error
      )
    }
  }
  return getPublishedHomeServices()
}
