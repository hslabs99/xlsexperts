import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { SERVICE_PAGE_TILES_COLLECTION } from '@/lib/firebase'
import { withoutArchivedServiceHrefs } from '@/lib/service-pages'
import {
  slugifyServicePageTile,
  type ServicePageTile,
  type ServicePageTileInput,
  type ServicePageTileRecord,
} from '@/lib/service-page-tiles-shared'

function mapTile(
  id: string,
  data: Record<string, unknown>
): ServicePageTileRecord {
  const hrefs = Array.isArray(data.serviceHrefs)
    ? withoutArchivedServiceHrefs(data.serviceHrefs.map(String))
    : []
  return {
    slug: id,
    tag: String(data.tag ?? ''),
    title: String(data.title ?? ''),
    detail: String(data.detail ?? ''),
    serviceHrefs: hrefs,
    published: data.published !== false,
    sortOrder:
      typeof data.sortOrder === 'number' && Number.isFinite(data.sortOrder)
        ? data.sortOrder
        : 9999,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  }
}

function serializeTimestamp(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
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

function normalizeInput(input: ServicePageTileInput): {
  slug: string
  data: Omit<ServicePageTile, 'slug'>
} {
  const slug =
    (input.slug?.trim() && slugifyServicePageTile(input.slug)) ||
    slugifyServicePageTile(input.title)
  if (!slug) throw new Error('slug or title is required')
  const hrefs = withoutArchivedServiceHrefs([
    ...new Set(
      (input.serviceHrefs ?? [])
        .map((h) => h.trim())
        .filter(Boolean)
        .map((h) => (h.startsWith('/') ? h : `/${h}`))
    ),
  ])
  return {
    slug,
    data: {
      tag: input.tag.trim(),
      title: input.title.trim(),
      detail: input.detail.trim(),
      serviceHrefs: hrefs,
      published: input.published !== false,
      sortOrder:
        typeof input.sortOrder === 'number' && Number.isFinite(input.sortOrder)
          ? input.sortOrder
          : 9999,
    },
  }
}

export async function fetchAllServicePageTiles(): Promise<
  ServicePageTileRecord[]
> {
  const snap = await getAdminDb().collection(SERVICE_PAGE_TILES_COLLECTION).get()
  return snap.docs
    .map((d) => mapTile(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
}

export async function upsertServicePageTile(
  input: ServicePageTileInput
): Promise<string> {
  const { slug, data } = normalizeInput(input)
  const ref = getAdminDb().collection(SERVICE_PAGE_TILES_COLLECTION).doc(slug)
  const existing = await ref.get()
  await ref.set(
    {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true }
  )
  return slug
}

export async function deleteServicePageTile(slug: string): Promise<void> {
  await getAdminDb()
    .collection(SERVICE_PAGE_TILES_COLLECTION)
    .doc(slug)
    .delete()
}

export async function seedServicePageTilesFromArchive(options?: {
  overwrite?: boolean
}): Promise<{ created: number; updated: number; skipped: number }> {
  const { SERVICE_PAGE_TILES_ARCHIVE } = await import(
    '@/lib/service-page-tiles-archive'
  )
  const overwrite = options?.overwrite === true
  let created = 0
  let updated = 0
  let skipped = 0

  for (const item of SERVICE_PAGE_TILES_ARCHIVE) {
    const ref = getAdminDb()
      .collection(SERVICE_PAGE_TILES_COLLECTION)
      .doc(item.slug)
    const existing = await ref.get()
    if (existing.exists && !overwrite) {
      skipped += 1
      continue
    }
    await ref.set(
      {
        tag: item.tag,
        title: item.title,
        detail: item.detail,
        serviceHrefs: item.serviceHrefs,
        published: true,
        sortOrder: item.sortOrder,
        updatedAt: FieldValue.serverTimestamp(),
        ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      },
      { merge: true }
    )
    if (existing.exists) updated += 1
    else created += 1
  }

  await stripArchivedServiceHrefsFromCmsTiles()

  return { created, updated, skipped }
}

/** Remove retired service hrefs from every CMS tile document. */
export async function stripArchivedServiceHrefsFromCmsTiles(): Promise<number> {
  const snap = await getAdminDb().collection(SERVICE_PAGE_TILES_COLLECTION).get()
  let updated = 0
  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>
    const raw = Array.isArray(data.serviceHrefs)
      ? data.serviceHrefs.map(String)
      : []
    const next = withoutArchivedServiceHrefs(raw)
    if (next.length === raw.length && next.every((h, i) => h === raw[i])) {
      continue
    }
    await doc.ref.update({
      serviceHrefs: next,
      updatedAt: FieldValue.serverTimestamp(),
    })
    updated += 1
  }
  return updated
}
