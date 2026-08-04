'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  defaultPageSeoMarkets,
  pagesForKind,
  type PageSeoFields,
  type PageSeoKind,
  type PageSeoMarkets,
} from '@/lib/page-seo'
import { marketLabel, type MarketId } from '@/lib/market'

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
    hint: 'Browser tab / SERP title (document <title>).',
  },
  {
    key: 'metaDescription',
    label: 'Meta description',
    rows: 3,
    hint: 'SERP snippet under the title.',
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
  const [markets, setMarkets] = useState<PageSeoMarkets>(defaultPageSeoMarkets())
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

  useEffect(() => {
    if (!list.some((item) => item.path === selectedPath)) {
      setSelectedPath(list[0]?.path ?? '')
    }
  }, [kind, list, selectedPath])

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

  function copyNzToGlobalPage() {
    if (!selected) return
    const nzFields = markets.nz[selected.path]
    if (!nzFields) return
    setMarkets((prev) => ({
      ...prev,
      intl: {
        ...prev.intl,
        [selected.path]: { ...nzFields },
      },
    }))
    setMarket('intl')
    setMessage(
      `Copied NZ fields for ${selected.path} into Global. Review and save draft.`
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
          'Draft saved for the full catalog (all services, solutions, NZ + Global). Click Publish when ready for the public site.'
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
          `Published full catalog (all pages, NZ + Global) to ${data.filePath ?? 'data/page-seo.generated.ts'}.`
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
            Pages CMS — H1, intro &amp; meta
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Per service and solution landing pages: H1, hero intro, and SEO
            meta. Separate fields for <strong>New Zealand</strong> and{' '}
            <strong>Global</strong>. Site-wide defaults, homepage, and contact
            live under <strong>CMS → Site CMS</strong>. Use the left column for
            Services/Solutions navigation. The public site picks market from
            the arrival domain (or local{' '}
            <code className="text-xs">/nz</code> /{' '}
            <code className="text-xs">/usa</code>
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
            and meta), for <strong>both</strong> NZ and Global — not only the
            page open on the right.
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

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Market">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Market
        </span>
        {(
          [
            { id: 'nz' as const, label: 'NZ' },
            { id: 'intl' as const, label: 'Global' },
          ] as const
        ).map((opt) => {
          const active = market === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setMarket(opt.id)
                setMessage(null)
              }}
              className={
                active
                  ? 'rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50'
              }
            >
              {opt.label}
            </button>
          )
        })}
        <span className="text-xs text-ink-muted">
          Editing: {marketLabel(market)}
        </span>
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

        <div className="space-y-4">
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
                    {market === 'nz' ? 'NZ' : 'Global'}
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
                  {market === 'intl' ? (
                    <button
                      type="button"
                      onClick={copyNzToGlobalPage}
                      className="rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-gray-50"
                    >
                      Copy NZ → Global
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
                  return (
                    <label key={field.key} className="block space-y-1">
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
                          onChange={(e) =>
                            updateField(
                              field.key,
                              e.target.value as PageSeoFields[typeof field.key]
                            )
                          }
                          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
                        />
                      )}
                    </label>
                  )
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-muted">No pages in this group.</p>
          )}
        </div>
      </div>
    </div>
  )
}
