/**
 * POST /api/funnel — public beacon for CTA clicks.
 * Intentionally tiny and fast; never throws to the browser.
 */

import { NextResponse } from 'next/server'
import { createFunnelEvent } from '@/lib/funnel-events-db'
import { isFunnelEventType } from '@/lib/funnel-events'
import { withTimeout } from '@/lib/with-timeout'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      type?: string
      label?: string
      href?: string
      path?: string
    }

    if (!body.type || !isFunnelEventType(body.type)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const label = String(body.label || '').trim()
    const href = String(body.href || '').trim()
    const path = String(body.path || '').trim()
    if (!label || label.length > 120) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    if (href.length > 500 || path.length > 300) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Don't await forever — drop if Firestore is slow
    await withTimeout(
      createFunnelEvent({
        type: body.type,
        label,
        href: href || '#',
        path: path || '/',
      }),
      4_000,
      'createFunnelEvent'
    )

    return NextResponse.json({ ok: true })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
