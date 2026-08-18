/**
 * Market / domain resolution for NZ, International, and UK.
 *
 * Production: host matching uses Admin → Settings → Domains (published
 * `data/domain-regions.generated.ts`). Unknown hosts → New Zealand.
 *
 * Local testing: visit /nz, /usa, or /uk once — sets a cookie, redirects to the
 * real path, and the market persists for all further navigation. No prior
 * switch → New Zealand.
 */

import { PUBLISHED_DOMAIN_REGIONS } from '@/data/domain-regions.generated'
import {
  hostMatchesDomainList,
  primaryHost,
  resolveMarketFromHost,
} from '@/lib/domain-regions'

export type MarketId = 'nz' | 'intl' | 'uk'

export const MARKET_COOKIE = 'xls-market'
export const MARKET_HEADER = 'x-xls-market'

/** Default when no switch and no recognizable domain. */
export const DEFAULT_MARKET: MarketId = 'nz'

export const MARKET_IDS: MarketId[] = ['nz', 'intl', 'uk']

export function isMarketId(value: unknown): value is MarketId {
  return value === 'nz' || value === 'intl' || value === 'uk'
}

export function parseMarketId(value: string | null | undefined): MarketId | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (normalized === 'nz') return 'nz'
  if (
    normalized === 'uk' ||
    normalized === 'gb' ||
    normalized === 'united kingdom' ||
    normalized === 'co.uk'
  ) {
    return 'uk'
  }
  if (
    normalized === 'intl' ||
    normalized === 'usa' ||
    normalized === 'us' ||
    normalized === 'international'
  ) {
    return 'intl'
  }
  return null
}

export function marketLabel(market: MarketId): string {
  if (market === 'uk') return 'United Kingdom'
  if (market === 'intl') return 'International'
  return 'New Zealand'
}

export function marketShortLabel(market: MarketId): string {
  if (market === 'uk') return 'UK'
  if (market === 'intl') return 'Intl'
  return 'NZ'
}

export function marketHostHint(market: MarketId): string {
  const fromPublished = primaryHost(
    PUBLISHED_DOMAIN_REGIONS.regions[market].hosts
  )
  if (fromPublished) return fromPublished
  if (market === 'uk') return 'xlsexperts.co.uk'
  if (market === 'intl') return 'xlsexperts.com'
  return 'xlsexperts.co.nz'
}

/** True when the request host is a local/dev machine. */
export function isLocalHost(host: string): boolean {
  const h = host.split(':')[0]?.toLowerCase() ?? ''
  return h === 'localhost' || h === '127.0.0.1' || h === '::1'
}

/** Recognizable international production host. */
export function isIntlProductionHost(host: string): boolean {
  return hostMatchesDomainList(
    host,
    PUBLISHED_DOMAIN_REGIONS.regions.intl.hosts
  )
}

/** Recognizable United Kingdom production host. */
export function isUkProductionHost(host: string): boolean {
  return hostMatchesDomainList(host, PUBLISHED_DOMAIN_REGIONS.regions.uk.hosts)
}

/** Recognizable New Zealand production host. */
export function isNzProductionHost(host: string): boolean {
  return hostMatchesDomainList(host, PUBLISHED_DOMAIN_REGIONS.regions.nz.hosts)
}

/**
 * Resolve market from production host only.
 * Unknown / preview / local hosts → New Zealand (default).
 */
export function marketFromHost(host: string): MarketId {
  return resolveMarketFromHost(
    host,
    PUBLISHED_DOMAIN_REGIONS.regions,
    DEFAULT_MARKET
  )
}

/**
 * Default for the public time zone selector when booking display settings
 * have not loaded yet. NZ and UK hide it; International shows it.
 */
export function marketUsesVisitorTimeZone(market: MarketId): boolean {
  return market === 'intl'
}

/** Local-dev region switcher: /nz, /usa, /uk. */
export const LOCAL_MARKET_SWITCHES: {
  market: MarketId
  segment: 'nz' | 'usa' | 'uk'
  label: string
  hint: string
}[] = [
  { market: 'nz', segment: 'nz', label: 'NZ', hint: marketHostHint('nz') },
  { market: 'intl', segment: 'usa', label: 'USA', hint: marketHostHint('intl') },
  { market: 'uk', segment: 'uk', label: 'UK', hint: marketHostHint('uk') },
]

/**
 * Strip a leading /nz, /usa, or /uk (case-insensitive) path segment used for local testing.
 * Returns null if the path is not a market-prefixed path.
 */
export function stripLocalMarketPrefix(pathname: string): {
  market: MarketId
  pathname: string
} | null {
  const match = pathname.match(/^\/(nz|usa|uk)(?=\/|$)/i)
  if (!match) return null
  const segment = match[1].toLowerCase()
  const market: MarketId =
    segment === 'nz' ? 'nz' : segment === 'uk' ? 'uk' : 'intl'
  const rest = pathname.slice(match[0].length) || '/'
  return { market, pathname: rest.startsWith('/') ? rest : `/${rest}` }
}
