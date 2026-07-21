/**
 * Firestore CRUD for `blog_seed_todo` (Wix harvest queue).
 * Server/CLI only.
 */

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { BLOG_SEED_TODO_COLLECTION } from '@/lib/firebase'
import { getWixBlogSeedEntries } from '@/lib/wix-blog-seed-urls'
import type {
  BlogSeedTodoItem,
  BlogSeedTodoStatus,
} from '@/lib/blog-seed-todo-shared'

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
  if (typeof value === 'string') return value
  return null
}

function mapTodo(
  id: string,
  data: Record<string, unknown>
): BlogSeedTodoItem {
  const status = String(data.status ?? 'pending') as BlogSeedTodoStatus
  const allowed: BlogSeedTodoStatus[] = [
    'pending',
    'imported',
    'duplicate',
    'failed',
    'skipped',
  ]
  return {
    slug: String(data.slug ?? id),
    sourceUrl: String(data.sourceUrl ?? ''),
    sortOrder:
      typeof data.sortOrder === 'number' ? data.sortOrder : Number.MAX_SAFE_INTEGER,
    status: allowed.includes(status) ? status : 'pending',
    title: typeof data.title === 'string' ? data.title : undefined,
    category: typeof data.category === 'string' ? data.category : undefined,
    lastError: typeof data.lastError === 'string' ? data.lastError : undefined,
    lastHttpStatus:
      typeof data.lastHttpStatus === 'number' ? data.lastHttpStatus : undefined,
    duplicateNote:
      typeof data.duplicateNote === 'string' ? data.duplicateNote : undefined,
    lastAttemptAt: tsToIso(data.lastAttemptAt),
    importedAt: tsToIso(data.importedAt),
    updatedAt: tsToIso(data.updatedAt),
    createdAt: tsToIso(data.createdAt),
  }
}

export async function listBlogSeedTodos(): Promise<BlogSeedTodoItem[]> {
  const snap = await getAdminDb().collection(BLOG_SEED_TODO_COLLECTION).get()
  const items = snap.docs.map((d) =>
    mapTodo(d.id, d.data() as Record<string, unknown>)
  )
  items.sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug))
  return items
}

export async function getBlogSeedTodo(
  slug: string
): Promise<BlogSeedTodoItem | null> {
  const snap = await getAdminDb()
    .collection(BLOG_SEED_TODO_COLLECTION)
    .doc(slug)
    .get()
  if (!snap.exists) return null
  return mapTodo(snap.id, snap.data() as Record<string, unknown>)
}

/**
 * Upsert every constant URL into `blog_seed_todo`.
 * Does not reset status / errors on existing docs (safe re-sync).
 */
export async function syncBlogSeedTodosFromConstant(): Promise<{
  created: number
  updated: number
  total: number
}> {
  const entries = getWixBlogSeedEntries()
  let created = 0
  let updated = 0
  const db = getAdminDb()

  for (const entry of entries) {
    const ref = db.collection(BLOG_SEED_TODO_COLLECTION).doc(entry.slug)
    const existing = await ref.get()
    if (existing.exists) {
      await ref.set(
        {
          slug: entry.slug,
          sourceUrl: entry.url,
          sortOrder: entry.sortOrder,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
      updated += 1
    } else {
      await ref.set({
        slug: entry.slug,
        sourceUrl: entry.url,
        sortOrder: entry.sortOrder,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      created += 1
    }
  }

  return { created, updated, total: entries.length }
}

export async function updateBlogSeedTodo(
  slug: string,
  patch: {
    status?: BlogSeedTodoStatus
    title?: string
    category?: string
    lastError?: string | null
    lastHttpStatus?: number | null
    duplicateNote?: string | null
    markImported?: boolean
    markAttempted?: boolean
  }
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (patch.status) payload.status = patch.status
  if (patch.title !== undefined) payload.title = patch.title
  if (patch.category !== undefined) payload.category = patch.category
  if (patch.lastError === null) payload.lastError = FieldValue.delete()
  else if (patch.lastError !== undefined) payload.lastError = patch.lastError
  if (patch.lastHttpStatus === null) payload.lastHttpStatus = FieldValue.delete()
  else if (patch.lastHttpStatus !== undefined)
    payload.lastHttpStatus = patch.lastHttpStatus
  if (patch.duplicateNote === null) payload.duplicateNote = FieldValue.delete()
  else if (patch.duplicateNote !== undefined)
    payload.duplicateNote = patch.duplicateNote
  if (patch.markAttempted) payload.lastAttemptAt = FieldValue.serverTimestamp()
  if (patch.markImported) payload.importedAt = FieldValue.serverTimestamp()

  await getAdminDb()
    .collection(BLOG_SEED_TODO_COLLECTION)
    .doc(slug)
    .set(payload, { merge: true })
}

export async function deleteBlogSeedTodo(slug: string): Promise<void> {
  await getAdminDb().collection(BLOG_SEED_TODO_COLLECTION).doc(slug).delete()
}

export async function resetBlogSeedTodoStatus(
  slugs: string[],
  status: BlogSeedTodoStatus = 'pending'
): Promise<number> {
  let n = 0
  for (const slug of slugs) {
    await updateBlogSeedTodo(slug, {
      status,
      lastError: null,
      lastHttpStatus: null,
      duplicateNote: null,
    })
    n += 1
  }
  return n
}
