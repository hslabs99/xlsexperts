'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import {
  defaultPageSeoMarkets,
  pagesForKind,
  type PageSeoFaq,
  type PageSeoFields,
  type PageSeoKind,
  type PageSeoMarkets,
} from '@/lib/page-seo'
import { cloneFaqs } from '@/lib/page-seo-faqs'
import { MARKET_IDS, marketLabel, marketShortLabel, type MarketId } from '@/lib/market'
import {
  DESC_MAX,
  DESC_MIN,
  TITLE_MAX,
  renderedTitleLength,
} from '@/lib/serp-copy'
import { cmsAnchorId, replaceAdminFocusHash, scrollCmsAnchor } from '@/lib/admin-focus'
import { cmsFocusRingClass, useCmsEditorFocus } from '@/lib/use-cms-editor-focus'

const FIELD_HELP: {
  key: keyof PageSeoFields
  label: string
  rows?: number
  hint?: string
}[] = [
  {
    key: 'h1',
    label: 'H1 (hero heading)',
    rows: 2,
    hint: 'Primary on-page heading shown in the hero.',
  },
  {
    key: 'heroIntro',
    label: 'Hero intro (under H1)',
    rows: 5,
    hint: 'Supporting paragraph immediately under the H1 on the page.',
  },
  {
    key: 'metaTitle',
    label: 'Meta title',
    rows: 2,
    hint: 'Browser tab / Google title. Max 60 characters including “ | XLS Experts”. Prefer {region} instead of NZ/UK/US.',
  },
  {
    key: 'metaDescription',
    label: 'Meta description',
    rows: 3,
    hint: 'Google snippet. 140–155 characters after {region} is filled. Leave Open Graph blank to reuse this.',
  },
  {
    key: 'keywords',
    label: 'Meta keywords',
    rows: 2,
    hint: 'Comma-separated keywords (and other target phrases).',
  },
  {
    key: 'ogTitle',
    label: 'Open Graph title',
    rows: 2,
    hint: 'Social share title. Leave blank to use meta title.',
  },
  {
    key: 'ogDescription',
    label: 'Open Graph description',
    rows: 3,
    hint: 'Social share description. Leave blank to use meta description.',
  },
  {
    key: 'ogImage',
    label: 'Open Graph image',
    rows: 1,
    hint: 'Path or absolute URL (e.g. /images/og-default.png). Blank = site default.',
  },
  {
    key: 'twitterTitle',
    label: 'Twitter title',
    rows: 2,
    hint: 'Leave blank to fall back to Open Graph / meta title.',
  },
  {
    key: 'twitterDescription',
    label: 'Twitter description',
    rows: 3,
    hint: 'Leave blank to fall back to Open Graph / meta description.',
  },
  {
    key: 'twitterImage',
    label: 'Twitter image',
    rows: 1,
    hint: 'Leave blank to fall back to Open Graph image.',
  },
  {
    key: 'seoNotes',
    label: 'Internal SEO notes',
    rows: 3,
    hint: 'Not shown on the public site — for technician notes only.',
  },
]

