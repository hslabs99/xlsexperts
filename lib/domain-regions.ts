/**
 * Production host → market bindings.
 * Middleware and canonical URLs read the published static file — never Firestore.
 */

export type DomainRegionId = 'nz' | 'intl' | 'uk'

export type DomainRegionBinding = {
  /** Apex or other hostnames. www and other subdomains of these still match. */
  hosts: string[]
  /** Canonical origin used in sitemap, JSON-LD, and metadata (https://www.example.com). */
  origin: string
}

export type DomainRegionConfig = {
  nz: DomainRegionBinding
  intl: DomainRegionBinding
  uk: DomainRegionBinding
}

export type PublishedDomainRegionsFile = {
  version: 1
  publishedAt: string
  regions: DomainRegionConfig
}

const REGION_IDS: readonly DomainRegionId[] = ['nz', 'intl', 'uk']

export const DEFAULT_DOMAIN_REGIONS: DomainRegionConfig = {
  nz: {
    hosts: ['xlsexperts.co.nz'],
    origin: 'https://www.xlsexperts.co.nz',
  },
  intl: {
    hosts: ['xlsexperts.com'],
    origin: 'https://www.xlsexperts.com',
  },
  uk: {
    hosts: ['xlsexperts.co.uk'],
    origin: 'https://www.xlsexperts.co.uk',
  },
}

export function cloneDomainRegions(source: DomainRegionConfig): DomainRegionConfig {
  return JSON.parse(JSON.stringify(source)) as DomainRegionConfig
}

export function defaultDomainRegions(): DomainRegionConfig {
  return cloneDomainRegions(DEFAULT_DOMAIN_REGIONS)
}

/** Hostname only, lowercased, no port. Uses the first host if several are listed. */
export function hostnameOnly(host: string): string {
  const first = host.split(',')[0]?.trim() ?? ''
  return first.split(':')[0]?.toLowerCase().trim() ?? ''
}

/**
 * Store apex-style hosts: strip protocol, path, port, and a leading www.
 */
export function normalizeHost(raw: string): string {
  let value = raw.trim().toLowerCase()
  if (!value) return ''
  value = value.replace(/^\s*https?:\/\//, '')
  value = value.split('/')[0] ?? value
  value = value.split(':')[0] ?? value
  value = value.replace(/^\.+|\.+$/g, '')
  if (value.startsWith('www.')) value = value.slice(4)
  return value
}

export function normalizeHosts(raw: unknown): string[] {
  const parts: string[] = []
  if (typeof raw === 'string') {
    parts.push(...raw.split(/[\n,]+/))
  } else if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string') parts.push(...item.split(/[\n,]+/))
    }
  }
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of parts) {
    const host = normalizeHost(part)
    if (!host || seen.has(host)) continue
    seen.add(host)
    out.push(host)
  }
  return out
}

export function normalizeOrigin(raw: string, fallback: string): string {
  const trimmed = raw.trim()
  const candidate = trimmed.includes('://') ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return fallback
    return `${url.protocol}//${url.host}`
  } catch {
    return fallback
  }
}

export function normalizeBinding(
  raw: unknown,
  fallback: DomainRegionBinding
): DomainRegionBinding {
  const data =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const hosts = normalizeHosts(data.hosts)
  const origin = normalizeOrigin(
    typeof data.origin === 'string' ? data.origin : '',
    fallback.origin
  )
  return {
    hosts: hosts.length > 0 ? hosts : [...fallback.hosts],
    origin,
  }
}

export function normalizeDomainRegions(raw: unknown): DomainRegionConfig {
  const defaults = defaultDomainRegions()
  if (!raw || typeof raw !== 'object') return defaults
  const data = raw as Record<string, unknown>
  const regions =
    data.regions && typeof data.regions === 'object'
      ? (data.regions as Record<string, unknown>)
      : data
  return {
    nz: normalizeBinding(regions.nz, defaults.nz),
    intl: normalizeBinding(regions.intl, defaults.intl),
    uk: normalizeBinding(regions.uk, defaults.uk),
  }
}

export function primaryHost(hosts: string[]): string {
  return hosts[0] ?? ''
}

export function hostMatchesDomainList(host: string, domains: string[]): boolean {
  const h = hostnameOnly(host)
  if (!h) return false
  const sorted = [...domains.map(normalizeHost).filter(Boolean)].sort(
    (a, b) => b.length - a.length
  )
  for (const domain of sorted) {
    if (h === domain || h.endsWith(`.${domain}`)) return true
  }
  return false
}

export function resolveMarketFromHost(
  host: string,
  regions: DomainRegionConfig,
  fallback: DomainRegionId = 'nz'
): DomainRegionId {
  const h = hostnameOnly(host)
  if (!h) return fallback

  const bindings: { host: string; market: DomainRegionId }[] = []
  for (const market of REGION_IDS) {
    for (const domain of regions[market].hosts) {
      const normalized = normalizeHost(domain)
      if (normalized) bindings.push({ host: normalized, market })
    }
  }
  bindings.sort((a, b) => b.host.length - a.host.length)
  for (const binding of bindings) {
    if (h === binding.host || h.endsWith(`.${binding.host}`)) {
      return binding.market
    }
  }
  return fallback
}

export function siteOriginsFromRegions(regions: DomainRegionConfig): {
  nz: string
  intl: string
  uk: string
} {
  return {
    nz: regions.nz.origin,
    intl: regions.intl.origin,
    uk: regions.uk.origin,
  }
}
