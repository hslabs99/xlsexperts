import { NextResponse } from 'next/server'
import { fetchFindOutAboutContent } from '@/lib/find-out-about-db'
import { withTimeout } from '@/lib/with-timeout'

/** GET /api/find-out-about — public quick-nav items (server Firestore). */
export async function GET() {
  try {
    const content = await withTimeout(
      fetchFindOutAboutContent(),
      8_000,
      'fetchFindOutAboutContent'
    )
    return NextResponse.json({ ok: true, content })
  } catch (error) {
    console.error(
      '[find-out-about] Failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { ok: false, error: 'Could not load Find out about menu' },
      { status: 500 }
    )
  }
}
