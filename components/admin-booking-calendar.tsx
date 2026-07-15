'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  formatDateKey,
  formatDayLabel,
  getMondayOfWeek,
  getWeekDays,
  groupSlotsByDate,
  parseTimeToMinutes,
  type BookingSlot,
} from '@/lib/booking-slots'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function aucklandToday(): Date {
  const key = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setHours(0, 0, 0, 0)
  return date
}

function statusStyles(status: BookingSlot['status'], selected: boolean) {
  if (status === 'booked') {
    return selected
      ? 'border-sky-600 bg-sky-600 text-white'
      : 'border-sky-300 bg-sky-50 text-sky-900 hover:border-sky-500'
  }
  if (status === 'unavailable') {
    return selected
      ? 'border-stone-500 bg-stone-500 text-white'
      : 'border-stone-300 bg-stone-100 text-stone-600 hover:border-stone-400'
  }
  return selected
    ? 'border-brand bg-brand text-white'
    : 'border-border bg-surface-raised text-ink hover:border-brand/50'
}

type Props = {
  slots: BookingSlot[]
  loading?: boolean
}

/**
 * Admin week calendar matching the public discovery layout.
 * Shows available / unavailable / booked; hover booked cells for details.
 */
export function AdminBookingCalendar({ slots, loading }: Props) {
  const today = useMemo(() => aucklandToday(), [])
  const [weekMonday, setWeekMonday] = useState<Date>(() =>
    getMondayOfWeek(aucklandToday())
  )
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const byDate = useMemo(() => groupSlotsByDate(slots), [slots])
  const weekDays = getWeekDays(weekMonday)

  const daySlots = useMemo(() => {
    if (!selectedDate) return []
    return [...(byDate[selectedDate] ?? [])].sort(
      (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
    )
  }, [byDate, selectedDate])

  const selectedSlot =
    slots.find((s) => s.id === selectedSlotId) ?? null

  const weekLabel = (() => {
    const end = weekDays[4]
    if (weekMonday.getMonth() === end.getMonth()) {
      return `${weekMonday.getDate()} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`
    }
    return `${weekMonday.getDate()} ${MONTH_NAMES[weekMonday.getMonth()]} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`
  })()

  function daySummary(dateKey: string) {
    const list = byDate[dateKey] ?? []
    return {
      total: list.length,
      available: list.filter((s) => s.status === 'available').length,
      booked: list.filter((s) => s.status === 'booked').length,
      unavailable: list.filter((s) => s.status === 'unavailable').length,
    }
  }

  function prevWeek() {
    const prev = new Date(weekMonday)
    prev.setDate(prev.getDate() - 7)
    setWeekMonday(prev)
    setSelectedDate(null)
    setSelectedSlotId(null)
  }

  function nextWeek() {
    const next = new Date(weekMonday)
    next.setDate(next.getDate() + 7)
    setWeekMonday(next)
    setSelectedDate(null)
    setSelectedSlotId(null)
  }

  function jumpToThisWeek() {
    setWeekMonday(getMondayOfWeek(today))
    setSelectedDate(null)
    setSelectedSlotId(null)
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Calendar view</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Same week layout as the public discovery calendar. Hover a booked
            time to see booking details.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Booked
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-400" /> Unavailable
          </span>
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-ink-muted">Loading calendar…</p>
      ) : slots.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">
          No slots to show yet. Add or seed booking slots first.
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prevWeek}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-ink-muted transition hover:border-brand/40 hover:text-ink"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-ink">{weekLabel}</span>
              <button
                type="button"
                onClick={jumpToThisWeek}
                className="text-xs font-semibold text-brand hover:underline"
              >
                This week
              </button>
            </div>
            <button
              type="button"
              onClick={nextWeek}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-ink-muted transition hover:border-brand/40 hover:text-ink"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {weekDays.map((day) => {
              const dateKey = formatDateKey(day)
              const label = formatDayLabel(dateKey)
              const summary = daySummary(dateKey)
              const isSelected = selectedDate === dateKey
              const isToday = dateKey === formatDateKey(today)
              const hasSlots = summary.total > 0
              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={!hasSlots}
                  onClick={() => {
                    setSelectedDate(dateKey)
                    setSelectedSlotId(null)
                  }}
                  className="flex flex-col items-center gap-1 rounded-md border py-3 text-center transition disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    borderColor: isSelected
                      ? '#1a6b3c'
                      : isToday
                        ? '#86efac'
                        : '#e5e7eb',
                    backgroundColor: isSelected
                      ? '#e8f5ee'
                      : isToday
                        ? '#f0fdf4'
                        : 'white',
                  }}
                >
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: isSelected ? '#1a6b3c' : '#6b7280' }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: isSelected ? '#1a6b3c' : '#111827' }}
                  >
                    {day.getDate()}
                  </span>
                  <span className="text-[10px] leading-tight text-ink-muted">
                    {summary.available} open · {summary.booked} booked
                  </span>
                </button>
              )
            })}
          </div>

          {selectedDate && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">
                Times — {formatDayLabel(selectedDate)}{' '}
                {parseInt(selectedDate.slice(8), 10)}
              </span>
              {daySlots.length === 0 ? (
                <p className="text-sm text-ink-muted">No slots on this day.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {daySlots.map((slot) => {
                    const isChosen = selectedSlotId === slot.id
                    const booked = slot.status === 'booked'
                    return (
                      <div key={slot.id} className="group relative">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSlotId(isChosen ? null : slot.id)
                          }
                          className={`w-full rounded-md border px-3 py-2.5 text-left text-xs font-semibold transition ${statusStyles(
                            slot.status,
                            isChosen
                          )}`}
                          title={
                            booked
                              ? undefined
                              : `${slot.status} · ${slot.durationMinutes} min`
                          }
                        >
                          <span className="block">{slot.time}</span>
                          <span
                            className={`mt-0.5 block text-[10px] font-medium ${
                              isChosen ? 'text-white/80' : 'opacity-70'
                            }`}
                          >
                            {slot.status === 'booked'
                              ? 'Booked'
                              : slot.status === 'unavailable'
                                ? 'Unavailable'
                                : `${slot.durationMinutes} min`}
                          </span>
                        </button>

                        {booked ? (
                          <div
                            className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-64 -translate-x-1/2 rounded-md border border-sky-200 bg-white p-3 text-left shadow-lg group-hover:block group-focus-within:block"
                            role="tooltip"
                          >
                            <BookingHoverCard slot={slot} />
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {selectedSlot && (
            <div className="rounded-md border border-border bg-surface-raised p-4 text-sm">
              <p className="font-semibold text-ink">
                {formatDayLabel(selectedSlot.date)} · {selectedSlot.time} ·{' '}
                <span className="capitalize">{selectedSlot.status}</span>
              </p>
              {selectedSlot.status === 'booked' ? (
                <BookingDetailsBody slot={selectedSlot} />
              ) : (
                <p className="mt-1 text-ink-muted">
                  No booking details — slot is {selectedSlot.status}.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BookingHoverCard({ slot }: { slot: BookingSlot }) {
  return (
    <div className="space-y-1 text-xs text-ink">
      <p className="font-semibold text-sky-900">
        {slot.booking?.name || 'Booked (no name)'}
      </p>
      <BookingDetailsBody slot={slot} compact />
    </div>
  )
}

function BookingDetailsBody({
  slot,
  compact = false,
}: {
  slot: BookingSlot
  compact?: boolean
}) {
  const b = slot.booking
  const rows = [
    b?.company ? `Company: ${b.company}` : null,
    b?.email ? `Email: ${b.email}` : null,
    b?.phone ? `Phone: ${b.phone}` : null,
    b?.method ? `Method: ${b.method}` : null,
    b?.message ? `Message: ${b.message}` : null,
    b?.services?.length ? `Services: ${b.services.join(', ')}` : null,
  ].filter(Boolean) as string[]

  if (rows.length === 0) {
    return (
      <p className={compact ? 'text-ink-muted' : 'mt-1 text-ink-muted'}>
        Booking recorded with no contact details.
      </p>
    )
  }

  return (
    <ul
      className={`${compact ? '' : 'mt-2'} space-y-0.5 ${compact ? 'text-ink-muted' : 'text-ink-muted'}`}
    >
      {rows.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  )
}
