import 'server-only'

import path from 'path'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  HERO_PROJECTS_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import { writeGeneratedFile } from '@/lib/write-generated-file'
import {
  defaultHeroProjects,
  normalizeHeroProjects,
  type HeroProjectTile,
  type PublishedHeroProjectsFile,
} from '@/lib/hero-trust'

const GENERATED_RELATIVE = path.join('data', 'hero-projects.generated.ts')

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

export async function fetchHeroProjectsDraft(): Promise<{
  projects: HeroProjectTile[]
  publishedAt: string | null
  updatedAt: string | null
}> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HERO_PROJECTS_DOC_ID)
    .get()

  if (!snap.exists) {
    return {
      projects: defaultHeroProjects(),
      publishedAt: null,
      updatedAt: null,
    }
  }

  const data = snap.data() as Record<string, unknown>
  return {
    projects: normalizeHeroProjects(data),
    publishedAt:
      typeof data.publishedAt === 'string' ? data.publishedAt : null,
    updatedAt: firestoreUpdatedAt(data.updatedAt),
  }
}

export async function saveHeroProjectsDraft(
  projects: HeroProjectTile[]
): Promise<HeroProjectTile[]> {
  const normalized = normalizeHeroProjects({ projects })
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HERO_PROJECTS_DOC_ID)
    .set(
      {
        content: { projects: normalized },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return normalized
}

function serializeGeneratedFile(payload: PublishedHeroProjectsFile): string {
  const json = JSON.stringify(payload, null, 2)
  return `/**
 * PUBLISHED homepage hero common projects — imported by the public site (no Firestore on first paint).
 * Edit drafts in Admin → CMS → Common Projects, then click Publish to regenerate this file.
 *
 * Generated at ${payload.publishedAt}
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedHeroProjectsFile } from '@/lib/hero-trust'

const published = ${json} as PublishedHeroProjectsFile

export const PUBLISHED_HERO_PROJECTS = published

export default published
`
}

export async function publishHeroProjects(
  projects?: HeroProjectTile[]
): Promise<{
  projects: HeroProjectTile[]
  publishedAt: string
  filePath: string
}> {
  const bundle =
    projects != null
      ? normalizeHeroProjects({ projects })
      : (await fetchHeroProjectsDraft()).projects

  const publishedAt = new Date().toISOString()
  const payload: PublishedHeroProjectsFile = {
    version: 1,
    publishedAt,
    content: { projects: bundle },
  }

  await writeGeneratedFile(GENERATED_RELATIVE, serializeGeneratedFile(payload))

  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HERO_PROJECTS_DOC_ID)
    .set(
      {
        content: { projects: bundle },
        publishedAt,
        updatedAt: publishedAt,
      },
      { merge: true }
    )

  return { projects: bundle, publishedAt, filePath: GENERATED_RELATIVE }
}
