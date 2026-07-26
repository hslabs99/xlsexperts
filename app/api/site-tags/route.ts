import { NextResponse } from 'next/server'
import { fetchSiteTags } from '@/lib/site-tags-db'
import { getMarket } from '@/lib/market-server'
import { withTimeout } from '@/lib/with-timeout'

/** GET /api/site-tags — public marketing tags for the arrival market only. */
export async function GET() {
  try {
    const market = await getMarket()
    const tags = await withTimeout(
      fetchSiteTags(market),
      8_000,
      'fetchSiteTags'
    )
    return NextResponse.json({ ok: true, market, tags })
  } catch (error) {
    console.error(
      '[site-tags] Failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { ok: false, error: 'Could not load site tags' },
      { status: 500 }
    )
  }
}
