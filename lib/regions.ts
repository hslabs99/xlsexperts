/**
 * Hreflang / canonical URL helpers for the three public markets.
 *
 * Host → market routing stays in `lib/market.ts` + `proxy.ts` (published
 * domain-regions). This module only builds the SEO cluster Google needs:
 * self-canonical on the arrival origin, hreflang only for hosts that actually
 * 200 the same path, x-default → .com when that host is in the cluster.
 */

import { PUBLISHED_DOMAIN_REGIONS } from '@/data/domain-regions.generated'
import {
  hostnameOnly,
  siteOriginsFromRegions,
  type DomainRegionBinding,
} from '@/lib/domain-regions'
import { MARKET_IDS, isLocalHost, type MarketId } from '@/lib/market'

/**
 * SERP geo tokens for the three live sites. These are not interchangeable:
 *   nz   → www.xlsexperts.co.nz  (New Zealand)
 *   uk   → www.xlsexperts.co.uk  (United Kingdom)
 *   intl → www.xlsexperts.com    (global, US-primary — never share UK copy)
 */
export type SerpTokens = {
  region: 'NZ' | 'UK' | 'US'
  based: 'Auckland-based' | 'UK-facing' | 'US-facing'
  modelling: 'modelling' | 'modeling'
  organisations: 'organisations' | 'organizations'
  currency: 'NZD' | 'USD' | 'GBP'
}

export function serpTokensForMarket(market: MarketId): SerpTokens {
  if (market === 'uk') {
    return {
      region: 'UK',
      based: 'UK-facing',
      modelling: 'modelling',
      organisations: 'organisations',
      currency: 'GBP',
    }
  }
  if (market === 'intl') {
    return {
      region: 'US',
      based: 'US-facing',
      modelling: 'modeling',
      organisations: 'organizations',
      currency: 'USD',
    }
  }
  return {
    region: 'NZ',
    based: 'Auckland-based',
    modelling: 'modelling',
    organisations: 'organisations',
    currency: 'NZD',
  }
}

/** Google-preferred mixed-case codes (en-NZ, not en-nz). */
export type Hreflang = 'en-NZ' | 'en-US' | 'en-GB'

export const HREFLANG_FOR_MARKET: Record<MarketId, Hreflang> = {
  nz: 'en-NZ',
  intl: 'en-US',
  uk: 'en-GB',
}

export type Region = {
  origin: string
  hreflang: Hreflang
  locale: string
  country: string
}

/** Next.js Metadata.alternates.languages — only keys that 200. */
export type AlternateLanguages = Record<string, string>

export const X_DEFAULT_ORIGIN = 'https://www.xlsexperts.com'

const LOCAL_DEV_ORIGIN = 'https://www.xlsexperts.co.nz'

const publishedOrigins = siteOriginsFromRegions(PUBLISHED_DOMAIN_REGIONS.regions)

export function originForMarket(market: MarketId): string {
  if (market === 'uk') return publishedOrigins.uk
  if (market === 'intl') return publishedOrigins.intl
  return publishedOrigins.nz
}

/** Apex host → www host. Preview / Cloud Run hosts are not listed. */
export const APEX_TO_WWW: Record<string, string> = {
  'xlsexperts.co.nz': 'www.xlsexperts.co.nz',
  'xlsexperts.com': 'www.xlsexperts.com',
  'xlsexperts.co.uk': 'www.xlsexperts.co.uk',
}

/**
 * LocalBusiness fields per market. NZ has a real Auckland number.
 * .com and .co.uk have no local line — omit telephone rather than the NZ number.
 */
export type RegionLocalBusiness = {
  addressCountry: 'NZ' | 'US' | 'GB'
  addressLocality?: string
  telephone?: string
  areaServedName: string
}

export function localBusinessForMarket(market: MarketId): RegionLocalBusiness {
  if (market === 'uk') {
    return { addressCountry: 'GB', areaServedName: 'United Kingdom' }
  }
  if (market === 'intl') {
    return {
      addressCountry: 'US',
      areaServedName: 'United States and international',
    }
  }
  return {
    addressCountry: 'NZ',
    addressLocality: 'Auckland',
    telephone: '+6421783967',
    areaServedName: 'New Zealand',
  }
}

export function marketHasPublicTelephone(market: MarketId): boolean {
  return Boolean(localBusinessForMarket(market).telephone)
}

