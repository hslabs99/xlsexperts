import 'server-only'

import { promises as fs } from 'fs'
import path from 'path'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  HOME_SERVICES_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import {
  defaultHomeServicesContent,
  normalizeHomeServicesContent,
  type HomeServicesContent,
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
 */
export async function fetchHomeServicesDraft(): Promise<{
  content: HomeServicesContent
  publishedAt: string | null
  updatedAt: string | null
}> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HOME_SERVICES_DOC_ID)
    .get()

  if (!snap.exists) {
    return {
      content: defaultHomeServicesContent(),
      publishedAt: null,
      updatedAt: null,
    }
  }

  const data = snap.data() as Record<string, unknown>
  return {
    content: normalizeHomeServicesContent(data),
    publishedAt:
      typeof data.publishedAt === 'string' ? data.publishedAt : null,
    updatedAt: firestoreUpdatedAt(data.updatedAt),
  }
}

/** Save draft homepage services to Firestore (does not publish the static file). */
export async function saveHomeServicesDraft(
  content: HomeServicesContent
): Promise<HomeServicesContent> {
  const normalized = normalizeHomeServicesContent(content)
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
  return normalized
}

function serializeGeneratedFile(payload: PublishedHomeServicesFile): string {
  const json = JSON.stringify(payload, null, 2)
  return `/**
 * PUBLISHED homepage services — imported by the public site (no Firestore on first paint).
 * Edit drafts in Admin → CMS → Home services, then click Publish to regenerate this file.
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
  content?: HomeServicesContent
): Promise<{
  content: HomeServicesContent
  publishedAt: string
  filePath: string
}> {
  const bundle =
    content != null
      ? normalizeHomeServicesContent(content)
      : (await fetchHomeServicesDraft()).content

  const publishedAt = new Date().toISOString()
  const payload: PublishedHomeServicesFile = {
    version: 1,
    publishedAt,
    content: bundle,
  }

  const filePath = path.join(process.cwd(), GENERATED_RELATIVE)
  await fs.writeFile(filePath, serializeGeneratedFile(payload), 'utf8')

  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HOME_SERVICES_DOC_ID)
    .set(
      {
        content: bundle,
        publishedAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

  return { content: bundle, publishedAt, filePath: GENERATED_RELATIVE }
}
