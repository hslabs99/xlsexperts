import { NextResponse } from 'next/server'
import { DEFAULT_ROBOTS_TXT, resolveRobotsTxt } from '@/lib/crawl-docs'
import { fetchCrawlDocs } from '@/lib/crawl-docs-db'
import { withTimeout } from '@/lib/with-timeout'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const docs = await withTimeout(fetchCrawlDocs(), 8_000, 'fetchCrawlDocs')
    return new NextResponse(resolveRobotsTxt(docs), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch {
    return new NextResponse(DEFAULT_ROBOTS_TXT, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=60',
      },
    })
  }
}
