import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { ENQUIRIES_COLLECTION } from '@/lib/firebase'
import {
  ENQUIRY_STATUSES,
  ENQUIRY_TYPES,
  type EnquiryInput,
  type EnquiryRecord,
  type EnquiryStatus,
  type EnquiryType,
} from '@/lib/enquiries'

function mapEnquiry(id: string, data: Record<string, unknown>): EnquiryRecord {
  const type: EnquiryType = ENQUIRY_TYPES.includes(data.type as EnquiryType)
    ? (data.type as EnquiryType)
    : 'standard'
  const status: EnquiryStatus = ENQUIRY_STATUSES.includes(
    data.status as EnquiryStatus
  )
    ? (data.status as EnquiryStatus)
    : 'new'

  return {
    id,
    type,
    status,
    name: String(data.name ?? ''),
    company: String(data.company ?? ''),
    email: String(data.email ?? ''),
    phone: String(data.phone ?? ''),
    message: String(data.message ?? ''),
    services: Array.isArray(data.services) ? data.services.map(String) : [],
    service: String(data.service ?? ''),
    solution: String(data.solution ?? ''),
    hear: String(data.hear ?? ''),
    day: String(data.day ?? ''),
    date: String(data.date ?? ''),
    time: String(data.time ?? ''),
    method: String(data.method ?? ''),
    slotId: String(data.slotId ?? ''),
    emailNotified: Boolean(data.emailNotified),
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  }
}

/** Persist a new enquiry in live Firestore (`enquiries`). */
export async function createEnquiry(input: EnquiryInput): Promise<string> {
  const ref = await getAdminDb().collection(ENQUIRIES_COLLECTION).add({
    type: input.type,
    status: input.status ?? 'new',
    name: input.name.trim(),
    company: input.company?.trim() || '',
    email: input.email.trim(),
    phone: input.phone?.trim() || '',
    message: input.message?.trim() || '',
    services: Array.isArray(input.services) ? input.services.map(String) : [],
    service: input.service?.trim() || '',
    solution: input.solution?.trim() || '',
    hear: input.hear?.trim() || '',
    day: input.day?.trim() || '',
    date: input.date?.trim() || '',
    time: input.time?.trim() || '',
    method: input.method?.trim() || '',
    slotId: input.slotId?.trim() || '',
    emailNotified: Boolean(input.emailNotified),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function fetchAllEnquiries(): Promise<EnquiryRecord[]> {
  const snap = await getAdminDb()
    .collection(ENQUIRIES_COLLECTION)
    .orderBy('createdAt', 'desc')
    .get()
  return snap.docs.map((d) =>
    mapEnquiry(d.id, d.data() as Record<string, unknown>)
  )
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<void> {
  await getAdminDb().collection(ENQUIRIES_COLLECTION).doc(id).update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function updateEnquiryEmailNotified(
  id: string,
  emailNotified: boolean
): Promise<void> {
  await getAdminDb().collection(ENQUIRIES_COLLECTION).doc(id).update({
    emailNotified,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function deleteEnquiry(id: string): Promise<void> {
  await getAdminDb().collection(ENQUIRIES_COLLECTION).doc(id).delete()
}

export function formatEnquiryCreatedAt(value: unknown): string {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    try {
      return (value as { toDate: () => Date }).toDate().toLocaleString('en-NZ')
    } catch {
      return '—'
    }
  }
  return '—'
}
