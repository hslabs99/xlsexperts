import 'server-only'

import { PUBLISHED_HERO_TOP_BULLETS } from '@/data/hero-top-bullets.generated'
import { getIsLocalDev, getMarket } from '@/lib/market-server'
import { withTimeout } from '@/lib/with-timeout'
import {
  defaultHeroTopBulletsBundle,
  heroTopBulletTexts,
  normalizeHeroTopBulletsBundle,
  pickHeroTopBullets,
  type HeroTopBulletsBundle,
} from '@/lib/hero-top-bullets'

/** Published homepage top bullets (static import — zero DB). */
export function getPublishedHeroTopBulletsBundle(): HeroTopBulletsBundle {
  try {
    return normalizeHeroTopBulletsBundle(PUBLISHED_HERO_TOP_BULLETS)
  } catch {
    return defaultHeroTopBulletsBundle()
  }
}

/**
 * Public homepage hero checklist for this request.
 * Localhost reads the CMS draft so Save draft is enough to preview.
 * Production reads the published static file.
 */
export async function getHeroTopBulletTexts(): Promise<string[]> {
  const market = await getMarket()
  let bundle = getPublishedHeroTopBulletsBundle()
  if (await getIsLocalDev()) {
    try {
      const { fetchHeroTopBulletsDraft } = await import(
        '@/lib/hero-top-bullets-db'
      )
      const draft = await withTimeout(
        fetchHeroTopBulletsDraft(),
        6_000,
        'fetchHeroTopBulletsDraft'
      )
      bundle = draft.content
    } catch (error) {
      console.error(
        '[hero-top-bullets] localhost CMS draft unavailable, using published copy',
        error instanceof Error ? error.message : error
      )
    }
  }
  return heroTopBulletTexts(pickHeroTopBullets(bundle, market))
}
