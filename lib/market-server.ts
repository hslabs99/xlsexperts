import 'server-only'

import { headers } from 'next/headers'
import {
  DEFAULT_MARKET,
  MARKET_COOKIE,
  MARKET_HEADER,
  isLocalHost,
  isMarketId,
  marketFromHost,
  parseMarketId,
  type MarketId,
} from '@/lib/market'
import {
  pickMarketCopy,
  type MarketCopy,
  type MarketCopyBundle,
} from '@/lib/market-copy'
import { PUBLISHED_MARKET_COPY } from '@/data/market-copy.generated'

/**
 * Market for this request.
 * Middleware sets x-xls-market. On localhost the cookie persists /nz|/usa.
 * Without a switch or recognizable domain → New Zealand.
 */
export async function getMarket(): Promise<MarketId> {
  const h = await headers()
  const fromHeader = parseMarketId(h.get(MARKET_HEADER))
  if (fromHeader) return fromHeader

  const host = h.get('x-forwarded-host') || h.get('host') || ''
  if (isLocalHost(host)) {
    const cookieHeader = h.get('cookie') ?? ''
    const cookieMatch = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${MARKET_COOKIE}=([^;]+)`)
    )
    const fromCookie = parseMarketId(
      cookieMatch?.[1] ? decodeURIComponent(cookieMatch[1]) : null
    )
    if (fromCookie) return fromCookie
    return DEFAULT_MARKET
  }

  return marketFromHost(host)
}

/** Full published bundle (both markets) — static import, zero DB. */
export function getPublishedMarketCopyBundle(): MarketCopyBundle {
  return PUBLISHED_MARKET_COPY.markets
}

/** Published copy for the current request market. */
export async function getMarketCopy(): Promise<MarketCopy> {
  const market = await getMarket()
  return pickMarketCopy(getPublishedMarketCopyBundle(), market)
}

export function getMarketCopyFor(market: MarketId): MarketCopy {
  const id = isMarketId(market) ? market : DEFAULT_MARKET
  return pickMarketCopy(getPublishedMarketCopyBundle(), id)
}

/** Absolute site origin for the current request market (.co.nz or .com). */
export async function getSiteOrigin(): Promise<string> {
  const copy = await getMarketCopy()
  return copy.site.origin
}
