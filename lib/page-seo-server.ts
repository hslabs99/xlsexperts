import 'server-only'

import type { Metadata } from 'next'
import { PUBLISHED_PAGE_SEO } from '@/data/page-seo.generated'
import { getIsLocalDev, getMarket } from '@/lib/market-server'
import type { MarketId } from '@/lib/market'
import { withTimeout } from '@/lib/with-timeout'
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

/** Published NZ + International + UK page SEO (static import — zero DB). */
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

async function livePageSeoMarkets(): Promise<PageSeoMarkets> {
  if (await getIsLocalDev()) {
    try {
      const { fetchPageSeoDraft } = await import('@/lib/page-seo-db')
      const draft = await withTimeout(
        fetchPageSeoDraft(),
        6_000,
        'fetchPageSeoDraft'
      )
      return draft.markets
    } catch (error) {
      console.error(
        '[page-seo] localhost CMS draft unavailable, using published file',
        error instanceof Error ? error.message : error
      )
    }
  }
  return getPublishedPageSeoMarkets()
}

/**
 * Effective SEO for a path on the current request market
 * (NZ .co.nz / International .com / UK .co.uk — or local /nz|/usa|/uk cookie).
 * Localhost uses the CMS draft so Save draft is enough to preview UK vs International.
 */
export async function getPageSeo(path: string): Promise<PageSeoFields> {
  const market = await getMarket()
  const bundle = pickPageSeoBundle(await livePageSeoMarkets(), market)
  return resolvePageSeo(path, bundle, market)
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
