/**
 * Market / domain resolution for NZ (.co.nz) vs international (.com).
 *
 * Production: recognizable host only (xlsexperts.com → intl, .co.nz → nz;
 * anything else → nz).
 *
 * Local testing: visit /nz or /usa once — sets a cookie, redirects to the
 * real path, and the market persists for all further navigation. No prior
 * switch → New Zealand.
 */

export type MarketId = 'nz' | 'intl'

export const MARKET_COOKIE = 'xls-market'
export const MARKET_HEADER = 'x-xls-market'

/** Default when no switch and no recognizable domain. */
export const DEFAULT_MARKET: MarketId = 'nz'

export const MARKET_IDS: MarketId[] = ['nz', 'intl']

export function isMarketId(value: unknown): value is MarketId {
  return value === 'nz' || value === 'intl'
}

export function parseMarketId(value: string | null | undefined): MarketId | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (normalized === 'nz') return 'nz'
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
  return market === 'nz' ? 'New Zealand' : 'International (USA)'
}

/** True when the request host is a local/dev machine. */
export function isLocalHost(host: string): boolean {
  const h = host.split(':')[0]?.toLowerCase() ?? ''
  return h === 'localhost' || h === '127.0.0.1' || h === '::1'
}

function hostnameOnly(host: string): string {
  return host.split(':')[0]?.toLowerCase() ?? ''
}

/** Recognizable international production host. */
export function isIntlProductionHost(host: string): boolean {
  const h = hostnameOnly(host)
  return h === 'xlsexperts.com' || h.endsWith('.xlsexperts.com')
}

/** Recognizable New Zealand production host. */
export function isNzProductionHost(host: string): boolean {
  const h = hostnameOnly(host)
  return h === 'xlsexperts.co.nz' || h.endsWith('.xlsexperts.co.nz')
}

/**
 * Resolve market from production host only.
 * Unknown / preview / local hosts → New Zealand (default).
 */
export function marketFromHost(host: string): MarketId {
  if (isIntlProductionHost(host)) return 'intl'
  if (isNzProductionHost(host)) return 'nz'
  return DEFAULT_MARKET
}

/**
 * Strip a leading /nz or /usa (case-insensitive) path segment used for local testing.
 * Returns null if the path is not a market-prefixed path.
 */
export function stripLocalMarketPrefix(pathname: string): {
  market: MarketId
  pathname: string
} | null {
  const match = pathname.match(/^\/(nz|usa)(?=\/|$)/i)
  if (!match) return null
  const segment = match[1].toLowerCase()
  const market: MarketId = segment === 'nz' ? 'nz' : 'intl'
  const rest = pathname.slice(match[0].length) || '/'
  return { market, pathname: rest.startsWith('/') ? rest : `/${rest}` }
}
