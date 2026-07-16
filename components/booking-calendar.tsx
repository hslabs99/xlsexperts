'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CheckSquare, Loader2 } from 'lucide-react'
import { MEET_OPTIONS } from '@/lib/booking-config'
import {
  formatDateKey,
  formatDayLabel,
  getMondayOfWeek,
  getWeekDays,
  groupSlotsByDate,
  type BookingSlot,
} from '@/lib/booking-slots'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** NZ business calendar day (YYYY-MM-DD), not the visitor’s local TZ. */
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

interface BookingCalendarProps {
  onConfirm: (payload: {
    day: string
    date: string
    time: string
    method: string
    slotId: string
  }) => void | Promise<void>
  onBack: () => void
}

export function BookingCalendar({ onConfirm, onBack }: BookingCalendarProps) {
  const today = useMemo(() => aucklandToday(), [])

  const [weekMonday, setWeekMonday] = useState<Date>(() =>
    getMondayOfWeek(aucklandToday())
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
          error?: string
        }
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Could not load booking slots.')
        }
        if (!cancelled) setSlots(data.items ?? [])
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

  const byDate = useMemo(() => groupSlotsByDate(slots), [slots])
  const weekDays = getWeekDays(weekMonday)

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null
  const daySlots = selectedDate ? byDate[selectedDate] ?? [] : []

  const prevWeek = () => {
    const prev = new Date(weekMonday)
    prev.setDate(prev.getDate() - 7)
    if (prev >= getMondayOfWeek(today)) {
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

  const weekLabel = (() => {
    const end = weekDays[4]
    if (weekMonday.getMonth() === end.getMonth()) {
      return `${weekMonday.getDate()} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`
    }
    return `${weekMonday.getDate()} ${MONTH_NAMES[weekMonday.getMonth()]} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`
  })()

  const isPastDay = (d: Date) => d < today
  const canConfirm = selectedSlot && selectedMethod

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
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Loading available slots…</p>
      )}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && slots.length === 0 && (
        <p className="text-sm text-gray-500">
          No discovery slots are open right now. Please try again later or send an enquiry.
        </p>
      )}

      {!loading && slots.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevWeek}
              className="flex h-8 w-8 items-center justify-center border border-gray-200 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-800"
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

          <div className="grid grid-cols-5 gap-2">
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
                  className="flex flex-col items-center gap-1 border py-3 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    borderColor: isSelected ? '#1a6b3c' : '#e5e7eb',
                    backgroundColor: isSelected ? '#e8f5ee' : past ? '#f9fafb' : 'white',
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
                  <span className="text-xs text-gray-400">{openCount} open</span>
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
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setSelectedSlotId(slot.id)
                        setSelectedMethod(null)
                      }}
                      className="border px-3 py-2.5 text-xs font-semibold transition-colors"
                      style={{
                        borderColor: isChosen ? '#1a6b3c' : '#e5e7eb',
                        backgroundColor: isChosen ? '#1a6b3c' : '#f9fafb',
                        color: isChosen ? 'white' : '#374151',
                      }}
                    >
                      {slot.time}
                      <span className={`mt-0.5 block text-[10px] font-medium ${isChosen ? 'text-white/80' : 'text-gray-400'}`}>
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

          {canConfirm && selectedSlot && (
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {formatDayLabel(selectedSlot.date)} at {selectedSlot.time}
                </span>
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
