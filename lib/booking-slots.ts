import type { Timestamp } from 'firebase/firestore'

/** Business timezone for discovery booking availability. */
export const BOOKING_TIMEZONE = 'Pacific/Auckland'

/** Minimum notice before a slot start (NZ wall clock). Blocks same-morning urgent bookings. */
export const BOOKING_MIN_LEAD_MINUTES = 120

/** Slot status shown in admin: tick = available, cross = unavailable, B = booked */
export type BookingSlotStatus = 'available' | 'unavailable' | 'booked'

/** Details captured when a discovery call is booked */
export interface BookingDetails {
  name: string
  company: string
  email: string
  phone: string
  message: string
  services: string[]
  service: string
  solution: string
  hear: string
  method: string
  bookedAt?: Timestamp | null
}

export interface BookingSlot {
  id: string
  date: string // YYYY-MM-DD
  time: string // e.g. "9:00 AM"
  type: string // e.g. "discovery"
  status: BookingSlotStatus
  durationMinutes: 15 | 30
  createdAt?: Timestamp | null
  booking?: BookingDetails | null
}

export type BookingSlotInput = Omit<BookingSlot, 'id' | 'createdAt' | 'booking'>

/** Weekday columns for the seed template (JS getDay(): Mon=1 … Fri=5). */
export const SEED_WEEKDAYS = [
  { day: 1, label: 'Mon', short: 'M' },
  { day: 2, label: 'Tue', short: 'T' },
  { day: 3, label: 'Wed', short: 'W' },
  { day: 4, label: 'Thu', short: 'T' },
  { day: 5, label: 'Fri', short: 'F' },
] as const

export type SeedWeekday = (typeof SEED_WEEKDAYS)[number]['day']

/** Business-day bounds for the availability grid (minutes from midnight). */
export const SEED_DAY_START_MINUTES = 8 * 60 // 8:00 AM
export const SEED_DAY_END_MINUTES = 18 * 60 // 6:00 PM

/**
 * Grid row length = appointment length.
 * 8:00–6:00 in 30-minute steps → 20 rows (two per hour).
 */
export const SEED_SLOT_MINUTES = 30 as const

export type SeedAppointmentMinutes = 15 | 30

/** Allowed seed horizons (rolling calendar weeks from Auckland today). */
export const SEED_WEEK_OPTIONS = [1, 2, 3] as const
export type SeedWeekOption = (typeof SEED_WEEK_OPTIONS)[number]

export interface SeedTemplateConfig {
  /** Appointment / row length (always 30 for the current grid). */
  appointmentMinutes: SeedAppointmentMinutes
  /**
   * Rolling horizon in calendar weeks from Auckland today.
   * 2 → today through today+13 days (14 calendar days / up to 10 weekdays).
   */
  weeks: number
  /**
   * Enabled day+window cells.
   * Key: `${weekday}-${windowStartMinutes}` e.g. `1-480` = Monday 8:00 AM.
   */
  enabled: Record<string, boolean>
}

