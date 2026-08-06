/**
 * GET /api/admin/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Enquiry chart + CTA click summary for the admin Analytics tab.
 */

import { NextResponse } from 'next/server'
import { fetchAnalyticsSummary } from '@/lib/funnel-events-db'
import { toDateKey } from '@/lib/funnel-events'
import { withTimeout } from '@/lib/with-timeout'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function defaultRange(): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 29)
  return { from: toDateKey(from), to: toDateKey(to) }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const defaults = defaultRange()
    const from = searchParams.get('from') || defaults.from
    const to = searchParams.get('to') || defaults.to

    if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
      return NextResponse.json(
        { ok: false, error: 'from and to must be YYYY-MM-DD' },
        { status: 400 }
      )
    }
    if (from > to) {
      return NextResponse.json(
        { ok: false, error: 'from must be on or before to' },
        { status: 400 }
      )
    }

    // Cap range at 366 days to keep queries cheap
    const fromDate = new Date(from + 'T00:00:00')
    const toDate = new Date(to + 'T00:00:00')
    const days =
      Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000) + 1
    if (days > 366) {
      return NextResponse.json(
        { ok: false, error: 'Date range cannot exceed 366 days' },
        { status: 400 }
      )
    }

    const summary = await withTimeout(
      fetchAnalyticsSummary(from, to),
      15_000,
      'fetchAnalyticsSummary'
    )

    return NextResponse.json({ ok: true, summary })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load analytics'
    // Missing Firestore composite index surfaces as a failed-precondition style message
    return NextResponse.json(
      { ok: false, error: message, summary: null },
      { status: 500 }
    )
  }
}
