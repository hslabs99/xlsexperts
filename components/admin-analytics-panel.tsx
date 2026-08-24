'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { HelpCircle } from 'lucide-react'
import type {
  AnalyticsMarketFilter,
  AnalyticsSummary,
  PageViewBucket,
} from '@/lib/funnel-events'
import { toLocalDateKey } from '@/lib/funnel-events'
import {
  MARKET_IDS,
  marketHostHint,
  marketLabel,
  marketShortLabel,
} from '@/lib/market'

type Preset = '7d' | '30d' | '90d' | 'custom'

function shiftDays(base: Date, delta: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + delta)
  return d
}

function presetRange(preset: Exclude<Preset, 'custom'>): {
  from: string
  to: string
} {
  const to = new Date()
  const days = preset === '7d' ? 6 : preset === '30d' ? 29 : 89
  return {
    from: toLocalDateKey(shiftDays(to, -days)),
    to: toLocalDateKey(to),
  }
}

function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, (m || 1) - 1, d || 1)
  return date.toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
  })
}

function MetricTip({ text }: { text: string }) {
  return (
    <span
      className="inline-flex text-ink-muted"
      title={text}
      aria-label={text}
    >
      <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
    </span>
  )
}

function SimpleBarChart({
  title,
  tip,
  points,
  emptyLabel,
}: {
  title: string
  tip: string
  points: { date: string; value: number; secondary?: number }[]
  emptyLabel: string
}) {
  const max = Math.max(1, ...points.map((p) => p.value))
  const total = points.reduce((sum, p) => sum + p.value, 0)

  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          {title}
          <MetricTip text={tip} />
        </h3>
        <span className="text-xs text-ink-muted">{total} total</span>
      </div>
      {total === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-muted">{emptyLabel}</p>
      ) : (
        <div className="mt-4 flex h-44 gap-0.5 sm:gap-1">
          {points.map((p) => {
            const height = Math.max(p.value > 0 ? 4 : 0, (p.value / max) * 100)
            return (
              <div
                key={p.date}
                className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
                title={`${formatShortDate(p.date)}: ${p.value}${
                  p.secondary != null ? ` (${p.secondary} discovery)` : ''
                }`}
              >
                <div
                  className="w-full max-w-[18px] self-center rounded-t-sm bg-brand/80 transition group-hover:bg-brand"
                  style={{ height: `${height}%` }}
                />
              </div>
            )
          })}
        </div>
      )}
      {points.length > 0 ? (
        <div className="mt-2 flex justify-between text-[10px] text-ink-muted">
          <span>{formatShortDate(points[0].date)}</span>
          <span>{formatShortDate(points[points.length - 1].date)}</span>
        </div>
      ) : null}
    </div>
  )
}

