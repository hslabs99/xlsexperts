'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  buildSeedTimeWindows,
  formatDateKey,
  formatMinutesToTime,
  getCalendarWeekDays,
  getMondayOfWeek,
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

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

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

function cellStyles(status: BookingSlot['status'] | null): string {
  if (!status) {
    return 'border-transparent bg-transparent text-stone-300'
  }
  if (status === 'booked') {
    return 'border-sky-300 bg-sky-50 text-sky-900 hover:border-sky-500'
  }
  if (status === 'unavailable') {
    return 'border-stone-300 bg-stone-100 text-stone-600 hover:border-stone-400'
  }
  return 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:border-emerald-500'
}

type Props = {
  slots: BookingSlot[]
  loading?: boolean
  busy?: boolean
  /** Toggle available ↔ unavailable, or reopen booked. */
  onToggleStatus: (slot: BookingSlot) => void | Promise<void>
  /** Mark every available slot in the list as unavailable. */
  onDisableSlots: (slots: BookingSlot[]) => void | Promise<void>
}

/**
 * Admin week grid: 7 day columns × 30-minute rows.
 * Same start time sits on one row so staff can disable a whole time
 * (e.g. all 10:00s) or one day cell (e.g. Friday afternoon).
 */
export function AdminBookingCalendar({
  slots,
  loading,
  busy,
  onToggleStatus,
  onDisableSlots,
}: Props) {
  const today = useMemo(() => aucklandToday(), [])
  const [weekMonday, setWeekMonday] = useState<Date>(() =>
    getMondayOfWeek(aucklandToday())
  )

  const timeRows = useMemo(() => buildSeedTimeWindows(), [])
  const weekDays = useMemo(
    () => getCalendarWeekDays(weekMonday),
    [weekMonday]
  )
  const weekDateKeys = useMemo(
    () => weekDays.map((d) => formatDateKey(d)),
    [weekDays]
  )

  /** Lookup: `${date}|${time}` → slot */
  const byKey = useMemo(() => {
    const map = new Map<string, BookingSlot>()
    for (const slot of slots) {
      map.set(`${slot.date}|${slot.time}`, slot)
    }
    return map
  }, [slots])

  const todayKey = formatDateKey(today)

  const weekLabel = (() => {
    const end = weekDays[6]
    if (weekMonday.getMonth() === end.getMonth()) {
      return `${weekMonday.getDate()} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`
    }
    return `${weekMonday.getDate()} ${MONTH_NAMES[weekMonday.getMonth()]} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`
  })()

  function slotsAtTime(startMinutes: number): BookingSlot[] {
    const time = formatMinutesToTime(startMinutes)
    return weekDateKeys
      .map((date) => byKey.get(`${date}|${time}`))
      .filter((s): s is BookingSlot => Boolean(s))
  }

  function slotsOnDate(dateKey: string): BookingSlot[] {
    return timeRows
      .map((win) =>
        byKey.get(`${dateKey}|${formatMinutesToTime(win.startMinutes)}`)
      )
      .filter((s): s is BookingSlot => Boolean(s))
  }

  function prevWeek() {
    const prev = new Date(weekMonday)
    prev.setDate(prev.getDate() - 7)
    setWeekMonday(prev)
  }

  function nextWeek() {
    const next = new Date(weekMonday)
    next.setDate(next.getDate() + 7)
    setWeekMonday(next)
  }

  function jumpToThisWeek() {
    setWeekMonday(getMondayOfWeek(today))
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Availability week grid
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            Seven columns (Mon–Sun), one row per 30-minute start. Click a cell
            to toggle available / occupied. Use a row or day control to block a
            whole time (e.g. all 10:00s) or a whole day (e.g. Friday) when you
            have a meeting. Booked cells stay blocked until reopened.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Booked
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-400" /> Occupied
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-200" /> Empty
          </span>
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-ink-muted">Loading calendar…</p>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
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

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 border-b border-border bg-surface px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Time
                  </th>
                  {weekDays.map((day, i) => {
                    const dateKey = weekDateKeys[i]
                    const isToday = dateKey === todayKey
                    const daySlots = slotsOnDate(dateKey)
                    const available = daySlots.filter(
                      (s) => s.status === 'available'
                    )
                    return (
                      <th
                        key={dateKey}
                        className={`border-b border-border px-1.5 py-2 text-center ${
                          isToday ? 'bg-emerald-50/60' : ''
                        }`}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          {DAY_SHORT[i]}
                        </div>
                        <div
                          className={`text-base font-bold ${
                            isToday ? 'text-brand' : 'text-ink'
                          }`}
                        >
                          {day.getDate()}
                        </div>
                        <button
                          type="button"
                          disabled={busy || available.length === 0}
                          onClick={() => void onDisableSlots(available)}
                          title={
                            available.length === 0
                              ? 'No available slots this day'
                              : `Occupy all ${available.length} available slot(s) on this day`
                          }
                          className="mt-1 rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Block day
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {timeRows.map((win) => {
                  const time = formatMinutesToTime(win.startMinutes)
                  const rowSlots = slotsAtTime(win.startMinutes)
                  const rowAvailable = rowSlots.filter(
                    (s) => s.status === 'available'
                  )
                  return (
                    <tr key={win.startMinutes} className="group">
                      <th className="sticky left-0 z-10 whitespace-nowrap border-b border-border/70 bg-surface px-2 py-1 text-left align-middle">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-ink">
                            {time}
                          </span>
                          <button
                            type="button"
                            disabled={busy || rowAvailable.length === 0}
                            onClick={() => void onDisableSlots(rowAvailable)}
                            title={
                              rowAvailable.length === 0
                                ? `No available ${time} slots this week`
                                : `Occupy all available ${time} slots this week`
                            }
                            className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted opacity-70 transition hover:bg-stone-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            Block
                          </button>
                        </div>
                      </th>
                      {weekDateKeys.map((dateKey) => {
                        const slot = byKey.get(`${dateKey}|${time}`) ?? null
                        const isToday = dateKey === todayKey
                        if (!slot) {
                          return (
                            <td
                              key={`${dateKey}|${time}`}
                              className={`border-b border-border/70 px-1 py-1 text-center ${
                                isToday ? 'bg-emerald-50/30' : ''
                              }`}
                            >
                              <span className="inline-flex h-9 w-full items-center justify-center rounded-md text-[10px] text-stone-300">
                                —
                              </span>
                            </td>
                          )
                        }
                        const title =
                          slot.status === 'booked'
                            ? `Booked${
                                slot.booking?.name
                                  ? ` — ${slot.booking.name}`
                                  : ''
                              } (click to reopen)`
                            : slot.status === 'unavailable'
                              ? 'Occupied — click to make available'
                              : 'Available — click to occupy'
                        return (
                          <td
                            key={slot.id}
                            className={`border-b border-border/70 px-1 py-1 text-center ${
                              isToday ? 'bg-emerald-50/30' : ''
                            }`}
                          >
                            <button
                              type="button"
                              disabled={busy}
                              title={title}
                              onClick={() => void onToggleStatus(slot)}
                              className={`inline-flex h-9 w-full min-w-[3.25rem] items-center justify-center rounded-md border text-[11px] font-semibold transition disabled:opacity-60 ${cellStyles(
                                slot.status
                              )}`}
                            >
                              {slot.status === 'booked'
                                ? 'B'
                                : slot.status === 'unavailable'
                                  ? 'Off'
                                  : 'On'}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-ink-muted">
            Tip: use week arrows to cover the next fortnight. Empty cells (—)
            mean nothing was seeded for that day/time.
          </p>
        </div>
      )}
    </div>
  )
}
