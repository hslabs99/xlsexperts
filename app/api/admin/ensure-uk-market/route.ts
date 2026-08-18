import { NextResponse } from 'next/server'
import { ensureUkMarketStructures } from '@/lib/ensure-uk-market'

/**
 * Backfill the UK market onto Site Content docs (market-copy, page-seo,
 * analytics-tags, crawl-documents) and set `showUk` on blog posts that
 * do not have it yet.
 */
export async function POST() {
  try {
    const result = await ensureUkMarketStructures()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'UK market backfill failed',
      },
      { status: 500 }
    )
  }
}
