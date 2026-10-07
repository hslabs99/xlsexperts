/**
 * Request-time blog routing. Used by proxy.ts and by the blog page as a
 * backup if the proxy could not reach Firestore.
 *
 * One hop only: /post/{slug} on a domain that does not publish the article
 * goes straight to /blog/{slug} on the primary domain.
 */

import {
  isIntlProductionHost,
  isLocalHost,
  isNzProductionHost,
  isUkProductionHost,
  MARKET_HEADER,
  marketFromHost,
  parseMarketId,
  stripLocalMarketPrefix,
  type MarketId,
} from '@/lib/market'
import { absoluteOnOrigin, normalizePathname, originForMarket } from '@/lib/regions'
import {
  articleDestination,
  blogOrPostSlug,
  effectivePrimaryRegion,
  fuzzyDecision,
  isPostArticlePath,
  isReservedPublicPath,
  matchService,
  rankPosts,
  recoveryKeywords,
  type RoutingPost,
  type ScoredPost,
  type ServiceHint,
} from '@/lib/blog-routing'
import {
  getRedirectRows,
  getRoutingIndex,
  incrementRedirectHit,
  type RoutingIndexEntry,
  type StoredRedirect,
} from '@/lib/blog-routing-db'

export type IncomingContext = {
  path: string
  market: MarketId
  local: boolean
  /** True only on xlsexperts.co.nz / .com / .co.uk. Preview hosts stay put. */
  production: boolean
  requestOrigin: string
}

export type IncomingDecision =
  | { type: 'continue'; missing: boolean }
  | { type: 'redirect'; url: string }
  | { type: 'gone' }

function cont(missing = false): IncomingDecision {
  return { type: 'continue', missing }
}

export type NotFoundRecovery = {
  keywords: string
  matches: { post: RoutingPost; score: number; href: string }[]
  service: ServiceHint | null
  top: { post: RoutingPost; href: string }[]
  serviceCategories: { href: string; title: string }[]
}

function localSegment(market: MarketId): string {
  if (market === 'intl') return 'usa'
  if (market === 'uk') return 'uk'
  return 'nz'
}

export function buildPublicUrl(
  market: MarketId,
  pathname: string,
  ctx: IncomingContext
): string {
  const path = normalizePathname(pathname)
  if (ctx.local) {
    const suffix = path === '/' ? '' : path
    return `${ctx.requestOrigin.replace(/\/+$/, '')}/${localSegment(market)}${suffix}`
  }
  if (!ctx.production) {
    return `${ctx.requestOrigin.replace(/\/+$/, '')}${path === '/' ? '/' : path}`
  }
  return absoluteOnOrigin(originForMarket(market), path)
}

function currentUrl(ctx: IncomingContext): string {
  return buildPublicUrl(ctx.market, ctx.path, ctx)
}

function sameUrl(left: string, right: string): boolean {
  try {
    const a = new URL(left)
    const b = new URL(right)
    return (
      a.origin === b.origin &&
      normalizePathname(a.pathname) === normalizePathname(b.pathname)
    )
  } catch {
    return left === right
  }
}

function logicalPathFromUrl(url: string, ctx: IncomingContext): string {
  const pathname = normalizePathname(new URL(url).pathname)
  if (!ctx.local) return pathname
  return stripLocalMarketPrefix(pathname)?.pathname ?? pathname
}

function marketOfUrl(url: string, ctx: IncomingContext): MarketId {
  if (ctx.local) {
    const stripped = stripLocalMarketPrefix(new URL(url).pathname)
    return stripped?.market ?? ctx.market
  }
  if (!ctx.production) return ctx.market
  return marketFromHost(new URL(url).host)
}

