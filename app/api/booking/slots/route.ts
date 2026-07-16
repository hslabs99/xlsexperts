import { NextResponse } from 'next/server'
import {
  BOOKING_MIN_LEAD_MINUTES,
  aucklandDateKey,
  isSlotBookableWithLead,
} from '@/lib/booking-slots'
import { fetchBookingSlots } from '@/lib/booking-slots-db'
import { withTimeout } from '@/lib/with-timeout'

/**
 * GET /api/booking/slots
 * Public list of available discovery slots from today (NZ) onward.
 * Only returns slots at least BOOKING_MIN_LEAD_MINUTES from now (NZ time).
 * Served from the server so the calendar does not depend on browser Firestore.
 */
export async function GET() {
  try {
    const fromDate = aucklandDateKey()
    const items = await withTimeout(
      fetchBookingSlots({
        status: 'available',
        fromDate,
      }),
      12_000,
      'fetchBookingSlots'
    )
    const bookable = items.filter((slot) =>
      isSlotBookableWithLead(slot.date, slot.time, BOOKING_MIN_LEAD_MINUTES)
    )
    return NextResponse.json({
      ok: true,
      fromDate,
      minLeadMinutes: BOOKING_MIN_LEAD_MINUTES,
      items: bookable,
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
