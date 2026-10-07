import 'server-only'

import { cache } from 'react'
import { PUBLISHED_REGION_ALIASES } from '@/data/region-aliases.generated'
import { getIsLocalDev } from '@/lib/market-server'
import type { MarketId } from '@/lib/market'
import {
  aliasesFromPublished,
  applyRegionAliasesToValue,
  type RegionAlias,
} from '@/lib/region-aliases'
import { withTimeout } from '@/lib/with-timeout'

export function publishedRegionAliases(): RegionAlias[] {
  return aliasesFromPublished(PUBLISHED_REGION_ALIASES)
}

/**
 * Alias list for this request.
 * Production uses the published file (no Firestore).
 * Localhost uses the CMS draft so Save is enough to preview Firebase content.
 */
export const loadRegionAliases = cache(async (): Promise<RegionAlias[]> => {
  if (await getIsLocalDev()) {
    try {
      const { fetchRegionAliasesDraft } = await import('@/lib/region-aliases-db')
      const draft = await withTimeout(
        fetchRegionAliasesDraft(),
        6_000,
        'fetchRegionAliasesDraft'
      )
      return draft.aliases
    } catch (error) {
      console.error(
        '[region-aliases] localhost draft unavailable, using published list',
        error instanceof Error ? error.message : error
      )
    }
  }
  return publishedRegionAliases()
})

export async function aliasServedValue<T>(
  value: T,
  market: MarketId
): Promise<T> {
  const aliases = await loadRegionAliases()
  return applyRegionAliasesToValue(value, market, aliases)
}
