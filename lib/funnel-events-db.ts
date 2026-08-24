import 'server-only'

import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import {
  ENQUIRIES_COLLECTION,
  FUNNEL_EVENTS_COLLECTION,
} from '@/lib/firebase'
import {
  enumerateDateKeys,
  firestoreRangeForDateKeys,
  toDateKey,
  type AnalyticsMarketFilter,
  type AnalyticsSummary,
  type CtaLabelBucket,
  type FunnelEventInput,
  type MarketTrafficBucket,
  type PageViewBucket,
} from '@/lib/funnel-events'
import type { EnquiryType } from '@/lib/enquiries'
import { ALL_SERVICES_HREF, servicePages } from '@/lib/service-pages'
import { ALL_SOLUTIONS_HREF, solutionPages } from '@/lib/solutions'
import {
  DEFAULT_MARKET,
  MARKET_IDS,
  isMarketId,
  marketHostHint,
  storedMarket,
  type MarketId,
} from '@/lib/market'

function createdAtToDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    try {
      return (value as { toDate: () => Date }).toDate()
    } catch {
      return null
    }
  }
  if (typeof value === 'string') {
    const t = Date.parse(value)
    return Number.isFinite(t) ? new Date(t) : null
  }
  return null
}

const SERVICE_LABELS = new Map<string, string>([
  [ALL_SERVICES_HREF, 'All services'],
  ['/enterprise', 'Enterprise'],
  ['/use-cases', 'A.I. Use Cases'],
  ...servicePages.map((p) => [p.href, p.label] as const),
])

const SOLUTION_LABELS = new Map<string, string>([
  [ALL_SOLUTIONS_HREF, 'All solutions'],
  ...solutionPages.map((p) => [p.href, p.navLabel] as const),
])

function normalizePath(path: string): string {
  if (!path) return '/'
  const bare = path.split('?')[0].split('#')[0] || '/'
  if (bare.length > 1 && bare.endsWith('/')) return bare.slice(0, -1)
  return bare
}

