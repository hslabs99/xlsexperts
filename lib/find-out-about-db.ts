import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  FIND_OUT_ABOUT_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import {
  DEFAULT_FIND_OUT_ABOUT,
  normalizeFindOutAboutContent,
  type FindOutAboutContent,
} from '@/lib/find-out-about'

/**
 * Load Find out about quick-nav from live Firestore.
 * Returns seeded defaults if the document does not exist yet.
 */
export async function fetchFindOutAboutContent(): Promise<FindOutAboutContent> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(FIND_OUT_ABOUT_DOC_ID)
    .get()
  if (!snap.exists) return DEFAULT_FIND_OUT_ABOUT
  return normalizeFindOutAboutContent(snap.data() as Record<string, unknown>)
}

/** Create or overwrite Find out about quick-nav in live Firestore. */
export async function saveFindOutAboutContent(
  content: FindOutAboutContent
): Promise<void> {
  const normalized = normalizeFindOutAboutContent(content)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(FIND_OUT_ABOUT_DOC_ID)
    .set(
      {
        ...normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
}
