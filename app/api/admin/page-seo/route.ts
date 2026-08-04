import { NextResponse } from 'next/server'
import {
  fetchPageSeoDraft,
  publishPageSeo,
  savePageSeoDraft,
} from '@/lib/page-seo-db'
import {
  normalizePageSeoMarkets,
  type PageSeoMarkets,
} from '@/lib/page-seo'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const draft = await withTimeout(
      fetchPageSeoDraft(),
      8_000,
      'fetchPageSeoDraft'
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
      markets?: PageSeoMarkets
      /** @deprecated use markets */
      pages?: unknown
      action?: 'save' | 'publish'
    }

    const action = body.action === 'publish' ? 'publish' : 'save'
    const marketsInput =
      body.markets != null
        ? body.markets
        : body.pages != null
          ? { pages: body.pages }
          : undefined

    if (action === 'publish') {
      const markets =
        marketsInput != null
          ? normalizePageSeoMarkets(marketsInput)
          : undefined
      const result = await withTimeout(
        publishPageSeo(markets),
        15_000,
        'publishPageSeo'
      )
      return NextResponse.json({
        ok: true,
        markets: result.markets,
        publishedAt: result.publishedAt,
        filePath: result.filePath,
        message:
          'Published full H1/meta catalog (every service & solution, NZ + Global) to the static file. Public pages import by market — no database read.',
      })
    }

    if (!marketsInput) {
      return NextResponse.json(
        { ok: false, error: 'markets payload required' },
        { status: 400 }
      )
    }

    const markets = await withTimeout(
      savePageSeoDraft(normalizePageSeoMarkets(marketsInput)),
      8_000,
      'savePageSeoDraft'
    )
    return NextResponse.json({
      ok: true,
      markets,
      message:
        'Draft saved for the full catalog (all pages, NZ + Global) to Firebase. Click Publish to update the public static file.',
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
