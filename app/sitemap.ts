import type { MetadataRoute } from 'next'
import { getPublishedBlogRecords } from '@/lib/blog'
import { visibleMarketsForBlog } from '@/lib/blog-shared'
import { fetchCrawlDocs } from '@/lib/crawl-docs-db'
import { MARKET_IDS, type MarketId } from '@/lib/market'
import { getMarket, getSiteOrigin } from '@/lib/market-server'
import {
  absoluteOnOrigin,
  sitemapLanguageAlternates,
} from '@/lib/regions'
import { servicePageHrefs, ALL_SERVICES_HREF } from '@/lib/service-pages'
import { ALL_SOLUTIONS_HREF, solutionPageHrefs } from '@/lib/solutions'

function withHreflang(
  entry: MetadataRoute.Sitemap[number],
  markets: readonly MarketId[]
): MetadataRoute.Sitemap[number] {
  const alternates = sitemapLanguageAlternates(entry.url, markets)
  return alternates ? { ...entry, alternates } : entry
}

/** Blog URLs and CMS extras come from Firestore at request time. */
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const market = await getMarket()
  const base = await getSiteOrigin()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteOnOrigin(base, '/'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: absoluteOnOrigin(base, '/enterprise'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: absoluteOnOrigin(base, '/use-cases'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    ...servicePageHrefs.map((href) => ({
      url: absoluteOnOrigin(base, href),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: absoluteOnOrigin(base, ALL_SERVICES_HREF),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: absoluteOnOrigin(base, ALL_SOLUTIONS_HREF),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    ...solutionPageHrefs.map((href) => ({
      url: absoluteOnOrigin(base, href),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    {
      url: absoluteOnOrigin(base, '/blog'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  const records = await getPublishedBlogRecords()
  const blogPages: MetadataRoute.Sitemap = records.map((post) => ({
    url: absoluteOnOrigin(base, `/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
  const blogMarkets = records.map((post) => visibleMarketsForBlog(post))

  let extraPages: MetadataRoute.Sitemap = []
  try {
    const crawlDocs = await fetchCrawlDocs(market)
    const seen = new Set(
      [...staticPages, ...blogPages].map((p) => p.url.toLowerCase())
    )
    const originHost = new URL(base).host.toLowerCase()
    extraPages = crawlDocs.sitemapExtraUrls
      .filter((entry) => {
        if (seen.has(entry.loc.toLowerCase())) return false
        try {
          // Never leak the other market's absolute URLs into this sitemap.
          return new URL(entry.loc).host.toLowerCase() === originHost
        } catch {
          return false
        }
      })
      .map((entry) => ({
        url: entry.loc,
        lastModified: entry.lastModified
          ? new Date(entry.lastModified)
          : new Date(),
        changeFrequency: entry.changeFrequency ?? ('monthly' as const),
        priority: entry.priority ?? 0.5,
      }))
  } catch {
    // Sitemap still works if crawl-docs Firestore is unavailable.
  }

  return [
    ...staticPages.map((entry) => withHreflang(entry, MARKET_IDS)),
    ...blogPages.map((entry, i) => withHreflang(entry, blogMarkets[i] ?? [])),
    // Crawl extras are market-local; unknown on the other hosts → no hreflang.
    ...extraPages.map((entry) => withHreflang(entry, [market])),
  ]
}
