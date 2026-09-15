/**
 * Homepage “What we do” featured service tiles.
 * Public pages read the published static file — never Firestore.
 */

import {
  DEFAULT_MARKET,
  MARKET_IDS,
  isMarketId,
  type MarketId,
} from '@/lib/market'
import {
  ALL_SERVICES_HREF,
  canonicalizeServiceHref,
  getServiceByHref,
  homeServicePages,
  isServiceIconKey,
  servicePages,
  type ServiceIconKey,
  type ServicePage,
} from '@/lib/service-pages'

export const HOME_SERVICES_MIN_TILES = 4
export const HOME_SERVICES_MAX_TILES = 8

export const SERVICE_ICON_LABELS: Record<ServiceIconKey, string> = {
  spreadsheet: 'Spreadsheet',
  dashboard: 'Dashboard',
  vba: 'VBA',
  macro: 'Macro',
  integrations: 'Integrations',
  sql: 'SQL',
  enterprise: 'Enterprise',
  web: 'Web app',
  financial: 'Financial',
  process: 'Process',
  ai: 'AI',
  sheets: 'Google Sheets',
  powerQuery: 'Power Query',
  powerApps: 'Power Apps',
  audit: 'Audit',
  migration: 'Migration',
}

export type HomeServiceTile = {
  href: string
  title: string
  description: string
  tags: string[]
  icon: ServiceIconKey
}

export type HomeServicesContent = {
  eyebrow: string
  heading: string
  intro: string
  viewAllLabel: string
  viewAllHref: string
  useCasesLabel: string
  useCasesHref: string
  ctaPrompt: string
  ctaLabel: string
  ctaHref: string
  tiles: HomeServiceTile[]
}

export type HomeServicesBundle = Record<MarketId, HomeServicesContent>

export type PublishedHomeServicesFile = {
  version: 1 | 2
  publishedAt: string
  content: HomeServicesBundle
}

export function tileFromServicePage(page: ServicePage): HomeServiceTile {
  return {
    href: page.href,
    title: page.title,
    description: page.description,
    tags: [...page.tags],
    icon: page.icon,
  }
}

/** Exact replica of the homepage section as it shipped before CMS. */
function withMarketDefaultTiles(
  content: HomeServicesContent,
  market: MarketId
): HomeServicesContent {
  if (market === 'nz') return content
  return {
    ...content,
    tiles: content.tiles.map((tile) => {
      if (tile.href !== '/web-applications') return tile
      return {
        ...tile,
        description:
          market === 'uk'
            ? 'Custom web application development for UK businesses—secure multi-user cloud apps, customer portals, field systems, hybrid Excel solutions and SaaS platforms.'
            : 'Custom web application development for businesses worldwide—secure multi-user cloud apps, customer portals, field systems, hybrid Excel solutions and SaaS platforms.',
      }
    }),
  }
}

export function cloneHomeServicesContent(
  content: HomeServicesContent
): HomeServicesContent {
  return {
    ...content,
    tiles: content.tiles.map((tile) => ({
      ...tile,
      tags: [...tile.tags],
    })),
  }
}

export function defaultHomeServicesContent(
  market: MarketId = DEFAULT_MARKET
): HomeServicesContent {
  const base: HomeServicesContent = {
    eyebrow: 'What we do',
    heading: 'Services',
    intro:
      'Whether you need a quick formula fix or a full enterprise application, we have the expertise to deliver it — on time, on budget, and built to last.',
    viewAllLabel: 'View all services',
    viewAllHref: ALL_SERVICES_HREF,
    useCasesLabel: 'A.I. use cases for Excel',
    useCasesHref: '/use-cases',
    ctaPrompt: 'Not sure which service fits your need?',
    ctaLabel: 'Book a free discovery call',
    ctaHref: '#contact',
    tiles: homeServicePages.map(tileFromServicePage),
  }
  return withMarketDefaultTiles(base, market)
}

export function defaultHomeServicesBundle(): HomeServicesBundle {
  return {
    nz: defaultHomeServicesContent('nz'),
    intl: defaultHomeServicesContent('intl'),
    uk: defaultHomeServicesContent('uk'),
  }
}

