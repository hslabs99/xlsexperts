import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { BOOKING_SLOTS_COLLECTION } from '@/lib/firebase'
import {
  allBookingRegions,
  buildSeedSlots,
  buildSeedTimeWindows,
  emptyBookingRegions,
  formatMinutesToTime,
  hasAnyBookingRegion,
  mondayDateKey,
  parseBookingRegions,
  addDateKeyDays,
  SEED_SLOT_MINUTES,
  type BookingDetails,
  type BookingRegionId,
  type BookingRegions,
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
    service: String(b.service ?? ''),
    solution: String(b.solution ?? ''),
    hear: String(b.hear ?? ''),
    method: String(b.method ?? ''),
    // Admin Timestamp still has toDate(); BookingDetails may type bookedAt as client Timestamp
    bookedAt: (b.bookedAt ?? null) as BookingDetails['bookedAt'],
  }
}

function mapSlot(id: string, data: Record<string, unknown>): BookingSlot {
  const status = (['booked', 'unavailable', 'available'].includes(String(data.status))
    ? data.status
    : 'available') as BookingSlotStatus
  return {
    id,
    date: String(data.date ?? ''),
    time: String(data.time ?? ''),
    type: String(data.type ?? 'discovery'),
    status,
    durationMinutes: data.durationMinutes === 15 ? 15 : 30,
    regions: parseBookingRegions(data.regions, status),
    createdAt: (data.createdAt ?? null) as BookingSlot['createdAt'],
    booking: mapBooking(data),
  }
}