function toAbsolute(toUrl: string, ctx: IncomingContext): string {
  if (/^https?:\/\//i.test(toUrl)) return toUrl
  const path = normalizePathname(toUrl)
  return buildPublicUrl(ctx.market, path, ctx)
}

function publishedPosts(entries: readonly RoutingIndexEntry[]): RoutingPost[] {
  return entries.filter((entry) => entry.state === 'published')
}

type Walk =
  | { type: 'url'; url: string }
  | { type: 'gone' }

function walkTarget(
  toUrl: string,
  ctx: IncomingContext,
  entries: readonly RoutingIndexEntry[],
  redirects: Map<string, StoredRedirect>,
  seen: Set<string>
): Walk {
  const absolute = toAbsolute(toUrl, ctx)
  let logical: string
  try {
    logical = logicalPathFromUrl(absolute, ctx)
  } catch {
    return { type: 'url', url: absolute }
  }
  if (seen.has(logical)) return { type: 'url', url: absolute }
  seen.add(logical)

  const manual = redirects.get(logical)
  if (manual) return walkTarget(manual.toUrl, ctx, entries, redirects, seen)

  const slug = blogOrPostSlug(logical)
  if (!slug) return { type: 'url', url: absolute }
  const post = entries.find((entry) => entry.slug === slug)
  if (!post) return { type: 'url', url: absolute }
  if (post.state === 'deleted') return { type: 'gone' }
  if (post.state !== 'published') return { type: 'url', url: absolute }

  const hostMarket = marketOfUrl(absolute, ctx)
  const destination = articleDestination(post, hostMarket)
  if (!destination) return { type: 'url', url: absolute }
  if (!ctx.production && !ctx.local && destination.market !== ctx.market) {
    return { type: 'url', url: buildPublicUrl(ctx.market, destination.pathname, ctx) }
  }
  return {
    type: 'url',
    url: buildPublicUrl(destination.market, destination.pathname, ctx),
  }
}

function fuzzyRedirect(
  pathname: string,
  ctx: IncomingContext,
  posts: readonly RoutingPost[]
): IncomingDecision {
  const { redirect } = fuzzyDecision(rankPosts(pathname, posts))
  if (!redirect) return cont(true)
  const primary = effectivePrimaryRegion(redirect.post)
  if (!primary) return cont(true)
  if (!ctx.production && !ctx.local && primary !== ctx.market) {
    return cont(true)
  }
  const url = buildPublicUrl(primary, `/blog/${redirect.post.slug}`, ctx)
  if (sameUrl(url, currentUrl({ ...ctx, path: pathname }))) return cont(false)
  return { type: 'redirect', url }
}

function resolveContent(
  pathname: string,
  ctx: IncomingContext,
  entries: readonly RoutingIndexEntry[]
): IncomingDecision {
  const slug = blogOrPostSlug(pathname)
  if (slug) {
    const post = entries.find((entry) => entry.slug === slug)
    if (post?.state === 'deleted') return { type: 'gone' }
    if (post?.state === 'published') {
      if (isPostArticlePath(pathname)) {
        const destination = articleDestination(post, ctx.market)
        if (!destination) return cont(true)
        if (!ctx.production && !ctx.local && destination.market !== ctx.market) {
          const sameHost = buildPublicUrl(ctx.market, `/blog/${post.slug}`, ctx)
          if (!sameUrl(sameHost, currentUrl({ ...ctx, path: pathname }))) {
            return { type: 'redirect', url: sameHost }
          }
          return cont(true)
        }
        const url = buildPublicUrl(destination.market, destination.pathname, ctx)
        if (sameUrl(url, currentUrl({ ...ctx, path: pathname }))) {
          return cont(false)
        }
        return { type: 'redirect', url }
      }
      const destination = articleDestination(post, ctx.market)
      if (!destination) return cont(true)
      if (destination.market === ctx.market) return cont(false)
      if (!ctx.production && !ctx.local) return cont(true)
      const url = buildPublicUrl(destination.market, destination.pathname, ctx)
      if (sameUrl(url, currentUrl({ ...ctx, path: pathname }))) return cont(false)
      return { type: 'redirect', url }
    }
    return fuzzyRedirect(pathname, { ...ctx, path: pathname }, publishedPosts(entries))
  }

  if (isReservedPublicPath(pathname)) return cont(false)
  return fuzzyRedirect(pathname, { ...ctx, path: pathname }, publishedPosts(entries))
}

export async function resolveIncomingPath(
  ctx: IncomingContext
): Promise<IncomingDecision> {
  const path = normalizePathname(ctx.path)
  const scoped: IncomingContext = { ...ctx, path }
  const redirectRows = await getRedirectRows()
  const redirects = new Map(redirectRows.map((row) => [row.fromPath, row]))
  const manual = redirects.get(path)
  if (manual) {
    const entries = await getRoutingIndex()
    const walked = walkTarget(
      manual.toUrl,
      scoped,
      entries,
      redirects,
      new Set([path])
    )
    if (walked.type === 'gone') return { type: 'gone' }
    if (!sameUrl(walked.url, currentUrl(scoped))) {
      void incrementRedirectHit(path).catch(() => {})
      return { type: 'redirect', url: walked.url }
    }
  }
  if (!blogOrPostSlug(path) && isReservedPublicPath(path)) {
    return cont(false)
  }
  const entries = await getRoutingIndex()
  return resolveContent(path, scoped, entries)
}

export function contextFromHeaderBag(
  bag: { get(name: string): string | null },
  path: string
): IncomingContext {
  const rawHost = bag.get('x-forwarded-host') || bag.get('host') || ''
  const host = rawHost.split(',')[0]?.trim() ?? ''
  const local = isLocalHost(host)
  const market =
    parseMarketId(bag.get(MARKET_HEADER)) ??
    (local ? 'nz' : marketFromHost(host))
  const proto = bag.get('x-forwarded-proto') || (local ? 'http' : 'https')
  const production =
    !local &&
    (isNzProductionHost(host) ||
      isUkProductionHost(host) ||
      isIntlProductionHost(host))
  return {
    path,
    market,
    local,
    production,
    requestOrigin: `${proto}://${host}`,
  }
}

const SERVICE_CATEGORIES: { href: string; title: string }[] = [
  { href: '/services', title: 'All services' },
  { href: '/excel-dashboard-development', title: 'Dashboards & reporting' },
  { href: '/excel-vba-macro-development', title: 'VBA & macros' },
  { href: '/excel-financial-modelling', title: 'Financial modelling' },
  { href: '/solutions/workflow-automation-systems-integration', title: 'Workflow automation' },
]

function hrefForPost(post: RoutingPost, ctx: IncomingContext): string {
  const destination = articleDestination(post, ctx.market)
  if (!destination) return `/blog/${post.slug}`
  if (!ctx.production && !ctx.local && destination.market !== ctx.market) {
    return `/blog/${post.slug}`
  }
  return buildPublicUrl(destination.market, destination.pathname, ctx)
}

export async function loadNotFoundRecovery(
  ctx: IncomingContext
): Promise<NotFoundRecovery> {
  const entries = await getRoutingIndex()
  const posts = publishedPosts(entries).filter((post) =>
    articleDestination(post, ctx.market)
  )
  const onMarket = publishedPosts(entries).filter(
    (post) => articleDestination(post, ctx.market)?.market === ctx.market
  )
  const ranked: ScoredPost[] = rankPosts(ctx.path, posts)
  const { suggestions } = fuzzyDecision(ranked)
  const matches = suggestions.map((row) => ({
    post: row.post,
    score: row.score,
    href: hrefForPost(row.post, ctx),
  }))
  const top =
    matches.length > 0
      ? []
      : onMarket.slice(0, 5).map((post) => ({
          post,
          href: hrefForPost(post, ctx),
        }))
  return {
    keywords: recoveryKeywords(ctx.path),
    matches,
    service: matchService(ctx.path),
    top,
    serviceCategories: SERVICE_CATEGORIES,
  }
}