/** Fire-and-forget friendly write for CTA / page-view events. */
export async function createFunnelEvent(
  input: FunnelEventInput
): Promise<string> {
  const market: MarketId = isMarketId(input.market)
    ? input.market
    : DEFAULT_MARKET
  const host = String(input.host || '').trim().slice(0, 120)
  const ref = await getAdminDb().collection(FUNNEL_EVENTS_COLLECTION).add({
    type: input.type,
    label: input.label.slice(0, 120),
    href: input.href.slice(0, 500),
    path: input.path.slice(0, 300),
    market,
    host,
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

function emptyMarketTotals(): Record<
  MarketId,
  { enquiries: number; ctaClicks: number; pageViews: number }
> {
  return {
    nz: { enquiries: 0, ctaClicks: 0, pageViews: 0 },
    intl: { enquiries: 0, ctaClicks: 0, pageViews: 0 },
    uk: { enquiries: 0, ctaClicks: 0, pageViews: 0 },
  }
}

export async function fetchAnalyticsSummary(
  fromKey: string,
  toKey: string,
  marketFilter: AnalyticsMarketFilter = 'all'
): Promise<AnalyticsSummary> {
  const { from, to } = firestoreRangeForDateKeys(fromKey, toKey)
  const dateKeys = enumerateDateKeys(fromKey, toKey)
  const dateKeySet = new Set(dateKeys)

  const [enquirySnap, funnelSnap] = await Promise.all([
    getAdminDb()
      .collection(ENQUIRIES_COLLECTION)
      .where('createdAt', '>=', Timestamp.fromDate(from))
      .where('createdAt', '<=', Timestamp.fromDate(to))
      .orderBy('createdAt', 'asc')
      .get(),
    getAdminDb()
      .collection(FUNNEL_EVENTS_COLLECTION)
      .where('createdAt', '>=', Timestamp.fromDate(from))
      .where('createdAt', '<=', Timestamp.fromDate(to))
      .orderBy('createdAt', 'asc')
      .get(),
  ])

  const marketTotals = emptyMarketTotals()

  const enquiryByDay = new Map<
    string,
    { total: number; standard: number; discovery: number }
  >()
  for (const key of dateKeys) {
    enquiryByDay.set(key, { total: 0, standard: 0, discovery: 0 })
  }

  let enquiryTotal = 0
  let standard = 0
  let discovery = 0

  for (const doc of enquirySnap.docs) {
    const data = doc.data() as Record<string, unknown>
    const created = createdAtToDate(data.createdAt)
    if (!created) continue
    const key = toDateKey(created)
    if (!dateKeySet.has(key)) continue
    const market = storedMarket(data.market, data.host)
    marketTotals[market].enquiries += 1
    if (marketFilter !== 'all' && market !== marketFilter) continue
    const bucket = enquiryByDay.get(key)
    if (!bucket) continue
    const type: EnquiryType =
      data.type === 'discovery' ? 'discovery' : 'standard'
    bucket.total += 1
    bucket[type] += 1
    enquiryTotal += 1
    if (type === 'standard') standard += 1
    else discovery += 1
  }

  const ctaByDay = new Map<string, number>()
  for (const key of dateKeys) ctaByDay.set(key, 0)

  const labelCounts = new Map<string, number>()
  let ctaTotal = 0

  const serviceCounts = new Map<string, number>()
  const solutionCounts = new Map<string, number>()
  let pageViewTotal = 0

  for (const doc of funnelSnap.docs) {
    const data = doc.data() as Record<string, unknown>
    const created = createdAtToDate(data.createdAt)
    if (!created) continue
    const key = toDateKey(created)
    if (!dateKeySet.has(key)) continue

    const market = storedMarket(data.market, data.host)
    const type = String(data.type || '')
    const include = marketFilter === 'all' || market === marketFilter

    if (type === 'cta_click') {
      marketTotals[market].ctaClicks += 1
      if (!include) continue
      ctaByDay.set(key, (ctaByDay.get(key) || 0) + 1)
      ctaTotal += 1
      const label = String(data.label || 'Contact CTA').slice(0, 120)
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1)
      continue
    }

    if (type === 'page_view') {
      const path = normalizePath(String(data.path || data.href || ''))
      const isService = SERVICE_LABELS.has(path)
      const isSolution = SOLUTION_LABELS.has(path)
      if (!isService && !isSolution) continue
      marketTotals[market].pageViews += 1
      if (!include) continue
      if (isService) {
        serviceCounts.set(path, (serviceCounts.get(path) || 0) + 1)
      } else {
        solutionCounts.set(path, (solutionCounts.get(path) || 0) + 1)
      }
      pageViewTotal += 1
    }
  }

  const byMarket: MarketTrafficBucket[] = MARKET_IDS.map((id) => ({
    market: id,
    hostHint: marketHostHint(id),
    ...marketTotals[id],
  }))

  const byLabel: CtaLabelBucket[] = [...labelCounts.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 12)

  const services: PageViewBucket[] = [...SERVICE_LABELS.entries()]
    .map(([path, label]) => ({
      path,
      label,
      total: serviceCounts.get(path) || 0,
    }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label))

  const solutions: PageViewBucket[] = [...SOLUTION_LABELS.entries()]
    .map(([path, label]) => ({
      path,
      label,
      total: solutionCounts.get(path) || 0,
    }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label))

  return {
    from: fromKey,
    to: toKey,
    market: marketFilter,
    dataSource: 'firestore',
    byMarket,
    enquiries: {
      total: enquiryTotal,
      standard,
      discovery,
      byDay: dateKeys.map((date) => {
        const b = enquiryByDay.get(date) || {
          total: 0,
          standard: 0,
          discovery: 0,
        }
        return { date, ...b }
      }),
    },
    ctaClicks: {
      total: ctaTotal,
      byDay: dateKeys.map((date) => ({
        date,
        total: ctaByDay.get(date) || 0,
      })),
      byLabel,
    },
    pageViews: {
      total: pageViewTotal,
      services,
      solutions,
    },
  }
}
