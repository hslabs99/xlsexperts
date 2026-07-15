'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react'
import { TIME_SLOTS, UNAVAILABLE, MEET_OPTIONS } from '@/lib/booking-config'

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface BookingCalendarProps {
  onConfirm: (day: string, time: string, method: string) => void
  onBack: () => void
}

export function BookingCalendar({ onConfirm, onBack }: BookingCalendarProps) {
  const today = new Date()
  const [weekMonday, setWeekMonday] = useState<Date>(getMondayOfWeek(today))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const weekDays = getWeekDays(weekMonday)

  const prevWeek = () => {
    const prev = new Date(weekMonday)
    prev.setDate(prev.getDate() - 7)
    if (prev >= getMondayOfWeek(today)) {
      setWeekMonday(prev)
      setSelectedDay(null)
      setSelectedTime(null)
    }
  }

  const nextWeek = () => {
    const next = new Date(weekMonday)
    next.setDate(next.getDate() + 7)
    setWeekMonday(next)
    setSelectedDay(null)
    setSelectedTime(null)
  }

  const weekLabel = (() => {
    const end = weekDays[4]
    if (weekMonday.getMonth() === end.getMonth()) {
      return `${weekMonday.getDate()} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`
    }
    return `${weekMonday.getDate()} ${MONTH_NAMES[weekMonday.getMonth()]} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`
  })()

  const isPastDay = (d: Date) => {
    const t = new Date(today); t.setHours(0, 0, 0, 0)
    return d < t
  }

  const availableSlots = (dayLabel: string) =>
    TIME_SLOTS.filter(t => !(UNAVAILABLE[dayLabel] || []).includes(t))

  const canConfirm = selectedDay && selectedTime && selectedMethod

  return (
    <div className="flex flex-col gap-6">

      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-800"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to enquiry form
      </button>

      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-gray-900">Book a free discovery call</h3>
        <p className="mt-1 text-sm text-gray-500">30 minutes · Free · No commitment</p>
      </div>

      {/* Week nav */}
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

      {/* Day selector */}
      <div className="grid grid-cols-5 gap-2">
        {weekDays.map((day, i) => {
          const label = DAY_LABELS[i]
          const past = isPastDay(day)
          const slots = availableSlots(label)
          const isSelected = selectedDay === label
          return (
            <button
              key={label}
              type="button"
              disabled={past || slots.length === 0}
              onClick={() => { setSelectedDay(label); setSelectedTime(null) }}
              className="flex flex-col items-center gap-1 border py-3 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: isSelected ? '#1a6b3c' : '#e5e7eb',
                backgroundColor: isSelected ? '#e8f5ee' : past ? '#f9fafb' : 'white',
              }}
            >
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: isSelected ? '#1a6b3c' : '#6b7280' }}>
                {label}
              </span>
              <span className="text-lg font-bold" style={{ color: isSelected ? '#1a6b3c' : '#111827' }}>
                {day.getDate()}
              </span>
              <span className="text-xs text-gray-400">{slots.length} open</span>
            </button>
          )
        })}
      </div>

      {/* Time slots */}
      {selectedDay && (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
            Available times — {selectedDay}
          </span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {availableSlots(selectedDay).map((slot) => {
              const isChosen = selectedTime === slot
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className="border px-3 py-2.5 text-xs font-semibold transition-colors"
                  style={{
                    borderColor: isChosen ? '#1a6b3c' : '#e5e7eb',
                    backgroundColor: isChosen ? '#1a6b3c' : '#f9fafb',
                    color: isChosen ? 'white' : '#374151',
                  }}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Meeting method — shown once a time is picked */}
      {selectedTime && (
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
                  <Icon className="h-5 w-5" aria-hidden="true" style={{ color: isChosen ? '#1a6b3c' : '#9ca3af' }} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Confirm section */}
      {canConfirm && (
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{selectedDay} at {selectedTime}</span>
            {' '}via{' '}
            <span className="font-semibold text-gray-900">
              {MEET_OPTIONS.find(m => m.id === selectedMethod)?.label}
            </span>
          </p>
          <button
            type="button"
            onClick={() => onConfirm(selectedDay!, selectedTime!, MEET_OPTIONS.find(m => m.id === selectedMethod)!.label)}
            className="btn-primary inline-flex h-12 w-full items-center justify-center gap-2 text-sm font-bold sm:w-fit sm:px-10"
          >
            <CheckSquare className="h-4 w-4" aria-hidden="true" />
            Book your free discovery call now
          </button>
          <p className="text-xs text-gray-400">We will be in touch to confirm the details.</p>
        </div>
      )}
    </div>
  )
}
