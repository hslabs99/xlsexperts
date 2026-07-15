import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { BOOKING_SLOTS_COLLECTION } from '@/lib/firebase'
import {
  buildSeedSlots,
  type BookingDetails,
  type BookingSlot,
  type BookingSlotInput,
  type BookingSlotStatus,
  type SeedTemplateConfig,
} from '@/lib/booking-slots'

function mapBooking(data: Record<string, unknown>): BookingDetails | null {
  if (!data.booking || typeof data.booking !== 'object') return null
  const b = data.booking as Record<string, unknown>
  return {
    name: String(b.name ?? ''),
    company: String(b.company ?? ''),
    email: String(b.email ?? ''),
    phone: String(b.phone ?? ''),
    message: String(b.message ?? ''),
    services: Array.isArray(b.services) ? b.services.map(String) : [],
    hear: String(b.hear ?? ''),
    method: String(b.method ?? ''),
    // Admin Timestamp still has toDate(); BookingDetails may type bookedAt as client Timestamp
    bookedAt: (b.bookedAt ?? null) as BookingDetails['bookedAt'],
  }
}

function mapSlot(id: string, data: Record<string, unknown>): BookingSlot {
  return {
    id,
    date: String(data.date ?? ''),
    time: String(data.time ?? ''),
    type: String(data.type ?? 'discovery'),
    status: (['booked', 'unavailable', 'available'].includes(String(data.status))
      ? data.status
      : 'available') as BookingSlotStatus,
    durationMinutes: data.durationMinutes === 15 ? 15 : 30,
    createdAt: (data.createdAt ?? null) as BookingSlot['createdAt'],
    booking: mapBooking(data),
  }
}

export async function fetchBookingSlots(options?: {
  status?: BookingSlotStatus
  fromDate?: string
}): Promise<BookingSlot[]> {
  // Single-field query to avoid composite index setup during early development.
  const col = getAdminDb().collection(BOOKING_SLOTS_COLLECTION)
  const snap = options?.fromDate
    ? await col
        .where('date', '>=', options.fromDate)
        .orderBy('date', 'asc')
        .get()
    : await col.orderBy('date', 'asc').get()

  let slots = snap.docs.map((d) =>
    mapSlot(d.id, d.data() as Record<string, unknown>)
  )
  if (options?.status) {
    slots = slots.filter((s) => s.status === options.status)
  }
  return slots
}

export async function fetchAllBookingSlots(): Promise<BookingSlot[]> {
  const snap = await getAdminDb()
    .collection(BOOKING_SLOTS_COLLECTION)
    .orderBy('date', 'asc')
    .get()
  return snap.docs.map((d) =>
    mapSlot(d.id, d.data() as Record<string, unknown>)
  )
}

export async function createBookingSlot(input: BookingSlotInput): Promise<string> {
  const ref = await getAdminDb().collection(BOOKING_SLOTS_COLLECTION).add({
    ...input,
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function deleteBookingSlot(id: string): Promise<void> {
  await getAdminDb().collection(BOOKING_SLOTS_COLLECTION).doc(id).delete()
}

export async function setBookingSlotStatus(
  id: string,
  status: BookingSlotStatus
): Promise<void> {
  await getAdminDb().collection(BOOKING_SLOTS_COLLECTION).doc(id).update({ status })
}

export async function markBookingSlotBooked(
  id: string,
  details: Omit<BookingDetails, 'bookedAt'>
): Promise<void> {
  await getAdminDb().collection(BOOKING_SLOTS_COLLECTION).doc(id).update({
    status: 'booked',
    booking: {
      ...details,
      bookedAt: FieldValue.serverTimestamp(),
    },
  })
}

export async function clearBookingAndReopen(id: string): Promise<void> {
  await getAdminDb().collection(BOOKING_SLOTS_COLLECTION).doc(id).update({
    status: 'available',
    booking: null,
  })
}

/** Delete every document in Booking Slots (global reset). */
export async function deleteAllBookingSlots(): Promise<number> {
  const snap = await getAdminDb().collection(BOOKING_SLOTS_COLLECTION).get()
  if (snap.empty) return 0

  const docs = snap.docs
  const chunkSize = 400
  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = getAdminDb().batch()
    for (const d of docs.slice(i, i + chunkSize)) {
      batch.delete(d.ref)
    }
    await batch.commit()
  }
  return docs.length
}

/**
 * Seed available discovery slots from a weekly availability template.
 * Skips date+time pairs that already exist.
 */
export async function seedBookingSlots(
  config?: SeedTemplateConfig
): Promise<{ created: number; skipped: number; planned: number }> {
  const existing = await fetchAllBookingSlots()
  const existingKeys = new Set(existing.map((s) => `${s.date}|${s.time}`))
  const planned = buildSeedSlots(config)

  let created = 0
  let skipped = 0

  for (const slot of planned) {
    const key = `${slot.date}|${slot.time}`
    if (existingKeys.has(key)) {
      skipped += 1
      continue
    }
    await createBookingSlot(slot)
    existingKeys.add(key)
    created += 1
  }

  return { created, skipped, planned: planned.length }
}
