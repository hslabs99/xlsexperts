/**
 * Blog URL resolution, hreflang and old-slug scoring.
 *
 * Region flags stay as showNz / showUsa / showUk. There is no parallel
 * regions array. primaryRegion is the domain that owns x-default and
 * receives 301s from domains where the article is not published.
 */

import type { MarketId } from '@/lib/market'
import { MARKET_IDS, isMarketId } from '@/lib/market'
import {
  absoluteOnOrigin,
  HREFLANG_FOR_MARKET,
  normalizePathname,
  originForMarket,
  type AlternateLanguages,
} from '@/lib/regions'
import {
  blogVisibleOnMarket,
  visibleMarketsForBlog,
  type BlogPrimaryRegion,
} from '@/lib/blog-shared'
import { isSharedIndexablePath } from '@/lib/indexable-paths'

/** At or above this, an unknown URL 301s to the top article. */
export const REDIRECT_THRESHOLD = 0.8

/** Shown on the 404 page when the top score is below the redirect threshold. */
export const SUGGEST_THRESHOLD = 0.3

/**
 * Two posts this close are treated as a tie so we do not 301 to the wrong one.
 */
const REDIRECT_MARGIN = 0.05

const STOPWORDS = new Set([
  'nz',
  'new',
  'zealand',
  'auckland',
  'uk',
  'us',
  'excel',
  'xls',
  'experts',
  'how',
  'the',
  'a',
  'an',
  'to',
  'for',
  'your',
  'you',
  'and',
  'of',
  'in',
  'with',
  'why',
  'what',
  'is',
  'it',
  's',
])

export type RoutingPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  showNz: boolean
  showUsa: boolean
  showUk: boolean
  primaryRegion: BlogPrimaryRegion
  sortOrder: number
}

export type RoutingPostState = 'published' | 'draft' | 'deleted'

export type ScoredPost = {
  post: RoutingPost
  score: number
}

export type ServiceHint = {
  href: string
  title: string
  blurb: string
}

type RegionFlags = {
  showNz: boolean
  showUsa: boolean
  showUk: boolean
  primaryRegion?: BlogPrimaryRegion
}

const SERVICE_RULES: readonly {
  terms: readonly string[]
  href: string
  title: string
  blurb: string
}[] = [
  {
    terms: ['dashboard', 'dashboards', 'kpi', 'chart', 'charts', 'pivot', 'bi'],
    href: '/solutions/dashboards-business-intelligence',
    title: 'Dashboards & BI',
    blurb:
      'Management dashboards and reporting that turn spreadsheet data into decisions.',
  },
  {
    terms: [
      'costing',
      'quoting',
      'estimating',
      'quote',
      'quotes',
      'estimate',
      'estimator',
    ],
    href: '/solutions/quoting-estimating-systems',
    title: 'Quoting & Estimating Systems',
    blurb:
      'Structured quoting, estimating and costing so prices stay consistent.',
  },
  {
    terms: ['automation', 'automate', 'automated', 'vba', 'macro', 'macros', 'workflow'],
    href: '/solutions/workflow-automation-systems-integration',
    title: 'Workflow automation',
    blurb:
      'Automate spreadsheet work and connect it to the rest of the business.',
  },
  {
    terms: ['financial', 'finance', 'modelling', 'modeling', 'forecast', 'budget'],
    href: '/excel-financial-modelling',
    title: 'Financial modelling',
    blurb: 'Excel financial models, forecasts and scenarios.',
  },
  {
    terms: ['powerquery', 'query', 'integration', 'integrations', 'sql'],
    href: '/excel-integrations',
    title: 'Excel integrations',
    blurb: 'Connect Excel to databases, files and other systems.',
  },
]

export function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
}

export function recoveryKeywords(pathname: string): string {
  const path = normalizePathname(pathname)
  const slug = path.split('/').filter(Boolean).pop() ?? ''
  const tokens = tokenize(slug)
  if (tokens.length > 0) return tokens.join(' ')
  return slug.replace(/[-_]+/g, ' ').trim()
}

/** Saved primary when it is one of the ticked domains, otherwise NZ if ticked. */
export function effectivePrimaryRegion(record: RegionFlags): MarketId | null {
  const visible = visibleMarketsForBlog(record)
  if (visible.length === 0) return null
  if (record.primaryRegion && visible.includes(record.primaryRegion)) {
    return record.primaryRegion
  }
  if (visible.includes('nz')) return 'nz'
  if (visible.includes('uk')) return 'uk'
  return 'intl'
}

/**
 * Value to persist. A single ticked domain is stored automatically.
 * Several domains with no explicit choice default to New Zealand when NZ is ticked.
 */
export function primaryToStore(
  record: Pick<RegionFlags, 'showNz' | 'showUsa' | 'showUk'>,
  requested: unknown
): BlogPrimaryRegion {
  const visible = visibleMarketsForBlog(record)
  if (visible.length === 0) return null
  if (isMarketId(requested) && visible.includes(requested)) return requested
  if (visible.includes('nz')) return 'nz'
  if (visible.includes('uk')) return 'uk'
  return visible[0]
}

