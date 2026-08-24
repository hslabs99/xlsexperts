/**
 * First-party funnel events — CTA clicks + service/solution page views.
 * Enquiries themselves live in `enquiries`; this collection is for pre-submit signals.
 * Events are stamped with market/host so NZ (.co.nz), International (.com),
 * and UK (.co.uk) traffic can be viewed separately.
 */

import {
  isMarketId,
  type MarketId,
} from '@/lib/market'

export const FUNNEL_EVENT_TYPES = ['cta_click', 'page_view'] as const
export type FunnelEventType = (typeof FUNNEL_EVENT_TYPES)[number]

export type AnalyticsMarketFilter = 'all' | MarketId

export type FunnelEventInput = {
  type: FunnelEventType
  /** Short human label, e.g. "Get a free quote", "Excel Dashboard Development" */
  label: string
  /** Clicked href or page path */
  href: string
  /** Page path when the event happened */
  path: string
  /** Arrival market from the request host (.co.nz / .com / .co.uk). */
  market: MarketId
  /** Arrival hostname, e.g. www.xlsexperts.co.uk */
  host?: string
}

export type FunnelEventRecord = FunnelEventInput & {
  id: string
  createdAt: unknown
}

export type MarketTrafficBucket = {
  market: MarketId
  hostHint: string
  enquiries: number
  ctaClicks: number
  pageViews: number
}

export type DayBucket = {
  date: string
  total: number
  standard: number
  discovery: number
}

export type CtaDayBucket = {
  date: string
  total: number
}

export type CtaLabelBucket = {
  label: string
  total: number
}

export type PageViewBucket = {
  path: string
  label: string
  total: number
}

export type AnalyticsSummary = {
  from: string
  to: string
  /** `all` or a single market (nz / intl / uk). */
  market: AnalyticsMarketFilter
  /** Always cloud Firestore for the configured Firebase project. */
  dataSource: 'firestore'
  /** Totals for every domain in this date range (not affected by the market filter). */
  byMarket: MarketTrafficBucket[]
  enquiries: {
    total: number
    standard: number
    discovery: number
    byDay: DayBucket[]
  }
  ctaClicks: {
    total: number
    byDay: CtaDayBucket[]
    byLabel: CtaLabelBucket[]
  }
  pageViews: {
    total: number
    services: PageViewBucket[]
    solutions: PageViewBucket[]
  }
}

export function isFunnelEventType(value: string): value is FunnelEventType {
  return (FUNNEL_EVENT_TYPES as readonly string[]).includes(value)
}

export function parseAnalyticsMarketFilter(
  value: string | null | undefined
): AnalyticsMarketFilter {
  if (!value || value === 'all') return 'all'
  return isMarketId(value) ? value : 'all'
}

/** YYYY-MM-DD in Pacific/Auckland (site market calendar). */
export function toDateKey(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

/** Local calendar key for admin date pickers (browser / Node local). */
export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function startOfLocalDay(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0)
}

export function endOfLocalDay(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999)
}

export function enumerateDateKeys(fromKey: string, toKey: string): string[] {
  const out: string[] = []
  const cursor = startOfLocalDay(fromKey)
  const end = startOfLocalDay(toKey)
  if (cursor > end) return out
  while (cursor <= end) {
    out.push(toLocalDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

/**
 * Query window padded so Auckland calendar days are fully covered
 * regardless of server timezone / DST.
 */
export function firestoreRangeForDateKeys(fromKey: string, toKey: string): {
  from: Date
  to: Date
} {
  const from = new Date(`${fromKey}T00:00:00.000Z`)
  from.setUTCHours(from.getUTCHours() - 14)
  const to = new Date(`${toKey}T23:59:59.999Z`)
  to.setUTCHours(to.getUTCHours() + 14)
  return { from, to }
}