function PageViewTable({
  title,
  tip,
  rows,
}: {
  title: string
  tip: string
  rows: PageViewBucket[]
}) {
  const total = rows.reduce((sum, r) => sum + r.total, 0)
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          {title}
          <MetricTip text={tip} />
        </h3>
        <span className="text-xs text-ink-muted">{total} views</span>
      </div>
      {total === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">
          No page views recorded in this range yet. Counts start after this
          tracker is live on the public site (localhost visits are ignored).
        </p>
      ) : (
        <ul className="mt-3 max-h-72 divide-y divide-border overflow-y-auto">
          {rows.map((row) => (
            <li
              key={row.path}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate text-ink" title={row.path}>
                {row.label}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-ink">
                {row.total}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const CARD_META = [
  {
    label: 'Enquiries',
    tip: 'Form submissions saved in Firestore (standard enquiry + discovery booking). Not page views — only completed contact forms.',
    valueKey: 'enquiries' as const,
  },
  {
    label: 'Standard',
    tip: 'Completed “Send enquiry” forms (type = standard) in the selected date range.',
    valueKey: 'standard' as const,
  },
  {
    label: 'Discovery',
    tip: 'Completed discovery-call bookings (type = discovery) in the selected date range.',
    valueKey: 'discovery' as const,
  },
  {
    label: 'CTA clicks',
    tip: 'Clicks on contact buttons (Contact Us, Get a free quote, Get in touch, tel: links, etc.). Tracked only on the live public site — not localhost.',
    valueKey: 'cta' as const,
  },
]

const MARKET_FILTERS: { id: AnalyticsMarketFilter; label: string; hint: string }[] =
  [
    { id: 'all', label: 'All domains', hint: 'Combined traffic' },
    ...MARKET_IDS.map((id) => ({
      id,
      label: marketShortLabel(id),
      hint: marketHostHint(id),
    })),
  ]

export function AdminAnalyticsPanel() {
  const initial = useMemo(() => presetRange('30d'), [])
  const [preset, setPreset] = useState<Preset>('30d')
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [market, setMarket] = useState<AnalyticsMarketFilter>('all')
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (fromKey: string, toKey: string, marketFilter: AnalyticsMarketFilter) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/admin/analytics?from=${encodeURIComponent(fromKey)}&to=${encodeURIComponent(toKey)}&market=${encodeURIComponent(marketFilter)}`
        )
        const data = (await res.json()) as {
          ok?: boolean
          error?: string
          summary?: AnalyticsSummary | null
        }
        if (!res.ok || !data.ok || !data.summary) {
          throw new Error(data.error || 'Failed to load analytics')
        }
        setSummary(data.summary)
      } catch (err) {
        setSummary(null)
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    void load(from, to, market)
  }, [from, to, market, load])

  const applyPreset = (next: Exclude<Preset, 'custom'>) => {
    const range = presetRange(next)
    setPreset(next)
    setFrom(range.from)
    setTo(range.to)
  }

  const enquiryPoints =
    summary?.enquiries.byDay.map((d) => ({
      date: d.date,
      value: d.total,
      secondary: d.discovery,
    })) ?? []

  const ctaPoints =
    summary?.ctaClicks.byDay.map((d) => ({
      date: d.date,
      value: d.total,
    })) ?? []

  const cardValue = (key: (typeof CARD_META)[number]['valueKey']) => {
    if (!summary) return '—'
    if (key === 'enquiries') return summary.enquiries.total
    if (key === 'standard') return summary.enquiries.standard
    if (key === 'discovery') return summary.enquiries.discovery
    return summary.ctaClicks.total
  }

  const byMarketRows =
    summary?.byMarket ??
    MARKET_IDS.map((id) => ({
      market: id,
      hostHint: marketHostHint(id),
      enquiries: 0,
      ctaClicks: 0,
      pageViews: 0,
    }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink">Analytics</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Numbers come from your{' '}
          <strong className="font-semibold text-ink">cloud Firestore</strong>{' '}
          project (same database as live enquiries), whether you open Admin on
          localhost or production. Use the domain buttons to split{' '}
          <code className="text-xs">{marketHostHint('nz')}</code>,{' '}
          <code className="text-xs">{marketHostHint('intl')}</code>, and{' '}
          <code className="text-xs">{marketHostHint('uk')}</code>. Hover the{' '}
          <HelpCircle className="inline h-3.5 w-3.5" aria-hidden="true" /> icons
          for what each metric means.
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          <strong className="font-semibold text-ink">Enquiries</strong> are
          completed forms — not page requests — so a quiet week looks low by
          design. CTA clicks and page views only count from{' '}
          <strong className="font-semibold text-ink">6 Aug 2026</strong> onward
          (when this tracker went live), and <em>localhost browsing is ignored</em>{' '}
          so local testing does not inflate the charts. Domain split on funnel
          events starts when this filter shipped; older events without a host
          are counted as New Zealand. Until there is more than a week of funnel
          data, Last 7 days and Last 30 days will look the same for page views
          and CTA clicks.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MARKET_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMarket(item.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              market === item.id
                ? 'bg-brand text-white'
                : 'border border-border bg-white text-ink hover:bg-surface'
            }`}
            title={item.hint}
          >
            {item.label}
            {item.id !== 'all' ? (
              <span
                className={`ml-1.5 text-xs font-normal ${
                  market === item.id ? 'text-white/80' : 'text-ink-muted'
                }`}
              >
                {item.hint}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-border bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['7d', 'Last 7 days'],
              ['30d', 'Last 30 days'],
              ['90d', 'Last 90 days'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                preset === id
                  ? 'bg-brand text-white'
                  : 'border border-border bg-surface text-ink hover:bg-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="inline-flex items-center gap-1 font-medium text-ink">
            From
            <MetricTip text="Start of range (Pacific/Auckland calendar day for bucketing)." />
          </span>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setPreset('custom')
              setFrom(e.target.value)
            }}
            className="rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="inline-flex items-center gap-1 font-medium text-ink">
            To
            <MetricTip text="End of range (inclusive)." />
          </span>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setPreset('custom')
              setTo(e.target.value)
            }}
            className="rounded-md border border-border px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={() => void load(from, to, market)}
          disabled={loading}
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="rounded-md border border-border bg-white p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
            Traffic by domain
            <MetricTip text="Enquiries, CTA clicks, and tracked page views in this date range, grouped by the site the visitor arrived on. Charts below follow the domain button you selected." />
          </h3>
          <span className="text-xs text-ink-muted">
            {market === 'all'
              ? 'All domains'
              : `${marketLabel(market)} · ${marketHostHint(market)}`}
          </span>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-muted">
                <th className="py-2 pr-3 font-medium">Domain</th>
                <th className="py-2 px-3 font-medium text-right">Enquiries</th>
                <th className="py-2 px-3 font-medium text-right">CTA clicks</th>
                <th className="py-2 pl-3 font-medium text-right">Page views</th>
              </tr>
            </thead>
            <tbody>
              {byMarketRows.map((row) => {
                const active = market === row.market
                return (
                  <tr
                    key={row.market}
                    className={`border-b border-border last:border-0 ${
                      active ? 'bg-brand-light/40' : ''
                    }`}
                  >
                    <td className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => setMarket(row.market)}
                        className="text-left"
                      >
                        <span className="font-medium text-ink">
                          {marketLabel(row.market)}
                        </span>
                        <span className="ml-2 text-xs text-ink-muted">
                          {row.hostHint}
                        </span>
                      </button>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-ink">
                      {loading && !summary ? '…' : row.enquiries}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-ink">
                      {loading && !summary ? '…' : row.ctaClicks}
                    </td>
                    <td className="py-2 pl-3 text-right tabular-nums text-ink">
                      {loading && !summary ? '…' : row.pageViews}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CARD_META.map((card) => (
          <div
            key={card.label}
            className="rounded-md border border-border bg-white px-4 py-3"
          >
            <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
              {card.label}
              <MetricTip text={card.tip} />
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
              {loading && !summary ? '…' : cardValue(card.valueKey)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleBarChart
          title="Enquiries per day"
          tip="How many completed enquiry/discovery forms were saved each Auckland calendar day."
          points={enquiryPoints}
          emptyLabel="No completed enquiries in this date range."
        />
        <SimpleBarChart
          title="Contact CTA clicks per day"
          tip="Daily clicks on contact CTAs on the live site. Empty until visitors click after the tracker went live."
          points={ctaPoints}
          emptyLabel="No CTA clicks recorded yet in this range (localhost is ignored)."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PageViewTable
          title="Service page views"
          tip="Page loads of /services and each service landing page on the live site. Not unique visitors — each visit counts."
          rows={summary?.pageViews.services ?? []}
        />
        <PageViewTable
          title="Solution page views"
          tip="Page loads of /solutions and each solution page on the live site. Not unique visitors — each visit counts."
          rows={summary?.pageViews.solutions ?? []}
        />
      </div>

      <div className="rounded-md border border-border bg-white p-4">
        <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          Top CTA labels
          <MetricTip text="Which contact buttons were clicked most often in this range." />
        </h3>
        {!summary || summary.ctaClicks.byLabel.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            Clicks on “Contact Us”, “Get a free quote”, floating enquiry, and
            other #contact / tel links on the live site will appear here.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {summary.ctaClicks.byLabel.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span className="truncate text-ink">{row.label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-ink">
                  {row.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