/**
 * Hreflang for one article. One domain → no tags.
 * Two or more → those languages only, x-default on the primary domain.
 */
export function buildBlogAlternates(
  pathname: string,
  markets: readonly MarketId[],
  primary: MarketId | null
): AlternateLanguages | undefined {
  const live = MARKET_IDS.filter((id) => markets.includes(id))
  if (live.length < 2) return undefined
  const owner =
    primary && live.includes(primary)
      ? primary
      : live.includes('nz')
        ? 'nz'
        : live[0]
  const path = normalizePathname(pathname)
  const languages: AlternateLanguages = {}
  for (const id of live) {
    languages[HREFLANG_FOR_MARKET[id]] = absoluteOnOrigin(originForMarket(id), path)
  }
  languages['x-default'] = absoluteOnOrigin(originForMarket(owner), path)
  return languages
}

export function blogOrPostSlug(pathname: string): string | null {
  const path = normalizePathname(pathname)
  const match = path.match(/^\/(?:blog|post)\/([^/]+)$/)
  if (!match) return null
  const slug = decodeURIComponent(match[1] ?? '').trim()
  return slug || null
}

export function isPostArticlePath(pathname: string): boolean {
  return /^\/post\/[^/]+$/.test(normalizePathname(pathname))
}

const RESERVED_PREFIXES = [
  '/admin',
  '/api',
  '/case-studies',
  '/email',
  '/thank-you',
  '/unsubscribe',
  '/solutions',
  '/industries',
  '/services',
  '/images',
  '/site-missing',
]

/** Live site sections that must never be fuzzy-redirected to a blog. */
export function isReservedPublicPath(pathname: string): boolean {
  const path = normalizePathname(pathname)
  if (path === '/blog' || path === '/post') return true
  if (isSharedIndexablePath(path)) return true
  return RESERVED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  )
}

export function shouldRewriteMissing(pathname: string): boolean {
  const path = normalizePathname(pathname)
  if (isReservedPublicPath(path)) return false
  if (blogOrPostSlug(path)) return false
  if (path === '/post') return false
  return true
}

export function shouldConsultRouting(pathname: string): boolean {
  const path = normalizePathname(pathname)
  if (
    path.startsWith('/api') ||
    path.startsWith('/admin') ||
    path.startsWith('/_next')
  ) {
    return false
  }
  if (/\.[a-z0-9]{2,8}$/i.test(path)) return false
  return true
}

export function scorePost(queryTokens: readonly string[], post: RoutingPost): number {
  if (queryTokens.length === 0) return 0
  const slugTokens = new Set(tokenize(post.slug.replace(/[-_]/g, ' ')))
  const titleTokens = new Set(tokenize(post.title))
  const categoryTokens = new Set(tokenize(post.category))
  let earned = 0
  for (const token of queryTokens) {
    if (slugTokens.has(token) || titleTokens.has(token)) earned += 4
    else if (categoryTokens.has(token)) earned += 1
  }
  return earned / (queryTokens.length * 4)
}

export function rankPosts(
  pathname: string,
  posts: readonly RoutingPost[]
): ScoredPost[] {
  const slug = normalizePathname(pathname).split('/').filter(Boolean).pop() ?? ''
  const tokens = tokenize(slug)
  return posts
    .map((post) => ({ post, score: scorePost(tokens, post) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.post.sortOrder - b.post.sortOrder
    })
}

export function fuzzyDecision(ranked: readonly ScoredPost[]): {
  redirect: ScoredPost | null
  suggestions: ScoredPost[]
} {
  const top = ranked[0]
  const second = ranked[1]
  const redirect =
    top &&
    top.score >= REDIRECT_THRESHOLD &&
    (!second || top.score - second.score >= REDIRECT_MARGIN)
      ? top
      : null
  const suggestions = ranked
    .filter((row) => row.score >= SUGGEST_THRESHOLD)
    .slice(0, 3)
  return { redirect, suggestions }
}

export function matchService(pathname: string): ServiceHint | null {
  const tokens = new Set(
    tokenize(
      normalizePathname(pathname).split('/').filter(Boolean).pop() ?? pathname
    )
  )
  let best: (typeof SERVICE_RULES)[number] | null = null
  let bestHits = 0
  for (const rule of SERVICE_RULES) {
    let hits = 0
    for (const term of rule.terms) {
      if (tokens.has(term)) hits += 1
    }
    if (hits > bestHits) {
      best = rule
      bestHits = hits
    }
  }
  if (!best || bestHits === 0) return null
  return { href: best.href, title: best.title, blurb: best.blurb }
}

export function articleDestination(
  post: RoutingPost,
  market: MarketId
): { market: MarketId; pathname: string } | null {
  const pathname = `/blog/${post.slug}`
  if (blogVisibleOnMarket(post, market)) return { market, pathname }
  const primary = effectivePrimaryRegion(post)
  if (!primary) return null
  return { market: primary, pathname }
}

export function isSearchBot(userAgent: string): boolean {
  return /googlebot|bingbot|duckduckbot|baiduspider|yandex|slurp|applebot|facebookexternalhit|twitterbot|linkedinbot|semrush|ahrefs|petalbot|mj12bot/i.test(
    userAgent
  )
}
