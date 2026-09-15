import 'server-only'

import path from 'path'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  HOME_SERVICES_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import { writeGeneratedFile } from '@/lib/write-generated-file'
import {
  CMS_DRAFT_CACHE_KEYS,
  cachedDraft,
  invalidateDraftCache,
} from '@/lib/cms-draft-cache'
import {
  defaultHomeServicesBundle,
  normalizeHomeServicesBundle,
  type HomeServicesBundle,
  type PublishedHomeServicesFile,
} from '@/lib/home-services'

const GENERATED_RELATIVE = path.join('data', 'home-services.generated.ts')

function firestoreUpdatedAt(raw: unknown): string | null {
  if (raw && typeof raw === 'object' && 'toDate' in raw) {
    try {
      return (raw as { toDate: () => Date }).toDate().toISOString()
    } catch {
      return null
    }
  }
  return typeof raw === 'string' ? raw : null
}

/**
 * Load draft homepage services from Firestore.
 * Falls back to the seeded current-homepage replica if missing.
 * Legacy single-document drafts are cloned into NZ / Intl / UK.
 */
export async function fetchHomeServicesDraft(): Promise<{
  content: HomeServicesBundle
  publishedAt: string | null
  updatedAt: string | null
}> {
  return cachedDraft(CMS_DRAFT_CACHE_KEYS.homeServices, loadHomeServicesDraft)
}

async function loadHomeServicesDraft(): Promise<{
  content: HomeServicesBundle
  publishedAt: string | null
  updatedAt: string | null
}> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HOME_SERVICES_DOC_ID)
    .get()

  if (!snap.exists) {
    return {
      content: defaultHomeServicesBundle(),
      publishedAt: null,
      updatedAt: null,
    }
  }

  const data = snap.data() as Record<string, unknown>
  return {
    content: normalizeHomeServicesBundle(data),
    publishedAt:
      typeof data.publishedAt === 'string' ? data.publishedAt : null,
    updatedAt: firestoreUpdatedAt(data.updatedAt),
  }
}

/** Save draft homepage services to Firestore (does not publish the static file). */
export async function saveHomeServicesDraft(
  content: HomeServicesBundle
): Promise<HomeServicesBundle> {
  const normalized = normalizeHomeServicesBundle(content)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HOME_SERVICES_DOC_ID)
    .set(
      {
        content: normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  invalidateDraftCache(CMS_DRAFT_CACHE_KEYS.homeServices)
  return normalized
}

function serializeGeneratedFile(payload: PublishedHomeServicesFile): string {
  const json = JSON.stringify(payload, null, 2)
  return `/**
 * PUBLISHED homepage services — imported by the public site (no Firestore on first paint).
 * Edit drafts in Admin → CMS → Home services, then click Publish to regenerate this file.
 * \`content\` is NZ / International / UK copy. Each host only serves its own market.
 *
 * Generated at ${payload.publishedAt}
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedHomeServicesFile } from '@/lib/home-services'

const published = ${json} as PublishedHomeServicesFile

export const PUBLISHED_HOME_SERVICES = published

export default published
`
}

/**
 * Write the static generated module and record publishedAt in Firestore.
 * Public pages import this file — never query Firestore for homepage tiles.
 */
export async function publishHomeServices(
  content?: HomeServicesBundle
): Promise<{
  content: HomeServicesBundle
  publishedAt: string
  filePath: string
}> {
  const bundle =
    content != null
      ? normalizeHomeServicesBundle(content)
      : (await loadHomeServicesDraft()).content

  const publishedAt = new Date().toISOString()
  const payload: PublishedHomeServicesFile = {
    version: 2,
    publishedAt,
    content: bundle,
  }

  await writeGeneratedFile(GENERATED_RELATIVE, serializeGeneratedFile(payload))

  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HOME_SERVICES_DOC_ID)
    .set(
      {
        content: bundle,
        publishedAt,
        updatedAt: publishedAt,
      },
      { merge: true }
    )

  return { content: bundle, publishedAt, filePath: GENERATED_RELATIVE }
}
