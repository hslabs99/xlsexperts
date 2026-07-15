import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  CONFIRMATION_CONTENT_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import {
  DEFAULT_CONFIRMATION_CONTENT,
  normalizeConfirmationContent,
  type ConfirmationContent,
} from '@/lib/confirmation-content'

/**
 * Load confirmation copy from live Firestore.
 * Returns built-in defaults if the document does not exist yet.
 */
export async function fetchConfirmationContent(): Promise<ConfirmationContent> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CONFIRMATION_CONTENT_DOC_ID)
    .get()
  if (!snap.exists) return DEFAULT_CONFIRMATION_CONTENT
  return normalizeConfirmationContent(snap.data() as Record<string, unknown>)
}

/** Create or overwrite confirmation copy in live Firestore. */
export async function saveConfirmationContent(
  content: ConfirmationContent
): Promise<void> {
  const normalized = normalizeConfirmationContent(content)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CONFIRMATION_CONTENT_DOC_ID)
    .set(
      {
        ...normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
}
