import 'server-only'

import path from 'path'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  HERO_TOP_BULLETS_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import { writeGeneratedFile } from '@/lib/write-generated-file'
import {
  defaultHeroTopBulletsBundle,
  normalizeHeroTopBulletsBundle,
  type HeroTopBulletsBundle,
  type PublishedHeroTopBulletsFile,
} from '@/lib/hero-top-bullets'

const GENERATED_RELATIVE = path.join('data', 'hero-top-bullets.generated.ts')

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
 * Load draft homepage top bullets from Firestore.
 * Falls back to the seeded current-homepage replica if missing.
 */
export async function fetchHeroTopBulletsDraft(): Promise<{
  content: HeroTopBulletsBundle
  publishedAt: string | null
  updatedAt: string | null
}> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HERO_TOP_BULLETS_DOC_ID)
    .get()

  if (!snap.exists) {
    return {
      content: defaultHeroTopBulletsBundle(),
      publishedAt: null,
      updatedAt: null,
    }
  }

  const data = snap.data() as Record<string, unknown>
  return {
    content: normalizeHeroTopBulletsBundle(data),
    publishedAt:
      typeof data.publishedAt === 'string' ? data.publishedAt : null,
    updatedAt: firestoreUpdatedAt(data.updatedAt),
  }
}

/** Save draft homepage top bullets to Firestore (does not publish the static file). */
export async function saveHeroTopBulletsDraft(
  content: HeroTopBulletsBundle
): Promise<HeroTopBulletsBundle> {
  const normalized = normalizeHeroTopBulletsBundle(content)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HERO_TOP_BULLETS_DOC_ID)
    .set(
      {
        content: normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return normalized
}

function serializeGeneratedFile(payload: PublishedHeroTopBulletsFile): string {
  const json = JSON.stringify(payload, null, 2)
  return `/**
 * PUBLISHED homepage hero top bullets — imported by the public site (no Firestore on first paint).
 * Edit drafts in Admin → CMS → Top Bullets, then click Publish to regenerate this file.
 *
 * Generated at ${payload.publishedAt}
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedHeroTopBulletsFile } from '@/lib/hero-top-bullets'

const published = ${json} as PublishedHeroTopBulletsFile

export const PUBLISHED_HERO_TOP_BULLETS = published

export default published
`
}

/**
 * Write the static generated module and record publishedAt in Firestore.
 * Public pages import this file — never query Firestore for homepage bullets.
 */
export async function publishHeroTopBullets(
  content?: HeroTopBulletsBundle
): Promise<{
  content: HeroTopBulletsBundle
  publishedAt: string
  filePath: string
}> {
  const bundle =
    content != null
      ? normalizeHeroTopBulletsBundle(content)
      : (await fetchHeroTopBulletsDraft()).content

  const publishedAt = new Date().toISOString()
  const payload: PublishedHeroTopBulletsFile = {
    version: 1,
    publishedAt,
    content: bundle,
  }

  await writeGeneratedFile(GENERATED_RELATIVE, serializeGeneratedFile(payload))

  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HERO_TOP_BULLETS_DOC_ID)
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
