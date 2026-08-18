'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_BOOKING_DISPLAY_SETTINGS,
  type BookingDisplaySettings,
  type BookingTimeZonePickerByRegion,
} from '@/lib/booking-display'
import {
  BOOKING_REGION_IDS,
  type BookingRegionId,
} from '@/lib/booking-slots'
import { marketLabel } from '@/lib/market'

const REGION_HINT: Record<BookingRegionId, string> = {
  nz: 'Not needed — visitors are on New Zealand time.',
  uk: 'Not needed — visitors are on United Kingdom time.',
  intl: 'Show this so visitors can pick where they will take the call.',
}

export function AdminBookingTimezonePanel() {
  const [settings, setSettings] = useState<BookingDisplaySettings>(
    DEFAULT_BOOKING_DISPLAY_SETTINGS
  )
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/booking-display')
      const data = (await res.json()) as {
        ok?: boolean
        settings?: BookingDisplaySettings
        error?: string
      }
      if (!res.ok || !data.ok || !data.settings) {
        throw new Error(data.error || 'Failed to load booking display settings')
      }
      setSettings(data.settings)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load booking display settings'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function save(next: BookingDisplaySettings) {
    setBusy(true)
    setError(null)
    setMessage(null)
    const previous = settings
    setSettings(next)
    try {
      const res = await fetch('/api/admin/booking-display', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      const data = (await res.json()) as {
        ok?: boolean
        settings?: BookingDisplaySettings
        error?: string
      }
      if (!res.ok || !data.ok || !data.settings) {
        throw new Error(data.error || 'Failed to save')
      }
      setSettings(data.settings)
      setMessage('Time zone selector setting saved.')
    } catch (err) {
      setSettings(previous)
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setBusy(false)
    }
  }

  function toggleRegion(region: BookingRegionId, checked: boolean) {
    const showTimeZonePicker: BookingTimeZonePickerByRegion = {
      ...settings.showTimeZonePicker,
      [region]: checked,
    }
    void save({ showTimeZonePicker })
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5 text-sm text-ink-muted">
        Loading time zone selector settings…
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-lg font-semibold text-ink">Time zone selector</h2>
      <p className="mt-1 max-w-3xl text-sm text-ink-muted">
        Choose whether visitors on each public site see a time zone dropdown on
        the discovery calendar. Unchecked sites lock to that region&apos;s local
        time.
      </p>

      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-3 rounded-md border border-brand/30 bg-brand-light px-3 py-2 text-sm text-brand-dark">
          {message}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {BOOKING_REGION_IDS.map((region) => (
          <label
            key={region}
            className="flex cursor-pointer flex-col gap-2 rounded-md border border-border bg-white p-4"
          >
            <span className="text-sm font-semibold text-ink">
              {marketLabel(region)}
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={settings.showTimeZonePicker[region]}
                disabled={busy}
                onChange={(e) => toggleRegion(region, e.target.checked)}
              />
              Show time zone selection
            </span>
            <span className="text-xs text-ink-muted">{REGION_HINT[region]}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
