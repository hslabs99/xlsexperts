/**
 * Homepage hero checklist (“top bullets”).
 * Admin drafts live in Firestore; Publish writes a generated file that the
 * public homepage imports — no database read on first paint.
 */

import {
  DEFAULT_MARKET,
  MARKET_IDS,
  isMarketId,
  type MarketId,
} from '@/lib/market'
import { uniqueHeroId } from '@/lib/hero-trust'

export const HERO_TOP_BULLETS_MIN = 3
export const HERO_TOP_BULLETS_MAX = 5

export type HeroTopBullet = {
  id: string
  text: string
}

export type HeroTopBulletsBundle = Record<MarketId, HeroTopBullet[]>

export type PublishedHeroTopBulletsFile = {
  version: 1
  publishedAt: string
  content: HeroTopBulletsBundle
}

const SHARED_FIXED_PRICE = 'Fixed-price projects available'
const SHARED_TRUSTED = 'Trusted by SMEs & enterprise'

/** Exact replica of the live homepage checklist before this CMS existed. */
export function defaultHeroTopBullets(market: MarketId = DEFAULT_MARKET): HeroTopBullet[] {
  const based =
    market === 'nz' ? 'New Zealand based' : 'Serving Global Clients'
  return [
    { id: 'fixed-price', text: SHARED_FIXED_PRICE },
    { id: 'based', text: based },
    { id: 'trusted', text: SHARED_TRUSTED },
  ]
}

export function defaultHeroTopBulletsBundle(): HeroTopBulletsBundle {
  return {
    nz: defaultHeroTopBullets('nz'),
    intl: defaultHeroTopBullets('intl'),
    uk: defaultHeroTopBullets('uk'),
  }
}

export function emptyHeroTopBullet(usedIds: Iterable<string>): HeroTopBullet {
  const id = uniqueHeroId('new-bullet', usedIds)
  return { id, text: 'New bullet' }
}

function asText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s+/g, ' ')
}

function parseBullet(
  value: unknown,
  usedIds: Set<string>
): HeroTopBullet | null {
  if (typeof value === 'string') {
    const text = asText(value)
    if (!text) return null
    const id = uniqueHeroId(text, usedIds)
    usedIds.add(id)
    return { id, text }
  }
  if (!value || typeof value !== 'object') return null
  const rec = value as Record<string, unknown>
  const text = asText(rec.text)
  if (!text) return null
  const id = uniqueHeroId(
    typeof rec.id === 'string' && rec.id.trim() ? rec.id : text,
    usedIds
  )
  usedIds.add(id)
  return { id, text }
}

function unwrapMarketList(raw: unknown): unknown[] | null {
  if (Array.isArray(raw)) return raw
  if (!raw || typeof raw !== 'object') return null
  const rec = raw as Record<string, unknown>
  if (Array.isArray(rec.bullets)) return rec.bullets
  if (Array.isArray(rec.items)) return rec.items
  return null
}

export function normalizeHeroTopBulletsForMarket(
  raw: unknown,
  market: MarketId = DEFAULT_MARKET
): HeroTopBullet[] {
  const defaults = defaultHeroTopBullets(market)
  const items = unwrapMarketList(raw)
  if (!items) return defaults
  const used = new Set<string>()
  const parsed: HeroTopBullet[] = []
  for (const item of items) {
    if (parsed.length >= HERO_TOP_BULLETS_MAX) break
    const bullet = parseBullet(item, used)
    if (bullet) parsed.push(bullet)
  }
  if (parsed.length < HERO_TOP_BULLETS_MIN) return defaults
  return parsed
}

function unwrapBundle(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const rec = raw as Record<string, unknown>
  if (rec.content && typeof rec.content === 'object') return rec.content
  if (rec.markets && typeof rec.markets === 'object') return rec.markets
  return rec
}

export function normalizeHeroTopBulletsBundle(raw: unknown): HeroTopBulletsBundle {
  const inner = unwrapBundle(raw)
  const rec =
    inner && typeof inner === 'object' ? (inner as Record<string, unknown>) : {}
  const bundle = {} as HeroTopBulletsBundle
  for (const market of MARKET_IDS) {
    bundle[market] = normalizeHeroTopBulletsForMarket(rec[market], market)
  }
  return bundle
}

export function pickHeroTopBullets(
  bundle: HeroTopBulletsBundle,
  market: MarketId | string | null | undefined
): HeroTopBullet[] {
  const id = isMarketId(market) ? market : DEFAULT_MARKET
  return bundle[id] ?? defaultHeroTopBullets(id)
}

export function heroTopBulletTexts(bullets: HeroTopBullet[]): string[] {
  return bullets.map((bullet) => bullet.text)
}
