/**
 * Detect NZ / UK / US-specific wording in blog copy so Admin can warn
 * when a post is tagged for a market its text was not written for.
 *
 * `{region}` and other SERP tokens are ignored — those are filled per host.
 */

import { MARKET_IDS, marketLabel, marketShortLabel, type MarketId } from '@/lib/market'
import type { BlogSection } from '@/lib/types'

export type BlogRegionFlags = {
  showNz?: boolean
  showUsa?: boolean
  showUk?: boolean
}

export type BlogRegionCopySource = BlogRegionFlags & {
  title?: string
  slug?: string
  excerpt?: string
  serpTitle?: string
  serpDescription?: string
  category?: string
  sections?: readonly BlogSection[]
}

const TOKEN_RE = /\{(?:region|based|modelling|modeling|organisations|organizations|currency)\}/gi

const PATTERNS: Record<MarketId, readonly RegExp[]> = {
  nz: [
    /\bnew zealand\b/i,
    /\baotearoa\b/i,
    /\bauckland\b/i,
    /\bwellington\b/i,
    /\bchristchurch\b/i,
    /\bhamilton\b/i,
    /\bnzd\b/i,
    /\bnz\$/i,
    /\bco\.nz\b/i,
    /\bkiwi(?:s)?\b/i,
    /\bnz\b/i,
  ],
  uk: [
    /\bunited kingdom\b/i,
    /\bgreat britain\b/i,
    /\bbritain\b/i,
    /\bbritish\b/i,
    /\bengland\b/i,
    /\bscotland\b/i,
    /\bwales\b/i,
    /\blondon\b/i,
    /\bmanchester\b/i,
    /\bbirmingham\b/i,
    /\bedinburgh\b/i,
    /\bgbp\b/i,
    /\bco\.uk\b/i,
    /\buk\b/i,
  ],
  intl: [
    /\bunited states\b/i,
    /\bu\.s\.a?\.?\b/i,
    /\busa\b/i,
    /\bamerican\b/i,
    /\bus-facing\b/i,
    /\busd\b/i,
    /\bus\$/i,
    /\bthe us\b/i,
  ],
}

function stripSerpTokens(value: string): string {
  return value.replace(TOKEN_RE, ' ')
}

function sectionPlainText(sections: readonly BlogSection[] | undefined): string {
  if (!sections?.length) return ''
  const parts: string[] = []
  for (const section of sections) {
    if (section.heading) parts.push(section.heading)
    if (section.text) parts.push(section.text)
    if (section.items) parts.push(section.items.join(' '))
    if (section.faqs) {
      for (const faq of section.faqs) {
        parts.push(faq.q, faq.a)
      }
    }
  }
  return parts.join(' ')
}

export function blogCopyPlainText(source: BlogRegionCopySource): string {
  return stripSerpTokens(
    [
      source.title,
      source.slug?.replace(/-/g, ' '),
      source.excerpt,
      source.serpTitle,
      source.serpDescription,
      source.category,
      sectionPlainText(source.sections),
    ]
      .filter((part): part is string => Boolean(part && part.trim()))
      .join('\n')
  )
}

function sampleAround(text: string, match: RegExpExecArray): string {
  const start = Math.max(0, match.index - 28)
  const end = Math.min(text.length, match.index + match[0].length + 28)
  return text.slice(start, end).replace(/\s+/g, ' ').trim()
}

export function detectBlogCopyMarkets(
  source: BlogRegionCopySource
): { detected: MarketId[]; samples: Partial<Record<MarketId, string[]>> } {
  const text = blogCopyPlainText(source)
  const samples: Partial<Record<MarketId, string[]>> = {}
  const detected: MarketId[] = []
  for (const market of MARKET_IDS) {
    const found: string[] = []
    for (const pattern of PATTERNS[market]) {
      const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)
      let hit: RegExpExecArray | null
      while ((hit = re.exec(text)) !== null) {
        const snippet = sampleAround(text, hit)
        if (snippet && !found.includes(snippet)) found.push(snippet)
        if (found.length >= 3) break
      }
      if (found.length >= 3) break
    }
    if (found.length > 0) {
      detected.push(market)
      samples[market] = found
    }
  }
  return { detected, samples }
}

export function taggedMarketsFromFlags(flags: BlogRegionFlags): MarketId[] {
  const tagged: MarketId[] = []
  if (flags.showNz) tagged.push('nz')
  if (flags.showUsa) tagged.push('intl')
  if (flags.showUk) tagged.push('uk')
  return tagged
}

export type BlogRegionCopyReport = {
  detected: MarketId[]
  samples: Partial<Record<MarketId, string[]>>
  tagged: MarketId[]
  /** Markets the post is tagged for that the copy was not written for. */
  conflicts: MarketId[]
  mixed: boolean
  label: string
}

export function blogRegionCopyReport(
  source: BlogRegionCopySource
): BlogRegionCopyReport {
  const { detected, samples } = detectBlogCopyMarkets(source)
  const tagged = taggedMarketsFromFlags(source)
  const mixed = detected.length > 1
  const conflicts =
    detected.length === 0
      ? []
      : tagged.filter((market) => !detected.includes(market))

  const copyLabel =
    detected.length === 0
      ? 'Neutral'
      : detected.map((id) => marketShortLabel(id)).join('+')

  let label = copyLabel
  if (conflicts.length > 0) {
    label = `${copyLabel} copy on ${conflicts.map((id) => marketShortLabel(id)).join(', ')}`
  } else if (mixed) {
    label = `Mixed ${copyLabel}`
  } else if (detected.length === 1) {
    label = `${copyLabel} copy`
  }

  return { detected, samples, tagged, conflicts, mixed, label }
}

export function blogRegionCopyHasConflict(source: BlogRegionCopySource): boolean {
  return blogRegionCopyReport(source).conflicts.length > 0
}

export function blogRegionCopyHoverTitle(report: BlogRegionCopyReport): string {
  if (report.detected.length === 0) {
    return 'No NZ / UK / US-specific wording found'
  }
  if (report.conflicts.length > 0) {
    return `Regional copy (${report.detected.map(marketShortLabel).join(', ')}) is also tagged on ${report.conflicts.map(marketShortLabel).join(', ')}`
  }
  return `Copy looks ${report.detected.map(marketLabel).join(' / ')}-specific`
}

export function blogRegionCopyTickTitle(
  report: BlogRegionCopyReport,
  market: MarketId,
  okTitle: string
): string {
  if (!report.conflicts.includes(market)) return okTitle
  const label =
    market === 'nz' ? 'NZ' : market === 'uk' ? 'UK' : 'International/US'
  return `Copy is not ${label}-specific — this domain tick conflicts`
}
