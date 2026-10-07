/**
 * Temporary recrawl list for xlsexperts.com and xlsexperts.co.uk.
 * Those domains used to serve NZ articles. The URLs now 301 to the primary
 * domain. Listing them helps Google recrawl and drop them.
 *
 * Turn SITEMAP_LEGACY_ENABLED off after about 3 months (target January 2027).
 * Keep the redirects themselves.
 */

import type { MarketId } from '@/lib/market'

export const SITEMAP_LEGACY_ENABLED = true

export function legacySitemapApplies(market: MarketId): boolean {
  return SITEMAP_LEGACY_ENABLED && (market === 'uk' || market === 'intl')
}

export function withLegacySitemapLine(
  robotsBody: string,
  origin: string,
  market: MarketId
): string {
  if (!legacySitemapApplies(market)) return robotsBody
  if (robotsBody.includes('/sitemap-legacy.xml')) return robotsBody
  const line = `Sitemap: ${origin.replace(/\/+$/, '')}/sitemap-legacy.xml`
  return `${robotsBody.trimEnd()}\n${line}\n`
}
