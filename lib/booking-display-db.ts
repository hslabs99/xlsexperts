import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  BOOKING_DISPLAY_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import {
  DEFAULT_BOOKING_DISPLAY_SETTINGS,
  normalizeBookingDisplaySettings,
  type BookingDisplaySettings,
} from '@/lib/booking-display'

/**
 * Load booking display settings from live Firestore.
 * Returns seeded defaults if the document does not exist yet.
 */
export async function fetchBookingDisplaySettings(): Promise<BookingDisplaySettings> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(BOOKING_DISPLAY_DOC_ID)
    .get()
  if (!snap.exists) return DEFAULT_BOOKING_DISPLAY_SETTINGS
  return normalizeBookingDisplaySettings(snap.data() as Record<string, unknown>)
}

/** Create or overwrite booking display settings in live Firestore. */
export async function saveBookingDisplaySettings(
  settings: BookingDisplaySettings
): Promise<BookingDisplaySettings> {
  const normalized = normalizeBookingDisplaySettings(settings)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(BOOKING_DISPLAY_DOC_ID)
    .set(
      {
        ...normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return normalized
}
