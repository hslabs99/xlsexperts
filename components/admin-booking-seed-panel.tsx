'use client'

import { useEffect, useMemo, useState } from 'react'
import { AdminDialog } from '@/components/admin-dialog'
import {
  buildSeedTimeWindows,
  countPlannedSeedSlots,
  createEmptySeedEnabled,
  createMorningSeedEnabled,
  defaultSeedTemplateConfig,
  formatDateKey,
  formatDisplayDate,
  SEED_SLOT_MINUTES,
  SEED_WEEKDAYS,
  seedCellKey,
  type BookingSlot,
  type SeedTemplateConfig,
  type SeedWeekday,
} from '@/lib/booking-slots'

const STORAGE_KEY = 'xls-booking-seed-template-v4'

/** Horizon options: from today forward. Default is 2 weeks. */
const SEED_WEEK_OPTIONS = [1, 2, 3] as const

function clampWeeks(weeks: number): number {
  if (SEED_WEEK_OPTIONS.includes(weeks as (typeof SEED_WEEK_OPTIONS)[number])) {
    return weeks
  }
  return 2
}

function loadStoredConfig(): SeedTemplateConfig {
  if (typeof window === 'undefined') return defaultSeedTemplateConfig()
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem('xls-booking-seed-template-v3')
    if (!raw) return defaultSeedTemplateConfig()
    const parsed = JSON.parse(raw) as Partial<SeedTemplateConfig>
    const weeks = clampWeeks(
      typeof parsed.weeks === 'number' ? Math.floor(parsed.weeks) : 2
    )
    const base = createEmptySeedEnabled()
    const enabled =
      parsed.enabled && typeof parsed.enabled === 'object'
        ? {
            ...base,
            ...Object.fromEntries(
              Object.entries(parsed.enabled).filter(([k]) => k in base)
            ),
          }
        : base
    return {
      appointmentMinutes: SEED_SLOT_MINUTES,
      weeks,
      enabled,
    }
  } catch {
    return defaultSeedTemplateConfig()
  }
}

function persistConfig(config: SeedTemplateConfig) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Ignore quota / private mode
  }
}

/** Booked slots whose date falls in [today, today+14 days] (calendar days). */
export function bookedSlotsInNextTwoWeeks(
  slots: BookingSlot[],
  from: Date = new Date()
): BookingSlot[] {
  const start = formatDateKey(from)
  const endDate = new Date(from)
  endDate.setHours(0, 0, 0, 0)
  endDate.setDate(endDate.getDate() + 14)
  const end = formatDateKey(endDate)
  return slots
    .filter(
      (s) => s.status === 'booked' && s.date >= start && s.date <= end
    )
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.time.localeCompare(b.time)
    })
}

type Props = {
  busy?: boolean
  slots?: BookingSlot[]
  onSeed: (config: SeedTemplateConfig) => Promise<void>
  onClearAll: () => Promise<void>
}

