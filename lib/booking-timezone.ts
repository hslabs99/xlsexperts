import {
  BOOKING_TIMEZONE,
  formatDayLabel,
  parseTimeToMinutes,
  type BookingSlot,
} from '@/lib/booking-slots'
import type { MarketId } from '@/lib/market'

/** Locked display zone when a region hides the time zone selector. */
export function displayTimeZoneForMarket(market: MarketId): string {
  if (market === 'uk') return 'Europe/London'
  return BOOKING_TIMEZONE
}

/** Browser / Node IANA zone, falling back to New Zealand business time. */
export function detectBrowserTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && isValidTimeZone(tz)) return tz
  } catch {
    // Ignore missing Intl support
  }
  return BOOKING_TIMEZONE
}

/**
 * Visitor zone for the public calendar.
 * On localhost, `?tz=Europe/London` or `?tz=America/New_York` overrides detection
 * so International booking can be previewed without changing the OS timezone.
 */
export function resolveVisitorTimeZone(): string {
  return resolveBookingPickerTimeZone().selected
}

/** Detected browser zone plus any stored or localhost override. */
export function resolveBookingPickerTimeZone(): {
  detected: string
  selected: string
} {
  const detected = canonicalizeBookingTimeZone(detectBrowserTimeZone())
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const isLocal = host === 'localhost' || host === '127.0.0.1'
    if (isLocal) {
      const tz = new URLSearchParams(window.location.search).get('tz')
      if (tz && isValidTimeZone(tz)) {
        return { detected, selected: canonicalizeBookingTimeZone(tz) }
      }
    }
    const stored = readStoredBookingTimeZone()
    if (stored) {
      return { detected, selected: canonicalizeBookingTimeZone(stored) }
    }
  }
  return { detected, selected: detected }
}

export const BOOKING_TIME_ZONE_STORAGE_KEY = 'xls-booking-timezone'

export interface BookingTimeZoneOption {
  id: string
  group: 'New Zealand' | 'Australia' | 'United Kingdom' | 'United States'
  label: string
}

/** Curated zones for the discovery calendar picker. */
export const BOOKING_TIME_ZONE_OPTIONS: BookingTimeZoneOption[] = [
  { id: 'Pacific/Auckland', group: 'New Zealand', label: 'Auckland' },
  {
    id: 'Australia/Sydney',
    group: 'Australia',
    label: 'Sydney, Melbourne, Canberra',
  },
  {
    id: 'Australia/Brisbane',
    group: 'Australia',
    label: 'Brisbane (Queensland)',
  },
  { id: 'Australia/Adelaide', group: 'Australia', label: 'Adelaide' },
  { id: 'Australia/Darwin', group: 'Australia', label: 'Darwin' },
  { id: 'Australia/Perth', group: 'Australia', label: 'Perth' },
  { id: 'Europe/London', group: 'United Kingdom', label: 'London' },
  {
    id: 'America/New_York',
    group: 'United States',
    label: 'Eastern — New York, Miami',
  },
  {
    id: 'America/Chicago',
    group: 'United States',
    label: 'Central — Chicago, Dallas',
  },
  {
    id: 'America/Denver',
    group: 'United States',
    label: 'Mountain — Denver',
  },
  {
    id: 'America/Phoenix',
    group: 'United States',
    label: 'Arizona (no daylight saving)',
  },
  {
    id: 'America/Los_Angeles',
    group: 'United States',
    label: 'Pacific — Los Angeles, Seattle',
  },
  { id: 'Pacific/Honolulu', group: 'United States', label: 'Hawaii' },
  { id: 'America/Anchorage', group: 'United States', label: 'Alaska' },
]

const BOOKING_TIME_ZONE_IDS = new Set(
  BOOKING_TIME_ZONE_OPTIONS.map((option) => option.id)
)

