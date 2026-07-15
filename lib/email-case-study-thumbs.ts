/**
 * Client + server safe: read email case-study thumb URLs from Firestore.
 * Publishing (sharp / Storage upload) lives in email-case-study-thumbs-publish.ts
 * so the browser never bundles Node-only tools.
 */

import { doc, getDoc } from 'firebase/firestore'
import { CASE_STUDIES_ARCHIVE } from '@/lib/case-studies-archive'
import { fetchAllCaseStudyRecords } from '@/lib/case-studies-db'
import type { EmailCaseStudyThumb } from '@/lib/email-insert-blocks'
import { SITE_CONTENT_COLLECTION, getDb } from '@/lib/firebase'

export const EMAIL_CASE_STUDY_THUMBS_DOC_ID = 'email-case-study-thumbs'
export const EMAIL_CASE_STUDY_THUMB_LIMIT = 6

export const EMAIL_CASE_STUDY_SLUGS = CASE_STUDIES_ARCHIVE.slice(
  0,
  EMAIL_CASE_STUDY_THUMB_LIMIT
).map((item) => item.slug)

function isAbsoluteHttpsUrl(value: string): boolean {
  return /^https:\/\//i.test(value.trim())
}

function mapThumb(raw: unknown): EmailCaseStudyThumb | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const src = String(r.src ?? '').trim()
  const slug = String(r.slug ?? '').trim()
  if (!slug || !isAbsoluteHttpsUrl(src)) return null
  return {
    slug,
    src,
    label: String(r.label ?? '').trim() || 'Case study',
    client: String(r.client ?? '').trim() || slug,
  }
}

/** Read published email thumbs (Storage HTTPS URLs only). */
export async function fetchEmailCaseStudyThumbs(): Promise<
  EmailCaseStudyThumb[]
> {
  try {
    const snap = await getDoc(
      doc(getDb(), SITE_CONTENT_COLLECTION, EMAIL_CASE_STUDY_THUMBS_DOC_ID)
    )
    if (snap.exists()) {
      const data = snap.data() as { items?: unknown }
      if (Array.isArray(data.items)) {
        const fromDoc = data.items
          .map(mapThumb)
          .filter((t): t is EmailCaseStudyThumb => Boolean(t))
          .slice(0, EMAIL_CASE_STUDY_THUMB_LIMIT)
        if (fromDoc.length > 0) return fromDoc
      }
    }
  } catch (error) {
    console.error(
      '[email-case-study-thumbs] Failed to read Site Content doc',
      error instanceof Error ? error.message : undefined
    )
  }

  // Fallback: caseStudies.image already pointing at Storage
  try {
    const records = await fetchAllCaseStudyRecords()
    const bySlug = new Map(records.map((r) => [r.slug, r]))
    const ordered = EMAIL_CASE_STUDY_SLUGS.map((slug) => bySlug.get(slug)).filter(
      Boolean
    ) as typeof records
    const pool =
      ordered.length > 0
        ? ordered
        : records
            .filter((r) => r.published)
            .slice(0, EMAIL_CASE_STUDY_THUMB_LIMIT)

    return pool
      .filter((r) => isAbsoluteHttpsUrl(r.image))
      .slice(0, EMAIL_CASE_STUDY_THUMB_LIMIT)
      .map((r) => ({
        slug: r.slug,
        src: r.image.trim(),
        label: r.sector,
        client: r.client,
      }))
  } catch (error) {
    console.error(
      '[email-case-study-thumbs] Failed to fall back to caseStudies',
      error instanceof Error ? error.message : undefined
    )
    return []
  }
}
