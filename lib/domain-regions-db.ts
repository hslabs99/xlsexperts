import 'server-only'

import path from 'path'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  DOMAIN_REGIONS_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import {
  defaultDomainRegions,
  normalizeDomainRegions,
  siteOriginsFromRegions,
  type DomainRegionConfig,
  type PublishedDomainRegionsFile,
} from '@/lib/domain-regions'
import { patchPublishedSiteOrigins } from '@/lib/market-copy-db'
import { writeGeneratedFile } from '@/lib/write-generated-file'

const GENERATED_RELATIVE = path.join('data', 'domain-regions.generated.ts')

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

/**
 * Load draft domain bindings from Firestore.
 * Falls back to built-in NZ / UK / International hosts if missing.
 */
export async function fetchDomainRegionsDraft(): Promise<{
  regions: DomainRegionConfig
  publishedAt: string | null
  updatedAt: string | null
}> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(DOMAIN_REGIONS_DOC_ID)
    .get()

  if (!snap.exists) {
    return {
      regions: defaultDomainRegions(),
      publishedAt: null,
      updatedAt: null,
    }
  }

  const data = snap.data() as Record<string, unknown>
  return {
    regions: normalizeDomainRegions(data),
    publishedAt: typeof data.publishedAt === 'string' ? data.publishedAt : null,
    updatedAt: firestoreUpdatedAt(data.updatedAt),
  }
}

export async function saveDomainRegionsDraft(
  regions: DomainRegionConfig
): Promise<DomainRegionConfig> {
  const normalized = normalizeDomainRegions(regions)
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(DOMAIN_REGIONS_DOC_ID)
    .set(
      {
        regions: normalized,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return normalized
}

function serializeGeneratedFile(payload: PublishedDomainRegionsFile): string {
  const json = JSON.stringify(payload, null, 2)
  return `/**
 * PUBLISHED domain → region bindings — imported by proxy (no Firestore).
 * Edit in Admin → Settings → Domains, then click Publish to regenerate this file.
 *
 * Generated at ${payload.publishedAt}
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedDomainRegionsFile } from '@/lib/domain-regions'

const published = ${json} as PublishedDomainRegionsFile

export const PUBLISHED_DOMAIN_REGIONS = published

export default published
`
}

/**
 * Write the static generated module, record publishedAt, and sync canonical
 * origins into market copy so Marketing cannot overwrite them from CMS.
 */
export async function publishDomainRegions(
  regions?: DomainRegionConfig
): Promise<{
  regions: DomainRegionConfig
  publishedAt: string
  filePath: string
}> {
  const bundle =
    regions != null
      ? normalizeDomainRegions(regions)
      : (await fetchDomainRegionsDraft()).regions

  const publishedAt = new Date().toISOString()
  const payload: PublishedDomainRegionsFile = {
    version: 1,
    publishedAt,
    regions: bundle,
  }

  await writeGeneratedFile(GENERATED_RELATIVE, serializeGeneratedFile(payload))

  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(DOMAIN_REGIONS_DOC_ID)
    .set(
      {
        regions: bundle,
        publishedAt,
        updatedAt: publishedAt,
      },
      { merge: true }
    )

  await patchPublishedSiteOrigins(siteOriginsFromRegions(bundle))

  return { regions: bundle, publishedAt, filePath: GENERATED_RELATIVE }
}
