import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import {
  SITE_CONTENT_COLLECTION,
  SITE_TAGS_DOC_ID,
  getDb,
} from '@/lib/firebase'
import {
  DEFAULT_SITE_TAGS,
  normalizeSiteTags,
  type SiteTagsContent,
} from '@/lib/site-tags'

export async function fetchSiteTags(): Promise<SiteTagsContent> {
  const ref = doc(getDb(), SITE_CONTENT_COLLECTION, SITE_TAGS_DOC_ID)
  const snap = await getDoc(ref)
  if (!snap.exists()) return DEFAULT_SITE_TAGS
  return normalizeSiteTags(snap.data())
}

export async function saveSiteTags(content: SiteTagsContent): Promise<void> {
  const normalized = normalizeSiteTags(content)
  const ref = doc(getDb(), SITE_CONTENT_COLLECTION, SITE_TAGS_DOC_ID)
  await setDoc(
    ref,
    {
      ...normalized,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
