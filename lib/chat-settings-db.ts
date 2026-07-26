import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  CHAT_SETTINGS_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import {
  DEFAULT_CHAT_SETTINGS,
  normalizeChatSettings,
  type ChatSettings,
} from '@/lib/chat'

/**
 * Load chat settings from live Firestore.
 * Returns seeded defaults if the document does not exist yet.
 */
export async function fetchChatSettings(): Promise<ChatSettings> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CHAT_SETTINGS_DOC_ID)
    .get()
  if (!snap.exists) return DEFAULT_CHAT_SETTINGS
  return normalizeChatSettings(snap.data() as Record<string, unknown>)
}

/** Create or overwrite chat settings in live Firestore. */
export async function saveChatSettings(
  content: ChatSettings
): Promise<ChatSettings> {
  const normalized = normalizeChatSettings(content)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CHAT_SETTINGS_DOC_ID)
    .set(
      {
        ...normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return normalized
}
