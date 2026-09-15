/**
 * Scan CMS regional drafts for country wording that does not belong
 * on that market (NZ copy on UK/Intl, UK copy on NZ, etc.).
 */

import { adminFocusHref, type CmsFocusSection } from '@/lib/admin-focus'
import { foreignRegionalMarkets } from '@/lib/blog-region-copy'
import {
  CONTACT_DETAIL_FIELDS,
  HERO_BADGE_DEFS,
  HOW_WE_WORK_FIELDS,
  MARKET_COPY_FIELDS,
  getByPath,
  type MarketCopyBundle,
} from '@/lib/market-copy'
import { catalogItemForPath, type PageSeoFields, type PageSeoMarkets } from '@/lib/page-seo'
import { parseFaqs } from '@/lib/page-seo-faqs'
import {
  homeServiceTileText,
  type HomeServicesBundle,
  type HomeServicesContent,
} from '@/lib/home-services'
import type { HeroTopBulletsBundle } from '@/lib/hero-top-bullets'
import { MARKET_IDS, marketLabel, marketShortLabel, type MarketId } from '@/lib/market'

export type CmsRegionHealthFinding = {
  id: string
  source: CmsFocusSection
  sourceLabel: string
  market: MarketId
  title: string
  detail: string
  samples: string[]
  foreign: MarketId[]
  href: string
}

export type CmsRegionHealthReport = {
  scannedAt: string
  findingCount: number
  findings: CmsRegionHealthFinding[]
  errors: string[]
}

const PAGE_SEO_SKIP = new Set([
  'ogImage',
  'twitterImage',
  'seoNotes',
  'robotsIndex',
  'robotsFollow',
  'faqs',
])

const MARKET_COPY_SKIP = new Set([
  'contact.phoneTel',
  'contact.whatsapp',
])

const HOME_CHROME: Array<{
  key: keyof HomeServicesContent
  label: string
}> = [
  { key: 'eyebrow', label: 'Eyebrow' },
  { key: 'heading', label: 'Heading' },
  { key: 'intro', label: 'Intro' },
  { key: 'viewAllLabel', label: 'View-all label' },
  { key: 'useCasesLabel', label: 'Use-cases label' },
  { key: 'ctaPrompt', label: 'CTA prompt' },
  { key: 'ctaLabel', label: 'CTA button' },
]

function foreignDetail(
  market: MarketId,
  foreign: MarketId[],
  samples: Partial<Record<MarketId, string[]>>
): { detail: string; samples: string[] } {
  const bits: string[] = []
  const flat: string[] = []
  for (const id of foreign) {
    const snippets = samples[id] ?? []
    for (const snippet of snippets) {
      if (!flat.includes(snippet)) flat.push(snippet)
    }
    bits.push(
      snippets[0]
        ? `${marketLabel(id)} (“${snippets[0]}”)`
        : marketLabel(id)
    )
  }
  return {
    detail: `${marketShortLabel(market)} copy names ${bits.join('; ')}`,
    samples: flat.slice(0, 4),
  }
}

function healthForeignMarkets(text: string, current: MarketId) {
  const { foreign, samples } = foreignRegionalMarkets(text, current)
  // International copy can name the US and UK as markets served.
  // NZ wording on .com / .co.uk is still a leak.
  if (current !== 'intl') return { foreign, samples }
  const nzOnly = foreign.filter((id) => id === 'nz')
  const nzSamples: Partial<Record<MarketId, string[]>> = {}
  if (samples.nz?.length) nzSamples.nz = samples.nz
  return { foreign: nzOnly, samples: nzSamples }
}

function healthForeignFaqMarkets(text: string, current: MarketId) {
  const { foreign, samples } = foreignRegionalMarkets(text, current)
  if (current !== 'intl') return { foreign, samples }
  // .com FAQs must not pin NZ or UK; US-primary wording is allowed.
  const keep = foreign.filter((id) => id === 'nz' || id === 'uk')
  const nextSamples: Partial<Record<MarketId, string[]>> = {}
  if (keep.includes('nz') && samples.nz) nextSamples.nz = samples.nz
  if (keep.includes('uk') && samples.uk) nextSamples.uk = samples.uk
  return { foreign: keep, samples: nextSamples }
}

