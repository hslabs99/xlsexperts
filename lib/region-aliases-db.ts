import 'server-only'

import path from 'path'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  REGION_ALIASES_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import {
  defaultRegionAliases,
  normalizeRegionAliases,
  type PublishedRegionAliasesFile,
  type RegionAlias,
} from '@/lib/region-aliases'
import { writeGeneratedFile } from '@/lib/write-generated-file'

const GENERATED_RELATIVE = path.join('data', 'region-aliases.generated.ts')

function firestoreUpdatedAt(raw: unknown): string | null {
  if (raw && typeof raw === 'object' && 'toDate' in raw) {
    try {
      return (raw as { toDate: () => Date }).toDate().toISOString()
    } catch {
      return null
    }
  }
  if (typeof raw === 'string') return raw
  return null
}

export async function fetchRegionAliasesDraft(): Promise<{
  aliases: RegionAlias[]
  publishedAt: string | null
  updatedAt: string | null
}> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(REGION_ALIASES_DOC_ID)
    .get()

  if (!snap.exists) {
    return {
      aliases: defaultRegionAliases(),
      publishedAt: null,
      updatedAt: null,
    }
  }

  const data = snap.data() as Record<string, unknown>
  const aliases = Array.isArray(data.aliases)
    ? normalizeRegionAliases(data.aliases)
    : defaultRegionAliases()
  return {
    aliases,
    publishedAt: typeof data.publishedAt === 'string' ? data.publishedAt : null,
    updatedAt: firestoreUpdatedAt(data.updatedAt),
  }
}

export async function saveRegionAliasesDraft(
  aliases: RegionAlias[]
): Promise<RegionAlias[]> {
  const normalized = normalizeRegionAliases(aliases)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(REGION_ALIASES_DOC_ID)
    .set(
      {
        aliases: normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return normalized
}

function serializeGeneratedFile(payload: PublishedRegionAliasesFile): string {
  const json = JSON.stringify(payload, null, 2)
  return `/**
 * PUBLISHED region word aliases — applied when serving UK and International copy.
 * Edit in Admin → CMS → Aliases, then click Publish to regenerate this file.
 *
 * Generated at ${payload.publishedAt}
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedRegionAliasesFile } from '@/lib/region-aliases'

const published = ${json} as PublishedRegionAliasesFile

export const PUBLISHED_REGION_ALIASES = published

export default published
`
}

export async function publishRegionAliases(aliases?: RegionAlias[]): Promise<{
  aliases: RegionAlias[]
  publishedAt: string
  filePath: string
}> {
  const bundle =
    aliases != null
      ? normalizeRegionAliases(aliases)
      : (await fetchRegionAliasesDraft()).aliases

  const publishedAt = new Date().toISOString()
  const payload: PublishedRegionAliasesFile = {
    version: 1,
    publishedAt,
    aliases: bundle,
  }

  await writeGeneratedFile(GENERATED_RELATIVE, serializeGeneratedFile(payload))

  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(REGION_ALIASES_DOC_ID)
    .set(
      {
        aliases: bundle,
        publishedAt,
        updatedAt: publishedAt,
      },
      { merge: true }
    )

  return { aliases: bundle, publishedAt, filePath: GENERATED_RELATIVE }
}
