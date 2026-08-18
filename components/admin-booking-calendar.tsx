'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { AdminDialog } from '@/components/admin-dialog'
import {
  BOOKING_REGION_IDS,
  BOOKING_REGION_LABELS,
  addDateKeyDays,
  buildSeedTimeWindows,
  emptyBookingRegions,
  formatDateKey,
  formatDisplayDate,
  formatMinutesToTime,
  getCalendarWeekDays,
  getMondayOfWeek,
  hasAnyBookingRegion,
  type BookingRegionId,
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

function regionButtonClass(on: boolean): string {
  return on
    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
    : 'border-stone-200 bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600'
}

type BulkScope = 'all' | BookingRegionId

type Props = {
  slots: BookingSlot[]
  loading?: boolean
  busy?: boolean
  /** Toggle booked → available. */
  onToggleStatus: (slot: BookingSlot) => void | Promise<void>
  /** Enable or disable one region (or all) on one or more date+time cells. */
  onSetCells: (
    cells: { date: string; time: string }[],
    scope: BulkScope,
    enabled: boolean
  ) => void | Promise<void>
  /** Copy this week's NZ/UK/INT availability onto the following week. */
  onCopyWeekToNext: (fromMonday: string) => void | Promise<void>
}

/**
 * Admin week grid: 7 day columns × 30-minute rows.
 * Click cells to open or block times; use row/day Open and Block for bulk edits.
 */
export function AdminBookingCalendar({
  slots,
  loading,
  busy,
  onToggleStatus,
  onSetCells,
  onCopyWeekToNext,
}: Props) {
  const today = useMemo(() => aucklandToday(), [])
  const [weekMonday, setWeekMonday] = useState<Date>(() =>
    getMondayOfWeek(aucklandToday())
  )
  const [bulkScope, setBulkScope] = useState<BulkScope>('all')
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false)

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

  function handleCopyToNextWeek() {
    setCopyConfirmOpen(true)
  }

  function confirmCopyToNextWeek() {
    setCopyConfirmOpen(false)
    void onCopyWeekToNext(formatDateKey(weekMonday))
  }

  function cellsForTime(time: string): { date: string; time: string }[] {
    return weekDateKeys.map((date) => ({ date, time }))
  }

  function cellsForDate(dateKey: string): { date: string; time: string }[] {
    return timeRows.map((win) => ({
      date: dateKey,
      time: formatMinutesToTime(win.startMinutes),
    }))
  }

  function handleRegionClick(
    dateKey: string,
    time: string,
    slot: BookingSlot | null,
    region: BookingRegionId
  ) {
    if (slot?.status === 'booked') return
    const on = Boolean(slot?.regions?.[region])
    void onSetCells([{ date: dateKey, time }], region, !on)
  }

  function slotRegions(slot: BookingSlot | null) {
    return slot?.regions ?? emptyBookingRegions()
  }

  function isRegionOn(slot: BookingSlot | null, region: BookingRegionId): boolean {
    if (!slot || slot.status === 'booked') return false
    return Boolean(slotRegions(slot)[region])
  }

  function isOpenForBulk(slot: BookingSlot | null): boolean {
    if (!slot || slot.status === 'booked') return false
    if (bulkScope === 'all') return hasAnyBookingRegion(slotRegions(slot))
    return isRegionOn(slot, bulkScope)
  }

  function isBooked(slot: BookingSlot | null): boolean {
    return slot?.status === 'booked'
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Availability week grid
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            Each cell has NZ, UK and INT. Green means that region can book the
            slot. Rows run 4:00 AM–11:00 PM NZ in clock order. Early NZ hours can
            be UK/INT only so New Zealand visitors never see them. Open / Block
            uses the bulk region selected below. Australia uses INT.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Region on
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-400" /> Region off
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Booked
          </span>
        </div>
      </div>

      {loading && slots.length === 0 ? (
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

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-ink-muted">Open / Block applies to</span>
              {(
                [
                  ['all', 'All'],
                  ['nz', 'NZ'],
                  ['uk', 'UK'],
                  ['intl', 'INT'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setBulkScope(id)}
                  className={`rounded border px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    bulkScope === id
                      ? 'border-brand bg-brand text-white'
                      : 'border-border bg-white text-ink-muted hover:bg-stone-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={handleCopyToNextWeek}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-stone-50 disabled:opacity-60"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy to next week
            </button>
          </div>

          <div className="max-h-[min(70vh,44rem)] overflow-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-20 border-b border-border bg-surface px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Time
                  </th>
                  {weekDays.map((day, i) => {
                    const dateKey = weekDateKeys[i]
                    const isToday = dateKey === todayKey
                    const blockable = timeRows.filter((win) => {
                      const slot =
                        byKey.get(
                          `${dateKey}|${formatMinutesToTime(win.startMinutes)}`
                        ) ?? null
                      return isOpenForBulk(slot)
                    }).length
                    const openableCount = timeRows.filter((win) => {
                      const slot =
                        byKey.get(
                          `${dateKey}|${formatMinutesToTime(win.startMinutes)}`
                        ) ?? null
                      return !isBooked(slot) && !isOpenForBulk(slot)
                    }).length
                    return (
                      <th
                        key={dateKey}
                        className={`sticky top-0 z-10 border-b border-border px-1.5 py-2 text-center ${
                          isToday ? 'bg-emerald-50' : 'bg-surface'
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
                        <div className="mt-1 flex flex-col items-center gap-0.5">
                          <button
                            type="button"
                            disabled={busy || openableCount === 0}
                            onClick={() =>
                              void onSetCells(
                                cellsForDate(dateKey),
                                bulkScope,
                                true
                              )
                            }
                            title={
                              openableCount === 0
                                ? 'No off cells this day for that region'
                                : `Open ${openableCount} cell(s) on this day for ${
                                    bulkScope === 'all' ? 'all regions' : bulkScope.toUpperCase()
                                  }`
                            }
                            className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            disabled={busy || blockable === 0}
                            onClick={() =>
                              void onSetCells(
                                cellsForDate(dateKey),
                                bulkScope,
                                false
                              )
                            }
                            title={
                              blockable === 0
                                ? 'No open slots this day for that region'
                                : `Block ${blockable} slot(s) on this day for ${
                                    bulkScope === 'all' ? 'all regions' : bulkScope.toUpperCase()
                                  }`
                            }
                            className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Block
                          </button>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {timeRows.map((win) => {
                  const time = formatMinutesToTime(win.startMinutes)
                  const rowBlockable = weekDateKeys.filter((date) =>
                    isOpenForBulk(byKey.get(`${date}|${time}`) ?? null)
                  ).length
                  const rowOpenable = weekDateKeys.filter((date) => {
                    const slot = byKey.get(`${date}|${time}`) ?? null
                    return !isBooked(slot) && !isOpenForBulk(slot)
                  }).length
                  return (
                    <tr key={win.startMinutes} className="group">
                      <th className="sticky left-0 z-10 whitespace-nowrap border-b border-border/70 bg-surface px-2 py-1 text-left align-middle">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-ink">
                            {time}
                          </span>
                          <button
                            type="button"
                            disabled={busy || rowOpenable === 0}
                            onClick={() =>
                              void onSetCells(cellsForTime(time), bulkScope, true)
                            }
                            title={
                              rowOpenable === 0
                                ? `No off ${time} cells this week for that region`
                                : `Open ${rowOpenable} ${time} cell(s) this week`
                            }
                            className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 opacity-70 transition hover:bg-emerald-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            disabled={busy || rowBlockable === 0}
                            onClick={() =>
                              void onSetCells(cellsForTime(time), bulkScope, false)
                            }
                            title={
                              rowBlockable === 0
                                ? `No open ${time} slots this week for that region`
                                : `Block ${rowBlockable} ${time} slot(s) this week`
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
                        const booked = slot?.status === 'booked'
                        const regions = slotRegions(slot)
                        return (
                          <td
                            key={`${dateKey}|${time}`}
                            className={`border-b border-border/70 px-1 py-1 text-center ${
                              isToday ? 'bg-emerald-50/30' : ''
                            }`}
                          >
                            {booked ? (
                              <button
                                type="button"
                                disabled={busy}
                                title={`Booked${
                                  slot?.booking?.name
                                    ? ` — ${slot.booking.name}`
                                    : ''
                                } (click to reopen)`}
                                onClick={() => void onToggleStatus(slot)}
                                className="inline-flex h-9 w-full min-w-[4.5rem] items-center justify-center rounded-md border border-sky-300 bg-sky-50 text-[11px] font-semibold text-sky-900 transition hover:border-sky-500 disabled:opacity-60"
                              >
                                B
                              </button>
                            ) : (
                              <div className="flex min-w-[4.75rem] gap-0.5">
                                {BOOKING_REGION_IDS.map((region) => {
                                  const on = regions[region]
                                  return (
                                    <button
                                      key={region}
                                      type="button"
                                      disabled={busy}
                                      title={`${BOOKING_REGION_LABELS[region]} ${
                                        on ? 'on — click to hide from this region' : 'off — click to offer in this region'
                                      }`}
                                      onClick={() =>
                                        handleRegionClick(
                                          dateKey,
                                          time,
                                          slot,
                                          region
                                        )
                                      }
                                      className={`inline-flex h-9 flex-1 items-center justify-center rounded border text-[9px] font-bold tracking-wide transition disabled:opacity-60 ${regionButtonClass(
                                        on
                                      )}`}
                                    >
                                      {BOOKING_REGION_LABELS[region]}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
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
            Tip: click NZ, UK or INT on a cell to offer that time in that
            region. Use week arrows to cover the next fortnight.
          </p>
        </div>
      )}

      <AdminDialog
        open={copyConfirmOpen}
        title="Copy this week to next week?"
        confirmLabel="Copy to next week"
        busy={busy}
        onClose={() => {
          if (!busy) setCopyConfirmOpen(false)
        }}
        onConfirm={confirmCopyToNextWeek}
      >
        <p>
          Copy this week&apos;s NZ / UK / INT availability onto the week of{' '}
          <strong>
            {formatDisplayDate(addDateKeyDays(formatDateKey(weekMonday), 7))}
          </strong>
          .
        </p>
        <p>Existing cells next week will be replaced. Booked calls will not be changed.</p>
      </AdminDialog>
    </div>
  )
}