function asTrimmedString(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

function asOptionalHref(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

function parseTags(value: unknown, fallback: readonly string[]): string[] {
  if (Array.isArray(value)) {
    const tags = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
    return tags.length > 0 ? tags : [...fallback]
  }
  if (typeof value === 'string') {
    const tags = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    return tags.length > 0 ? tags : [...fallback]
  }
  return [...fallback]
}

function parseTile(value: unknown): HomeServiceTile | null {
  if (!value || typeof value !== 'object') return null
  const rec = value as Record<string, unknown>
  const hrefRaw = typeof rec.href === 'string' ? rec.href : ''
  const href = canonicalizeServiceHref(hrefRaw)
  const page = getServiceByHref(href)
  if (!page) return null

  return {
    href: page.href,
    title: asTrimmedString(rec.title, page.title),
    description: asTrimmedString(rec.description, page.description),
    tags: parseTags(rec.tags, page.tags),
    icon: typeof rec.icon === 'string' && isServiceIconKey(rec.icon)
      ? rec.icon
      : page.icon,
  }
}

function fillToMinimum(tiles: HomeServiceTile[]): HomeServiceTile[] {
  if (tiles.length >= HOME_SERVICES_MIN_TILES) return tiles
  const seen = new Set(tiles.map((tile) => tile.href))
  const next = [...tiles]
  for (const page of [...homeServicePages, ...servicePages]) {
    if (next.length >= HOME_SERVICES_MIN_TILES) break
    if (seen.has(page.href)) continue
    seen.add(page.href)
    next.push(tileFromServicePage(page))
  }
  return next
}

function looksLikeSingleContent(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false
  const rec = raw as Record<string, unknown>
  return (
    Array.isArray(rec.tiles) ||
    typeof rec.eyebrow === 'string' ||
    typeof rec.heading === 'string'
  )
}

function looksLikeBundle(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false
  const rec = raw as Record<string, unknown>
  return MARKET_IDS.some(
    (id) => rec[id] != null && typeof rec[id] === 'object' && !Array.isArray(rec[id])
  )
}

function unwrapHomeServicesPayload(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const rec = raw as Record<string, unknown>
  if (looksLikeBundle(rec.content)) return rec.content
  if (looksLikeBundle(rec.markets)) return rec.markets
  if (looksLikeBundle(rec)) return rec
  if (looksLikeSingleContent(rec.content)) return rec.content
  return rec
}

export function normalizeHomeServicesBundle(raw: unknown): HomeServicesBundle {
  const inner = unwrapHomeServicesPayload(raw)
  const rec =
    inner && typeof inner === 'object' && !Array.isArray(inner)
      ? (inner as Record<string, unknown>)
      : {}

  if (looksLikeBundle(rec)) {
    const fallbackSource =
      rec.nz ?? rec.intl ?? rec.uk ?? defaultHomeServicesContent()
    const fallback = normalizeHomeServicesContent(fallbackSource)
    const bundle = {} as HomeServicesBundle
    for (const market of MARKET_IDS) {
      bundle[market] = rec[market]
        ? normalizeHomeServicesContent(rec[market])
        : cloneHomeServicesContent(fallback)
    }
    return bundle
  }

  const shared = normalizeHomeServicesContent(
    looksLikeSingleContent(rec) ? rec : raw
  )
  return {
    nz: cloneHomeServicesContent(shared),
    intl: withMarketDefaultTiles(cloneHomeServicesContent(shared), 'intl'),
    uk: withMarketDefaultTiles(cloneHomeServicesContent(shared), 'uk'),
  }
}

export function pickHomeServices(
  bundle: HomeServicesBundle,
  market: MarketId | string | null | undefined
): HomeServicesContent {
  const id = isMarketId(market) ? market : DEFAULT_MARKET
  return bundle[id] ?? defaultHomeServicesContent()
}

export function homeServiceTileText(tile: HomeServiceTile): string {
  return [tile.title, tile.description, tile.tags.join(' ')].join('\n')
}

export function homeServicesContentText(content: HomeServicesContent): string {
  return [
    content.eyebrow,
    content.heading,
    content.intro,
    content.viewAllLabel,
    content.useCasesLabel,
    content.ctaPrompt,
    content.ctaLabel,
    ...content.tiles.map(homeServiceTileText),
  ].join('\n')
}

/**
 * Coerce Firestore / generated payloads into a valid homepage section.
 * Unknown service hrefs are dropped; count is clamped to 4–8.
 */
export function normalizeHomeServicesContent(
  raw: unknown
): HomeServicesContent {
  const defaults = defaultHomeServicesContent()
  const wrapper =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const source =
    wrapper.content && typeof wrapper.content === 'object'
      ? (wrapper.content as Record<string, unknown>)
      : wrapper

  const seen = new Set<string>()
  const parsed: HomeServiceTile[] = []
  const tilesRaw = Array.isArray(source.tiles) ? source.tiles : []
  for (const item of tilesRaw) {
    if (parsed.length >= HOME_SERVICES_MAX_TILES) break
    const tile = parseTile(item)
    if (!tile || seen.has(tile.href)) continue
    seen.add(tile.href)
    parsed.push(tile)
  }

  const tiles = fillToMinimum(parsed)
  if (tiles.length === 0) return defaults

  return {
    eyebrow: asTrimmedString(source.eyebrow, defaults.eyebrow),
    heading: asTrimmedString(source.heading, defaults.heading),
    intro: asTrimmedString(source.intro, defaults.intro),
    viewAllLabel: asTrimmedString(source.viewAllLabel, defaults.viewAllLabel),
    viewAllHref: asOptionalHref(source.viewAllHref, defaults.viewAllHref),
    useCasesLabel: asTrimmedString(
      source.useCasesLabel,
      defaults.useCasesLabel
    ),
    useCasesHref: asOptionalHref(source.useCasesHref, defaults.useCasesHref),
    ctaPrompt: asTrimmedString(source.ctaPrompt, defaults.ctaPrompt),
    ctaLabel: asTrimmedString(source.ctaLabel, defaults.ctaLabel),
    ctaHref: asOptionalHref(source.ctaHref, defaults.ctaHref),
    tiles,
  }
}

export function unusedServicePages(
  tiles: readonly HomeServiceTile[]
): ServicePage[] {
  const used = new Set(tiles.map((tile) => tile.href))
  return servicePages.filter((page) => !used.has(page.href))
}
