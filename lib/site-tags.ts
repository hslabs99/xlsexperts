/**
 * Marketing / analytics tag configuration for the public site.
 * Stored in Firestore Site Content / analytics-tags — one set per market
 * so NZ (.co.nz) and International (.com) never share campaign tags.
 */

import {
  DEFAULT_MARKET,
  MARKET_IDS,
  isMarketId,
  type MarketId,
} from '@/lib/market'

export interface SiteTagsContent {
  /** When false, nothing is injected on the public site. */
  enabled: boolean
  /** Google Tag Manager container id, e.g. GTM-XXXXXXX */
  googleTagManagerId: string
  /** Google Analytics 4 measurement id, e.g. G-XXXXXXXXXX */
  googleAnalyticsId: string
  /**
   * Free-form HTML/scripts for <head> (Meta Pixel, LinkedIn Insight, etc.).
   * Paste vendor snippets as provided — including <script> tags is fine.
   */
  headHtml: string
  /**
   * Free-form HTML for the start of <body> (e.g. GTM <noscript> iframe).
   */
  bodyHtml: string
}

export type SiteTagsBundle = Record<MarketId, SiteTagsContent>

export const DEFAULT_SITE_TAGS: SiteTagsContent = {
  enabled: false,
  googleTagManagerId: '',
  googleAnalyticsId: '',
  headHtml: '',
  bodyHtml: '',
}

export function cloneSiteTags(source: SiteTagsContent): SiteTagsContent {
  return {
    enabled: source.enabled,
    googleTagManagerId: source.googleTagManagerId,
    googleAnalyticsId: source.googleAnalyticsId,
    headHtml: source.headHtml,
    bodyHtml: source.bodyHtml,
  }
}

export function defaultSiteTagsBundle(): SiteTagsBundle {
  return {
    nz: cloneSiteTags(DEFAULT_SITE_TAGS),
    intl: cloneSiteTags(DEFAULT_SITE_TAGS),
  }
}

export function normalizeSiteTags(raw: unknown): SiteTagsContent {
  const data =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    enabled: Boolean(data.enabled),
    googleTagManagerId: String(data.googleTagManagerId ?? '')
      .trim()
      .toUpperCase(),
    googleAnalyticsId: String(data.googleAnalyticsId ?? '')
      .trim()
      .toUpperCase(),
    headHtml: String(data.headHtml ?? ''),
    bodyHtml: String(data.bodyHtml ?? ''),
  }
}

/**
 * Accepts either the new `{ markets: { nz, intl } }` shape or a legacy flat
 * document (pre market-split). Legacy docs map to NZ; intl starts empty.
 */
export function normalizeSiteTagsBundle(raw: unknown): SiteTagsBundle {
  const bundle = defaultSiteTagsBundle()
  if (!raw || typeof raw !== 'object') return bundle

  const data = raw as Record<string, unknown>
  const markets =
    data.markets && typeof data.markets === 'object'
      ? (data.markets as Record<string, unknown>)
      : null

  if (markets) {
    for (const id of MARKET_IDS) {
      if (markets[id] != null) {
        bundle[id] = normalizeSiteTags(markets[id])
      }
    }
    return bundle
  }

  // Legacy flat document → NZ only (intl stays default/empty).
  if (
    'enabled' in data ||
    'googleTagManagerId' in data ||
    'googleAnalyticsId' in data ||
    'headHtml' in data ||
    'bodyHtml' in data
  ) {
    bundle.nz = normalizeSiteTags(data)
  }

  return bundle
}

export function pickSiteTags(
  bundle: SiteTagsBundle,
  market: MarketId | string | null | undefined
): SiteTagsContent {
  const id = isMarketId(market) ? market : DEFAULT_MARKET
  return cloneSiteTags(bundle[id] ?? bundle[DEFAULT_MARKET])
}

/** Basic sanity checks for common Google id formats (empty is allowed). */
export function validateSiteTags(tags: SiteTagsContent): string | null {
  const gtm = tags.googleTagManagerId.trim()
  if (gtm && !/^GTM-[A-Z0-9]+$/i.test(gtm)) {
    return 'Google Tag Manager ID should look like GTM-XXXXXXX.'
  }
  const ga = tags.googleAnalyticsId.trim()
  if (ga && !/^G-[A-Z0-9]+$/i.test(ga)) {
    return 'Google Analytics ID should look like G-XXXXXXXXXX.'
  }
  return null
}

export function validateSiteTagsBundle(bundle: SiteTagsBundle): string | null {
  for (const id of MARKET_IDS) {
    const err = validateSiteTags(bundle[id])
    if (err) return `${id === 'nz' ? 'New Zealand' : 'International'}: ${err}`
  }
  return null
}