export interface SeedTimeWindow {
  startMinutes: number
  endMinutes: number
  label: string
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function seedCellKey(day: SeedWeekday, startMinutes: number): string {
  return `${day}-${startMinutes}`
}

export function formatMinutesToTime(totalMinutes: number): string {
  const clamped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  let hours = Math.floor(clamped / 60)
  const minutes = clamped % 60
  const period = hours >= 12 ? 'PM' : 'AM'
  if (hours === 0) hours = 12
  else if (hours > 12) hours -= 12
  return `${hours}:${String(minutes).padStart(2, '0')} ${period}`
}

/**
 * Build grid rows from 8:00 AM–6:00 PM every 30 minutes
 * (8:00–8:30, 8:30–9:00, …, 5:30–6:00) — 20 rows.
 */
export function buildSeedTimeWindows(
  slotMinutes: number = SEED_SLOT_MINUTES
): SeedTimeWindow[] {
  const step = slotMinutes > 0 ? slotMinutes : SEED_SLOT_MINUTES
  const windows: SeedTimeWindow[] = []
  for (
    let start = SEED_DAY_START_MINUTES;
    start + step <= SEED_DAY_END_MINUTES;
    start += step
  ) {
    const end = start + step
    windows.push({
      startMinutes: start,
      endMinutes: end,
      label: `${formatMinutesToTime(start)} – ${formatMinutesToTime(end)}`,
    })
  }
  return windows
}

/** Empty template — all cells off until staff enable rows / cells. */
export function createEmptySeedEnabled(): Record<string, boolean> {
  const enabled: Record<string, boolean> = {}
  for (const { day } of SEED_WEEKDAYS) {
    for (const win of buildSeedTimeWindows()) {
      enabled[seedCellKey(day, win.startMinutes)] = false
    }
  }
  return enabled
}

/**
 * Example starting point: Mon / Wed / Fri mornings (8:00–12:00).
 * Staff can refine from here before seeding.
 */
export function createMorningSeedEnabled(): Record<string, boolean> {
  const enabled = createEmptySeedEnabled()
  const morningCutoff = 12 * 60
  for (const day of [1, 3, 5] as SeedWeekday[]) {
    for (const win of buildSeedTimeWindows()) {
      if (win.endMinutes <= morningCutoff) {
        enabled[seedCellKey(day, win.startMinutes)] = true
      }
    }
  }
  return enabled
}

export function defaultSeedTemplateConfig(): SeedTemplateConfig {
  return {
    appointmentMinutes: SEED_SLOT_MINUTES,
    weeks: 2,
    enabled: createEmptySeedEnabled(),
  }
}

/** Clamp / coerce weeks so missing or invalid values never shrink the horizon. */
export function resolveSeedWeeks(weeks: unknown): SeedWeekOption {
  const n = typeof weeks === 'number' ? weeks : Number(weeks)
  if (
    Number.isFinite(n) &&
    SEED_WEEK_OPTIONS.includes(Math.floor(n) as SeedWeekOption)
  ) {
    return Math.floor(n) as SeedWeekOption
  }
  return 2
}

/** Add calendar days to a YYYY-MM-DD key (timezone-safe via UTC). */
export function addDateKeyDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  const yy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

/** JS weekday 0=Sun…6=Sat for a YYYY-MM-DD calendar date. */
export function weekdayFromDateKey(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

/** Inclusive Auckland start/end date keys for a seed horizon. */
export function seedHorizonDateKeys(
  weeks: unknown,
  from: Date = new Date()
): {
  startKey: string
  endKey: string
  lastWeekdayKey: string
  daySpan: number
} {
  const resolved = resolveSeedWeeks(weeks)
  const daySpan = resolved * 7
  const startKey = aucklandDateKey(from)
  const endKey = addDateKeyDays(startKey, daySpan - 1)
  let lastWeekdayKey = endKey
  for (let offset = daySpan - 1; offset >= 0; offset--) {
    const key = addDateKeyDays(startKey, offset)
    const dow = weekdayFromDateKey(key)
    if (dow >= 1 && dow <= 5) {
      lastWeekdayKey = key
      break
    }
  }
  return { startKey, endKey, lastWeekdayKey, daySpan }
}

/** Times offered in the manual “Add slot” form (every 30 min, 8–6). */
export const SEED_TIME_OPTIONS: { time: string; durationMinutes: 15 | 30 }[] =
  (() => {
    const options: { time: string; durationMinutes: 15 | 30 }[] = []
    for (
      let m = SEED_DAY_START_MINUTES;
      m < SEED_DAY_END_MINUTES;
      m += SEED_SLOT_MINUTES
    ) {
      options.push({
        time: formatMinutesToTime(m),
        durationMinutes: SEED_SLOT_MINUTES,
      })
    }
    return options
  })()

export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Calendar day + minutes-from-midnight in Pacific/Auckland for an instant. */
export function aucklandDateAndMinutes(now: Date = new Date()): {
  dateKey: string
  minutes: number
} {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOOKING_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '0'
  const dateKey = `${get('year')}-${get('month')}-${get('day')}`
  let hour = Number(get('hour'))
  if (hour === 24) hour = 0
  const minute = Number(get('minute'))
  return { dateKey, minutes: hour * 60 + minute }
}

/** YYYY-MM-DD in Pacific/Auckland for an instant. */
export function aucklandDateKey(now: Date = new Date()): string {
  return aucklandDateAndMinutes(now).dateKey
}

function dateKeyDayIndex(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000)
}

/**
 * True when the slot’s NZ wall-clock start is at least `leadMinutes` after `now`
 * (also measured in NZ). Used to hide past / too-soon public slots.
 */
export function isSlotBookableWithLead(
  date: string,
  time: string,
  leadMinutes: number = BOOKING_MIN_LEAD_MINUTES,
  now: Date = new Date()
): boolean {
  const auckland = aucklandDateAndMinutes(now)
  const slotAbs =
    dateKeyDayIndex(date) * 24 * 60 + parseTimeToMinutes(time)
  const nowAbs =
    dateKeyDayIndex(auckland.dateKey) * 24 * 60 + auckland.minutes
  return slotAbs >= nowAbs + leadMinutes
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDayLabel(dateKey: string): string {
  const date = parseDateKey(dateKey)
  return DAY_NAMES[date.getDay()]
}

export function formatDisplayDate(dateKey: string): string {
  const date = parseDateKey(dateKey)
  return date.toLocaleDateString('en-NZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Build discovery slots from a weekly availability template.
 * Each enabled Mon–Fri cell becomes one 30-minute appointment start.
 * Horizon is `weeks * 7` Auckland calendar days starting today (default 2 → 14 days).
 * Slots sooner than BOOKING_MIN_LEAD_MINUTES in NZ time are skipped.
 */
export function buildSeedSlots(
  config: SeedTemplateConfig = defaultSeedTemplateConfig(),
  from: Date = new Date()
): BookingSlotInput[] {
  const weeks = resolveSeedWeeks(config?.weeks)
  const { startKey, daySpan } = seedHorizonDateKeys(weeks, from)
  const windows = buildSeedTimeWindows()
  const enabled = config?.enabled ?? createEmptySeedEnabled()
  const slots: BookingSlotInput[] = []

  for (let offset = 0; offset < daySpan; offset++) {
    const date = addDateKeyDays(startKey, offset)
    const dow = weekdayFromDateKey(date)
    if (dow < 1 || dow > 5) continue

    const weekday = dow as SeedWeekday
    for (const win of windows) {
      if (!enabled[seedCellKey(weekday, win.startMinutes)]) continue
      const time = formatMinutesToTime(win.startMinutes)
      if (!isSlotBookableWithLead(date, time, BOOKING_MIN_LEAD_MINUTES, from)) {
        continue
      }

      slots.push({
        date,
        time,
        type: 'discovery',
        status: 'available',
        durationMinutes: SEED_SLOT_MINUTES,
      })
    }
  }

  return slots
}

export function groupSlotsByDate(slots: BookingSlot[]): Record<string, BookingSlot[]> {
  const grouped: Record<string, BookingSlot[]> = {}
  for (const slot of slots) {
    if (!grouped[slot.date]) grouped[slot.date] = []
    grouped[slot.date].push(slot)
  }
  for (const date of Object.keys(grouped)) {
    grouped[date].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time))
  }
  return grouped
}

export function parseTimeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0
  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3].toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

/** Count how many appointment slots the current template would produce. */
export function countPlannedSeedSlots(
  config: SeedTemplateConfig,
  from: Date = new Date()
): number {
  return buildSeedSlots(config, from).length
}

export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Next Mon–Fri calendar day on/after `from` (local date components).
 * Sat → next Mon, Sun → next Mon, weekday → same day.
 */
export function nextWorkingDay(from: Date = new Date()): Date {
  const d = new Date(from)
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay()
  if (dow === 6) {
    d.setDate(d.getDate() + 2)
  } else if (dow === 0) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

/**
 * Monday that starts the booking week visitors should see first:
 * the week containing the next working day (never a past Mon–Fri week
 * when today is Sat/Sun).
 */
export function bookingCalendarStartMonday(from: Date = new Date()): Date {
  return getMondayOfWeek(nextWorkingDay(from))
}

export function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

/** Mon–Sun (7 columns) for admin availability grids. */
export function getCalendarWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}
