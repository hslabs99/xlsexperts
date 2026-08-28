/**
 * Admin blog queue — unstructured subjects and AI prompt drafts.
 * Not shown on the public site.
 */

export type BlogQueueItem = {
  id: string
  /** Short label for the table — the article you intend to write. */
  subject: string
  /** Unstructured notes, prompts, and paragraphs to copy into the Blog tool. */
  body: string
  createdAt: string | null
  updatedAt: string | null
}

export type BlogQueueInput = {
  subject: string
  body: string
}
