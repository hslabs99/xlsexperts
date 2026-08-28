/**
 * Firestore CRUD for the admin blog queue (`blogQueue`).
 * Server only.
 */

import 'server-only'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { BLOG_QUEUE_COLLECTION } from '@/lib/firebase'
import type { BlogQueueInput, BlogQueueItem } from '@/lib/blog-queue'

function tsToIso(value: unknown): string | null {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString()
    } catch {
      return null
    }
  }
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return null
}

function mapItem(
  id: string,
  data: Record<string, unknown>
): BlogQueueItem {
  return {
    id,
    subject: typeof data.subject === 'string' ? data.subject : '',
    body: typeof data.body === 'string' ? data.body : '',
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
  }
}

export async function listBlogQueueItems(): Promise<BlogQueueItem[]> {
  const snap = await getAdminDb().collection(BLOG_QUEUE_COLLECTION).get()
  const items = snap.docs.map((d) =>
    mapItem(d.id, d.data() as Record<string, unknown>)
  )
  items.sort((a, b) => {
    const aTime = a.updatedAt ?? a.createdAt ?? ''
    const bTime = b.updatedAt ?? b.createdAt ?? ''
    return bTime.localeCompare(aTime)
  })
  return items
}

export async function getBlogQueueItem(
  id: string
): Promise<BlogQueueItem | null> {
  const trimmed = id.trim()
  if (!trimmed) return null
  const snap = await getAdminDb()
    .collection(BLOG_QUEUE_COLLECTION)
    .doc(trimmed)
    .get()
  if (!snap.exists) return null
  return mapItem(snap.id, snap.data() as Record<string, unknown>)
}

export async function createBlogQueueItem(
  input: BlogQueueInput
): Promise<BlogQueueItem> {
  const subject = input.subject.trim()
  const body = input.body
  if (!subject) throw new Error('Subject is required.')

  const ref = getAdminDb().collection(BLOG_QUEUE_COLLECTION).doc()
  await ref.set({
    subject,
    body,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  const saved = await ref.get()
  return mapItem(saved.id, saved.data() as Record<string, unknown>)
}

export async function updateBlogQueueItem(
  id: string,
  input: BlogQueueInput
): Promise<BlogQueueItem> {
  const trimmed = id.trim()
  if (!trimmed) throw new Error('id is required.')
  const subject = input.subject.trim()
  const body = input.body
  if (!subject) throw new Error('Subject is required.')

  const ref = getAdminDb().collection(BLOG_QUEUE_COLLECTION).doc(trimmed)
  const existing = await ref.get()
  if (!existing.exists) throw new Error('Queue item not found.')

  await ref.set(
    {
      subject,
      body,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
  const saved = await ref.get()
  return mapItem(saved.id, saved.data() as Record<string, unknown>)
}

export async function deleteBlogQueueItem(id: string): Promise<void> {
  const trimmed = id.trim()
  if (!trimmed) throw new Error('id is required.')
  await getAdminDb().collection(BLOG_QUEUE_COLLECTION).doc(trimmed).delete()
}
