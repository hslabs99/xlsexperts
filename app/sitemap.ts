import type { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/blog'
import { fetchCrawlDocs } from '@/lib/crawl-docs-db'
import { SITE_BASE_URL } from '@/lib/crawl-docs'
import { servicePageHrefs } from '@/lib/service-pages'

/** Blog URLs and CMS extras come from Firestore at request time. */
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_BASE_URL

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${base}/enterprise-excel-vba-development`,
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
    const crawlDocs = await fetchCrawlDocs()
    const seen = new Set(
      [...staticPages, ...blogPages].map((p) => p.url.toLowerCase())
    )
    extraPages = crawlDocs.sitemapExtraUrls
      .filter((entry) => !seen.has(entry.loc.toLowerCase()))
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
