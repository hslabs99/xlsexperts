import { NextResponse } from 'next/server'
import {
  fetchBookingDisplaySettings,
  saveBookingDisplaySettings,
} from '@/lib/booking-display-db'
import {
  normalizeBookingDisplaySettings,
  type BookingDisplaySettings,
} from '@/lib/booking-display'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const settings = await withTimeout(
      fetchBookingDisplaySettings(),
      8_000,
      'fetchBookingDisplaySettings'
    )
    return NextResponse.json({ ok: true, settings })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load booking display settings',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as BookingDisplaySettings
    const settings = normalizeBookingDisplaySettings(body)
    const saved = await withTimeout(
      saveBookingDisplaySettings(settings),
      8_000,
      'saveBookingDisplaySettings'
    )
    return NextResponse.json({ ok: true, settings: saved })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save booking display settings',
      },
      { status: 500 }
    )
  }
}
