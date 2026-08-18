'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  defaultDomainRegions,
  type DomainRegionConfig,
} from '@/lib/domain-regions'
import { MARKET_IDS, marketLabel, type MarketId } from '@/lib/market'

const REGION_BLURB: Record<MarketId, string> = {
  nz: 'New Zealand public site. Australia is not a separate site — it uses International.',
  intl: 'International / USA public site, including Australia.',
  uk: 'United Kingdom public site.',
}

export function AdminDomainRegionsPanel() {
  const [regions, setRegions] = useState<DomainRegionConfig>(
    defaultDomainRegions()
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
      const res = await fetch('/api/admin/domain-regions')
      const data = (await res.json()) as {
        ok?: boolean
        regions?: DomainRegionConfig
        publishedAt?: string | null
        updatedAt?: string | null
        error?: string
      }
      if (!res.ok || !data.ok || !data.regions) {
        throw new Error(data.error || 'Failed to load domain bindings')
      }
      setRegions(data.regions)
      setPublishedAt(data.publishedAt ?? null)
      setUpdatedAt(data.updatedAt ?? null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load domain bindings from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function updateRegion(
    market: MarketId,
    patch: Partial<{ hostsText: string; origin: string }>
  ) {
    setRegions((prev) => {
      const current = prev[market]
      return {
        ...prev,
        [market]: {
          hosts:
            patch.hostsText != null
              ? patch.hostsText
                  .split(/[\n,]+/)
                  .map((item) => item.trim())
                  .filter(Boolean)
              : current.hosts,
          origin: patch.origin != null ? patch.origin : current.origin,
        },
      }
    })
  }

  async function handleSave() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/domain-regions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', regions }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        regions?: DomainRegionConfig
        message?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.regions) {
        throw new Error(data.error || 'Save failed')
      }
      setRegions(data.regions)
      setUpdatedAt(new Date().toISOString())
      setMessage(
        data.message ||
          'Draft saved. Click Publish to update live host routing.'
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
      const res = await fetch('/api/admin/domain-regions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', regions }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        regions?: DomainRegionConfig
        publishedAt?: string
        filePath?: string
        message?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.regions) {
        throw new Error(data.error || 'Publish failed')
      }
      setRegions(data.regions)
      setPublishedAt(data.publishedAt ?? null)
      setMessage(
        data.message ||
          `Published to ${data.filePath ?? 'data/domain-regions.generated.ts'}.`
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
        Loading domain → region bindings from Firebase…
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Domains</h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Attach each production domain to a region. Incoming hosts (including
            www and other subdomains) pick NZ, UK, or International from this
            list. If the host matches none of these domains, the site uses New
            Zealand. Canonical site URLs are used for sitemaps and metadata.
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

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {MARKET_IDS.map((id) => (
          <div
            key={id}
            className="space-y-3 rounded-md border border-border bg-white p-4"
          >
            <div>
              <h3 className="text-sm font-semibold text-ink">
                {marketLabel(id)}
              </h3>
              <p className="mt-1 text-xs text-ink-muted">{REGION_BLURB[id]}</p>
            </div>
            <label className="block text-xs font-semibold text-ink">
              Domain
              <textarea
                value={regions[id].hosts.join('\n')}
                onChange={(e) =>
                  updateRegion(id, { hostsText: e.target.value })
                }
                rows={2}
                placeholder={
                  id === 'uk'
                    ? 'xlsexperts.co.uk'
                    : id === 'intl'
                      ? 'xlsexperts.com'
                      : 'xlsexperts.co.nz'
                }
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-normal"
              />
            </label>
            <p className="text-[11px] text-ink-muted">
              Apex domain is enough — www and other subdomains follow. Add extra
              hosts on new lines if needed.
            </p>
            <label className="block text-xs font-semibold text-ink">
              Canonical site URL
              <input
                type="url"
                value={regions[id].origin}
                onChange={(e) => updateRegion(id, { origin: e.target.value })}
                placeholder="https://www.example.com"
                className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3 text-sm font-normal"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
