import { NextResponse } from 'next/server'
import {
  fetchCrawlDocsBundle,
  saveCrawlDocsBundle,
  saveCrawlDocsForMarket,
} from '@/lib/crawl-docs-db'
import { isMarketId, parseMarketId, type MarketId } from '@/lib/market'
import {
  normalizeCrawlDocs,
  normalizeCrawlDocsBundle,
  validateCrawlDocs,
  validateCrawlDocsBundle,
  type CrawlDocsBundle,
  type CrawlDocsContent,
} from '@/lib/crawl-docs'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const markets = await withTimeout(
      fetchCrawlDocsBundle(),
      8_000,
      'fetchCrawlDocsBundle'
    )
    return NextResponse.json({ ok: true, markets })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load',
      },
      { status: 500 }
    )
  }
}

type PutBody =
  | { market: MarketId; docs: CrawlDocsContent }
  | { markets: CrawlDocsBundle }

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as PutBody

    if ('markets' in body && body.markets) {
      const markets = normalizeCrawlDocsBundle({ markets: body.markets })
      const validationError = validateCrawlDocsBundle(markets)
      if (validationError) {
        return NextResponse.json(
          { ok: false, error: validationError },
          { status: 400 }
        )
      }
      const saved = await withTimeout(
        saveCrawlDocsBundle(markets),
        8_000,
        'saveCrawlDocsBundle'
      )
      return NextResponse.json({ ok: true, markets: saved })
    }

    const market = parseMarketId(
      typeof body === 'object' && body && 'market' in body
        ? String(body.market)
        : null
    )
    if (!market || !('docs' in body)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Provide { market, docs } or { markets: { nz, intl } }',
        },
        { status: 400 }
      )
    }
    if (!isMarketId(market)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid market' },
        { status: 400 }
      )
    }

    const docs = normalizeCrawlDocs(body.docs, market)
    const validationError = validateCrawlDocs(docs)
    if (validationError) {
      return NextResponse.json(
        { ok: false, error: validationError },
        { status: 400 }
      )
    }

    const markets = await withTimeout(
      saveCrawlDocsForMarket(market, docs),
      8_000,
      'saveCrawlDocsForMarket'
    )
    return NextResponse.json({
      ok: true,
      market,
      docs: markets[market],
      markets,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to save',
      },
      { status: 500 }
    )
  }
}
