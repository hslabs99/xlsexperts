import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  BLOG_SERP_PROMPT_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import {
  DEFAULT_BLOG_SERP_PROMPT,
  normalizeBlogSerpPrompt,
} from '@/lib/blog-serp-prompt'

export async function fetchBlogSerpPrompt(): Promise<string> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(BLOG_SERP_PROMPT_DOC_ID)
    .get()
  if (!snap.exists) return DEFAULT_BLOG_SERP_PROMPT
  return normalizeBlogSerpPrompt(
    (snap.data() as Record<string, unknown> | undefined)?.prompt
  )
}

export async function saveBlogSerpPrompt(prompt: string): Promise<string> {
  const normalized = normalizeBlogSerpPrompt(prompt)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(BLOG_SERP_PROMPT_DOC_ID)
    .set(
      {
        prompt: normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return normalized
}
