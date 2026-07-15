import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  SITE_CONTENT_COLLECTION,
  SITE_TAGS_DOC_ID,
} from '@/lib/firebase'
import {
  DEFAULT_SITE_TAGS,
  normalizeSiteTags,
  type SiteTagsContent,
} from '@/lib/site-tags'

export async function fetchSiteTags(): Promise<SiteTagsContent> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(SITE_TAGS_DOC_ID)
    .get()
  if (!snap.exists) return DEFAULT_SITE_TAGS
  return normalizeSiteTags(snap.data() as Record<string, unknown>)
}

export async function saveSiteTags(content: SiteTagsContent): Promise<void> {
  const normalized = normalizeSiteTags(content)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(SITE_TAGS_DOC_ID)
    .set(
      {
        ...normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
}
