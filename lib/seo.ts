import 'server-only'

import type { Metadata } from 'next'
import { MARKET_IDS, type MarketId } from '@/lib/market'
import { getMarket, getMarketCopy } from '@/lib/market-server'
import {
  absoluteOnOrigin,
  buildAlternates,
  normalizePathname,
  serpTokensForMarket,
} from '@/lib/regions'
import { resolveSerpCopy } from '@/lib/serp-copy'
import { SITE_ICONS } from '@/lib/site-icons'

const BRAND_TITLE_SUFFIX = ' | XLS Experts'

type PageSeoInput = {
  path: string
  title: string
  description: string
  keywords?: string | string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogImageWidth?: number
  ogImageHeight?: number
  robots?: Metadata['robots']
}

/**
 * Single owner of the document title suffix. Page titles that already end
 * with `| XLS Experts` (CMS / defaults) are left as-is; short titles get it
 * once. Combined with no layout `title.template`, this cannot double.
 */
export function documentTitle(title: string): string {
  const trimmed = title.trim()
  if (!trimmed) return 'XLS Experts'
  if (trimmed === 'XLS Experts' || trimmed.endsWith(BRAND_TITLE_SUFFIX)) {
    return trimmed
  }
  return `${trimmed}${BRAND_TITLE_SUFFIX}`
}

function robotsAreNoIndex(robots: Metadata['robots'] | undefined): boolean {
  if (!robots) return false
  if (typeof robots === 'string') return /\bnoindex\b/i.test(robots)
  if (typeof robots === 'object') return robots.index === false
  return false
}

/**
 * Canonical for this request's arrival origin (the Host that Firebase already
 * routes to nz / intl / uk). Hreflang lists only hosts where this path 200s.
 * We never cross-canonical to another market.
 */
export async function marketPathAlternates(
  path: string,
  options?: { indexable?: boolean; markets?: readonly MarketId[] }
): Promise<NonNullable<Metadata['alternates']>> {
  const { site } = await getMarketCopy()
  const pathname = normalizePathname(path)
  const canonical = absoluteOnOrigin(site.origin, pathname)
  if (options?.indexable === false) {
    return { canonical }
  }
  const languages = buildAlternates(pathname, options?.markets ?? MARKET_IDS)
  return languages ? { canonical, languages } : { canonical }
}

/** Market-scoped metadata: canonical + OG URL always match the arrival domain. */
export async function marketPageMetadata({
  path,
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage = '/images/og-default.png',
  ogImageWidth = 1200,
  ogImageHeight = 630,
  robots,
}: PageSeoInput): Promise<Metadata> {
  const { site } = await getMarketCopy()
  const market = await getMarket()
  const pathname = normalizePathname(path)
  const serp = resolveSerpCopy(pathname, market)
  const resolvedTitle = serp?.title ?? title
  const resolvedDescription = serp?.description ?? description
  const url = absoluteOnOrigin(site.origin, pathname)
  const keywordList =
    typeof keywords === 'string'
      ? keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : keywords
  const indexable = !robotsAreNoIndex(robots)
  return {
    title: { absolute: documentTitle(resolvedTitle) },
    description: resolvedDescription,
    icons: SITE_ICONS,
    ...(keywordList && keywordList.length > 0
      ? { keywords: keywordList }
      : {}),
    ...(robots ? { robots } : {}),
    alternates: await marketPathAlternates(pathname, { indexable }),
    openGraph: {
      title: ogTitle ?? resolvedTitle,
      description: ogDescription ?? resolvedDescription,
      url,
      images: [
        { url: ogImage, width: ogImageWidth, height: ogImageHeight },
      ],
    },
  }
}

/** Absolute URL on the current market origin. */
export async function marketAbsoluteUrl(path = '/'): Promise<string> {
  const { site } = await getMarketCopy()
  return absoluteOnOrigin(site.origin, path)
}

export async function marketSiteOrigin(): Promise<string> {
  const { site } = await getMarketCopy()
  return site.origin
}

type ServiceSchemaInput = {
  path: string
  name: string
  description: string
  serviceType?: string
}

/** JSON-LD Service schema scoped to the request market (never cross-domain). */
export async function marketServiceSchema({
  path,
  name,
  description,
  serviceType,
}: ServiceSchemaInput) {
  const copy = await getMarketCopy()
  const market = await getMarket()
  const href = path.startsWith('/') ? path : `/${path}`
  const url = absoluteOnOrigin(copy.site.origin, href)
  const areaName = copy.home.schemaAreaServed
  const currency = serpTokensForMarket(market).currency
  const telephone = copy.contact.phoneTel.startsWith('+')
    ? copy.contact.phoneTel
    : `+${copy.contact.phoneTel.replace(/\D/g, '')}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'ProfessionalService',
      name: 'XLS Experts',
      url: copy.site.origin,
      telephone,
      areaServed: { '@type': 'Country', name: areaName },
      address: {
        '@type': 'PostalAddress',
        addressCountry: copy.home.schemaAddressCountry,
        addressLocality: copy.home.schemaAddressLocality,
      },
    },
    url,
    areaServed: { '@type': 'Country', name: areaName },
    serviceType: serviceType ?? name,
    offers: {
      '@type': 'Offer',
      priceCurrency: currency,
    },
  }
}

/** Homepage Organization / LocalBusiness JSON-LD for the request market. */
export async function marketLocalBusinessSchema() {
  const copy = await getMarketCopy()
  const market = await getMarket()
  const currency = serpTokensForMarket(market).currency
  const telephone = copy.contact.phoneTel.startsWith('+')
    ? copy.contact.phoneTel
    : `+${copy.contact.phoneTel.replace(/\D/g, '')}`
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'XLS Experts',
    description: copy.home.schemaDescription,
    url: absoluteOnOrigin(copy.site.origin, '/'),
    logo: `${copy.site.origin.replace(/\/+$/, '')}/images/xls-experts-logo.png`,
    telephone,
    currenciesAccepted: currency,
    areaServed: {
      '@type': 'Country',
      name: copy.home.schemaAreaServed,
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: copy.home.schemaAddressCountry,
      addressLocality: copy.home.schemaAddressLocality,
    },
    knowsAbout: [
      'Excel VBA development',
      'Spreadsheet automation',
      'Excel dashboard development',
      `Financial ${serpTokensForMarket(market).modelling}`,
      'Power Query',
      'Business process automation',
      'Excel consulting',
      'Data analysis',
    ],
    sameAs: [copy.site.origin.replace(/\/+$/, '')],
  }
}
