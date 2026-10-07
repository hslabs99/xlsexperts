/**
 * Region word aliases.
 *
 * Source copy is still largely written for New Zealand. Each alias is the
 * NZ word or phrase, plus the text to show on the UK site and on the
 * international site. An empty replacement leaves that word unchanged.
 *
 * Public pages apply the published list. Localhost previews the Firebase
 * draft for content read live from Firestore.
 */

import type { MarketId } from '@/lib/market'

export type RegionAliasMatch = 'word' | 'phrase'

export type RegionAlias = {
  id: string
  /** NZ source term, matched without regard to case. */
  term: string
  /** Word: stands alone. Phrase: may include spaces. Both avoid matching inside a longer word. */
  match: RegionAliasMatch
  /** United Kingdom (.co.uk). Blank = keep the NZ term. */
  uk: string
  /** International / US (.com). Blank = keep the NZ term. */
  intl: string
  enabled: boolean
}

export type PublishedRegionAliasesFile = {
  version: 1
  publishedAt: string | null
  aliases: RegionAlias[]
}

export const REGION_ALIAS_TERM_MAX = 80
export const REGION_ALIAS_REPLACEMENT_MAX = 120
export const REGION_ALIAS_MAX_ROWS = 200

/**
 * Starting dictionary. Longer phrases are listed first so they win over
 * the shorter word (New Zealand GST before GST).
 */
export function defaultRegionAliases(): RegionAlias[] {
  return [
    {
      id: 'new-zealand-gst',
      term: 'New Zealand GST',
      match: 'phrase',
      uk: 'UK VAT',
      intl: 'global sales tax',
      enabled: true,
    },
    {
      id: 'gst',
      term: 'GST',
      match: 'word',
      uk: 'VAT',
      intl: 'sales tax',
      enabled: true,
    },
    {
      id: 'xero',
      term: 'Xero',
      match: 'word',
      uk: '',
      intl: 'QuickBooks',
      enabled: true,
    },
  ]
}

export function newRegionAliasId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `alias-${Math.random().toString(36).slice(2, 10)}`
}

export function emptyRegionAlias(): RegionAlias {
  return {
    id: newRegionAliasId(),
    term: '',
    match: 'word',
    uk: '',
    intl: '',
    enabled: true,
  }
}

function clip(value: string, max: number): string {
  const trimmed = value.trim()
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed
}

export function normalizeRegionAlias(raw: unknown, index: number): RegionAlias | null {
  if (!raw || typeof raw !== 'object') return null
  const rec = raw as Record<string, unknown>
  const term = clip(typeof rec.term === 'string' ? rec.term : '', REGION_ALIAS_TERM_MAX)
  if (term.length < 2) return null
  const match: RegionAliasMatch =
    rec.match === 'phrase' || /\s/.test(term) ? 'phrase' : 'word'
  const id =
    typeof rec.id === 'string' && rec.id.trim()
      ? rec.id.trim().slice(0, 80)
      : `alias-${index + 1}`
  return {
    id,
    term,
    match,
    uk: clip(typeof rec.uk === 'string' ? rec.uk : '', REGION_ALIAS_REPLACEMENT_MAX),
    intl: clip(
      typeof rec.intl === 'string' ? rec.intl : '',
      REGION_ALIAS_REPLACEMENT_MAX
    ),
    enabled: rec.enabled !== false,
  }
}

/** Drop blanks and duplicate terms (first row wins). */
export function normalizeRegionAliases(raw: unknown): RegionAlias[] {
  if (!Array.isArray(raw)) return defaultRegionAliases()
  const next: RegionAlias[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (next.length >= REGION_ALIAS_MAX_ROWS) break
    const alias = normalizeRegionAlias(item, next.length)
    if (!alias) continue
    const key = alias.term.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    next.push(alias)
  }
  return next
}

export function aliasesFromPublished(file: {
  aliases?: unknown
} | null | undefined): RegionAlias[] {
  if (!file || !Array.isArray(file.aliases)) return defaultRegionAliases()
  return normalizeRegionAliases(file.aliases)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replacementFor(alias: RegionAlias, market: MarketId): string | null {
  if (!alias.enabled || market === 'nz') return null
  const value = (market === 'uk' ? alias.uk : alias.intl).trim()
  if (!value) return null
  if (value.toLowerCase() === alias.term.toLowerCase()) return null
  return value
}

/**
 * Swap NZ terms for the host market. Replacements are inserted as written.
 * Matching ignores case. Longer terms run first.
 */
export function applyRegionAliases(
  text: string,
  market: MarketId,
  aliases: readonly RegionAlias[]
): string {
  if (market === 'nz' || !text || !aliases.length) return text
  const active = aliases
    .map((alias) => ({ alias, replacement: replacementFor(alias, market) }))
    .filter(
      (row): row is { alias: RegionAlias; replacement: string } =>
        row.replacement != null
    )
    .sort((a, b) => b.alias.term.length - a.alias.term.length)
  if (active.length === 0) return text

  const urls: string[] = []
  const shielded = text.replace(/https?:\/\/[^\s<>"')]+/gi, (url) => {
    const token = `\u0000U${urls.length}\u0000`
    urls.push(url)
    return token
  })

  let out = shielded
  for (const { alias, replacement } of active) {
    const pattern = new RegExp(
      `(?<![A-Za-z0-9])${escapeRegExp(alias.term)}(?![A-Za-z0-9])`,
      'gi'
    )
    out = out.replace(pattern, replacement)
  }

  if (urls.length === 0) return out
  return out.replace(/\u0000U(\d+)\u0000/g, (_, index: string) => {
    return urls[Number(index)] ?? ''
  })
}

const ALIAS_SKIP_KEYS = new Set([
  'href',
  'slug',
  'id',
  'path',
  'icon',
  'image',
  'src',
  'url',
  'logo',
  'iconSrc',
  'logoSrc',
  'ogImage',
  'twitterImage',
  'origin',
  'htmlLang',
  'ogLocale',
  'phoneTel',
  'phoneDisplay',
  'whatsapp',
  'email',
  'color',
  'abbr',
  'serviceHrefs',
  'serviceSlugs',
  'solutionSlugs',
  'hosts',
  'kind',
  'type',
  'date',
  'author',
  'readTime',
  'client',
  'name',
  'schemaAddressCountry',
  'canonical',
  'visibleOn',
  'primaryRegion',
])

function skipAliasKey(key: string): boolean {
  if (ALIAS_SKIP_KEYS.has(key)) return true
  return /(?:Href|Src|Url|Tel)$/.test(key)
}

/** Rewrite visitor-facing strings. Identifiers, URLs, phones, and client names stay put. */
export function applyRegionAliasesToValue<T>(
  value: T,
  market: MarketId,
  aliases: readonly RegionAlias[]
): T {
  if (market === 'nz' || value == null) return value
  if (typeof value === 'string') {
    return applyRegionAliases(value, market, aliases) as T
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      applyRegionAliasesToValue(item, market, aliases)
    ) as T
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      out[key] = skipAliasKey(key)
        ? child
        : applyRegionAliasesToValue(child, market, aliases)
    }
    return out as T
  }
  return value
}
