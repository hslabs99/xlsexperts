import { NextResponse } from 'next/server'
import { fetchBookingSlots } from '@/lib/booking-slots-db'
import { withTimeout } from '@/lib/with-timeout'

/**
 * Business-local “today” so Cloud Run UTC (or visitor browsers abroad)
 * do not drop NZ calendar days.
 */
function todayInAuckland(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/**
 * GET /api/booking/slots
 * Public list of available discovery slots from today (NZ) onward.
 * Served from the server so the calendar does not depend on browser Firestore.
 */
export async function GET() {
  try {
    const fromDate = todayInAuckland()
    const items = await withTimeout(
      fetchBookingSlots({
        status: 'available',
        fromDate,
      }),
      12_000,
      'fetchBookingSlots'
    )
    return NextResponse.json({
      ok: true,
      fromDate,
      items,
    })
  } catch (error) {
    console.error(
      '[booking/slots] Failed to load',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to load booking slots',
        items: [],
      },
      { status: 500 }
    )
  }
}
