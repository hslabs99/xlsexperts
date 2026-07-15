import 'server-only'

/**
 * Server-only: compress archive images with sharp and upload to Storage.
 * Never import this module from a Client Component.
 */

import { FieldValue } from 'firebase-admin/firestore'
import { CASE_STUDIES_ARCHIVE } from '@/lib/case-studies-archive'
import { compressLocalCaseStudyImage } from '@/lib/case-studies-seed'
import {
  formatStorageError,
  uploadEmailCaseStudyThumb,
} from '@/lib/case-studies-storage'
import {
  EMAIL_CASE_STUDY_THUMBS_DOC_ID,
  EMAIL_CASE_STUDY_THUMB_LIMIT,
} from '@/lib/email-case-study-thumbs'
import type { EmailCaseStudyThumb } from '@/lib/email-insert-blocks'
import { getAdminDb } from '@/lib/firebase-admin'
import { SITE_CONTENT_COLLECTION } from '@/lib/firebase'

export type PublishEmailThumbsResult = {
  uploaded: number
  failed: number
  items: EmailCaseStudyThumb[]
  lastError?: string
}

/**
 * Compress archive images → Storage `email/case-studies/{slug}.jpg`
 * and publish download URLs to Site Content for discovery emails.
 */
export async function publishEmailCaseStudyThumbsToStorage(): Promise<PublishEmailThumbsResult> {
  const items: EmailCaseStudyThumb[] = []
  let uploaded = 0
  let failed = 0
  let lastError: string | undefined

  for (const archive of CASE_STUDIES_ARCHIVE.slice(
    0,
    EMAIL_CASE_STUDY_THUMB_LIMIT
  )) {
    try {
      const compressed = await compressLocalCaseStudyImage(archive.localImage)
      const src = await uploadEmailCaseStudyThumb(
        archive.slug,
        compressed.bytes,
        compressed.contentType
      )
      items.push({
        slug: archive.slug,
        src,
        label: archive.sector,
        client: archive.client,
      })
      uploaded += 1
    } catch (err) {
      failed += 1
      lastError = formatStorageError(err)
    }
  }

  if (items.length > 0) {
    await getAdminDb()
      .collection(SITE_CONTENT_COLLECTION)
      .doc(EMAIL_CASE_STUDY_THUMBS_DOC_ID)
      .set(
        {
          items,
          slugs: items.map((i) => i.slug),
          storagePrefix: 'email/case-studies/',
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
  }

  return { uploaded, failed, items, lastError }
}
