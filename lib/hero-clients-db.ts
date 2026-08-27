import 'server-only'

import path from 'path'
import { readFile } from 'fs/promises'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  HERO_CLIENTS_DOC_ID,
  SITE_CONTENT_COLLECTION,
} from '@/lib/firebase'
import { writeGeneratedFile, parseGeneratedPublishedJson } from '@/lib/write-generated-file'
import {
  defaultHeroClients,
  normalizeHeroClientFade,
  normalizeHeroClientHeading,
  normalizeHeroClients,
  type HeroClientFade,
  type HeroClientTile,
  type PublishedHeroClientsFile,
} from '@/lib/hero-trust'

const GENERATED_RELATIVE = path.join('data', 'hero-clients.generated.ts')

function shuffleHeroClients(items: HeroClientTile[]): HeroClientTile[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = next[i]
    next[i] = next[j]
    next[j] = current
  }
  return next
}

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

export async function fetchHeroClientsDraft(): Promise<{
  clients: HeroClientTile[]
  fade: HeroClientFade
  heading: string
  publishedAt: string | null
  updatedAt: string | null
}> {
  const snap = await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HERO_CLIENTS_DOC_ID)
    .get()

  if (!snap.exists) {
    return {
      clients: [],
      fade: normalizeHeroClientFade(null),
      heading: normalizeHeroClientHeading(null),
      publishedAt: null,
      updatedAt: null,
    }
  }

  const data = snap.data() as Record<string, unknown>
  return {
    clients: normalizeHeroClients(data),
    fade: normalizeHeroClientFade(data),
    heading: normalizeHeroClientHeading(data),
    publishedAt:
      typeof data.publishedAt === 'string' ? data.publishedAt : null,
    updatedAt: firestoreUpdatedAt(data.updatedAt),
  }
}

export async function saveHeroClientsDraft(
  clients: HeroClientTile[],
  fade?: HeroClientFade,
  heading?: string
): Promise<{
  clients: HeroClientTile[]
  fade: HeroClientFade
  heading: string
}> {
  const draft = await fetchHeroClientsDraft()
  const normalized = normalizeHeroClients({ clients })
  const nextFade = normalizeHeroClientFade(fade ?? draft.fade)
  const nextHeading = normalizeHeroClientHeading(
    heading != null ? { heading } : draft.heading
  )
  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HERO_CLIENTS_DOC_ID)
    .set(
      {
        content: {
          clients: normalized,
          fade: nextFade,
          heading: nextHeading,
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return { clients: normalized, fade: nextFade, heading: nextHeading }
}

function serializeGeneratedFile(payload: PublishedHeroClientsFile): string {
  const json = JSON.stringify(payload, null, 2)
  return `/**
 * PUBLISHED homepage hero clients — imported by the public site (no Firestore on first paint).
 * Edit drafts in Admin → CMS → Client Logos, then click Publish to regenerate this file.
 *
 * Generated at ${payload.publishedAt}
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedHeroClientsFile } from '@/lib/hero-trust'

const published = ${json} as PublishedHeroClientsFile

export const PUBLISHED_HERO_CLIENTS = published

export default published
`
}

export async function publishHeroClients(
  clients?: HeroClientTile[],
  fade?: HeroClientFade,
  heading?: string
): Promise<{
  clients: HeroClientTile[]
  fade: HeroClientFade
  heading: string
  publishedAt: string
  filePath: string
}> {
  const draft = await fetchHeroClientsDraft()
  const incoming =
    clients != null ? normalizeHeroClients({ clients }) : draft.clients
  const nextFade = normalizeHeroClientFade(fade ?? draft.fade)
  const nextHeading = normalizeHeroClientHeading(
    heading != null ? { heading } : draft.heading
  )

  const defaultIds = new Set(defaultHeroClients().map((client) => client.id))
  const looksLikeOriginalTwelve =
    incoming.length > 0 &&
    incoming.length <= defaultHeroClients().length &&
    incoming.every((client) => defaultIds.has(client.id)) &&
    draft.clients.length > incoming.length

  if (looksLikeOriginalTwelve) {
    throw new Error(
      `Publish blocked: this would replace ${draft.clients.length} logos with the original ${incoming.length} enterprise names. Reload Client Logos so the full list is showing, then Publish.`
    )
  }

  if (incoming.length === 0) {
    throw new Error('Publish blocked: there are no client logos to publish.')
  }

  const bundle = shuffleHeroClients(incoming)
  const publishedAt = new Date().toISOString()
  const payload: PublishedHeroClientsFile = {
    version: 1,
    publishedAt,
    content: { clients: bundle, fade: nextFade, heading: nextHeading },
  }

  await writeGeneratedFile(GENERATED_RELATIVE, serializeGeneratedFile(payload))

  const writtenText = await readFile(
    path.join(process.cwd(), GENERATED_RELATIVE),
    'utf8'
  )
  const writtenParsed = parseGeneratedPublishedJson(writtenText)
  const writtenCount = writtenParsed
    ? normalizeHeroClients(writtenParsed).length
    : 0
  if (writtenCount !== bundle.length) {
    throw new Error(
      `Publish wrote ${writtenCount} logos to the homepage file, expected ${bundle.length}.`
    )
  }

  await getAdminDb()
    .collection(SITE_CONTENT_COLLECTION)
    .doc(HERO_CLIENTS_DOC_ID)
    .set(
      {
        content: {
          clients: bundle,
          fade: nextFade,
          heading: nextHeading,
        },
        publishedAt,
        updatedAt: publishedAt,
      },
      { merge: true }
    )

  return {
    clients: bundle,
    fade: nextFade,
    heading: nextHeading,
    publishedAt,
    filePath: GENERATED_RELATIVE,
  }
}
