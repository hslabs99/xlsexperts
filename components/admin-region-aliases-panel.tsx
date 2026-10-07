'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { marketHostHint, marketLabel } from '@/lib/market'
import {
  applyRegionAliases,
  emptyRegionAlias,
  normalizeRegionAliases,
  type RegionAlias,
  type RegionAliasMatch,
} from '@/lib/region-aliases'

const PREVIEW_SOURCE =
  'New Zealand GST treatment in Xero, including GST on the invoice.'

function validateAliases(rows: RegionAlias[]): string | null {
  const seen = new Set<string>()
  for (const row of rows) {
    const term = row.term.trim()
    if (term.length < 2) return 'Each alias needs a term of at least 2 characters.'
    const key = term.toLowerCase()
    if (seen.has(key)) return `“${term}” is listed more than once.`
    seen.add(key)
  }
  return null
}

export function AdminRegionAliasesPanel() {
  const [aliases, setAliases] = useState<RegionAlias[]>([])
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
      const res = await fetch('/api/admin/region-aliases')
      const data = (await res.json()) as {
        ok?: boolean
        aliases?: RegionAlias[]
        publishedAt?: string | null
        updatedAt?: string | null
        error?: string
      }
      if (!res.ok || !data.ok || !data.aliases) {
        throw new Error(data.error || 'Failed to load aliases')
      }
      setAliases(data.aliases)
      setPublishedAt(data.publishedAt ?? null)
      setUpdatedAt(data.updatedAt ?? null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load aliases from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const previewAliases = useMemo(
    () => normalizeRegionAliases(aliases.filter((row) => row.term.trim().length >= 2)),
    [aliases]
  )

  function updateRow(id: string, patch: Partial<RegionAlias>) {
    setAliases((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    )
  }

  async function persist(action: 'save' | 'publish') {
    const problem = validateAliases(aliases)
    if (problem) {
      setError(problem)
      setMessage(null)
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/region-aliases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, aliases }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        aliases?: RegionAlias[]
        publishedAt?: string
        message?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.aliases) {
        throw new Error(data.error || (action === 'publish' ? 'Publish failed' : 'Save failed'))
      }
      setAliases(data.aliases)
      setUpdatedAt(new Date().toISOString())
      if (action === 'publish') setPublishedAt(data.publishedAt ?? null)
      setMessage(data.message || (action === 'publish' ? 'Published.' : 'Draft saved.'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-muted">
        Loading region aliases from Firebase…
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Aliases</h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            New Zealand wording is still in a lot of pages, blogs, and case
            studies. List the NZ word here, then what {marketLabel('uk')} (
            {marketHostHint('uk')}) and {marketLabel('intl')} (
            {marketHostHint('intl')}) should say instead. Leave a region blank
            to keep the NZ word on that site. Matching ignores case and does
            not change letters inside a longer word or inside a web address.
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
            onClick={() => void persist('save')}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-60"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void persist('publish')}
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

      <div className="overflow-x-auto rounded-md border border-border bg-white">
        <table className="min-w-[880px] w-full text-left text-sm">
          <thead className="border-b border-border bg-gray-50 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-3 py-2">NZ term</th>
              <th className="px-3 py-2">Match</th>
              <th className="px-3 py-2">United Kingdom</th>
              <th className="px-3 py-2">International</th>
              <th className="px-3 py-2">On</th>
              <th className="px-3 py-2">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {aliases.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-sm text-ink-muted">
                  No aliases yet. Add GST, Xero, or any other NZ word that
                  should change on the UK or international site.
                </td>
              </tr>
            ) : (
              aliases.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 align-top">
                    <input
                      value={row.term}
                      onChange={(e) => {
                        const term = e.target.value
                        updateRow(row.id, {
                          term,
                          match: /\s/.test(term) ? 'phrase' : row.match,
                        })
                      }}
                      placeholder="GST"
                      className="w-full min-w-[10rem] rounded-md border border-border px-2 py-1.5 text-sm text-ink"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <select
                      value={row.match}
                      onChange={(e) =>
                        updateRow(row.id, {
                          match: e.target.value as RegionAliasMatch,
                        })
                      }
                      className="rounded-md border border-border bg-white px-2 py-1.5 text-sm text-ink"
                    >
                      <option value="word">Word</option>
                      <option value="phrase">Phrase</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      value={row.uk}
                      onChange={(e) => updateRow(row.id, { uk: e.target.value })}
                      placeholder="VAT"
                      className="w-full min-w-[10rem] rounded-md border border-border px-2 py-1.5 text-sm text-ink"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      value={row.intl}
                      onChange={(e) => updateRow(row.id, { intl: e.target.value })}
                      placeholder="QuickBooks"
                      className="w-full min-w-[10rem] rounded-md border border-border px-2 py-1.5 text-sm text-ink"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) =>
                        updateRow(row.id, { enabled: e.target.checked })
                      }
                      aria-label={`Use alias ${row.term || 'row'}`}
                      className="mt-2 h-4 w-4"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <button
                      type="button"
                      onClick={() =>
                        setAliases((prev) => prev.filter((item) => item.id !== row.id))
                      }
                      className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition hover:bg-red-50 hover:text-red-700"
                      aria-label={`Remove ${row.term || 'alias'}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => setAliases((prev) => [...prev, emptyRegionAlias()])}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50"
      >
        <Plus className="h-4 w-4" />
        Add alias
      </button>

      <div className="rounded-md border border-border bg-white p-4">
        <h3 className="text-sm font-semibold text-ink">Preview</h3>
        <p className="mt-1 text-xs text-ink-muted">
          Uses the rows above, including unsaved edits. Publish is what the
          live sites use. On localhost, Save draft is enough to preview blogs,
          case studies, and other Firebase content.
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              New Zealand
            </dt>
            <dd className="text-ink">{PREVIEW_SOURCE}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {marketLabel('uk')}
            </dt>
            <dd className="text-ink">
              {applyRegionAliases(PREVIEW_SOURCE, 'uk', previewAliases)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {marketLabel('intl')}
            </dt>
            <dd className="text-ink">
              {applyRegionAliases(PREVIEW_SOURCE, 'intl', previewAliases)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
