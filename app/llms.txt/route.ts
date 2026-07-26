import { NextResponse } from 'next/server'
import {
  defaultLlmsTxt,
  resolveLlmsTxt,
  siteOriginForMarket,
} from '@/lib/crawl-docs'
import { fetchCrawlDocs } from '@/lib/crawl-docs-db'
import { getMarket } from '@/lib/market-server'
import { withTimeout } from '@/lib/with-timeout'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const market = await getMarket()
    const docs = await withTimeout(
      fetchCrawlDocs(market),
      8_000,
      'fetchCrawlDocs'
    )
    return new NextResponse(resolveLlmsTxt(docs, market), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch {
    try {
      const market = await getMarket()
      return new NextResponse(
        defaultLlmsTxt(market, siteOriginForMarket(market)),
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, s-maxage=60',
          },
        }
      )
    } catch {
      return new NextResponse(
        defaultLlmsTxt('nz', siteOriginForMarket('nz')),
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, s-maxage=60',
          },
        }
      )
    }
  }
}
