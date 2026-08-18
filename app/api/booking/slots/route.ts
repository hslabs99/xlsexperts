import { NextResponse } from 'next/server'
import { showTimeZonePickerForMarket } from '@/lib/booking-display'
import { fetchBookingDisplaySettings } from '@/lib/booking-display-db'
import {
  BOOKING_MIN_LEAD_MINUTES,
  aucklandDateKey,
  bookingRegionForMarket,
  isSlotBookableWithLead,
  slotOpenForRegion,
} from '@/lib/booking-slots'
import { fetchBookingSlots } from '@/lib/booking-slots-db'
import { displayTimeZoneForMarket } from '@/lib/booking-timezone'
import { getMarket } from '@/lib/market-server'
import { marketUsesVisitorTimeZone } from '@/lib/market'
import { withTimeout } from '@/lib/with-timeout'

/**
 * GET /api/booking/slots
 * Public list of available discovery slots from today (NZ) onward.
 * Only returns slots enabled for this site region (NZ / UK / International)
 * and at least BOOKING_MIN_LEAD_MINUTES from now (NZ time).
 */
export async function GET() {
  try {
    const market = await getMarket()
    const region = bookingRegionForMarket(market)
    const fromDate = aucklandDateKey()
    const [items, displaySettings] = await Promise.all([
      withTimeout(
        fetchBookingSlots({
          status: 'available',
          fromDate,
        }),
        12_000,
        'fetchBookingSlots'
      ),
      withTimeout(
        fetchBookingDisplaySettings(),
        8_000,
        'fetchBookingDisplaySettings'
      ).catch(() => null),
    ])
    const showTimeZonePicker = displaySettings
      ? showTimeZonePickerForMarket(displaySettings, market)
      : marketUsesVisitorTimeZone(market)
    const bookable = items.filter(
      (slot) =>
        slotOpenForRegion(slot, region) &&
        isSlotBookableWithLead(slot.date, slot.time, BOOKING_MIN_LEAD_MINUTES)
    )
    return NextResponse.json({
      ok: true,
      fromDate,
      region,
      minLeadMinutes: BOOKING_MIN_LEAD_MINUTES,
      showTimeZonePicker,
      displayTimeZone: displayTimeZoneForMarket(market),
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
