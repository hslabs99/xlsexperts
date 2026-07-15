import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import {
  CONFIRMATION_CONTENT_DOC_ID,
  SITE_CONTENT_COLLECTION,
  getDb,
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
  const ref = doc(
    getDb(),
    SITE_CONTENT_COLLECTION,
    CONFIRMATION_CONTENT_DOC_ID
  )
  const snap = await getDoc(ref)
  if (!snap.exists()) return DEFAULT_CONFIRMATION_CONTENT
  return normalizeConfirmationContent(snap.data())
}

/** Create or overwrite confirmation copy in live Firestore. */
export async function saveConfirmationContent(
  content: ConfirmationContent
): Promise<void> {
  const normalized = normalizeConfirmationContent(content)
  const ref = doc(
    getDb(),
    SITE_CONTENT_COLLECTION,
    CONFIRMATION_CONTENT_DOC_ID
  )
  await setDoc(
    ref,
    {
      ...normalized,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
