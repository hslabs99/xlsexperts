import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { BLOG_LINKS_DOC_ID, SITE_CONTENT_COLLECTION } from '@/lib/firebase'
import {
  EMPTY_BLOG_LINK_GRAPH,
  normalizeBlogLinkGraph,
  type BlogLinkGraph,
} from '@/lib/blog-links'

export async function fetchBlogLinkGraph(): Promise<BlogLinkGraph> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(BLOG_LINKS_DOC_ID)
    .get()
  if (!snap.exists) return EMPTY_BLOG_LINK_GRAPH
  return normalizeBlogLinkGraph(snap.data())
}

export async function saveBlogLinkGraph(
  graph: BlogLinkGraph
): Promise<BlogLinkGraph> {
  const normalized = normalizeBlogLinkGraph(graph)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(BLOG_LINKS_DOC_ID)
    .set(
      {
        links: normalized.links,
        suggestions: normalized.suggestions,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return normalized
}
