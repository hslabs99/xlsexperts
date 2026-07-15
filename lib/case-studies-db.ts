import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { CASE_STUDIES_ARCHIVE } from '@/lib/case-studies-archive'
import {
  CASE_STUDIES_COLLECTION,
  CASE_STUDIES_HOME_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import type { CaseStudy } from '@/lib/types'
import {
  HOME_CASE_STUDIES_LIMIT,
  MORE_CASE_STUDIES_PAGE_SIZE,
  selectHomeCaseStudies,
  toPublicCaseStudy,
  type CaseStudiesHomeSnapshot,
  type CaseStudyInput,
  type CaseStudyRecord,
} from '@/lib/case-studies-shared'

export {
  HOME_CASE_STUDIES_LIMIT,
  MORE_CASE_STUDIES_PAGE_SIZE,
  selectHomeCaseStudies,
  toPublicCaseStudy,
  type CaseStudiesHomeSnapshot,
  type CaseStudyInput,
  type CaseStudyRecord,
} from '@/lib/case-studies-shared'

function archivePublicCaseStudies(): CaseStudy[] {
  return CASE_STUDIES_ARCHIVE.map(
    ({ localImage: _local, ...publicFields }) => publicFields
  )
}

function mapTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.map(String).map((t) => t.trim()).filter(Boolean)
}

function mapRecord(id: string, data: Record<string, unknown>): CaseStudyRecord {
  return {
    slug: String(data.slug ?? id),
    client: String(data.client ?? ''),
    sector: String(data.sector ?? ''),
    title: String(data.title ?? ''),
    image: String(data.image ?? ''),
    problem: String(data.problem ?? ''),
    solution: String(data.solution ?? ''),
    outcome: String(data.outcome ?? ''),
    tags: mapTags(data.tags),
    published: data.published !== false,
    showOnHome: Boolean(data.showOnHome),
    homeOrder: typeof data.homeOrder === 'number' ? data.homeOrder : 9999,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 9999,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  }
}

export async function fetchAllCaseStudyRecords(): Promise<CaseStudyRecord[]> {
  const snap = await getAdminDb()
    .collection(CASE_STUDIES_COLLECTION)
    .orderBy('sortOrder', 'asc')
    .get()
  return snap.docs.map((d) =>
    mapRecord(d.id, d.data() as Record<string, unknown>)
  )
}

export async function fetchCaseStudyRecordBySlug(
  slug: string
): Promise<CaseStudyRecord | null> {
  const snap = await getAdminDb()
    .collection(CASE_STUDIES_COLLECTION)
    .doc(slug)
    .get()
  if (!snap.exists) return null
  return mapRecord(snap.id, snap.data() as Record<string, unknown>)
}

export async function saveCaseStudy(input: CaseStudyInput): Promise<void> {
  const slug = input.slug.trim()
  if (!slug) throw new Error('Slug is required')
  const ref = getAdminDb().collection(CASE_STUDIES_COLLECTION).doc(slug)
  const existing = await ref.get()
  await ref.set(
    {
      slug,
      client: input.client.trim(),
      sector: input.sector.trim(),
      title: input.title.trim(),
      image: input.image.trim(),
      problem: input.problem.trim(),
      solution: input.solution.trim(),
      outcome: input.outcome.trim(),
      tags: input.tags.map((t) => t.trim()).filter(Boolean),
      published: input.published !== false,
      showOnHome: Boolean(input.showOnHome),
      homeOrder:
        typeof input.homeOrder === 'number' ? input.homeOrder : 9999,
      sortOrder:
        typeof input.sortOrder === 'number' ? input.sortOrder : 9999,
      updatedAt: FieldValue.serverTimestamp(),
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true }
  )
}