/** Common browser IANA ids that share a curated zone. */
const BOOKING_TIME_ZONE_ALIASES: Record<string, string> = {
  NZ: 'Pacific/Auckland',
  'Pacific/Auckland': 'Pacific/Auckland',
  'Antarctica/McMurdo': 'Pacific/Auckland',
  'Antarctica/South_Pole': 'Pacific/Auckland',
  'Australia/Melbourne': 'Australia/Sydney',
  'Australia/Hobart': 'Australia/Sydney',
  'Australia/Currie': 'Australia/Sydney',
  'Australia/ACT': 'Australia/Sydney',
  'Australia/NSW': 'Australia/Sydney',
  'Australia/Victoria': 'Australia/Sydney',
  'Australia/Canberra': 'Australia/Sydney',
  'Australia/Queensland': 'Australia/Brisbane',
  'Australia/Lindeman': 'Australia/Brisbane',
  'Australia/South': 'Australia/Adelaide',
  'Australia/Broken_Hill': 'Australia/Adelaide',
  'Australia/Yancowinna': 'Australia/Adelaide',
  'Australia/North': 'Australia/Darwin',
  'Australia/West': 'Australia/Perth',
  GB: 'Europe/London',
  'GB-Eire': 'Europe/London',
  'Europe/Belfast': 'Europe/London',
  'Europe/Guernsey': 'Europe/London',
  'Europe/Jersey': 'Europe/London',
  'Europe/Isle_of_Man': 'Europe/London',
  'US/Eastern': 'America/New_York',
  'America/Detroit': 'America/New_York',
  'America/Kentucky/Louisville': 'America/New_York',
  'America/Indiana/Indianapolis': 'America/New_York',
  'America/Toronto': 'America/New_York',
  'America/Montreal': 'America/New_York',
  'US/Central': 'America/Chicago',
  'America/Indiana/Knox': 'America/Chicago',
  'America/Winnipeg': 'America/Chicago',
  'US/Mountain': 'America/Denver',
  'America/Boise': 'America/Denver',
  'America/Edmonton': 'America/Denver',
  'US/Arizona': 'America/Phoenix',
  'US/Pacific': 'America/Los_Angeles',
  'America/Vancouver': 'America/Los_Angeles',
  'America/Tijuana': 'America/Los_Angeles',
  'US/Hawaii': 'Pacific/Honolulu',
  'US/Alaska': 'America/Anchorage',
}

export function canonicalizeBookingTimeZone(timeZone: string): string {
  if (BOOKING_TIME_ZONE_IDS.has(timeZone)) return timeZone
  return BOOKING_TIME_ZONE_ALIASES[timeZone] ?? timeZone
}

export function readStoredBookingTimeZone(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = sessionStorage.getItem(BOOKING_TIME_ZONE_STORAGE_KEY)
    if (stored && isValidTimeZone(stored)) return stored
  } catch {
    // Private mode
  }
  return null
}

export function storeBookingTimeZone(timeZone: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(BOOKING_TIME_ZONE_STORAGE_KEY, timeZone)
  } catch {
    // Private mode
  }
}

export function clearStoredBookingTimeZone(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(BOOKING_TIME_ZONE_STORAGE_KEY)
  } catch {
    // Private mode
  }
}

export function formatGmtOffset(
  timeZone: string,
  at: Date = new Date()
): string {
  if (!isValidTimeZone(timeZone)) return ''
  const offset =
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName')?.value ?? ''
  if (offset) return offset
  return (
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName')?.value ?? ''
  )
}

function ianaCityName(timeZone: string): string {
  return timeZone.split('/').pop()?.replace(/_/g, ' ') ?? timeZone
}

export function formatTimeZoneOptionLabel(
  option: { id: string; label: string },
  at: Date = new Date()
): string {
  const offset = formatGmtOffset(option.id, at)
  return offset ? `${option.label} (${offset})` : option.label
}

