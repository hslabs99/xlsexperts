/**
 * Admin flags for blog regionalization. Nothing here changes a post.
 * Applying a patch is a separate, explicit save.
 */

import type { MarketId } from '@/lib/market'
import { marketShortLabel } from '@/lib/market'
import {
  blogRegionCopyReport,
  type BlogRegionCopySource,
} from '@/lib/blog-region-copy'
import { visibleMarketsForBlog, type BlogPrimaryRegion } from '@/lib/blog-shared'
import { effectivePrimaryRegion } from '@/lib/blog-routing'

/**
 * .co.nz articles Search Console still canonicalised to a sister domain
 * in October 2026. Flag them until they are NZ-only.
 */
const SEARCH_CONSOLE_NZ_SLUGS = new Set([
  'stop-fighting-your-formulas-3-signs-you-need-an-excel-consultant',
  'enterprise-excel-automation-scaling-business-processes',
  'automated-daily-site-reports-in-excel-a-guide-for-engineering-firms',
  'excel-solutions-energy-utilities-new-zealand',
  'excel-solutions-nz-streamline-your-workflow-and-boost-your-productivity',
])

export type RegionPatch = {
  showNz: boolean
  showUsa: boolean
  showUk: boolean
  primaryRegion: MarketId
}

export type BlogDecision = {
  code:
    | 'copy-conflict'
    | 'search-console'
    | 'search-console-hide'
    | 'hidden-published'
    | 'primary-unset'
  tone: 'action' | 'confirm'
  /** The action that keeps every ticked domain and fixes the Google fallback. */
  recommended?: boolean
  text: string
  patch?: RegionPatch
  patchLabel?: string
}

type DecisionPost = BlogRegionCopySource & {
  slug: string
  published: boolean
  showNz: boolean
  showUsa: boolean
  showUk: boolean
  primaryRegion?: BlogPrimaryRegion
}

function domainLabel(market: MarketId): string {
  if (market === 'intl') return 'US'
  return marketShortLabel(market)
}

function patchFromMarkets(markets: readonly MarketId[]): RegionPatch {
  const primary = markets.includes('nz') ? 'nz' : markets[0]
  return {
    showNz: markets.includes('nz'),
    showUsa: markets.includes('intl'),
    showUk: markets.includes('uk'),
    primaryRegion: primary,
  }
}

export function blogRoutingDecisions(post: DecisionPost): BlogDecision[] {
  if (!post.published) return []
  const items: BlogDecision[] = []
  const visible = visibleMarketsForBlog(post)
  const report = blogRegionCopyReport(post)

  if (visible.length === 0) {
    items.push({
      code: 'hidden-published',
      tone: 'action',
      text: 'Published, but ticked off every domain, so every URL 404s. Tick a domain or unpublish it.',
    })
  }

  if (report.conflicts.length > 0 && report.detected.length > 0) {
    const detected = report.detected
    const patch = patchFromMarkets(detected)
    items.push({
      code: 'copy-conflict',
      tone: 'action',
      text: `Copy reads as ${detected.map(domainLabel).join(' + ')}, but it is also published on ${report.conflicts.map(domainLabel).join(' and ')}. Unticking a domain 301s that URL to the primary region.`,
      patch,
      patchLabel: `Keep ${detected.map(domainLabel).join(' + ')} only`,
    })
  }

  if (
    SEARCH_CONSOLE_NZ_SLUGS.has(post.slug) &&
    post.showNz &&
    (post.showUsa || post.showUk)
  ) {
    const nzOnlyPatch = patchFromMarkets(['nz'])
    const alreadyOffered = items.some(
      (item) => item.patchLabel === 'Keep NZ only'
    )
    if (post.primaryRegion !== 'nz') {
      items.push({
        code: 'search-console',
        tone: 'action',
        recommended: true,
        text: 'Google indexed another domain instead of this .co.nz article. The fallback (x-default) pointed at .com whenever the US site was included, so Google treated .com as the default. Set the primary to New Zealand. The article stays on every ticked site. x-default then points at the .co.nz URL, which is the default Google uses inside the set. Google still has to recrawl before Search Console updates.',
        patch: {
          showNz: post.showNz,
          showUsa: post.showUsa,
          showUk: post.showUk,
          primaryRegion: 'nz',
        },
        patchLabel: 'Set primary to NZ',
      })
    }
    if (!alreadyOffered) {
      items.push({
        code: 'search-console-hide',
        tone: 'action',
        text: 'Publishing on New Zealand only removes the article from the other sites. Those addresses then redirect to .co.nz. Use that only if it should not appear on .com or .co.uk.',
        patch: nzOnlyPatch,
        patchLabel: 'Publish on NZ only',
      })
    }
  }

  if (
    visible.length > 1 &&
    !post.primaryRegion &&
    !visible.includes('nz') &&
    !items.some((item) => item.recommended)
  ) {
    const assumed = effectivePrimaryRegion(post)
    if (assumed) {
      items.push({
        code: 'primary-unset',
        tone: 'confirm',
        text: `On more than one domain, with no saved primary. x-default and cross-domain 301s currently use ${domainLabel(assumed)}.`,
        patch: {
          showNz: post.showNz,
          showUsa: post.showUsa,
          showUk: post.showUk,
          primaryRegion: assumed,
        },
        patchLabel: `Confirm primary: ${domainLabel(assumed)}`,
      })
    }
  }

  return items
}

export function blogNeedsRoutingDecision(post: DecisionPost): boolean {
  return blogRoutingDecisions(post).length > 0
}