export async function fetchBookingSlots(options?: {
  status?: BookingSlotStatus
  fromDate?: string
}) {
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

export async function fetchAllBookingSlots() {
  const snap = await getAdminDb()
    .collection(BOOKING_SLOTS_COLLECTION)
    .orderBy('date', 'asc')
    .get()
  return snap.docs.map((d) =>
    mapSlot(d.id, d.data() as Record<string, unknown>)
  )
}

export async function fetchBookingSlotById(id: string) {
  const snap = await getAdminDb()
    .collection(BOOKING_SLOTS_COLLECTION)
    .doc(id)
    .get()
  if (!snap.exists) return null
  return mapSlot(snap.id, snap.data() as Record<string, unknown>)
}

export async function createBookingSlot(input: BookingSlotInput) {
  const regions = input.regions ?? allBookingRegions()
  const col = getAdminDb().collection(BOOKING_SLOTS_COLLECTION)
  const payload = {
    date: input.date,
    time: input.time,
    type: input.type,
    status: input.status,
    durationMinutes: input.durationMinutes,
    regions,
    createdAt: FieldValue.serverTimestamp(),
  }
  const ref = await col.add(payload)
  return ref.id
}

export async function deleteBookingSlot(id: string) {
  await getAdminDb().collection(BOOKING_SLOTS_COLLECTION).doc(id).delete()
}

export async function setBookingSlotStatus(
  id: string,
  status: BookingSlotStatus
) {
  await getAdminDb().collection(BOOKING_SLOTS_COLLECTION).doc(id).update({ status })
}

export async function markBookingSlotBooked(
  id: string,
  details: Omit<BookingDetails, 'bookedAt'>
) {
  await getAdminDb().collection(BOOKING_SLOTS_COLLECTION).doc(id).update({
    status: 'booked',
    booking: {
      ...details,
      bookedAt: FieldValue.serverTimestamp(),
    },
  })
}

export async function clearBookingAndReopen(id: string) {
  await getAdminDb().collection(BOOKING_SLOTS_COLLECTION).doc(id).update({
    status: 'available',
    booking: null,
  })
}

/** Set durationMinutes to 30 on every slot that is not already 30. */
export async function normalizeAllBookingSlotDurations() {
  const snap = await getAdminDb().collection(BOOKING_SLOTS_COLLECTION).get()
  const toUpdate = snap.docs.filter(
    (d) => d.data().durationMinutes !== SEED_SLOT_MINUTES
  )
  if (toUpdate.length === 0) {
    return { updated: 0, total: snap.size }
  }

  const chunkSize = 400
  for (let i = 0; i < toUpdate.length; i += chunkSize) {
    const batch = getAdminDb().batch()
    for (const d of toUpdate.slice(i, i + chunkSize)) {
      batch.update(d.ref, { durationMinutes: SEED_SLOT_MINUTES })
    }
    await batch.commit()
  }
  return { updated: toUpdate.length, total: snap.size }
}

/** Delete every document in Booking Slots (global reset). */
export async function deleteAllBookingSlots() {
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
export async function seedBookingSlots(config?: SeedTemplateConfig) {
  const existing = await fetchAllBookingSlots()
  const existingKeys = new Set(existing.map((s) => `${s.date}|${s.time}`))
  // Always normalize weeks so a partial/missing config cannot collapse the horizon.
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

export type BookingCellRef = { date: string; time: string }

export type BookingRegionChange =
  | { scope: 'all'; enabled: boolean }
  | { scope: BookingRegionId; enabled: boolean }

function nextRegions(
  current: BookingRegions | undefined,
  change: BookingRegionChange
): BookingRegions {
  if (change.scope === 'all') {
    return change.enabled ? allBookingRegions() : emptyBookingRegions()
  }
  const base = current ?? emptyBookingRegions()
  return { ...base, [change.scope]: change.enabled }
}

/**
 * Enable or disable cells for one region or all regions.
 * Creates missing slots when turning a region on. Booked cells are never changed.
 */
export async function setBookingCells(
  cells: BookingCellRef[],
  change: BookingRegionChange
) {
  const unique = new Map<string, BookingCellRef>()
  for (const cell of cells) {
    const date = cell.date?.trim()
    const time = cell.time?.trim()
    if (!date || !time) continue
    unique.set(`${date}|${time}`, { date, time })
  }
  const wanted = [...unique.values()]
  if (wanted.length === 0) {
    return { created: 0, updated: 0, skipped: 0 }
  }

  const existing = await fetchAllBookingSlots()
  const byKey = new Map(existing.map((s) => [`${s.date}|${s.time}`, s]))

  const toCreate: BookingSlotInput[] = []
  const toUpdate: {
    id: string
    regions: BookingRegions
    status: BookingSlotStatus
  }[] = []
  let skipped = 0

  for (const cell of wanted) {
    const slot = byKey.get(`${cell.date}|${cell.time}`)
    if (!slot) {
      if (!change.enabled) {
        skipped += 1
        continue
      }
      const regions = nextRegions(undefined, change)
      toCreate.push({
        date: cell.date,
        time: cell.time,
        type: 'discovery',
        status: 'available',
        durationMinutes: SEED_SLOT_MINUTES,
        regions,
      })
      continue
    }
    if (slot.status === 'booked') {
      skipped += 1
      continue
    }
    const regions = nextRegions(slot.regions, change)
    const any = hasAnyBookingRegion(regions)
    const status: BookingSlotStatus = any ? 'available' : 'unavailable'
    const unchanged =
      regions.nz === slot.regions.nz &&
      regions.uk === slot.regions.uk &&
      regions.intl === slot.regions.intl &&
      status === slot.status
    if (unchanged) {
      skipped += 1
      continue
    }
    toUpdate.push({ id: slot.id, regions, status })
  }

  const db = getAdminDb()
  const col = db.collection(BOOKING_SLOTS_COLLECTION)
  const chunkSize = 400

  for (let i = 0; i < toCreate.length; i += chunkSize) {
    const batch = db.batch()
    for (const input of toCreate.slice(i, i + chunkSize)) {
      const ref = col.doc()
      batch.set(ref, {
        ...input,
        createdAt: FieldValue.serverTimestamp(),
      })
    }
    await batch.commit()
  }

  for (let i = 0; i < toUpdate.length; i += chunkSize) {
    const batch = db.batch()
    for (const item of toUpdate.slice(i, i + chunkSize)) {
      batch.update(col.doc(item.id), {
        regions: item.regions,
        status: item.status,
        ...(item.status === 'available' ? { booking: null } : {}),
      })
    }
    await batch.commit()
  }

  return {
    created: toCreate.length,
    updated: toUpdate.length,
    skipped,
  }
}

function regionsMatch(a: BookingRegions, b: BookingRegions): boolean {
  return a.nz === b.nz && a.uk === b.uk && a.intl === b.intl
}

/**
 * Copy Mon–Sun availability (including NZ/UK/INT flags) from the week of
 * `fromMonday` onto the following week. Booked destination cells are left
 * unchanged. Everything else in that next week is replaced to match source.
 */
export async function copyBookingWeek(fromMonday: string) {
  const monday = mondayDateKey(fromMonday.trim())
  if (!/^\d{4}-\d{2}-\d{2}$/.test(monday)) {
    throw new Error('fromMonday must be a YYYY-MM-DD date')
  }

  const sourceDates = Array.from({ length: 7 }, (_, i) => addDateKeyDays(monday, i))
  const destDates = sourceDates.map((date) => addDateKeyDays(date, 7))
  const sourceSet = new Set(sourceDates)
  const destSet = new Set(destDates)

  const times = new Set(
    buildSeedTimeWindows().map((win) => formatMinutesToTime(win.startMinutes))
  )

  const existing = await fetchAllBookingSlots()
  const byKey = new Map(existing.map((s) => [`${s.date}|${s.time}`, s]))
  for (const slot of existing) {
    if (sourceSet.has(slot.date) || destSet.has(slot.date)) {
      times.add(slot.time)
    }
  }

  const toCreate: BookingSlotInput[] = []
  const toUpdate: {
    id: string
    regions: BookingRegions
    status: BookingSlotStatus
  }[] = []
  let skipped = 0
  let skippedBooked = 0

  for (let day = 0; day < 7; day++) {
    const sourceDate = sourceDates[day]
    const destDate = destDates[day]
    for (const time of times) {
      const source = byKey.get(`${sourceDate}|${time}`)
      const dest = byKey.get(`${destDate}|${time}`)
      const regions = source
        ? { ...source.regions }
        : emptyBookingRegions()
      const any = hasAnyBookingRegion(regions)
      const status: BookingSlotStatus = any ? 'available' : 'unavailable'

      if (dest?.status === 'booked') {
        skippedBooked += 1
        continue
      }

      if (!dest) {
        if (!any) {
          skipped += 1
          continue
        }
        toCreate.push({
          date: destDate,
          time,
          type: source?.type || 'discovery',
          status: 'available',
          durationMinutes: SEED_SLOT_MINUTES,
          regions,
        })
        continue
      }

      if (regionsMatch(regions, dest.regions) && dest.status === status) {
        skipped += 1
        continue
      }
      toUpdate.push({ id: dest.id, regions, status })
    }
  }

  const db = getAdminDb()
  const col = db.collection(BOOKING_SLOTS_COLLECTION)
  const chunkSize = 400

  for (let i = 0; i < toCreate.length; i += chunkSize) {
    const batch = db.batch()
    for (const input of toCreate.slice(i, i + chunkSize)) {
      const ref = col.doc()
      batch.set(ref, {
        ...input,
        createdAt: FieldValue.serverTimestamp(),
      })
    }
    await batch.commit()
  }

  for (let i = 0; i < toUpdate.length; i += chunkSize) {
    const batch = db.batch()
    for (const item of toUpdate.slice(i, i + chunkSize)) {
      batch.update(col.doc(item.id), {
        regions: item.regions,
        status: item.status,
        ...(item.status === 'available' ? { booking: null } : {}),
      })
    }
    await batch.commit()
  }

  return {
    fromMonday: monday,
    toMonday: addDateKeyDays(monday, 7),
    created: toCreate.length,
    updated: toUpdate.length,
    skipped,
    skippedBooked,
  }
}