/** e.g. "a 10:00 AM NZ slot is 10:00 PM the day before" */
export function describeNzSlotInTimeZone(
  timeZone: string,
  nzTime: string = '10:00 AM',
  at: Date = new Date()
): string | null {
  if (!isValidTimeZone(timeZone) || timeZone === BOOKING_TIMEZONE) return null
  const nzDate = dateKeyInTimeZone(at, BOOKING_TIMEZONE)
  const instant = aucklandWallTimeToUtc(nzDate, nzTime)
  const localDate = dateKeyInTimeZone(instant, timeZone)
  const localTime = formatTimeInTimeZone(instant, timeZone)
  if (localDate === nzDate) {
    return `a ${nzTime} NZ slot is ${localTime} the same day`
  }
  if (localDate < nzDate) {
    return `a ${nzTime} NZ slot is ${localTime} the day before`
  }
  return `a ${nzTime} NZ slot is ${localTime} the next day`
}

/** e.g. "11 hours behind New Zealand" — DST-aware, including half hours. */
export function describeOffsetFromNewZealand(
  timeZone: string,
  at: Date = new Date()
): string {
  if (!isValidTimeZone(timeZone) || timeZone === BOOKING_TIMEZONE) {
    return 'the same as New Zealand'
  }
  const hours =
    (timeZoneOffsetMs(at, timeZone) - timeZoneOffsetMs(at, BOOKING_TIMEZONE)) /
    3_600_000
  const rounded = Math.round(hours * 2) / 2
  if (rounded === 0) return 'the same as New Zealand'
  const abs = Math.abs(rounded)
  const hoursLabel = Number.isInteger(abs) ? String(abs) : abs.toFixed(1)
  const unit = abs === 1 ? 'hour' : 'hours'
  return rounded > 0
    ? `${hoursLabel} ${unit} ahead of New Zealand`
    : `${hoursLabel} ${unit} behind New Zealand`
}

export function bookingTimeZoneSelectGroups(
  detectedId: string,
  selectedId?: string
): {
  group: string
  options: { id: string; label: string }[]
}[] {
  const groups: { group: string; options: { id: string; label: string }[] }[] =
    []
  const extraIds = new Set<string>()
  const canonicalDetected = canonicalizeBookingTimeZone(detectedId)
  if (
    isValidTimeZone(detectedId) &&
    !BOOKING_TIME_ZONE_IDS.has(canonicalDetected)
  ) {
    extraIds.add(detectedId)
    groups.push({
      group: 'Detected',
      options: [
        {
          id: detectedId,
          label: `${ianaCityName(detectedId)} (your browser)`,
        },
      ],
    })
  }
  if (
    selectedId &&
    isValidTimeZone(selectedId) &&
    !BOOKING_TIME_ZONE_IDS.has(selectedId) &&
    !extraIds.has(selectedId)
  ) {
    groups.push({
      group: 'Selected',
      options: [
        {
          id: selectedId,
          label: ianaCityName(selectedId),
        },
      ],
    })
  }

  const byGroup = new Map<string, BookingTimeZoneOption[]>()
  for (const option of BOOKING_TIME_ZONE_OPTIONS) {
    const list = byGroup.get(option.group) ?? []
    list.push(option)
    byGroup.set(option.group, list)
  }
  for (const [group, options] of byGroup) {
    groups.push({
      group,
      options: options.map((option) => ({
        id: option.id,
        label: option.label,
      })),
    })
  }
  return groups
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone.trim()) return false
  try {
    Intl.DateTimeFormat('en-US', { timeZone })
    return true
  } catch {
    return false
  }
}

/**
 * Offset of `timeZone` at `instant`: milliseconds to add to UTC to get wall clock
 * expressed as a UTC timestamp (i.e. Auckland UTC+12 → +12h).
 */
function timeZoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)
  const num = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0')
  let hour = num('hour')
  if (hour === 24) hour = 0
  const asUtc = Date.UTC(
    num('year'),
    num('month') - 1,
    num('day'),
    hour,
    num('minute'),
    num('second')
  )
  return asUtc - instant.getTime()
}

