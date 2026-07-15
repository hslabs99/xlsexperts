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
  type DocumentData,
  type UpdateData,
} from 'firebase/firestore'
import { ENQUIRIES_COLLECTION, getDb } from '@/lib/firebase'
import {
  ENQUIRY_STATUSES,
  ENQUIRY_TYPES,
  type EnquiryInput,
  type EnquiryRecord,
  type EnquiryStatus,
  type EnquiryType,
} from '@/lib/enquiries'

function mapEnquiry(id: string, data: DocumentData): EnquiryRecord {
  const type: EnquiryType = ENQUIRY_TYPES.includes(data.type)
    ? (data.type as EnquiryType)
    : 'standard'
  const status: EnquiryStatus = ENQUIRY_STATUSES.includes(data.status)
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
  const ref = await addDoc(collection(getDb(), ENQUIRIES_COLLECTION), {
    type: input.type,
    status: input.status ?? 'new',
    name: input.name.trim(),
    company: input.company?.trim() || '',
    email: input.email.trim(),
    phone: input.phone?.trim() || '',
    message: input.message?.trim() || '',
    services: Array.isArray(input.services) ? input.services.map(String) : [],
    hear: input.hear?.trim() || '',
    day: input.day?.trim() || '',
    date: input.date?.trim() || '',
    time: input.time?.trim() || '',
    method: input.method?.trim() || '',
    slotId: input.slotId?.trim() || '',
    emailNotified: Boolean(input.emailNotified),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function fetchAllEnquiries(): Promise<EnquiryRecord[]> {
  const snap = await getDocs(
    query(collection(getDb(), ENQUIRIES_COLLECTION), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map((d) => mapEnquiry(d.id, d.data()))
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<void> {
  await updateDoc(doc(getDb(), ENQUIRIES_COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  } satisfies UpdateData<DocumentData>)
}

export async function updateEnquiryEmailNotified(
  id: string,
  emailNotified: boolean
): Promise<void> {
  await updateDoc(doc(getDb(), ENQUIRIES_COLLECTION, id), {
    emailNotified,
    updatedAt: serverTimestamp(),
  } satisfies UpdateData<DocumentData>)
}

export async function deleteEnquiry(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), ENQUIRIES_COLLECTION, id))
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
