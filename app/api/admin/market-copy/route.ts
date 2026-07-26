import { NextResponse } from 'next/server'
import {
  fetchMarketCopyDraft,
  publishMarketCopy,
  saveMarketCopyDraft,
} from '@/lib/market-copy-db'
import {
  normalizeMarketCopyBundle,
  type MarketCopyBundle,
} from '@/lib/market-copy'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const draft = await withTimeout(
      fetchMarketCopyDraft(),
      8_000,
      'fetchMarketCopyDraft'
    )
    return NextResponse.json({ ok: true, ...draft })
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

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      markets?: MarketCopyBundle
      action?: 'save' | 'publish'
    }

    const action = body.action === 'publish' ? 'publish' : 'save'

    if (action === 'publish') {
      const markets =
        body.markets != null
          ? normalizeMarketCopyBundle(body.markets)
          : undefined
      const result = await withTimeout(
        publishMarketCopy(markets),
        15_000,
        'publishMarketCopy'
      )
      return NextResponse.json({
        ok: true,
        markets: result.markets,
        publishedAt: result.publishedAt,
        filePath: result.filePath,
        message:
          'Published to static file. Public pages import this file — no database read on the homepage.',
      })
    }

    if (!body.markets) {
      return NextResponse.json(
        { ok: false, error: 'markets payload required' },
        { status: 400 }
      )
    }

    const markets = await withTimeout(
      saveMarketCopyDraft(normalizeMarketCopyBundle(body.markets)),
      8_000,
      'saveMarketCopyDraft'
    )
    return NextResponse.json({
      ok: true,
      markets,
      message:
        'Draft saved to Firebase (Site Content / market-copy). Click Publish to update the static file used by the public site.',
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
