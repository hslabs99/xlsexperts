import { notFound } from 'next/navigation'
import { NextResponse } from 'next/server'
import {
  contentTypeForCrawlPath,
  findVerificationFile,
} from '@/lib/crawl-docs'
import { fetchCrawlDocs } from '@/lib/crawl-docs-db'
import { getMarket } from '@/lib/market-server'
import { withTimeout } from '@/lib/with-timeout'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ doc: string }> }

/**
 * Serves admin-managed root verification files (e.g. googleXXXX.html).
 * Only responds for paths ending in .html/.htm/.xml/.txt that match an
 * enabled Firestore verification entry for this market — otherwise 404.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { doc } = await params
  if (!doc || !/\.(html?|xml|txt)$/i.test(doc)) {
    notFound()
  }

  try {
    const market = await getMarket()
    const docs = await withTimeout(
      fetchCrawlDocs(market),
      8_000,
      'fetchCrawlDocs'
    )
    const file = findVerificationFile(docs, doc)
    if (!file) notFound()

    return new NextResponse(file.content, {
      headers: {
        'Content-Type': contentTypeForCrawlPath(file.path),
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch {
    notFound()
  }
}
