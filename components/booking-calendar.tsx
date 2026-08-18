'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, CheckSquare, Globe, Loader2 } from 'lucide-react'
import { MEET_OPTIONS } from '@/lib/booking-config'
import { useMarket } from '@/components/market-provider'
import { marketLabel, marketUsesVisitorTimeZone } from '@/lib/market'
import {
  BOOKING_TIMEZONE,
  bookingCalendarStartMonday,
  formatDateKey,
  formatDayLabel,
  getCalendarWeekDays,
  getMondayOfWeek,
  getWeekDays,
  nextWorkingDay,
  type BookingSlot,
} from '@/lib/booking-slots'
import {
  bookingTimeZoneSelectGroups,
  civilDateInTimeZone,
  describeNzSlotInTimeZone,
  describeOffsetFromNewZealand,
  displayTimeZoneForMarket,
  formatTimeZoneOptionLabel,
  formatTimeZoneShort,
  groupSlotsByDateInTimeZone,
  resolveBookingPickerTimeZone,
  slotLocalDisplay,
  storeBookingTimeZone,
  clearStoredBookingTimeZone,
} from '@/lib/booking-timezone'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function civilDateFromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setHours(0, 0, 0, 0)
  return date
}

export interface BookingCalendarConfirm {
  day: string
  date: string
  time: string
  method: string
  slotId: string
  displayDay: string
  displayTime: string
  timeZone: string
}

interface BookingCalendarProps {
  onConfirm: (payload: BookingCalendarConfirm) => void | Promise<void>
  onBack: () => void
}

