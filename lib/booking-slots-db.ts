import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { BOOKING_SLOTS_COLLECTION, getDb } from '@/lib/firebase'
import {
  buildSeedSlots,
  type BookingDetails,
  type BookingSlot,
  type BookingSlotInput,
  type BookingSlotStatus,
  type SeedTemplateConfig,
} from '@/lib/booking-slots'

function mapBooking(data: DocumentData): BookingDetails | null {
  if (!data.booking || typeof data.booking !== 'object') return null
  const b = data.booking as DocumentData
  return {
    name: String(b.name ?? ''),
    company: String(b.company ?? ''),
    email: String(b.email ?? ''),
    phone: String(b.phone ?? ''),
    message: String(b.message ?? ''),
    services: Array.isArray(b.services) ? b.services.map(String) : [],
    hear: String(b.hear ?? ''),
    method: String(b.method ?? ''),
    bookedAt: b.bookedAt ?? null,
  }
}

function mapSlot(id: string, data: DocumentData): BookingSlot {
  return {
    id,
    date: String(data.date ?? ''),
    time: String(data.time ?? ''),
    type: String(data.type ?? 'discovery'),
    status: (['booked', 'unavailable', 'available'].includes(data.status)
      ? data.status
      : 'available') as BookingSlotStatus,
    durationMinutes: data.durationMinutes === 15 ? 15 : 30,
    createdAt: data.createdAt ?? null,
    booking: mapBooking(data),
  }
}

export async function fetchBookingSlots(options?: {
  status?: BookingSlotStatus
  fromDate?: string
}): Promise<BookingSlot[]> {
  // Single-field query to avoid composite index setup during early development.
  const constraints: QueryConstraint[] = [orderBy('date', 'asc')]
  if (options?.fromDate) {
    constraints.unshift(where('date', '>=', options.fromDate))
  }

  const snap = await getDocs(query(collection(getDb(), BOOKING_SLOTS_COLLECTION), ...constraints))
  let slots = snap.docs.map((d) => mapSlot(d.id, d.data()))
  if (options?.status) {
    slots = slots.filter((s) => s.status === options.status)
  }
  return slots
}

export async function fetchAllBookingSlots(): Promise<BookingSlot[]> {
  const snap = await getDocs(
    query(collection(getDb(), BOOKING_SLOTS_COLLECTION), orderBy('date', 'asc'))
  )
  return snap.docs.map((d) => mapSlot(d.id, d.data()))
}

export async function createBookingSlot(input: BookingSlotInput): Promise<string> {
  const ref = await addDoc(collection(getDb(), BOOKING_SLOTS_COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteBookingSlot(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), BOOKING_SLOTS_COLLECTION, id))
}

export async function setBookingSlotStatus(
  id: string,
  status: BookingSlotStatus
): Promise<void> {
  await updateDoc(doc(getDb(), BOOKING_SLOTS_COLLECTION, id), { status })
}

export async function markBookingSlotBooked(
  id: string,
  details: Omit<BookingDetails, 'bookedAt'>
): Promise<void> {
  await updateDoc(doc(getDb(), BOOKING_SLOTS_COLLECTION, id), {
    status: 'booked',
    booking: {
      ...details,
      bookedAt: serverTimestamp(),
    },
  })
}

export async function clearBookingAndReopen(id: string): Promise<void> {
  await updateDoc(doc(getDb(), BOOKING_SLOTS_COLLECTION, id), {
    status: 'available',
    booking: null,
  })
}

/** Delete every document in Booking Slots (global reset). */
export async function deleteAllBookingSlots(): Promise<number> {
  const snap = await getDocs(collection(getDb(), BOOKING_SLOTS_COLLECTION))
  if (snap.empty) return 0

  const docs = snap.docs
  const chunkSize = 400
  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = writeBatch(getDb())
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
