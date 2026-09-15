/**
 * Deep links from CMS → Publish health findings into the matching editor.
 * Hash shape: #tab=cms&cms=pages&market=uk&path=/solutions/...&field=metaDescription
 */

import { isMarketId, type MarketId } from '@/lib/market'

export type CmsFocusSection =
  | 'site'
  | 'how-we-work'
  | 'pages'
  | 'top-bullets'
  | 'home-services'

export type AdminFocus = {
  tab: 'cms'
  cms: CmsFocusSection
  market: MarketId
  /** Page SEO path, market-copy field path, or home-services tile href. */
  path?: string
  kind?: 'service' | 'solution'
  field?: string
  group?: string
  tileHref?: string
  bulletId?: string
}

export const CMS_FOCUS_SECTIONS: readonly CmsFocusSection[] = [
  'site',
  'how-we-work',
  'pages',
  'top-bullets',
  'home-services',
]

export function isCmsFocusSection(value: string | null): value is CmsFocusSection {
  return CMS_FOCUS_SECTIONS.includes(value as CmsFocusSection)
}

export function adminFocusHref(focus: AdminFocus): string {
  const params = new URLSearchParams()
  params.set('tab', 'cms')
  params.set('cms', focus.cms)
  params.set('market', focus.market)
  if (focus.path) params.set('path', focus.path)
  if (focus.kind) params.set('kind', focus.kind)
  if (focus.field) params.set('field', focus.field)
  if (focus.group) params.set('group', focus.group)
  if (focus.tileHref) params.set('tile', focus.tileHref)
  if (focus.bulletId) params.set('bullet', focus.bulletId)
  return `/admin#${params.toString()}`
}

/** Update the CMS bookmark without a hashchange scroll or reload. */
export function replaceAdminFocusHash(focus: AdminFocus): void {
  if (typeof window === 'undefined') return
  const href = adminFocusHref(focus)
  const hash = href.slice(href.indexOf('#'))
  if (window.location.hash === hash) return
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}${hash}`
  )
}

export function parseAdminFocusHash(hash: string): AdminFocus | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (!raw) return null
  const params = new URLSearchParams(raw)
  if (params.get('tab') !== 'cms') return null
  const cms = params.get('cms')
  const market = params.get('market')
  if (!isCmsFocusSection(cms) || !isMarketId(market)) return null
  const kindRaw = params.get('kind')
  const kind =
    kindRaw === 'service' || kindRaw === 'solution' ? kindRaw : undefined
  return {
    tab: 'cms',
    cms,
    market,
    path: params.get('path') || undefined,
    kind,
    field: params.get('field') || undefined,
    group: params.get('group') || undefined,
    tileHref: params.get('tile') || undefined,
    bulletId: params.get('bullet') || undefined,
  }
}

export function cmsAnchorId(parts: Array<string | number | undefined>): string {
  return ['cms', ...parts.filter((part) => part != null && part !== '')]
    .join('-')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
}

export function cmsFocusRingClass(active: boolean): string {
  return active
    ? 'ring-2 ring-amber-400 ring-offset-2'
    : ''
}

export function scrollCmsAnchor(
  id: string,
  block: ScrollLogicalPosition = 'center'
): void {
  window.setTimeout(() => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block })
  }, 80)
}
