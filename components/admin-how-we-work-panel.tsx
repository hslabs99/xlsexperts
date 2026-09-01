'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  HOW_WE_WORK_FIELDS,
  defaultMarketCopyBundle,
  getByPath,
  setByPath,
  type MarketCopyBundle,
} from '@/lib/market-copy'
import { MARKET_IDS, marketLabel, type MarketId } from '@/lib/market'

export function AdminHowWeWorkPanel() {
  const [markets, setMarkets] = useState<MarketCopyBundle>(
    defaultMarketCopyBundle()
  )
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

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
        throw new Error(data.error || 'Failed to load How we work copy')
      }
      setMarkets(data.markets)
      setPublishedAt(data.publishedAt ?? null)
      setUpdatedAt(data.updatedAt ?? null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load How we work copy from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function updateField(market: MarketId, path: string, value: string) {
    setMarkets((prev) => ({
      ...prev,
      [market]: setByPath(prev[market], path, value),
    }))
  }

  function copyNzToIntl(path: string) {
    updateField('intl', path, getByPath(markets.nz, path))
  }

  function copyNzToUk(path: string) {
    updateField('uk', path, getByPath(markets.nz, path))
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
        Loading How we work copy from Firebase…
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            How we work — NZ / International / UK
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Homepage process section: heading, four steps, principles, and the
            call to action. Each region has its own wording. Save stores a
            draft in Firebase{' '}
            <code className="text-xs">Site Content / market-copy</code>.{' '}
            <strong>Publish</strong> writes{' '}
            <code className="text-xs">data/market-copy.generated.ts</code>.
            Local testing: open <code className="text-xs">/nz</code>,{' '}
            <code className="text-xs">/usa</code>, or{' '}
            <code className="text-xs">/uk</code> once.
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

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-3 py-3 font-semibold">Field</th>
              {MARKET_IDS.map((id) => (
                <th key={id} className="px-3 py-3 font-semibold">
                  {marketLabel(id)}
                </th>
              ))}
              <th className="px-3 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {HOW_WE_WORK_FIELDS.map((field) => {
              const nzValue = getByPath(markets.nz, field.path)
              const intlValue = getByPath(markets.intl, field.path)
              const ukValue = getByPath(markets.uk, field.path)
              return (
                <tr key={field.path} className="align-top">
                  <td className="px-3 py-3">
                    <div className="font-medium text-ink">{field.label}</div>
                    <div className="mt-1 text-[11px] text-ink-muted">
                      {field.group}
                    </div>
                  </td>
                  {MARKET_IDS.map((id) => (
                    <td key={id} className="px-3 py-3">
                      <FieldInput
                        value={getByPath(markets[id], field.path)}
                        onChange={(v) => updateField(id, field.path, v)}
                        multiline={field.multiline}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-3">
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
  value,
  onChange,
  multiline,
}: {
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  const className =
    'w-full min-w-[14rem] rounded-md border border-border bg-white px-2.5 py-2 text-sm text-ink'
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
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
