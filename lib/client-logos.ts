/**
 * Client-safe types and paste/normalise helpers for the logo harvest list.
 * Doc id = registrable host without leading www (e.g. aoteaelectric.co.nz).
 */

export const CLIENT_LOGO_STATUSES = [
  'pending',
  'harvested',
  'saved',
  'failed',
] as const

export type ClientLogoStatus = (typeof CLIENT_LOGO_STATUSES)[number]

export type LogoCandidateSource =
  | 'img-logo'
  | 'json-ld'
  | 'og-image'
  | 'apple-touch'
  | 'favicon'
  | 'other'

export type LogoCandidate = {
  source: LogoCandidateSource
  sourceUrl: string
  score: number
  storedUrl: string
  width: number
  height: number
}

export type ClientLogoRecord = {
  id: string
  host: string
  url: string
  displayName: string
  status: ClientLogoStatus
  candidates: LogoCandidate[]
  selectedCandidateIndex: number
  logoUrl: string
  lastError: string
  lastHttpStatus: number | null
  lastHarvestedAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type NormalizedClientSite = {
  id: string
  host: string
  url: string
  displayName: string
}

export type ClientLogoImportResult = {
  added: number
  skipped: number
  invalid: string[]
  addedHosts: string[]
  skippedHosts: string[]
}

export function isClientLogoStatus(value: unknown): value is ClientLogoStatus {
  return (
    typeof value === 'string' &&
    (CLIENT_LOGO_STATUSES as readonly string[]).includes(value)
  )
}

function stripWrapQuotes(value: string): string {
  const t = value.trim()
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).trim()
  }
  return t
}

/**
 * One domain / URL per token. Host without www is the unique key.
 * Path, query, and hash are dropped — we always harvest the origin homepage.
 */
export function normalizeClientSite(
  input: string
): NormalizedClientSite | null {
  let raw = stripWrapQuotes(input)
  if (!raw) return null
  raw = raw.replace(/[,;]+$/g, '').trim()
  if (!raw || raw.startsWith('#') || raw.includes('@')) return null

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
    raw = `https://${raw}`
  }

  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return null
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null

  const hostname = parsed.hostname.replace(/\.$/, '').toLowerCase()
  if (!hostname) return null
  if (!hostname.includes('.') && hostname !== 'localhost') return null

  const host = hostname.replace(/^www\./, '')
  if (!host) return null

  return {
    id: host,
    host,
    url: `https://${hostname}`,
    displayName: '',
  }
}

function looksLikeUrlOrDomain(value: string): boolean {
  const raw = stripWrapQuotes(value).replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
  if (!raw || raw.includes(' ') || raw.includes('@')) return false
  const host = raw.split('/')[0]?.replace(/^www\./i, '') ?? ''
  return host.includes('.') || host === 'localhost'
}

function isHeaderRow(name: string, url: string): boolean {
  const n = name.trim().toLowerCase()
  const u = url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
  return (
    /^(company(\s*name)?|client(\s*name)?|name|organisation|organization)$/.test(
      n
    ) && /^(url|website|web\s*site|domain|site)$/.test(u)
  )
}

function splitNameUrlLine(
  line: string
): { name: string; url: string } | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return null

  if (trimmed.includes('\t')) {
    const [namePart, ...rest] = trimmed.split('\t')
    return {
      name: stripWrapQuotes(namePart),
      url: stripWrapQuotes(rest.join(' ').trim()),
    }
  }

  if (trimmed.includes('|')) {
    const i = trimmed.indexOf('|')
    return {
      name: stripWrapQuotes(trimmed.slice(0, i)),
      url: stripWrapQuotes(trimmed.slice(i + 1)),
    }
  }

  const lastComma = trimmed.lastIndexOf(',')
  if (lastComma > 0) {
    const name = stripWrapQuotes(trimmed.slice(0, lastComma))
    const url = stripWrapQuotes(trimmed.slice(lastComma + 1))
    if (name && looksLikeUrlOrDomain(url)) return { name, url }
  }

  return null
}

/**
 * Two-column paste: company name, then URL.
 * Excel copy (tab-separated) is the main format. Pipes and name,url CSV also work.
 * Unique key is the host without www.
 */
export function parsePastedDomains(raw: string): {
  parsed: NormalizedClientSite[]
  invalid: string[]
} {
  const seen = new Set<string>()
  const parsed: NormalizedClientSite[] = []
  const invalid: string[] = []

  const lines = String(raw || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    const split = splitNameUrlLine(line)
    if (!split) {
      invalid.push(line)
      continue
    }
    const name = split.name.replace(/\s+/g, ' ').trim()
    if (!name) {
      invalid.push(line)
      continue
    }
    if (isHeaderRow(name, split.url)) continue
    const site = normalizeClientSite(split.url)
    if (!site) {
      invalid.push(line)
      continue
    }
    if (seen.has(site.id)) continue
    seen.add(site.id)
    parsed.push({ ...site, displayName: name })
  }

  return { parsed, invalid }
}

export function storageSlugForHost(host: string): string {
  const slug = host
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'site'
}
