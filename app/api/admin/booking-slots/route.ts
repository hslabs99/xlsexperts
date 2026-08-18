import { NextResponse } from 'next/server'
import {
  clearBookingAndReopen,
  copyBookingWeek,
  createBookingSlot,
  deleteAllBookingSlots,
  deleteBookingSlot,
  fetchAllBookingSlots,
  normalizeAllBookingSlotDurations,
  seedBookingSlots,
  setBookingCells,
  setBookingSlotStatus,
} from '@/lib/booking-slots-db'
import {
  SEED_SLOT_MINUTES,
  type BookingRegionId,
  type BookingSlotStatus,
  type SeedTemplateConfig,
} from '@/lib/booking-slots'
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
      status?: BookingSlotStatus
      enabled?: boolean
      scope?: 'all' | BookingRegionId
      cells?: { date: string; time: string }[]
      fromMonday?: string
      slot?: {
        date: string
        time: string
        type: string
        status: BookingSlotStatus
        durationMinutes: 15 | 30
        regions?: { nz: boolean; uk: boolean; intl: boolean }
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

    if (body.action === 'normalize-durations') {
      const result = await withTimeout(
        normalizeAllBookingSlotDurations(),
        60_000,
        'normalizeAllBookingSlotDurations'
      )
      return NextResponse.json({ ok: true, ...result })
    }

    if (body.action === 'set-cells') {
      const cells = Array.isArray(body.cells) ? body.cells : []
      if (cells.length === 0) {
        return NextResponse.json(
          { ok: false, error: 'cells are required' },
          { status: 400 }
        )
      }
      const enabled =
        typeof body.enabled === 'boolean'
          ? body.enabled
          : body.status !== 'unavailable'
      const scope = body.scope === 'nz' || body.scope === 'uk' || body.scope === 'intl'
        ? body.scope
        : 'all'
      const result = await withTimeout(
        setBookingCells(
          cells,
          scope === 'all' ? { scope: 'all', enabled } : { scope, enabled }
        ),
        60_000,
        'setBookingCells'
      )
      return NextResponse.json({ ok: true, scope, enabled, ...result })
    }

    if (body.action === 'copy-week') {
      const fromMonday = body.fromMonday?.trim() ?? ''
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fromMonday)) {
        return NextResponse.json(
          { ok: false, error: 'fromMonday (YYYY-MM-DD) is required' },
          { status: 400 }
        )
      }
      const result = await withTimeout(
        copyBookingWeek(fromMonday),
        60_000,
        'copyBookingWeek'
      )
      return NextResponse.json({ ok: true, ...result })
    }

    if (body.action === 'create' && body.slot) {
      const id = await withTimeout(
        createBookingSlot({
          ...body.slot,
          durationMinutes: SEED_SLOT_MINUTES,
          regions: body.slot.regions ?? {
            nz: true,
            uk: true,
            intl: true,
          },
        }),
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