export function BookingCalendar({ onConfirm, onBack }: BookingCalendarProps) {
  const { market } = useMarket()

  const [visitorTimeZone, setVisitorTimeZone] = useState(() =>
    displayTimeZoneForMarket(market)
  )
  const [detectedTimeZone, setDetectedTimeZone] = useState(() =>
    displayTimeZoneForMarket(market)
  )
  const [showTimeZonePicker, setShowTimeZonePicker] = useState(() =>
    marketUsesVisitorTimeZone(market)
  )
  const [tzReady, setTzReady] = useState(false)
  const didAutoSelect = useRef(false)

  useEffect(() => {
    if (showTimeZonePicker) {
      const { detected, selected } = resolveBookingPickerTimeZone()
      setDetectedTimeZone(detected)
      setVisitorTimeZone(selected)
    } else if (market === 'intl') {
      const { detected } = resolveBookingPickerTimeZone()
      setDetectedTimeZone(detected)
      setVisitorTimeZone(detected)
    } else {
      const locked = displayTimeZoneForMarket(market)
      setDetectedTimeZone(locked)
      setVisitorTimeZone(locked)
    }
    didAutoSelect.current = false
    setTzReady(true)
  }, [market, showTimeZonePicker])

  const displayTimeZone = visitorTimeZone
  const useVisitorWeek = displayTimeZone !== BOOKING_TIMEZONE

  const today = useMemo(
    () => civilDateInTimeZone(displayTimeZone),
    [displayTimeZone]
  )
  const firstBookableDay = useMemo(
    () => (useVisitorWeek ? today : nextWorkingDay(today)),
    [useVisitorWeek, today]
  )
  const earliestMonday = useMemo(
    () =>
      useVisitorWeek
        ? getMondayOfWeek(today)
        : bookingCalendarStartMonday(today),
    [useVisitorWeek, today]
  )

  const [weekMonday, setWeekMonday] = useState<Date>(() =>
    bookingCalendarStartMonday(civilDateInTimeZone(BOOKING_TIMEZONE))
  )
  const [slots, setSlots] = useState<BookingSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/booking/slots')
        const data = (await res.json()) as {
          ok?: boolean
          items?: BookingSlot[]
          showTimeZonePicker?: boolean
          error?: string
        }
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Could not load booking slots.')
        }
        if (!cancelled) {
          setSlots(data.items ?? [])
          if (typeof data.showTimeZonePicker === 'boolean') {
            setShowTimeZonePicker(data.showTimeZonePicker)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load booking slots.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const byDate = useMemo(
    () => groupSlotsByDateInTimeZone(slots, displayTimeZone),
    [slots, displayTimeZone]
  )
  const weekDays = useVisitorWeek
    ? getCalendarWeekDays(weekMonday)
    : getWeekDays(weekMonday)
  const firstBookableKey = formatDateKey(firstBookableDay)
  const timeZoneGroups = useMemo(
    () => bookingTimeZoneSelectGroups(detectedTimeZone, visitorTimeZone),
    [detectedTimeZone, visitorTimeZone]
  )
  const offsetFromNz = describeOffsetFromNewZealand(displayTimeZone)
  const nzExample = describeNzSlotInTimeZone(displayTimeZone)
  const detectedLabel = formatTimeZoneOptionLabel({
    id: detectedTimeZone,
    label:
      timeZoneGroups
        .flatMap((group) => group.options)
        .find((option) => option.id === detectedTimeZone)?.label ?? 'Detected',
  })
  const hasOverriddenTimeZone = visitorTimeZone !== detectedTimeZone

  function applyTimeZone(next: string) {
    setVisitorTimeZone(next)
    if (next === detectedTimeZone) {
      clearStoredBookingTimeZone()
    } else {
      storeBookingTimeZone(next)
    }
    setSelectedDate(null)
    setSelectedSlotId(null)
    setSelectedMethod(null)
    didAutoSelect.current = false
  }

  // Once slots + timezone are ready, open on the earliest bookable day with availability.
  useEffect(() => {
    if (!tzReady || didAutoSelect.current || loading || slots.length === 0) return
    const dates = Object.keys(byDate)
      .filter((d) => d >= firstBookableKey)
      .sort()
    const firstOpen = dates.find((d) => (byDate[d] ?? []).length > 0)
    if (!firstOpen) {
      didAutoSelect.current = true
      return
    }
    const day = civilDateFromKey(firstOpen)
    setWeekMonday(
      useVisitorWeek ? getMondayOfWeek(day) : bookingCalendarStartMonday(day)
    )
    setSelectedDate(firstOpen)
    didAutoSelect.current = true
  }, [tzReady, loading, slots, byDate, firstBookableKey, useVisitorWeek])

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null
  const daySlots = selectedDate ? byDate[selectedDate] ?? [] : []
  const selectedLocal = selectedSlot
    ? slotLocalDisplay(selectedSlot, displayTimeZone)
    : null

  const prevWeek = () => {
    const prev = new Date(weekMonday)
    prev.setDate(prev.getDate() - 7)
    if (prev >= earliestMonday) {
      setWeekMonday(prev)
      setSelectedDate(null)
      setSelectedSlotId(null)
      setSelectedMethod(null)
    }
  }

  const nextWeek = () => {
    const next = new Date(weekMonday)
    next.setDate(next.getDate() + 7)
    setWeekMonday(next)
    setSelectedDate(null)
    setSelectedSlotId(null)
    setSelectedMethod(null)
  }

  const weekEnd = weekDays[weekDays.length - 1]
  const weekLabel = (() => {
    if (weekMonday.getMonth() === weekEnd.getMonth()) {
      return `${weekMonday.getDate()} – ${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`
    }
    return `${weekMonday.getDate()} ${MONTH_NAMES[weekMonday.getMonth()]} – ${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`
  })()

  const isPastDay = (d: Date) => d < firstBookableDay
  const canConfirm = selectedSlot && selectedMethod
  const canGoPrev = weekMonday > earliestMonday
  const showCalendar = tzReady && !loading && slots.length > 0

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        disabled={confirming}
        className="flex w-fit items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-800 disabled:opacity-50"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to enquiry form
      </button>

      <div>
        <h3 className="text-base font-bold text-gray-900">Book a free discovery call</h3>
        <p className="mt-1 text-sm text-gray-500">30 minutes · Free · No commitment</p>
        {tzReady && showTimeZonePicker && (
          <div className="mt-4 flex flex-col gap-1.5">
            <label
              htmlFor="booking-timezone"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-600"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              Time zone
            </label>
            <select
              id="booking-timezone"
              value={visitorTimeZone}
              onChange={(e) => applyTimeZone(e.target.value)}
              className="border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white"
            >
              {timeZoneGroups.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {formatTimeZoneOptionLabel(option)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-sm text-gray-500">
              Site region: {marketLabel(market)}.{' '}
              {hasOverriddenTimeZone
                ? 'Times use the zone you selected.'
                : 'Auto-detected from your browser — change if you will take the call somewhere else.'}{' '}
              Slots are {offsetFromNz}
              {nzExample ? ` — ${nzExample}` : ''}.
            </p>
            {hasOverriddenTimeZone ? (
              <button
                type="button"
                onClick={() => applyTimeZone(detectedTimeZone)}
                className="w-fit text-xs font-semibold text-[#1a6b3c] underline-offset-2 hover:underline"
              >
                Use detected time zone ({detectedLabel})
              </button>
            ) : null}
          </div>
        )}
      </div>

      {(loading || !tzReady) && (
        <p className="text-sm text-gray-500">Loading available slots…</p>
      )}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {tzReady && !loading && !error && slots.length === 0 && (
        <p className="text-sm text-gray-500">
          No discovery slots are open right now. Please try again later or send an enquiry.
        </p>
      )}

      {showCalendar && (
        <>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevWeek}
              disabled={!canGoPrev}
              className="flex h-8 w-8 items-center justify-center border border-gray-200 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-700">{weekLabel}</span>
            <button
              type="button"
              onClick={nextWeek}
              className="flex h-8 w-8 items-center justify-center border border-gray-200 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-800"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className={useVisitorWeek ? 'grid grid-cols-7 gap-1 sm:gap-2' : 'grid grid-cols-5 gap-2'}>
            {weekDays.map((day) => {
              const dateKey = formatDateKey(day)
              const label = formatDayLabel(dateKey)
              const past = isPastDay(day)
              const openCount = (byDate[dateKey] ?? []).length
              const isSelected = selectedDate === dateKey
              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={past || openCount === 0}
                  onClick={() => {
                    setSelectedDate(dateKey)
                    setSelectedSlotId(null)
                    setSelectedMethod(null)
                  }}
                  className="flex flex-col items-center gap-1 border py-2 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:py-3"
                  style={{
                    borderColor: isSelected ? '#1a6b3c' : '#e5e7eb',
                    backgroundColor: isSelected ? '#e8f5ee' : past ? '#f9fafb' : 'white',
                  }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest sm:text-xs"
                    style={{ color: isSelected ? '#1a6b3c' : '#6b7280' }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-base font-bold sm:text-lg"
                    style={{ color: isSelected ? '#1a6b3c' : '#111827' }}
                  >
                    {day.getDate()}
                  </span>
                  <span className="text-[10px] text-gray-400 sm:text-xs">{openCount} open</span>
                </button>
              )
            })}
          </div>

          {selectedDate && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Available times — {formatDayLabel(selectedDate)} {parseInt(selectedDate.slice(8), 10)}
              </span>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {daySlots.map((slot) => {
                  const isChosen = selectedSlotId === slot.id
                  const local = slotLocalDisplay(slot, displayTimeZone)
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setSelectedSlotId(slot.id)
                        setSelectedMethod(null)
                      }}
                      className="border px-3 py-2.5 text-xs font-semibold transition-colors hover:border-[#1a6b3c]"
                      style={{
                        borderColor: isChosen ? '#1a6b3c' : '#b7ddc8',
                        backgroundColor: isChosen ? '#1a6b3c' : '#e8f5ee',
                        color: isChosen ? 'white' : '#1a6b3c',
                      }}
                    >
                      {local.time}
                      <span className={`mt-0.5 block text-[10px] font-medium ${isChosen ? 'text-white/80' : 'text-[#1a6b3c]/70'}`}>
                        {slot.durationMinutes} min
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {selectedSlot && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Preferred meeting method <span className="text-red-500">*</span>
              </span>
              <div className="grid grid-cols-3 gap-3">
                {MEET_OPTIONS.map(({ id, label, icon: Icon }) => {
                  const isChosen = selectedMethod === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedMethod(id)}
                      className="flex flex-col items-center gap-2 border px-3 py-4 text-center text-xs font-semibold transition-colors"
                      style={{
                        borderColor: isChosen ? '#1a6b3c' : '#e5e7eb',
                        backgroundColor: isChosen ? '#e8f5ee' : '#f9fafb',
                        color: isChosen ? '#1a6b3c' : '#374151',
                      }}
                      aria-pressed={isChosen}
                    >
                      <Icon
                        className="h-5 w-5"
                        aria-hidden="true"
                        style={{ color: isChosen ? '#1a6b3c' : '#9ca3af' }}
                      />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {canConfirm && selectedSlot && selectedLocal && (
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {selectedLocal.dayLabel} at {selectedLocal.time}
                </span>
                <span className="text-gray-500"> ({formatTimeZoneShort(displayTimeZone)})</span>
                {' '}via{' '}
                <span className="font-semibold text-gray-900">
                  {MEET_OPTIONS.find((m) => m.id === selectedMethod)?.label}
                </span>
              </p>
              <button
                type="button"
                disabled={confirming}
                onClick={() => {
                  if (confirming || !selectedMethod) return
                  setConfirming(true)
                  void Promise.resolve(
                    onConfirm({
                      day: formatDayLabel(selectedSlot.date),
                      date: selectedSlot.date,
                      time: selectedSlot.time,
                      method: MEET_OPTIONS.find((m) => m.id === selectedMethod)!.label,
                      slotId: selectedSlot.id,
                      displayDay: selectedLocal.dayLabel,
                      displayTime: selectedLocal.time,
                      timeZone: displayTimeZone,
                    })
                  ).catch(() => {
                    setConfirming(false)
                  })
                }}
                className="btn-primary inline-flex h-12 w-full items-center justify-center gap-2 text-sm font-bold disabled:opacity-70 sm:w-fit sm:px-10"
              >
                {confirming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Booking…
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4" aria-hidden="true" />
                    Book your free discovery call now
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400">
                {confirming
                  ? 'Please wait — we are confirming your booking.'
                  : 'We will be in touch to confirm the details.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