export async function updateCaseStudyFields(
  slug: string,
  fields: Partial<CaseStudyInput>
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (fields.client !== undefined) payload.client = fields.client.trim()
  if (fields.sector !== undefined) payload.sector = fields.sector.trim()
  if (fields.title !== undefined) payload.title = fields.title.trim()
  if (fields.image !== undefined) payload.image = fields.image.trim()
  if (fields.problem !== undefined) payload.problem = fields.problem.trim()
  if (fields.solution !== undefined) payload.solution = fields.solution.trim()
  if (fields.outcome !== undefined) payload.outcome = fields.outcome.trim()
  if (fields.tags !== undefined)
    payload.tags = fields.tags.map((t) => t.trim()).filter(Boolean)
  if (fields.published !== undefined) payload.published = fields.published
  if (fields.showOnHome !== undefined) payload.showOnHome = fields.showOnHome
  if (fields.homeOrder !== undefined) payload.homeOrder = fields.homeOrder
  if (fields.sortOrder !== undefined) payload.sortOrder = fields.sortOrder

  await getAdminDb().collection(CASE_STUDIES_COLLECTION).doc(slug).update(payload)
}

export async function deleteCaseStudy(slug: string): Promise<void> {
  await getAdminDb().collection(CASE_STUDIES_COLLECTION).doc(slug).delete()
}

/**
 * Write a single Site Content document with the homepage cards.
 * Call this from admin after choosing which studies appear on home —
 * the public homepage reads only this document (one Firestore read).
 */
export async function publishHomeCaseStudiesSnapshot(
  records?: CaseStudyRecord[]
): Promise<CaseStudiesHomeSnapshot> {
  const all = records ?? (await fetchAllCaseStudyRecords())
  const items = selectHomeCaseStudies(all)
  const payload = {
    items,
    slugs: items.map((i) => i.slug),
    updatedAt: FieldValue.serverTimestamp(),
  }
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CASE_STUDIES_HOME_DOC_ID)
    .set(payload, { merge: true })
  return { items, slugs: payload.slugs, updatedAt: null }
}

export async function fetchHomeCaseStudiesSnapshot(): Promise<CaseStudy[]> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CASE_STUDIES_HOME_DOC_ID)
    .get()
  if (!snap.exists) return []
  const data = snap.data() as Record<string, unknown>
  if (!Array.isArray(data.items)) return []
  return data.items
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null
      const r = raw as Record<string, unknown>
      const slug = String(r.slug ?? '').trim()
      const title = String(r.title ?? '').trim()
      if (!slug || !title) return null
      return {
        slug,
        client: String(r.client ?? ''),
        sector: String(r.sector ?? ''),
        title,
        image: String(r.image ?? ''),
        problem: String(r.problem ?? ''),
        solution: String(r.solution ?? ''),
        outcome: String(r.outcome ?? ''),
        tags: mapTags(r.tags),
      } satisfies CaseStudy
    })
    .filter((item): item is CaseStudy => Boolean(item))
    .slice(0, HOME_CASE_STUDIES_LIMIT)
}

/**
 * Next page of published case studies for the homepage “More” control.
 * Excludes already-visible slugs; ordered by sortOrder.
 *
 * When Firestore has no published case studies yet (common on a fresh
 * deploy before Admin → Seed), fall back to the frozen archive so “Show
 * more” still works — same source as the homepage first-paint fallback.
 */
export async function fetchMoreCaseStudies(options: {
  excludeSlugs: string[]
  limit?: number
}): Promise<{ items: CaseStudy[]; hasMore: boolean }> {
  const limit = options.limit ?? MORE_CASE_STUDIES_PAGE_SIZE
  const exclude = new Set(
    options.excludeSlugs.map((s) => s.trim().toLowerCase()).filter(Boolean)
  )

  let remaining: CaseStudy[] = []
  let usedFirestore = false

  try {
    const publishedRecords = (await fetchAllCaseStudyRecords()).filter(
      (r) => r.published
    )
    if (publishedRecords.length > 0) {
      usedFirestore = true
      remaining = publishedRecords
        .filter((r) => !exclude.has(r.slug.toLowerCase()))
        .map(toPublicCaseStudy)
    }
  } catch (error) {
    console.error(
      '[case-studies] Failed to load more from Firestore',
      error instanceof Error ? error.message : undefined
    )
  }

  if (!usedFirestore) {
    remaining = archivePublicCaseStudies().filter(
      (item) => !exclude.has(item.slug.toLowerCase())
    )
  }

  return {
    items: remaining.slice(0, limit),
    hasMore: remaining.length > limit,
  }
}
