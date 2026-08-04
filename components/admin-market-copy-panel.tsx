'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MARKET_COPY_FIELDS,
  defaultMarketCopyBundle,
  getByPath,
  setByPath,
  type MarketCopyBundle,
} from '@/lib/market-copy'
import { marketLabel, type MarketId } from '@/lib/market'

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
        publishedAt?: string | null
        updatedAt?: string | null
        error?: string
      }
      if (!res.ok || !data.ok || !data.markets) {
        throw new Error(data.error || 'Failed to load market copy')
      }
      setMarkets(data.markets)
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
        getByPath(markets.intl, field.path).toLowerCase().includes(q)
      )
    })
  }, [filter, groupFilter, markets])

  function updateField(market: MarketId, path: string, value: string) {
    setMarkets((prev) => ({
      ...prev,
      [market]: setByPath(prev[market], path, value),
    }))
  }

  function copyNzToIntl(path: string) {
    const value = getByPath(markets.nz, path)
    updateField('intl', path, value)
  }

  async function handleSave() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/market-copy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', markets }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        markets?: MarketCopyBundle
        message?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.markets) {
        throw new Error(data.error || 'Save failed')
      }
      setMarkets(data.markets)
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
        body: JSON.stringify({ action: 'publish', markets }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        markets?: MarketCopyBundle
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
        Loading NZ / International market copy from Firebase…
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Site CMS — NZ / Global copy
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Site-level content: defaults, homepage SEO, contact details, hero,
            about and FAQs. Edit New Zealand and Global (USA / Canada / UK /
            Australia) strings side by side. Save stores a draft in Firebase{' '}
            <code className="text-xs">Site Content / market-copy</code>.{' '}
            <strong>Publish</strong> writes{' '}
            <code className="text-xs">data/market-copy.generated.ts</code> so
            the public site never queries the database for these strings.
            Service and solution page H1s live under{' '}
            <strong>CMS → Pages CMS</strong>. Local testing: open{' '}
            <code className="text-xs">/nz</code> or{' '}
            <code className="text-xs">/usa</code> once — the choice is stored in
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
              <th className="px-3 py-3 font-semibold">
                {marketLabel('nz')}
              </th>
              <th className="px-3 py-3 font-semibold">
                {marketLabel('intl')}
              </th>
              <th className="px-3 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {visibleFields.map((field) => {
              const nzValue = getByPath(markets.nz, field.path)
              const intlValue = getByPath(markets.intl, field.path)
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
                  </td>
                  <td className="px-3 py-3">
                    <FieldInput
                      as={InputTag}
                      value={nzValue}
                      onChange={(v) => updateField('nz', field.path, v)}
                      multiline={field.multiline}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <FieldInput
                      as={InputTag}
                      value={intlValue}
                      onChange={(v) => updateField('intl', field.path, v)}
                      multiline={field.multiline}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      disabled={busy || nzValue === intlValue}
                      onClick={() => copyNzToIntl(field.path)}
                      className="rounded border border-border px-2 py-1 text-xs font-medium text-ink hover:bg-gray-50 disabled:opacity-40"
                      title="Copy NZ value into International"
                    >
                      NZ → Intl
                    </button>
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
