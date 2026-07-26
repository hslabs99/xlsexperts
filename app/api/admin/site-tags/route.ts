import { NextResponse } from 'next/server'
import {
  fetchSiteTagsBundle,
  saveSiteTagsBundle,
  saveSiteTagsForMarket,
} from '@/lib/site-tags-db'
import { isMarketId, parseMarketId, type MarketId } from '@/lib/market'
import {
  normalizeSiteTags,
  normalizeSiteTagsBundle,
  validateSiteTags,
  validateSiteTagsBundle,
  type SiteTagsBundle,
  type SiteTagsContent,
} from '@/lib/site-tags'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const markets = await withTimeout(
      fetchSiteTagsBundle(),
      8_000,
      'fetchSiteTagsBundle'
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
  | { market: MarketId; tags: SiteTagsContent }
  | { markets: SiteTagsBundle }

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as PutBody

    if ('markets' in body && body.markets) {
      const markets = normalizeSiteTagsBundle({ markets: body.markets })
      const validationError = validateSiteTagsBundle(markets)
      if (validationError) {
        return NextResponse.json(
          { ok: false, error: validationError },
          { status: 400 }
        )
      }
      const saved = await withTimeout(
        saveSiteTagsBundle(markets),
        8_000,
        'saveSiteTagsBundle'
      )
      return NextResponse.json({ ok: true, markets: saved })
    }

    const market = parseMarketId(
      typeof body === 'object' && body && 'market' in body
        ? String(body.market)
        : null
    )
    if (!market || !('tags' in body)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Provide { market, tags } or { markets: { nz, intl } }',
        },
        { status: 400 }
      )
    }

    const tags = normalizeSiteTags(body.tags)
    const validationError = validateSiteTags(tags)
    if (validationError) {
      return NextResponse.json(
        { ok: false, error: validationError },
        { status: 400 }
      )
    }
    if (!isMarketId(market)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid market' },
        { status: 400 }
      )
    }

    const markets = await withTimeout(
      saveSiteTagsForMarket(market, tags),
      8_000,
      'saveSiteTagsForMarket'
    )
    return NextResponse.json({ ok: true, market, tags: markets[market], markets })
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
