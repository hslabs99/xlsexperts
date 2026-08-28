import 'server-only'

import { cookies, headers } from 'next/headers'
import { connection } from 'next/server'
import {
  DEFAULT_MARKET,
  MARKET_COOKIE,
  MARKET_HEADER,
  isLocalHost,
  isMarketId,
  marketFromHost,
  normalizeRequestHost,
  parseMarketId,
  type MarketId,
} from '@/lib/market'
import { PUBLISHED_MARKET_COPY } from '@/data/market-copy.generated'
import { withTimeout } from '@/lib/with-timeout'
import {
  pickHeroBackgroundHoldSeconds,
  pickMarketCopy,
  type MarketCopy,
  type MarketCopyBundle,
} from '@/lib/market-copy'

/**
 * Market for this request.
 * Middleware sets x-xls-market. On localhost the cookie persists /nz|/usa|/uk.
 * Without a switch or recognizable domain → New Zealand.
 */
export async function getMarket(): Promise<MarketId> {
  await connection()
  const h = await headers()
  const fromHeader = parseMarketId(h.get(MARKET_HEADER))
  if (fromHeader) return fromHeader

  const host = h.get('x-forwarded-host') || h.get('host') || ''
  if (isLocalHost(host)) {
    const cookieStore = await cookies()
    const fromCookieStore = parseMarketId(
      cookieStore.get(MARKET_COOKIE)?.value
    )
    if (fromCookieStore) return fromCookieStore

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

/** Live bundle: CMS draft on localhost, published file in production. */
export async function getLiveMarketCopyBundle(): Promise<MarketCopyBundle> {
  return liveMarketCopyBundle()
}

/**
 * Public copy for this request.
 * Localhost reads the CMS draft so Save draft is enough to preview NZ / UK / International.
 * Production reads the published static file.
 */
async function liveMarketCopyBundle(): Promise<MarketCopyBundle> {
  if (await getIsLocalDev()) {
    try {
      const { fetchMarketCopyDraft } = await import('@/lib/market-copy-db')
      const draft = await withTimeout(
        fetchMarketCopyDraft(),
        6_000,
        'fetchMarketCopyDraft'
      )
      return draft.markets
    } catch (error) {
      console.error(
        '[market] localhost CMS draft unavailable, using published copy',
        error instanceof Error ? error.message : error
      )
    }
  }
  return getPublishedMarketCopyBundle()
}

/** Seconds each homepage hero background image is shown before rotating. */
export async function getHeroBackgroundHoldSeconds(): Promise<number> {
  if (await getIsLocalDev()) {
    try {
      const { fetchMarketCopyDraft } = await import('@/lib/market-copy-db')
      const draft = await withTimeout(
        fetchMarketCopyDraft(),
        6_000,
        'fetchMarketCopyDraft'
      )
      return draft.heroBackgroundHoldSeconds
    } catch (error) {
      console.error(
        '[market] localhost hero background hold unavailable, using published value',
        error instanceof Error ? error.message : error
      )
    }
  }
  return pickHeroBackgroundHoldSeconds(PUBLISHED_MARKET_COPY)
}

/** Published copy for the current request market. */
export async function getMarketCopy(): Promise<MarketCopy> {
  const market = await getMarket()
  return pickMarketCopy(await liveMarketCopyBundle(), market)
}

export function getMarketCopyFor(market: MarketId): MarketCopy {
  const id = isMarketId(market) ? market : DEFAULT_MARKET
  return pickMarketCopy(getPublishedMarketCopyBundle(), id)
}

/** Absolute site origin for the current request market (.co.nz, .com, or .co.uk). */
export async function getSiteOrigin(): Promise<string> {
  const copy = await getMarketCopy()
  return copy.site.origin
}

/** Arrival host for this request (no port). */
export async function getRequestHost(): Promise<string> {
  await connection()
  const h = await headers()
  const raw = h.get('x-forwarded-host') || h.get('host') || ''
  return normalizeRequestHost(raw)
}

/** Market + host to stamp on enquiries and funnel events. */
export async function getMarketStamp(): Promise<{
  market: MarketId
  host: string
}> {
  const [market, host] = await Promise.all([getMarket(), getRequestHost()])
  return { market, host }
}

/** True when this request is on localhost (local region switcher). */
export async function getIsLocalDev(): Promise<boolean> {
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || ''
  return isLocalHost(host)
}