function shortenFaqQuestion(q: string, max = 72): string {
  const t = q.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trimEnd()}…`
}

function pushFinding(
  findings: CmsRegionHealthFinding[],
  input: {
    source: CmsFocusSection
    sourceLabel: string
    market: MarketId
    title: string
    text: string
    id: string
    href: string
    detector?: (text: string, current: MarketId) => {
      foreign: MarketId[]
      samples: Partial<Record<MarketId, string[]>>
    }
  }
) {
  const detect = input.detector ?? healthForeignMarkets
  const { foreign, samples } = detect(input.text, input.market)
  if (foreign.length === 0) return
  const extra = foreignDetail(input.market, foreign, samples)
  findings.push({
    id: input.id,
    source: input.source,
    sourceLabel: input.sourceLabel,
    market: input.market,
    title: input.title,
    detail: extra.detail,
    samples: extra.samples,
    foreign,
    href: input.href,
  })
}

function scanMarketCopyFields(
  findings: CmsRegionHealthFinding[],
  markets: MarketCopyBundle
) {
  const siteFields = [
    ...MARKET_COPY_FIELDS,
    ...CONTACT_DETAIL_FIELDS,
    ...HERO_BADGE_DEFS.map((badge) => ({
      path: badge.textPath,
      label: `${badge.label} label`,
      group: 'Hero badges',
    })),
  ]

  for (const market of MARKET_IDS) {
    for (const field of siteFields) {
      if (MARKET_COPY_SKIP.has(field.path)) continue
      const text = getByPath(markets[market], field.path)
      if (!text.trim()) continue
      pushFinding(findings, {
        source: 'site',
        sourceLabel: 'Site CMS',
        market,
        title: `${field.label} · ${marketShortLabel(market)}`,
        text,
        id: `site:${market}:${field.path}`,
        href: adminFocusHref({
          tab: 'cms',
          cms: 'site',
          market,
          path: field.path,
          field: field.path,
          group: field.group,
        }),
        detector:
          field.group === 'Homepage FAQ' ? healthForeignFaqMarkets : undefined,
      })
    }

    for (const field of HOW_WE_WORK_FIELDS) {
      const text = getByPath(markets[market], field.path)
      if (!text.trim()) continue
      pushFinding(findings, {
        source: 'how-we-work',
        sourceLabel: 'How we work',
        market,
        title: `${field.label} · ${marketShortLabel(market)}`,
        text,
        id: `how-we-work:${market}:${field.path}`,
        href: adminFocusHref({
          tab: 'cms',
          cms: 'how-we-work',
          market,
          path: field.path,
          field: field.path,
        }),
      })
    }
  }
}

function scanPageSeo(findings: CmsRegionHealthFinding[], markets: PageSeoMarkets) {
  for (const market of MARKET_IDS) {
    const bundle = markets[market] ?? {}
    for (const [path, fields] of Object.entries(bundle)) {
      if (!fields) continue
      const item = catalogItemForPath(path)
      const parts: string[] = []
      let firstField: string | undefined
      for (const [key, value] of Object.entries(fields as PageSeoFields)) {
        if (PAGE_SEO_SKIP.has(key) || typeof value !== 'string' || !value.trim()) {
          continue
        }
        const { foreign } = healthForeignMarkets(value, market)
        if (foreign.length === 0) continue
        parts.push(value)
        if (!firstField) firstField = key
      }
      if (parts.length > 0) {
        pushFinding(findings, {
          source: 'pages',
          sourceLabel: 'Pages CMS',
          market,
          title: `${item?.label ?? path} · ${marketShortLabel(market)}`,
          text: parts.join('\n'),
          id: `pages:${market}:${path}`,
          href: adminFocusHref({
            tab: 'cms',
            cms: 'pages',
            market,
            path,
            kind: item?.kind,
            field: firstField,
          }),
        })
      }

      parseFaqs((fields as PageSeoFields).faqs).forEach((faq, index) => {
        const text = `${faq.q}\n${faq.a}`
        if (!text.trim()) return
        pushFinding(findings, {
          source: 'pages',
          sourceLabel: 'Pages CMS',
          market,
          title: `${item?.label ?? path} · FAQ: ${shortenFaqQuestion(faq.q)} · ${marketShortLabel(market)}`,
          text,
          id: `pages:${market}:${path}:faq:${index}`,
          href: adminFocusHref({
            tab: 'cms',
            cms: 'pages',
            market,
            path,
            kind: item?.kind,
            field: 'faqs',
          }),
          detector: healthForeignFaqMarkets,
        })
      })
    }
  }
}

function scanHomeServices(
  findings: CmsRegionHealthFinding[],
  bundle: HomeServicesBundle
) {
  for (const market of MARKET_IDS) {
    const content = bundle[market]
    if (!content) continue
    for (const field of HOME_CHROME) {
      const text = String(content[field.key] ?? '')
      if (!text.trim()) continue
      pushFinding(findings, {
        source: 'home-services',
        sourceLabel: 'Home services',
        market,
        title: `${field.label} · ${marketShortLabel(market)}`,
        text,
        id: `home-services:${market}:${field.key}`,
        href: adminFocusHref({
          tab: 'cms',
          cms: 'home-services',
          market,
          field: String(field.key),
        }),
      })
    }
    content.tiles.forEach((tile, index) => {
      const text = homeServiceTileText(tile)
      if (!text.trim()) return
      pushFinding(findings, {
        source: 'home-services',
        sourceLabel: 'Home services',
        market,
        title: `Tile ${index + 1}: ${tile.title || tile.href} · ${marketShortLabel(market)}`,
        text,
        id: `home-services:${market}:tile:${tile.href}`,
        href: adminFocusHref({
          tab: 'cms',
          cms: 'home-services',
          market,
          tileHref: tile.href,
        }),
      })
    })
  }
}

function scanTopBullets(
  findings: CmsRegionHealthFinding[],
  bundle: HeroTopBulletsBundle
) {
  for (const market of MARKET_IDS) {
    const bullets = bundle[market] ?? []
    bullets.forEach((bullet, index) => {
      if (!bullet.text.trim()) return
      pushFinding(findings, {
        source: 'top-bullets',
        sourceLabel: 'Top Bullets',
        market,
        title: `Bullet ${index + 1} · ${marketShortLabel(market)}`,
        text: bullet.text,
        id: `top-bullets:${market}:${bullet.id}`,
        href: adminFocusHref({
          tab: 'cms',
          cms: 'top-bullets',
          market,
          bulletId: bullet.id,
        }),
      })
    })
  }
}

const SOURCE_ORDER: CmsFocusSection[] = [
  'pages',
  'site',
  'how-we-work',
  'home-services',
  'top-bullets',
]

export function buildCmsRegionHealthReport(input: {
  pageSeo?: PageSeoMarkets | null
  marketCopy?: MarketCopyBundle | null
  homeServices?: HomeServicesBundle | null
  topBullets?: HeroTopBulletsBundle | null
  errors?: string[]
}): CmsRegionHealthReport {
  const findings: CmsRegionHealthFinding[] = []
  if (input.pageSeo) scanPageSeo(findings, input.pageSeo)
  if (input.marketCopy) scanMarketCopyFields(findings, input.marketCopy)
  if (input.homeServices) scanHomeServices(findings, input.homeServices)
  if (input.topBullets) scanTopBullets(findings, input.topBullets)

  findings.sort((a, b) => {
    const source = SOURCE_ORDER.indexOf(a.source) - SOURCE_ORDER.indexOf(b.source)
    if (source !== 0) return source
    const market = MARKET_IDS.indexOf(a.market) - MARKET_IDS.indexOf(b.market)
    if (market !== 0) return market
    return a.title.localeCompare(b.title)
  })

  return {
    scannedAt: new Date().toISOString(),
    findingCount: findings.length,
    findings,
    errors: input.errors ?? [],
  }
}
