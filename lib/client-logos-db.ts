/**
 * Firestore CRUD for the client logo harvest master list.
 * Server/CLI only.
 */

import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { CLIENT_LOGOS_COLLECTION } from '@/lib/firebase'
import {
  isClientLogoStatus,
  parsePastedDomains,
  type ClientLogoImportResult,
  type ClientLogoRecord,
  type LogoCandidate,
  type LogoCandidateSource,
} from '@/lib/client-logos'

const IMPORT_CHUNK = 100

function tsToIso(value: unknown): string | null {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString()
    } catch {
      return null
    }
  }
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return null
}

function mapCandidate(raw: unknown): LogoCandidate | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const sourceUrl = String(row.sourceUrl ?? '').trim()
  const storedUrl = String(row.storedUrl ?? '').trim()
  if (!sourceUrl && !storedUrl) return null
  const source = String(row.source ?? 'other') as LogoCandidateSource
  const allowed: LogoCandidateSource[] = [
    'img-logo',
    'json-ld',
    'og-image',
    'apple-touch',
    'favicon',
    'other',
  ]
  return {
    source: allowed.includes(source) ? source : 'other',
    sourceUrl,
    score: typeof row.score === 'number' ? row.score : 0,
    storedUrl,
    width: typeof row.width === 'number' ? row.width : 0,
    height: typeof row.height === 'number' ? row.height : 0,
  }
}

function mapRecord(id: string, data: Record<string, unknown>): ClientLogoRecord {
  const status = isClientLogoStatus(data.status) ? data.status : 'pending'
  const candidates = Array.isArray(data.candidates)
    ? data.candidates
        .map(mapCandidate)
        .filter((row): row is LogoCandidate => Boolean(row))
    : []
  const selected =
    typeof data.selectedCandidateIndex === 'number'
      ? data.selectedCandidateIndex
      : 0

  return {
    id,
    host: String(data.host ?? id),
    url: String(data.url ?? ''),
    displayName: String(data.displayName ?? ''),
    status,
    candidates,
    selectedCandidateIndex: Math.max(0, selected),
    logoUrl: String(data.logoUrl ?? ''),
    lastError: String(data.lastError ?? ''),
    lastHttpStatus:
      typeof data.lastHttpStatus === 'number' ? data.lastHttpStatus : null,
    lastHarvestedAt: tsToIso(data.lastHarvestedAt),
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
  }
}

function collection() {
  return getAdminDb().collection(CLIENT_LOGOS_COLLECTION)
}

export async function listClientLogos(): Promise<ClientLogoRecord[]> {
  const snap = await collection().get()
  const items = snap.docs.map((d) =>
    mapRecord(d.id, d.data() as Record<string, unknown>)
  )
  items.sort((a, b) =>
    (a.displayName || a.host).localeCompare(b.displayName || b.host)
  )
  return items
}

export async function getClientLogo(
  id: string
): Promise<ClientLogoRecord | null> {
  const snap = await collection().doc(id).get()
  if (!snap.exists) return null
  return mapRecord(snap.id, snap.data() as Record<string, unknown>)
}

export async function importClientLogoUrls(
  raw: string
): Promise<ClientLogoImportResult> {
  const { parsed, invalid } = parsePastedDomains(raw)
  if (parsed.length > 2000) {
    throw new Error('Paste at most 2000 rows at a time')
  }

  const addedHosts: string[] = []
  const skippedHosts: string[] = []
  const db = getAdminDb()

  for (let i = 0; i < parsed.length; i += IMPORT_CHUNK) {
    const chunk = parsed.slice(i, i + IMPORT_CHUNK)
    const refs = chunk.map((site) => collection().doc(site.id))
    const snaps = refs.length ? await db.getAll(...refs) : []
    const batch = db.batch()
    let writes = 0

    chunk.forEach((site, index) => {
      const snap = snaps[index]
      if (snap?.exists) {
        skippedHosts.push(site.host)
        return
      }
      batch.set(refs[index], {
        host: site.host,
        url: site.url,
        displayName: site.displayName,
        status: 'pending',
        candidates: [],
        selectedCandidateIndex: 0,
        logoUrl: '',
        lastError: '',
        lastHttpStatus: null,
        lastHarvestedAt: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      writes += 1
      addedHosts.push(site.host)
    })

    if (writes > 0) await batch.commit()
  }

  return {
    added: addedHosts.length,
    skipped: skippedHosts.length,
    invalid,
    addedHosts,
    skippedHosts,
  }
}

export async function updateClientLogo(
  id: string,
  fields: Record<string, unknown>
): Promise<void> {
  await collection()
    .doc(id)
    .set(
      {
        ...fields,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
}

export async function saveClientLogoCandidate(
  id: string,
  candidateIndex: number
): Promise<ClientLogoRecord> {
  const row = await getClientLogo(id)
  if (!row) throw new Error('URL is not in the master list')
  const candidate = row.candidates[candidateIndex]
  if (!candidate?.storedUrl) {
    throw new Error('Harvest this URL first, then pick a thumbnail to save')
  }
  await updateClientLogo(id, {
    selectedCandidateIndex: candidateIndex,
    logoUrl: candidate.storedUrl,
    status: 'saved',
    lastError: '',
  })
  const saved = await getClientLogo(id)
  if (!saved) throw new Error('Saved logo could not be reloaded')
  return saved
}

export async function deleteClientLogos(ids: string[]): Promise<number> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
  if (!unique.length) return 0
  const db = getAdminDb()
  for (let i = 0; i < unique.length; i += IMPORT_CHUNK) {
    const chunk = unique.slice(i, i + IMPORT_CHUNK)
    const batch = db.batch()
    for (const id of chunk) {
      batch.delete(collection().doc(id))
    }
    await batch.commit()
  }
  return unique.length
}
