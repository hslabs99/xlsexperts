/**
 * Per-region booking calendar display options.
 * Stored in Firestore Site Content / booking-display.
 */

import type { BookingRegionId } from '@/lib/booking-slots'
import type { MarketId } from '@/lib/market'

export type BookingTimeZonePickerByRegion = {
  nz: boolean
  uk: boolean
  intl: boolean
}

export type BookingDisplaySettings = {
  /** When true, the public discovery calendar shows the time zone selector. */
  showTimeZonePicker: BookingTimeZonePickerByRegion
}

/**
 * NZ and UK hide the selector (single local zone). International shows it
 * so visitors can pick where they will take the call.
 */
export const DEFAULT_BOOKING_DISPLAY_SETTINGS: BookingDisplaySettings = {
  showTimeZonePicker: {
    nz: false,
    uk: false,
    intl: true,
  },
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function normalizeBookingDisplaySettings(
  raw: unknown
): BookingDisplaySettings {
  const data =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const picker =
    data.showTimeZonePicker && typeof data.showTimeZonePicker === 'object'
      ? (data.showTimeZonePicker as Record<string, unknown>)
      : data
  const defaults = DEFAULT_BOOKING_DISPLAY_SETTINGS.showTimeZonePicker
  return {
    showTimeZonePicker: {
      nz: asBoolean(picker.nz, defaults.nz),
      uk: asBoolean(picker.uk, defaults.uk),
      intl: asBoolean(picker.intl, defaults.intl),
    },
  }
}

export function showTimeZonePickerForRegion(
  settings: BookingDisplaySettings,
  region: BookingRegionId
): boolean {
  return settings.showTimeZonePicker[region]
}

export function showTimeZonePickerForMarket(
  settings: BookingDisplaySettings,
  market: MarketId
): boolean {
  return settings.showTimeZonePicker[market]
}