export function AdminPageSeoPanel() {
  const [markets, setMarkets] = useState<PageSeoMarkets>(() =>
    defaultPageSeoMarkets()
  )
  const [market, setMarket] = useState<MarketId>('nz')
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [kind, setKind] = useState<PageSeoKind>('service')
  const [selectedPath, setSelectedPath] = useState(
    pagesForKind('service')[0]?.path ?? ''
  )
  const [bookmarkField, setBookmarkField] = useState('')
  const pendingAnchor = useRef<{ id: string; top: number } | null>(null)

  const list = useMemo(() => pagesForKind(kind), [kind])
  const pages = markets[market]

  const selectedIndex = list.findIndex((item) => item.path === selectedPath)
  const selected = selectedIndex >= 0 ? list[selectedIndex] : list[0]
  const fields: PageSeoFields | null = selected
    ? pages[selected.path] ?? null
    : null

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/page-seo')
      const data = (await res.json()) as {
        ok?: boolean
        markets?: PageSeoMarkets
        publishedAt?: string | null
        updatedAt?: string | null
        error?: string
      }
      if (!res.ok || !data.ok || !data.markets) {
        throw new Error(data.error || 'Failed to load page SEO')
      }
      setMarkets(data.markets)
      setPublishedAt(data.publishedAt ?? null)
      setUpdatedAt(data.updatedAt ?? null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load page SEO from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const focusHighlight = useCmsEditorFocus('pages', (focus) => {
    setMarket(focus.market)
    if (focus.kind) setKind(focus.kind)
    if (focus.path) setSelectedPath(focus.path)
    if (focus.field) setBookmarkField(focus.field)
    return focus.field
      ? cmsAnchorId(['pages', 'field', focus.field])
      : cmsAnchorId(['pages', 'editor'])
  })

  const restoredAfterLoad = useRef(false)
  useEffect(() => {
    if (loading || !focusHighlight || restoredAfterLoad.current) return
    restoredAfterLoad.current = true
    scrollCmsAnchor(
      focusHighlight,
      focusHighlight.includes('faqs') ? 'start' : 'center'
    )
  }, [loading, focusHighlight])

  useEffect(() => {
    if (!list.some((item) => item.path === selectedPath)) {
      setSelectedPath(list[0]?.path ?? '')
    }
  }, [kind, list, selectedPath])

  useEffect(() => {
    if (loading || !selectedPath) return
    replaceAdminFocusHash({
      tab: 'cms',
      cms: 'pages',
      market,
      path: selectedPath,
      kind,
      field: bookmarkField,
    })
  }, [bookmarkField, kind, loading, market, selectedPath])

  useLayoutEffect(() => {
    const pending = pendingAnchor.current
    if (!pending) return
    pendingAnchor.current = null
    if (!pending.id) {
      window.scrollTo(0, pending.top)
      return
    }
    const el = document.getElementById(pending.id)
    if (!el) return
    window.scrollBy(0, el.getBoundingClientRect().top - pending.top)
  }, [market])

  function changeMarket(next: MarketId) {
    if (next === market) return
    const faqId = cmsAnchorId(['pages', 'field', 'faqs'])
    const fieldId = bookmarkField
      ? cmsAnchorId(['pages', 'field', bookmarkField])
      : faqId
    const el =
      document.getElementById(fieldId) ?? document.getElementById(faqId)
    if (el) {
      const rect = el.getBoundingClientRect()
      const inView = rect.bottom > 80 && rect.top < window.innerHeight
      if (inView) {
        pendingAnchor.current = { id: el.id, top: rect.top }
        if (el.id === faqId) setBookmarkField('faqs')
      } else {
        pendingAnchor.current = { id: '', top: window.scrollY }
      }
    } else {
      pendingAnchor.current = { id: '', top: window.scrollY }
    }
    setMarket(next)
    setMessage(null)
  }

  function updateField<K extends keyof PageSeoFields>(
    key: K,
    value: PageSeoFields[K]
  ) {
    if (!selected) return
    setMarkets((prev) => ({
      ...prev,
      [market]: {
        ...prev[market],
        [selected.path]: {
          ...prev[market][selected.path],
          [key]: value,
        },
      },
    }))
  }

  function copyNzToMarket(target: MarketId) {
    if (!selected || target === 'nz') return
    const nzFields = markets.nz[selected.path]
    if (!nzFields) return
    setMarkets((prev) => ({
      ...prev,
      [target]: {
        ...prev[target],
        [selected.path]: { ...nzFields, faqs: cloneFaqs(nzFields.faqs ?? []) },
      },
    }))
    changeMarket(target)
    setMessage(
      `Copied NZ fields for ${selected.path} into ${marketLabel(target)}. Review and save draft.`
    )
  }

  function goRelative(delta: number) {
    if (!list.length) return
    const idx = selectedIndex >= 0 ? selectedIndex : 0
    const next = (idx + delta + list.length) % list.length
    setSelectedPath(list[next].path)
    setMessage(null)
  }

  async function handleSave() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/page-seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', markets }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        markets?: PageSeoMarkets
        message?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.markets) {
        throw new Error(data.error || 'Save failed')
      }
      setMarkets(data.markets)
      setUpdatedAt(new Date().toISOString())
      setMessage(
        data.message ||
          'Draft saved for the full catalog (all services, solutions, NZ + International + UK). Click Publish when ready for the public site.'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function handlePublish() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/page-seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', markets }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        markets?: PageSeoMarkets
        publishedAt?: string
        filePath?: string
        message?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.markets) {
        throw new Error(data.error || 'Publish failed')
      }
      setMarkets(data.markets)
      setPublishedAt(data.publishedAt ?? null)
      setMessage(
        data.message ||
          `Published full catalog (all pages, NZ + International + UK) to ${data.filePath ?? 'data/page-seo.generated.ts'}.`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-muted">
        Loading H1 / meta tags from Firebase…
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Pages CMS — H1, intro, meta &amp; FAQs
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Per service and solution landing pages: H1, hero intro, SEO meta,
            and on-page FAQs. Separate fields for <strong>New Zealand</strong>,{' '}
            <strong>International</strong>, and the{' '}
            <strong>United Kingdom</strong>. Site-wide defaults, homepage, and
            contact live under <strong>CMS → Site CMS</strong>. Use the left
            column for Services/Solutions navigation. The public site picks
            market from the arrival domain (or local{' '}
            <code className="text-xs">/nz</code> /{' '}
            <code className="text-xs">/usa</code> /{' '}
            <code className="text-xs">/uk</code>
            ). Commit{' '}
            <code className="text-xs">data/page-seo.generated.ts</code> after
            Publish on production deploys.
          </p>
          <p className="mt-2 text-xs text-ink-muted">
            Last draft update:{' '}
            {updatedAt ? new Date(updatedAt).toLocaleString('en-NZ') : '—'}
            {' · '}
            Last publish:{' '}
            {publishedAt
              ? new Date(publishedAt).toLocaleString('en-NZ')
              : 'never'}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSave()}
              className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-60"
            >
              Save draft (all)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handlePublish()}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              Publish (all)
            </button>
          </div>
          <p className="max-w-xs text-right text-xs text-ink-muted">
            Saves the full CMS catalog: every service and solution page (H1, intro,
            meta, and FAQs), for <strong>NZ, International, and UK</strong> — not
            only the page open on the right.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      )}

      <div className="sticky top-0 z-20 -mx-6 mb-1 border-b border-border bg-surface/95 px-6 py-3 backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <PagesMarketSwitcher market={market} onChange={changeMarket} />
          {selected ? (
            <p className="truncate text-xs text-ink-muted">
              {selected.label}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div
            className="flex flex-col gap-2"
            role="group"
            aria-label="Page type"
          >
            {([
              { id: 'service' as const, label: 'Services' },
              { id: 'solution' as const, label: 'Solutions' },
            ] as const).map((opt) => {
              const active = kind === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setKind(opt.id)}
                  className={
                    active
                      ? 'rounded-md bg-brand px-4 py-2 text-left text-sm font-semibold text-white'
                      : 'rounded-md border border-border bg-white px-4 py-2 text-left text-sm font-semibold text-ink transition hover:bg-gray-50'
                  }
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          <nav
            className="max-h-[60vh] space-y-1 overflow-y-auto rounded-md border border-border bg-white p-2"
            aria-label={`${kind === 'service' ? 'Services' : 'Solutions'} pages`}
          >
            {list.map((item, index) => {
              const active = item.path === selected?.path
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    setSelectedPath(item.path)
                    setMessage(null)
                  }}
                  className={
                    active
                      ? 'flex w-full flex-col rounded-md bg-brand/10 px-3 py-2 text-left text-sm'
                      : 'flex w-full flex-col rounded-md px-3 py-2 text-left text-sm transition hover:bg-gray-50'
                  }
                >
                  <span className="font-semibold text-ink">
                    {index + 1}. {item.label}
                  </span>
                  <span className="truncate text-xs text-ink-muted">
                    {item.path}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        <div id={cmsAnchorId(['pages', 'editor'])} className="space-y-4">
          {selected && fields ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    {selected.label}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {selected.path}
                    {' · '}
                    {marketShortLabel(market)}
                    {' · '}
                    {selectedIndex + 1} of {list.length}
                    {' · '}
                    edits apply on next Save draft (all)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={selected.path}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-gray-50"
                  >
                    Open page
                  </a>
                  {market !== 'nz' ? (
                    <button
                      type="button"
                      onClick={() => copyNzToMarket(market)}
                      className="rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-gray-50"
                    >
                      Copy NZ → {marketShortLabel(market)}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={list.length < 2}
                    onClick={() => goRelative(-1)}
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={list.length < 2}
                    onClick={() => goRelative(1)}
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={fields.robotsIndex}
                    onChange={(e) => updateField('robotsIndex', e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  robots: index
                </label>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={fields.robotsFollow}
                    onChange={(e) =>
                      updateField('robotsFollow', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-border"
                  />
                  robots: follow
                </label>
              </div>

              <div className="space-y-4">
                {FIELD_HELP.map((field) => {
                  const value = String(fields[field.key] ?? '')
                  const rows = field.rows ?? 1
                  const titleLen =
                    field.key === 'metaTitle' ? renderedTitleLength(value) : null
                  const descLen =
                    field.key === 'metaDescription' ? value.trim().length : null
                  const countBad =
                    (titleLen !== null && titleLen > TITLE_MAX) ||
                    (descLen !== null &&
                      (descLen < DESC_MIN || descLen > DESC_MAX))
                  return (
                    <label
                      key={field.key}
                      id={cmsAnchorId(['pages', 'field', field.key])}
                      className={`block space-y-1 rounded-md ${cmsFocusRingClass(
                        focusHighlight ===
                          cmsAnchorId(['pages', 'field', field.key])
                      )}`}
                    >
                      <span className="text-sm font-medium text-ink">
                        {field.label}
                      </span>
                      {field.hint && (
                        <span className="block text-xs text-ink-muted">
                          {field.hint}
                        </span>
                      )}
                      {rows > 1 ? (
                        <textarea
                          value={value}
                          rows={rows}
                          onFocus={() => setBookmarkField(field.key)}
                          onChange={(e) =>
                            updateField(
                              field.key,
                              e.target.value as PageSeoFields[typeof field.key]
                            )
                          }
                          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onFocus={() => setBookmarkField(field.key)}
                          onChange={(e) =>
                            updateField(
                              field.key,
                              e.target.value as PageSeoFields[typeof field.key]
                            )
                          }
                          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
                        />
                      )}
                      {titleLen !== null ? (
                        <span
                          className={`block text-xs ${countBad ? 'text-red-700' : 'text-ink-muted'}`}
                        >
                          {titleLen}/{TITLE_MAX} including “ | XLS Experts”
                        </span>
                      ) : null}
                      {descLen !== null ? (
                        <span
                          className={`block text-xs ${countBad ? 'text-red-700' : 'text-ink-muted'}`}
                        >
                          {descLen} characters (need {DESC_MIN}–{DESC_MAX})
                        </span>
                      ) : null}
                    </label>
                  )
                })}
              </div>

              <PageSeoFaqEditor
                faqs={fields.faqs ?? []}
                highlight={focusHighlight}
                market={market}
                onMarketChange={changeMarket}
                onChange={(faqs) => updateField('faqs', faqs)}
                onFocusField={() => setBookmarkField('faqs')}
              />
            </>
          ) : (
            <p className="text-sm text-ink-muted">No pages in this group.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function PagesMarketSwitcher({
  market,
  onChange,
  compact,
}: {
  market: MarketId
  onChange: (market: MarketId) => void
  compact?: boolean
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Market"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Market
      </span>
      {MARKET_IDS.map((id) => {
        const active = market === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={
              active
                ? compact
                  ? 'rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white'
                  : 'rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white'
                : compact
                  ? 'rounded-md border border-border bg-white px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-gray-50'
                  : 'rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50'
            }
          >
            {marketShortLabel(id)}
          </button>
        )
      })}
      <span className="text-xs text-ink-muted">
        Editing: {marketLabel(market)}
      </span>
    </div>
  )
}

function PageSeoFaqEditor({
  faqs,
  highlight,
  market,
  onMarketChange,
  onChange,
  onFocusField,
}: {
  faqs: PageSeoFaq[]
  highlight: string | null
  market: MarketId
  onMarketChange: (market: MarketId) => void
  onChange: (faqs: PageSeoFaq[]) => void
  onFocusField: () => void
}) {
  function updateFaq(index: number, patch: Partial<PageSeoFaq>) {
    const next = cloneFaqs(faqs)
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }

  function moveFaq(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= faqs.length) return
    const next = cloneFaqs(faqs)
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    onChange(next)
  }

  return (
    <div
      id={cmsAnchorId(['pages', 'field', 'faqs'])}
      className={`scroll-mt-24 space-y-3 rounded-md border border-border bg-white p-4 ${cmsFocusRingClass(
        highlight === cmsAnchorId(['pages', 'field', 'faqs'])
      )}`}
      onFocusCapture={onFocusField}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-ink">On-page FAQs</h4>
          <p className="mt-1 text-xs text-ink-muted">
            Stay on this block and switch NZ / Intl / UK. Empty pairs are dropped
            on save.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...cloneFaqs(faqs), { q: '', a: '' }])}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add question
        </button>
      </div>
      <PagesMarketSwitcher
        market={market}
        onChange={onMarketChange}
        compact
      />

      {faqs.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No FAQs yet. Add a question or save draft to load the seeded defaults.
        </p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={`faq-${index}`}
              className="space-y-2 rounded-md border border-border bg-surface p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Question {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Move up"
                    aria-label={`Move FAQ ${index + 1} up`}
                    onClick={() => moveFaq(index, -1)}
                    disabled={index === 0}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-ink hover:bg-white disabled:opacity-40"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    aria-label={`Move FAQ ${index + 1} down`}
                    onClick={() => moveFaq(index, 1)}
                    disabled={index === faqs.length - 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-ink hover:bg-white disabled:opacity-40"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Remove"
                    aria-label={`Remove FAQ ${index + 1}`}
                    onClick={() =>
                      onChange(faqs.filter((_, i) => i !== index))
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={faq.q}
                onChange={(e) => updateFaq(index, { q: e.target.value })}
                placeholder="Question"
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
              />
              <textarea
                value={faq.a}
                rows={4}
                onChange={(e) => updateFaq(index, { a: e.target.value })}
                placeholder="Answer"
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