export function AdminBookingSeedPanel({
  busy,
  slots = [],
  onSeed,
  onClearAll,
}: Props) {
  const [config, setConfig] = useState<SeedTemplateConfig>(() =>
    defaultSeedTemplateConfig()
  )
  const [hydrated, setHydrated] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    setConfig(loadStoredConfig())
    setHydrated(true)
  }, [])

  const windows = useMemo(() => buildSeedTimeWindows(), [])
  const slotCount = slots.length

  const plannedCount = useMemo(
    () => countPlannedSeedSlots(config),
    [config]
  )

  const enabledCount = useMemo(
    () => Object.values(config.enabled).filter(Boolean).length,
    [config.enabled]
  )

  const upcomingBookings = useMemo(
    () => bookedSlotsInNextTwoWeeks(slots),
    [slots]
  )

  function update(next: SeedTemplateConfig) {
    setConfig(next)
    if (hydrated) persistConfig(next)
  }

  function toggleCell(day: SeedWeekday, startMinutes: number) {
    const key = seedCellKey(day, startMinutes)
    update({
      ...config,
      enabled: { ...config.enabled, [key]: !config.enabled[key] },
    })
  }

  function setRow(startMinutes: number, value: boolean) {
    const enabled = { ...config.enabled }
    for (const { day } of SEED_WEEKDAYS) {
      enabled[seedCellKey(day, startMinutes)] = value
    }
    update({ ...config, enabled })
  }

  function rowState(startMinutes: number): 'on' | 'off' | 'mixed' {
    let on = 0
    for (const { day } of SEED_WEEKDAYS) {
      if (config.enabled[seedCellKey(day, startMinutes)]) on += 1
    }
    if (on === 0) return 'off'
    if (on === SEED_WEEKDAYS.length) return 'on'
    return 'mixed'
  }

  function setAll(value: boolean) {
    const enabled = createEmptySeedEnabled()
    if (value) {
      for (const key of Object.keys(enabled)) enabled[key] = true
    }
    update({ ...config, enabled })
  }

  function applyMorningPreset() {
    update({
      ...config,
      enabled: createMorningSeedEnabled(),
    })
  }

  async function confirmClearAll() {
    setClearing(true)
    try {
      await onClearAll()
      setClearOpen(false)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Seed discovery availability
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            20 half-hour rows from 8:00 AM–6:00 PM. Turn a whole row on/off,
            then fine-tune individual Mon–Fri cells. Seed creates one booking
            slot for every enabled cell from today through the weeks you choose
            (default 2).
          </p>
        </div>
        <p className="text-xs text-ink-muted">
          {enabledCount} cell{enabledCount === 1 ? '' : 's'} · ~{plannedCount}{' '}
          slot{plannedCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Slot length</span>
          <div className="rounded-md border border-border bg-surface-raised px-3 py-2 text-ink">
            30 minutes (fixed)
          </div>
          <span className="text-xs text-ink-muted">
            Rows: 8:00–8:30, 8:30–9:00, …, 5:30–6:00
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Weeks to seed from today</span>
          <select
            value={config.weeks}
            onChange={(e) =>
              update({ ...config, weeks: clampWeeks(Number(e.target.value)) })
            }
            className="rounded-md border border-border px-3 py-2"
          >
            {SEED_WEEK_OPTIONS.map((n) => (
              <option key={n} value={n}>
                Today + {n} week{n === 1 ? '' : 's'}
                {n === 2 ? ' (default)' : ''}
              </option>
            ))}
          </select>
          <span className="text-xs text-ink-muted">
            Applies this Mon–Fri pattern from today through the period you pick
          </span>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAll(true)}
          className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-surface-raised"
        >
          Enable all
        </button>
        <button
          type="button"
          onClick={() => setAll(false)}
          className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-surface-raised"
        >
          Disable all
        </button>
        <button
          type="button"
          onClick={applyMorningPreset}
          className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-surface-raised"
        >
          Mon / Wed / Fri mornings
        </button>
        <button
          type="button"
          disabled={busy || slotCount === 0}
          onClick={() => setClearOpen(true)}
          className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Empty all booking slots
        </button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-border px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Time
              </th>
              <th className="border-b border-border px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Row
              </th>
              {SEED_WEEKDAYS.map((d) => (
                <th
                  key={d.day}
                  className="border-b border-border px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted"
                >
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {windows.map((win) => {
              const state = rowState(win.startMinutes)
              return (
                <tr key={win.startMinutes}>
                  <td className="whitespace-nowrap border-b border-border/70 px-2 py-1.5 text-xs font-medium text-ink">
                    {win.label}
                  </td>
                  <td className="border-b border-border/70 px-1.5 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setRow(win.startMinutes, state !== 'on')
                      }
                      title={
                        state === 'on'
                          ? 'Turn this time off for Mon–Fri'
                          : 'Turn this time on for Mon–Fri'
                      }
                      className={`inline-flex h-9 min-w-[3.25rem] items-center justify-center rounded-md border px-2 text-[11px] font-semibold transition ${
                        state === 'on'
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : state === 'mixed'
                            ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                            : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      {state === 'on' ? 'On' : state === 'mixed' ? 'Mix' : 'Off'}
                    </button>
                  </td>
                  {SEED_WEEKDAYS.map((d) => {
                    const key = seedCellKey(d.day, win.startMinutes)
                    const on = Boolean(config.enabled[key])
                    return (
                      <td
                        key={key}
                        className="border-b border-border/70 px-1.5 py-1.5 text-center"
                      >
                        <button
                          type="button"
                          onClick={() => toggleCell(d.day, win.startMinutes)}
                          title={
                            on
                              ? 'Enabled — will be seeded (click to disable)'
                              : 'Disabled — will not be seeded (click to enable)'
                          }
                          className={`inline-flex h-9 w-full min-w-[3.5rem] items-center justify-center rounded-md border text-xs font-semibold transition ${
                            on
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'border-stone-200 bg-stone-50 text-stone-400 hover:bg-stone-100'
                          }`}
                        >
                          {on ? 'On' : 'Off'}
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

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || enabledCount === 0}
          onClick={() => void onSeed(config)}
          className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy
            ? 'Working…'
            : `Seed today + ${config.weeks} week${config.weeks === 1 ? '' : 's'} (~${plannedCount} slots)`}
        </button>
        {enabledCount === 0 ? (
          <p className="text-xs text-amber-700">
            Turn on at least one cell (or a whole row) before seeding.
          </p>
        ) : (
          <p className="text-xs text-ink-muted">
            Tip: empty existing slots first if you want a clean rebuild, then
            seed only what is On.
          </p>
        )}
      </div>

      <AdminDialog
        open={clearOpen}
        title="Empty all booking slots?"
        mode="confirm"
        tone="danger"
        confirmLabel="Delete all slots"
        cancelLabel="Keep slots"
        busy={clearing}
        onClose={() => {
          if (!clearing) setClearOpen(false)
        }}
        onConfirm={confirmClearAll}
      >
        <p>
          This deletes all {slotCount} booking slot
          {slotCount === 1 ? '' : 's'} (available, unavailable, and booked).
          This cannot be undone.
        </p>
        {upcomingBookings.length > 0 ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-950">
            <p className="font-semibold">
              Warning: {upcomingBookings.length} booked discovery call
              {upcomingBookings.length === 1 ? '' : 's'} in the next 2 weeks
              will also be deleted.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {upcomingBookings.slice(0, 8).map((s) => (
                <li key={s.id}>
                  {formatDisplayDate(s.date)} · {s.time}
                  {s.booking?.name ? ` — ${s.booking.name}` : ''}
                  {s.booking?.company ? ` (${s.booking.company})` : ''}
                </li>
              ))}
              {upcomingBookings.length > 8 ? (
                <li>…and {upcomingBookings.length - 8} more</li>
              ) : null}
            </ul>
          </div>
        ) : (
          <p>No booked calls found in the next 2 weeks.</p>
        )}
      </AdminDialog>
    </div>
  )
}
