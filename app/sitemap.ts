import type { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/blog'
import { fetchCrawlDocs } from '@/lib/crawl-docs-db'
import { getMarket, getSiteOrigin } from '@/lib/market-server'
import { servicePageHrefs } from '@/lib/service-pages'
import { ALL_SOLUTIONS_HREF, solutionPageHrefs } from '@/lib/solutions'

/** Blog URLs and CMS extras come from Firestore at request time. */
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const market = await getMarket()
  const base = await getSiteOrigin()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${base}/enterprise`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...servicePageHrefs.map((href) => ({
      url: `${base}${href}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${base}${ALL_SOLUTIONS_HREF}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    ...solutionPageHrefs.map((href) => ({
      url: `${base}${href}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    {
      url: `${base}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  const posts = await getAllBlogPosts()
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

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

  return [...staticPages, ...blogPages, ...extraPages]
}
