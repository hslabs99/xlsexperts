import { NextResponse } from 'next/server'
import {
  clearBookingAndReopen,
  createBookingSlot,
  deleteAllBookingSlots,
  deleteBookingSlot,
  fetchAllBookingSlots,
  seedBookingSlots,
  setBookingSlotStatus,
} from '@/lib/booking-slots-db'
import type { BookingSlotStatus, SeedTemplateConfig } from '@/lib/booking-slots'
import { withTimeout } from '@/lib/with-timeout'

function serializeSlot(slot: Awaited<ReturnType<typeof fetchAllBookingSlots>>[number]) {
  const booking = slot.booking
    ? {
        ...slot.booking,
        bookedAt: serializeTimestamp(slot.booking.bookedAt),
      }
    : null
  return {
    ...slot,
    createdAt: serializeTimestamp(slot.createdAt),
    booking,
  }
}

function serializeTimestamp(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString()
    } catch {
      return null
    }
  }
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return null
}

export async function GET() {
  try {
    const items = await withTimeout(
      fetchAllBookingSlots(),
      15_000,
      'fetchAllBookingSlots'
    )
    return NextResponse.json({ ok: true, items: items.map(serializeSlot) })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load slots',
        items: [],
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: string
      config?: SeedTemplateConfig
      slot?: {
        date: string
        time: string
        type: string
        status: BookingSlotStatus
        durationMinutes: 15 | 30
      }
    }

    if (body.action === 'seed') {
      const result = await withTimeout(
        seedBookingSlots(body.config),
        60_000,
        'seedBookingSlots'
      )
      return NextResponse.json({ ok: true, ...result })
    }

    if (body.action === 'clear-all') {
      const deleted = await withTimeout(
        deleteAllBookingSlots(),
        60_000,
        'deleteAllBookingSlots'
      )
      return NextResponse.json({ ok: true, deleted })
    }

    if (body.action === 'create' && body.slot) {
      const id = await withTimeout(
        createBookingSlot(body.slot),
        8_000,
        'createBookingSlot'
      )
      return NextResponse.json({ ok: true, id })
    }

    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Booking action failed',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string
      action?: 'available' | 'unavailable' | 'reopen'
    }
    const id = body.id?.trim()
    if (!id || !body.action) {
      return NextResponse.json(
        { ok: false, error: 'id and action are required' },
        { status: 400 }
      )
    }

    if (body.action === 'reopen') {
      await withTimeout(clearBookingAndReopen(id), 8_000, 'clearBookingAndReopen')
    } else {
      await withTimeout(
        setBookingSlotStatus(id, body.action),
        8_000,
        'setBookingSlotStatus'
      )
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to update slot',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')?.trim()
    if (!id) {
      return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 })
    }
    await withTimeout(deleteBookingSlot(id), 8_000, 'deleteBookingSlot')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to delete slot',
      },
      { status: 500 }
    )
  }
}
