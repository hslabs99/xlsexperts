import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  CRAWL_DOCS_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import {
  DEFAULT_CRAWL_DOCS,
  normalizeCrawlDocs,
  type CrawlDocsContent,
} from '@/lib/crawl-docs'

export async function fetchCrawlDocs(): Promise<CrawlDocsContent> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CRAWL_DOCS_DOC_ID)
    .get()
  if (!snap.exists) return DEFAULT_CRAWL_DOCS
  return normalizeCrawlDocs(snap.data() as Record<string, unknown>)
}

export async function saveCrawlDocs(content: CrawlDocsContent): Promise<void> {
  const normalized = normalizeCrawlDocs(content)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(CRAWL_DOCS_DOC_ID)
    .set(
      {
        ...normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
}
