'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CONTACT_DETAIL_FIELDS,
  DEFAULT_HERO_BACKGROUND_HOLD_SECONDS,
  HERO_BADGE_DEFS,
  HERO_BACKGROUND_HOLD_SECONDS_MAX,
  HERO_BACKGROUND_HOLD_SECONDS_MIN,
  MARKET_COPY_FIELDS,
  defaultMarketCopyBundle,
  getByPath,
  normalizeHeroBackgroundHoldSeconds,
  setByPath,
  type MarketCopyBundle,
} from '@/lib/market-copy'
import { MARKET_IDS, marketLabel, type MarketId } from '@/lib/market'
import { HERO_BADGE_LINK_OPTIONS } from '@/lib/hero-badge-links'

export function AdminMarketCopyPanel() {
  const [markets, setMarkets] = useState<MarketCopyBundle>(
    defaultMarketCopyBundle()
  )
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [heroHoldSeconds, setHeroHoldSeconds] = useState(
    DEFAULT_HERO_BACKGROUND_HOLD_SECONDS,
  )

  const groups = useMemo(() => {
    const set = new Set(MARKET_COPY_FIELDS.map((f) => f.group))
    return Array.from(set)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/market-copy')
      const data = (await res.json()) as {
        ok?: boolean
        markets?: MarketCopyBundle
        heroBackgroundHoldSeconds?: unknown
        publishedAt?: string | null
        updatedAt?: string | null
        error?: string
      }
      if (!res.ok || !data.ok || !data.markets) {
        throw new Error(data.error || 'Failed to load market copy')
      }
      setMarkets(data.markets)
      setHeroHoldSeconds(
        normalizeHeroBackgroundHoldSeconds(data.heroBackgroundHoldSeconds),
      )
      setPublishedAt(data.publishedAt ?? null)
      setUpdatedAt(data.updatedAt ?? null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load market copy from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const visibleFields = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return MARKET_COPY_FIELDS.filter((field) => {
      if (groupFilter !== 'all' && field.group !== groupFilter) return false
      if (!q) return true
      return (
        field.path.toLowerCase().includes(q) ||
        field.label.toLowerCase().includes(q) ||
        field.group.toLowerCase().includes(q) ||
        getByPath(markets.nz, field.path).toLowerCase().includes(q) ||
        getByPath(markets.intl, field.path).toLowerCase().includes(q) ||
        getByPath(markets.uk, field.path).toLowerCase().includes(q)
      )
    })
  }, [filter, groupFilter, markets])

  function updateField(market: MarketId, path: string, value: string) {
    setMarkets((prev) => ({
      ...prev,
      [market]: setByPath(prev[market], path, value),
    }))
  }

  function copyField(from: MarketId, to: MarketId, path: string) {
    const value = getByPath(markets[from], path)
    updateField(to, path, value)
  }

  function copyNzToIntl(path: string) {
    copyField('nz', 'intl', path)
  }

  function copyNzToUk(path: string) {
    copyField('nz', 'uk', path)
  }

  async function handleSave() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/market-copy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          markets,
          heroBackgroundHoldSeconds: heroHoldSeconds,
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        markets?: MarketCopyBundle
        heroBackgroundHoldSeconds?: unknown
        message?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.markets) {
        throw new Error(data.error || 'Save failed')
      }
      setMarkets(data.markets)
      if (data.heroBackgroundHoldSeconds !== undefined) {
        setHeroHoldSeconds(
          normalizeHeroBackgroundHoldSeconds(data.heroBackgroundHoldSeconds),
        )
      }
      setMessage(
        data.message ||
          'Draft saved. Click Publish to update the static file used by the public site.'
      )
      setUpdatedAt(new Date().toISOString())
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
      const res = await fetch('/api/admin/market-copy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          markets,
          heroBackgroundHoldSeconds: heroHoldSeconds,
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        markets?: MarketCopyBundle
        heroBackgroundHoldSeconds?: unknown
        publishedAt?: string
        filePath?: string
        message?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.markets) {
        throw new Error(data.error || 'Publish failed')
      }
      setMarkets(data.markets)
      if (data.heroBackgroundHoldSeconds !== undefined) {
        setHeroHoldSeconds(
          normalizeHeroBackgroundHoldSeconds(data.heroBackgroundHoldSeconds),
        )
      }
      setPublishedAt(data.publishedAt ?? null)
      setMessage(
        data.message ||
          `Published to ${data.filePath ?? 'data/market-copy.generated.ts'}.`
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
        Loading NZ / International / UK market copy from Firebase…
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Site CMS — NZ / International / UK copy
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Site-level content: defaults, homepage SEO, contact details, hero,
            about and FAQs. Edit New Zealand, International, and United Kingdom
            strings side by side. Save stores a draft in Firebase{' '}
            <code className="text-xs">Site Content / market-copy</code>.{' '}
            <strong>Publish</strong> writes{' '}
            <code className="text-xs">data/market-copy.generated.ts</code> so
            the public site never queries the database for these strings.
            Service and solution page H1s live under{' '}
            <strong>CMS → Pages CMS</strong>. Local testing: open{' '}
            <code className="text-xs">/nz</code>,{' '}
            <code className="text-xs">/usa</code>, or{' '}
            <code className="text-xs">/uk</code> once — the choice is stored in
            a cookie and stays for the rest of the site.
          </p>
          <p className="mt-2 text-xs text-ink-muted">
            Last draft update:{' '}
            {updatedAt ? new Date(updatedAt).toLocaleString('en-NZ') : '—'}
            {' · '}
            Last publish:{' '}
            {publishedAt ? new Date(publishedAt).toLocaleString('en-NZ') : 'never'}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSave()}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-60"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handlePublish()}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            Publish
          </button>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`rounded-md border p-3 text-sm ${
            error
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-brand/30 bg-brand-light text-brand-dark'
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="rounded-md border border-border bg-white p-4">
        <h3 className="text-sm font-semibold text-ink">
          Homepage hero background
        </h3>
        <p className="mt-1 text-xs text-ink-muted">
          How long each rotating industry image stays on screen before the next
          one. Same setting for NZ, International, and UK. Save draft, then
          Publish.
        </p>
        <label className="mt-3 flex max-w-xs flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Seconds per image</span>
          <input
            type="number"
            min={HERO_BACKGROUND_HOLD_SECONDS_MIN}
            max={HERO_BACKGROUND_HOLD_SECONDS_MAX}
            step={1}
            value={heroHoldSeconds}
            disabled={busy}
            onChange={(event) =>
              setHeroHoldSeconds(
                normalizeHeroBackgroundHoldSeconds(event.target.value),
              )
            }
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
          />
          <span className="text-[11px] text-ink-muted">
            {HERO_BACKGROUND_HOLD_SECONDS_MIN}–{HERO_BACKGROUND_HOLD_SECONDS_MAX}{' '}
            seconds (current default {DEFAULT_HERO_BACKGROUND_HOLD_SECONDS}).
          </span>
        </label>
      </div>

      <div className="rounded-md border border-border bg-white p-4">
        <h3 className="text-base font-semibold text-ink">
          Homepage hero badges
        </h3>
        <p className="mt-1 text-sm text-ink-muted">
          The three straplines under the green hero title. Set the label text
          and optionally link each badge to a service or solution page (same
          list as the main site nav). Save draft + Publish above writes{' '}
          <code className="text-xs">data/market-copy.generated.ts</code> for
          the live site.
        </p>
        <div className="mt-4 space-y-4">
          {HERO_BADGE_DEFS.map((badge) => (
            <div
              key={badge.id}
              className="rounded-md border border-border/80 bg-surface p-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {badge.label}
              </p>
              <div className="mt-2 grid gap-3 lg:grid-cols-3">
                {MARKET_IDS.map((market) => (
                  <div key={market} className="space-y-2">
                    <p className="text-xs font-medium text-ink">
                      {marketLabel(market)}
                    </p>
                    <label className="block space-y-1">
                      <span className="text-xs text-ink-muted">Label text</span>
                      <input
                        type="text"
                        value={getByPath(markets[market], badge.textPath)}
                        onChange={(e) =>
                          updateField(market, badge.textPath, e.target.value)
                        }
                        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-xs text-ink-muted">
                        Links to page
                      </span>
                      <select
                        value={getByPath(markets[market], badge.hrefPath)}
                        onChange={(e) =>
                          updateField(market, badge.hrefPath, e.target.value)
                        }
                        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
                      >
                        <option value="">No link</option>
                        <optgroup label="Services">
                          {HERO_BADGE_LINK_OPTIONS.filter(
                            (o) => o.group === 'services'
                          ).map((o) => (
                            <option key={`s-${market}-${o.href}`} value={o.href}>
                              {o.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Solutions">
                          {HERO_BADGE_LINK_OPTIONS.filter(
                            (o) => o.group === 'solutions'
                          ).map((o) => (
                            <option key={`o-${market}-${o.href}`} value={o.href}>
                              {o.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Other">
                          {HERO_BADGE_LINK_OPTIONS.filter(
                            (o) => o.group === 'other'
                          ).map((o) => (
                            <option key={`x-${market}-${o.href}`} value={o.href}>
                              {o.label}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </label>
                    {market === 'nz' ? (
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            copyNzToIntl(badge.textPath)
                            copyNzToIntl(badge.hrefPath)
                          }}
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          Copy NZ → Intl
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            copyNzToUk(badge.textPath)
                            copyNzToUk(badge.hrefPath)
                          }}
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          Copy NZ → UK
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-white p-4">
        <h3 className="text-base font-semibold text-ink">Contact details</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Phone, WhatsApp, and location on Contact Us, the thank-you page, and
          the floating call button. Set a different number and region line for
          New Zealand, International, and the United Kingdom. Save draft to
          preview on localhost; Publish for the live sites.
        </p>
        <div className="mt-4 space-y-4">
          {CONTACT_DETAIL_FIELDS.map((field) => (
            <div
              key={field.path}
              className="rounded-md border border-border/80 bg-surface p-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {field.label}
              </p>
              {field.hint ? (
                <p className="mt-0.5 text-xs text-ink-muted">{field.hint}</p>
              ) : null}
              <div className="mt-2 grid gap-3 lg:grid-cols-3">
                {MARKET_IDS.map((market) => (
                  <div key={market} className="space-y-2">
                    <p className="text-xs font-medium text-ink">
                      {marketLabel(market)}
                    </p>
                    <FieldInput
                      as={field.multiline ? 'textarea' : 'input'}
                      value={getByPath(markets[market], field.path)}
                      onChange={(v) => updateField(market, field.path, v)}
                      multiline={field.multiline}
                    />
                    {market === 'nz' ? (
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => copyNzToIntl(field.path)}
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          Copy NZ → Intl
                        </button>
                        <button
                          type="button"
                          onClick={() => copyNzToUk(field.path)}
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          Copy NZ → UK
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by key, label, or text…"
          className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm sm:max-w-sm"
        />
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        >
          <option value="all">All groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <span className="text-xs text-ink-muted">
          {visibleFields.length} / {MARKET_COPY_FIELDS.length} fields
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-3 py-3 font-semibold">Key</th>
              {MARKET_IDS.map((id) => (
                <th key={id} className="px-3 py-3 font-semibold">
                  {marketLabel(id)}
                </th>
              ))}
              <th className="px-3 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {visibleFields.map((field) => {
              const nzValue = getByPath(markets.nz, field.path)
              const intlValue = getByPath(markets.intl, field.path)
              const ukValue = getByPath(markets.uk, field.path)
              const InputTag = field.multiline ? 'textarea' : 'input'
              return (
                <tr key={field.path} className="align-top">
                  <td className="px-3 py-3">
                    <div className="font-medium text-ink">{field.label}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-ink-muted">
                      {field.path}
                    </div>
                    <div className="mt-1 text-[11px] text-ink-muted">
                      {field.group}
                    </div>
                    {field.hint ? (
                      <div className="mt-1 text-[11px] text-ink-muted">
                        {field.hint}
                      </div>
                    ) : null}
                  </td>
                  {MARKET_IDS.map((id) => (
                    <td key={id} className="px-3 py-3">
                      <FieldInput
                        as={InputTag}
                        value={getByPath(markets[id], field.path)}
                        onChange={(v) => updateField(id, field.path, v)}
                        multiline={field.multiline}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    {field.independentPerMarket ? (
                      <span className="text-[11px] text-ink-muted">
                        One label per region
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          disabled={busy || nzValue === intlValue}
                          onClick={() => copyNzToIntl(field.path)}
                          className="rounded border border-border px-2 py-1 text-xs font-medium text-ink hover:bg-gray-50 disabled:opacity-40"
                          title="Copy NZ value into International"
                        >
                          NZ → Intl
                        </button>
                        <button
                          type="button"
                          disabled={busy || nzValue === ukValue}
                          onClick={() => copyNzToUk(field.path)}
                          className="rounded border border-border px-2 py-1 text-xs font-medium text-ink hover:bg-gray-50 disabled:opacity-40"
                          title="Copy NZ value into United Kingdom"
                        >
                          NZ → UK
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FieldInput({
  as,
  value,
  onChange,
  multiline,
}: {
  as: 'input' | 'textarea'
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  const className =
    'w-full min-w-[14rem] rounded-md border border-border bg-white px-2.5 py-2 text-sm text-ink'
  if (as === 'textarea' || multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={className}
      />
    )
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  )
}
