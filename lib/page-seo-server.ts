import 'server-only'

import type { Metadata } from 'next'
import { PUBLISHED_PAGE_SEO } from '@/data/page-seo.generated'
import { getMarket } from '@/lib/market-server'
import type { MarketId } from '@/lib/market'
import {
  catalogItemForPath,
  defaultPageSeoMarkets,
  keywordsList,
  normalizePageSeoMarkets,
  normalizePath,
  pickPageSeoBundle,
  resolvePageSeo,
  type PageSeoFields,
  type PageSeoMarkets,
} from '@/lib/page-seo'
import { marketPageMetadata } from '@/lib/seo'

/** Published NZ + Global page SEO (static import — zero DB). */
export function getPublishedPageSeoMarkets(): PageSeoMarkets {
  const raw = PUBLISHED_PAGE_SEO as unknown as Record<string, unknown>
  // Accept v1 (pages) or v2 (markets) static files
  if (raw && typeof raw === 'object' && 'markets' in raw) {
    return normalizePageSeoMarkets(raw)
  }
  if (raw && typeof raw === 'object' && 'pages' in raw) {
    return normalizePageSeoMarkets(raw)
  }
  return defaultPageSeoMarkets()
}

export function getPublishedPageSeoBundle(market: MarketId = 'nz') {
  return pickPageSeoBundle(getPublishedPageSeoMarkets(), market)
}

/**
 * Effective SEO for a path on the current request market
 * (NZ .co.nz / Global .com — or local /nz|/usa cookie).
 */
export async function getPageSeo(path: string): Promise<PageSeoFields> {
  const market = await getMarket()
  return resolvePageSeo(path, getPublishedPageSeoBundle(market), market)
}

/** Effective SEO for an explicit market (admin preview / tools). */
export function getPageSeoForMarket(
  path: string,
  market: MarketId
): PageSeoFields {
  return resolvePageSeo(path, getPublishedPageSeoBundle(market), market)
}

/**
 * Market-scoped Next.js Metadata for a service/solution landing.
 * Falls back safely if the path is unknown to the catalog.
 */
export async function pageSeoMetadata(path: string): Promise<Metadata> {
  const normalized = normalizePath(path)
  const seo = await getPageSeo(normalized)
  const item = catalogItemForPath(normalized)
  const href = item?.path ?? normalized

  const title = seo.metaTitle || item?.label || 'XLS Experts'
  const description = seo.metaDescription
  const keywords = keywordsList(seo.keywords)
  const ogTitle = seo.ogTitle || title
  const ogDescription = seo.ogDescription || description
  const ogImage = seo.ogImage.trim() || undefined
  const twitterTitle = seo.twitterTitle || ogTitle
  const twitterDescription = seo.twitterDescription || ogDescription
  const twitterImage = seo.twitterImage.trim() || ogImage

  const base = await marketPageMetadata({
    path: href,
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    robots: {
      index: seo.robotsIndex,
      follow: seo.robotsFollow,
    },
  })

  return {
    ...base,
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription || undefined,
      ...(twitterImage ? { images: [twitterImage] } : {}),
    },
  }
}
