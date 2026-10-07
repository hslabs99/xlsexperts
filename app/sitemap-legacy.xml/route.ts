import { getMarket, getSiteOrigin } from '@/lib/market-server'
import { legacySitemapApplies } from '@/lib/sitemap-legacy'
import { absoluteOnOrigin } from '@/lib/regions'
import { fetchAllBlogPostRecords } from '@/lib/blog-db'
import { blogVisibleOnMarket, visibleMarketsForBlog } from '@/lib/blog-shared'
import { effectivePrimaryRegion } from '@/lib/blog-routing'

export const dynamic = 'force-dynamic'

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Old article URLs on .com and .co.uk that now 301 to a live page.
 * Not linked from the NZ site. Remove the flag in lib/sitemap-legacy.ts
 * after about 3 months.
 */
export async function GET() {
  const market = await getMarket()
  if (!legacySitemapApplies(market)) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const origin = await getSiteOrigin()
  const records = await fetchAllBlogPostRecords()
  const locs: string[] = []
  for (const post of records) {
    if (!post.published) continue
    if (blogVisibleOnMarket(post, market)) continue
    if (!effectivePrimaryRegion(post) || visibleMarketsForBlog(post).length === 0) {
      continue
    }
    locs.push(absoluteOnOrigin(origin, `/blog/${post.slug}`))
    locs.push(absoluteOnOrigin(origin, `/post/${post.slug}`))
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <url><loc>${xmlEscape(loc)}</loc></url>`).join('\n')}
</urlset>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
