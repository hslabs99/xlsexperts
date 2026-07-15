import { NextResponse } from 'next/server'
import { fetchSiteTags } from '@/lib/site-tags-db'
import { withTimeout } from '@/lib/with-timeout'

/** GET /api/site-tags — public marketing tags (server Firestore). */
export async function GET() {
  try {
    const tags = await withTimeout(fetchSiteTags(), 8_000, 'fetchSiteTags')
    return NextResponse.json({ ok: true, tags })
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
