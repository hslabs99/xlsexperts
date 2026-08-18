import 'server-only'

import type { Metadata } from 'next'
import { getMarketCopy } from '@/lib/market-server'
import { SITE_ICONS } from '@/lib/site-icons'

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
  const href = path.startsWith('/') ? path : `/${path}`
  const url = `${site.origin}${href === '/' ? '' : href}`
  const keywordList =
    typeof keywords === 'string'
      ? keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : keywords
  return {
    title,
    description,
    icons: SITE_ICONS,
    ...(keywordList && keywordList.length > 0
      ? { keywords: keywordList }
      : {}),
    ...(robots ? { robots } : {}),
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle ?? title,
      description: ogDescription ?? description,
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
  const href = path.startsWith('/') ? path : `/${path}`
  return `${site.origin}${href === '/' ? '' : href}`
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
  const href = path.startsWith('/') ? path : `/${path}`
  const url = `${copy.site.origin}${href}`
  const areaName = copy.home.schemaAreaServed
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'ProfessionalService',
      name: 'XLS Experts',
      url: copy.site.origin,
      areaServed: { '@type': 'Place', name: areaName },
    },
    url,
    areaServed: { '@type': 'Place', name: areaName },
    serviceType: serviceType ?? name,
  }
}
