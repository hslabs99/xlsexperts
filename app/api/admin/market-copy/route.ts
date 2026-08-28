import { NextResponse } from 'next/server'
import { PUBLISHED_DOMAIN_REGIONS } from '@/data/domain-regions.generated'
import { siteOriginsFromRegions } from '@/lib/domain-regions'
import {
  fetchMarketCopyDraft,
  publishMarketCopy,
  saveMarketCopyDraft,
} from '@/lib/market-copy-db'
import {
  applySiteOrigins,
  normalizeMarketCopyBundle,
  type MarketCopyBundle,
} from '@/lib/market-copy'
import { withTimeout } from '@/lib/with-timeout'

function marketsWithLockedOrigins(
  markets: MarketCopyBundle
): MarketCopyBundle {
  return applySiteOrigins(
    markets,
    siteOriginsFromRegions(PUBLISHED_DOMAIN_REGIONS.regions)
  )
}

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
      heroBackgroundHoldSeconds?: unknown
      action?: 'save' | 'publish'
    }

    const action = body.action === 'publish' ? 'publish' : 'save'
    const extras =
      body.heroBackgroundHoldSeconds !== undefined
        ? { heroBackgroundHoldSeconds: body.heroBackgroundHoldSeconds }
        : undefined

    if (action === 'publish') {
      const markets =
        body.markets != null
          ? marketsWithLockedOrigins(normalizeMarketCopyBundle(body.markets))
          : undefined
      const result = await withTimeout(
        publishMarketCopy(markets, extras),
        15_000,
        'publishMarketCopy'
      )
      return NextResponse.json({
        ok: true,
        markets: result.markets,
        heroBackgroundHoldSeconds: result.heroBackgroundHoldSeconds,
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

    const saved = await withTimeout(
      saveMarketCopyDraft(
        marketsWithLockedOrigins(normalizeMarketCopyBundle(body.markets)),
        extras
      ),
      8_000,
      'saveMarketCopyDraft'
    )
    return NextResponse.json({
      ok: true,
      markets: saved.markets,
      heroBackgroundHoldSeconds: saved.heroBackgroundHoldSeconds,
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