const REGION_SEO: readonly {
  binding: DomainRegionBinding
  origin: string
  hreflang: Hreflang
  locale: string
  country: string
}[] = [
  {
    binding: PUBLISHED_DOMAIN_REGIONS.regions.nz,
    origin: publishedOrigins.nz,
    hreflang: 'en-NZ',
    locale: 'en-NZ',
    country: 'NZ',
  },
  {
    binding: PUBLISHED_DOMAIN_REGIONS.regions.intl,
    origin: publishedOrigins.intl,
    hreflang: 'en-US',
    locale: 'en-US',
    country: 'US',
  },
  {
    binding: PUBLISHED_DOMAIN_REGIONS.regions.uk,
    origin: publishedOrigins.uk,
    hreflang: 'en-GB',
    locale: 'en-GB',
    country: 'GB',
  },
]

function hostKeysForOrigin(origin: string, hosts: string[]): string[] {
  const keys = new Set<string>()
  const add = (raw: string) => {
    const host = hostnameOnly(raw)
    if (!host) return
    keys.add(host)
    const apex = host.replace(/^www\./, '')
    keys.add(apex)
    keys.add(`www.${apex}`)
  }
  add(origin.replace(/^https?:\/\//, ''))
  for (const host of hosts) add(host)
  return [...keys]
}

function buildHostnameMap(): Record<string, Region> {
  const map: Record<string, Region> = {}
  for (const row of REGION_SEO) {
    const region: Region = {
      origin: row.origin,
      hreflang: row.hreflang,
      locale: row.locale,
      country: row.country,
    }
    for (const key of hostKeysForOrigin(row.origin, row.binding.hosts)) {
      map[key] = region
    }
  }
  return map
}

/** Hostname (www or apex) → region SEO record. */
export const REGIONS: Record<string, Region> = buildHostnameMap()

export function normalizePathname(pathname: string): string {
  const trimmed = pathname.trim()
  if (!trimmed || trimmed === '/') return '/'
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const withoutQuery = withSlash.split('?')[0]?.split('#')[0] ?? withSlash
  return withoutQuery.replace(/\/+$/, '') || '/'
}

function stripTrailingSlash(origin: string): string {
  return origin.replace(/\/+$/, '')
}

/**
 * Absolute URL on an origin. Homepage always uses a trailing slash so
 * sitemap loc, canonical, hreflang and OG url are the same form.
 */
export function absoluteOnOrigin(origin: string, pathname: string): string {
  const base = stripTrailingSlash(origin)
  const path = normalizePathname(pathname)
  return path === '/' ? `${base}/` : `${base}${path}`
}

/**
 * Resolve the public origin from a Host header.
 * Localhost → NZ. Unknown production hosts → x-default (.com).
 *
 * Public page canonicals should still use `getSiteOrigin()` so the local
 * /nz|/usa|/uk cookie switch keeps matching the previewed market.
 */
export function getOriginFromHost(host: string | null): string {
  if (!host) return X_DEFAULT_ORIGIN
  const normalized = hostnameOnly(host)
  if (!normalized) return X_DEFAULT_ORIGIN
  if (isLocalHost(normalized)) return LOCAL_DEV_ORIGIN
  return REGIONS[normalized]?.origin ?? X_DEFAULT_ORIGIN
}

function uniqueMarkets(markets: readonly MarketId[]): MarketId[] {
  return MARKET_IDS.filter((id) => markets.includes(id))
}

/**
 * Hreflang cluster for hosts that actually render this path (200).
 * Fewer than two markets → undefined (no hreflang, not a self-only tag).
 * x-default is included only when .com is in the cluster.
 */
export function buildAlternates(
  pathname: string,
  markets: readonly MarketId[] = MARKET_IDS
): AlternateLanguages | undefined {
  const live = uniqueMarkets(markets)
  if (live.length < 2) return undefined
  const path = normalizePathname(pathname)
  const languages: AlternateLanguages = {}
  for (const id of live) {
    languages[HREFLANG_FOR_MARKET[id]] = absoluteOnOrigin(
      originForMarket(id),
      path
    )
  }
  if (live.includes('intl')) {
    languages['x-default'] = absoluteOnOrigin(X_DEFAULT_ORIGIN, path)
  }
  return languages
}

export function sitemapLanguageAlternates(
  pageUrl: string,
  markets: readonly MarketId[] = MARKET_IDS
): { languages: AlternateLanguages } | undefined {
  let pathname = '/'
  try {
    pathname = normalizePathname(new URL(pageUrl).pathname)
  } catch {
    pathname = '/'
  }
  const languages = buildAlternates(pathname, markets)
  return languages ? { languages } : undefined
}