/**
 * Interpret `dateKey` + `time` as a wall-clock time in `timeZone` and return the UTC instant.
 */
export function wallTimeToUtc(
  dateKey: string,
  time: string,
  timeZone: string
): Date {
  const totalMinutes = parseTimeToMinutes(time)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const [y, m, d] = dateKey.split('-').map(Number)
  const wallAsUtc = Date.UTC(y, m - 1, d, hours, minutes, 0)
  let utcMs = wallAsUtc
  for (let i = 0; i < 2; i++) {
    const offset = timeZoneOffsetMs(new Date(utcMs), timeZone)
    utcMs = wallAsUtc - offset
  }
  return new Date(utcMs)
}

/** NZ business wall clock → UTC instant. */
export function aucklandWallTimeToUtc(dateKey: string, time: string): Date {
  return wallTimeToUtc(dateKey, time, BOOKING_TIMEZONE)
}

export function dateKeyInTimeZone(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant)
}

/** Civil date (local midnight Date) for “today” in `timeZone`. */
export function civilDateInTimeZone(
  timeZone: string,
  now: Date = new Date()
): Date {
  const key = dateKeyInTimeZone(now, timeZone)
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setHours(0, 0, 0, 0)
  return date
}

/** e.g. "9:00 AM" in the given zone, matching seeded slot time formatting. */
export function formatTimeInTimeZone(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h12',
  }).formatToParts(instant)
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '12'
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
  const periodRaw = parts.find((p) => p.type === 'dayPeriod')?.value ?? 'AM'
  const period = /pm/i.test(periodRaw) ? 'PM' : 'AM'
  return `${hour}:${minute} ${period}`
}

/** Long name plus offset, e.g. "Pacific Daylight Time (GMT-7)". */
export function formatTimeZoneLabel(
  timeZone: string,
  at: Date = new Date()
): string {
  if (!isValidTimeZone(timeZone)) return timeZone.replace(/_/g, ' ')
  const long =
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'long',
    })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName')?.value ?? ''
  let offset =
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName')?.value ?? ''
  if (!offset || offset === long) {
    offset =
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'short',
      })
        .formatToParts(at)
        .find((p) => p.type === 'timeZoneName')?.value ?? ''
  }
  if (long && offset && long !== offset) return `${long} (${offset})`
  return long || offset || timeZone.replace(/_/g, ' ')
}

/** Short abbreviation, e.g. "PDT" or "GMT+12". */
export function formatTimeZoneShort(
  timeZone: string,
  at: Date = new Date()
): string {
  if (!isValidTimeZone(timeZone)) return timeZone
  return (
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName')?.value ?? timeZone
  )
}

export interface SlotLocalDisplay {
  dateKey: string
  time: string
  dayLabel: string
}

export function slotLocalDisplay(
  slot: Pick<BookingSlot, 'date' | 'time'>,
  timeZone: string
): SlotLocalDisplay {
  const instant = aucklandWallTimeToUtc(slot.date, slot.time)
  const dateKey = dateKeyInTimeZone(instant, timeZone)
  return {
    dateKey,
    time: formatTimeInTimeZone(instant, timeZone),
    dayLabel: formatDayLabel(dateKey),
  }
}

export function groupSlotsByDateInTimeZone(
  slots: BookingSlot[],
  timeZone: string
): Record<string, BookingSlot[]> {
  const grouped: Record<string, BookingSlot[]> = {}
  const instants = new Map<string, number>()
  for (const slot of slots) {
    const instant = aucklandWallTimeToUtc(slot.date, slot.time)
    instants.set(slot.id, instant.getTime())
    const localDate = dateKeyInTimeZone(instant, timeZone)
    if (!grouped[localDate]) grouped[localDate] = []
    grouped[localDate].push(slot)
  }
  for (const date of Object.keys(grouped)) {
    grouped[date].sort(
      (a, b) => (instants.get(a.id) ?? 0) - (instants.get(b.id) ?? 0)
    )
  }
  return grouped
}
