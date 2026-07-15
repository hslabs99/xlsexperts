import { NextResponse } from 'next/server'
import { fetchConfirmationContent } from '@/lib/confirmation-content-db'
import { withTimeout } from '@/lib/with-timeout'

/** GET /api/confirmation-content — public post-submit copy (server Firestore). */
export async function GET() {
  try {
    const content = await withTimeout(
      fetchConfirmationContent(),
      8_000,
      'fetchConfirmationContent'
    )
    return NextResponse.json({ ok: true, content })
  } catch (error) {
    console.error(
      '[confirmation-content] Failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { ok: false, error: 'Could not load confirmation content' },
      { status: 500 }
    )
  }
}
