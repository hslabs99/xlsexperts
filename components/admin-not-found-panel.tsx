'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type Group = {
  host: string
  path: string
  humanHits: number
  botHits: number
  lastSeen: number
  referrers: { referrer: string; count: number }[]
  clicked: { slug: string; count: number }[]
  matchedSlugs: string[]
  topScore: number
}

type RedirectRow = {
  fromPath: string
  toUrl: string
  source: 'manual' | 'promoted'
  hits: number
  createdAt: number | null
}

function formatWhen(at: number): string {
  if (!at) return '—'
  return new Date(at).toLocaleString('en-NZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminNotFoundPanel() {
  const [groups, setGroups] = useState<Group[]>([])
  const [redirects, setRedirects] = useState<RedirectRow[]>([])
  const [hideBots, setHideBots] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [fromPath, setFromPath] = useState('')
  const [toUrl, setToUrl] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/not-found')
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        groups?: Group[]
        redirects?: RedirectRow[]
      }
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to load')
      setGroups(data.groups ?? [])
      setRedirects(data.redirects ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const visible = useMemo(
    () => (hideBots ? groups.filter((row) => row.humanHits > 0) : groups),
    [groups, hideBots]
  )

  async function promote(path: string, slug: string) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/not-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromPath: path, slug, source: 'promoted' }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to save redirect')
      setMessage(`301 saved for ${path}. The next request uses it — no deploy.`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save redirect')
    } finally {
      setBusy(false)
    }
  }

  async function saveManual(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/not-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromPath, toUrl, source: 'manual' }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to save redirect')
      setFromPath('')
      setToUrl('')
      setMessage('Redirect saved.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save redirect')
    } finally {
      setBusy(false)
    }
  }

  async function removeRedirect(path: string) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/not-found?fromPath=${encodeURIComponent(path)}`,
        { method: 'DELETE' }
      )
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to delete')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-ink">404s and redirects</h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-muted">
          Unknown URLs stay as 404s until you promote one. A promoted row becomes
          a 301 on the next request, including old /post and /blog addresses, with
          no deploy. Bot-only rows are hidden unless you show them.
        </p>
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

      <label className="inline-flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={hideBots}
          onChange={(event) => setHideBots(event.target.checked)}
        />
        Hide bot-only rows
      </label>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
              <th className="py-2 pr-3">Host and path</th>
              <th className="py-2 pr-3">Human</th>
              <th className="py-2 pr-3">Bot</th>
              <th className="py-2 pr-3">Last seen</th>
              <th className="py-2 pr-3">Referrers</th>
              <th className="py-2">Suggestion</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-6 text-ink-muted">
                  Loading…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-ink-muted">
                  No 404s in this view yet.
                </td>
              </tr>
            ) : (
              visible.map((row) => {
                const choice = row.clicked[0]?.slug || row.matchedSlugs[0] || ''
                return (
                  <tr key={`${row.host}${row.path}`} className="border-b border-border/70">
                    <td className="py-3 pr-3 align-top">
                      <div className="font-medium text-ink">{row.host || '—'}</div>
                      <div className="font-mono text-[11px] text-ink-muted">{row.path}</div>
                    </td>
                    <td className="py-3 pr-3 align-top">{row.humanHits}</td>
                    <td className="py-3 pr-3 align-top">{row.botHits}</td>
                    <td className="py-3 pr-3 align-top whitespace-nowrap">
                      {formatWhen(row.lastSeen)}
                    </td>
                    <td className="py-3 pr-3 align-top text-xs text-ink-muted">
                      {row.referrers.length === 0
                        ? '—'
                        : row.referrers.map((item) => (
                            <div key={item.referrer}>
                              {item.referrer} ({item.count})
                            </div>
                          ))}
                    </td>
                    <td className="py-3 align-top">
                      <div className="text-xs text-ink-muted">
                        {row.clicked[0]
                          ? `Clicked ${row.clicked[0].slug} (${row.clicked[0].count})`
                          : row.matchedSlugs[0]
                            ? `Match ${row.matchedSlugs[0]} (${Math.round(row.topScore * 100)}%)`
                            : 'No match'}
                      </div>
                      {choice ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void promote(row.path, choice)}
                          className="mt-2 rounded-md bg-brand px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          Make permanent 301
                        </button>
                      ) : null}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-ink">Redirects</h3>
        <form onSubmit={saveManual} className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-xs text-ink-muted">
            From path
            <input
              value={fromPath}
              onChange={(event) => setFromPath(event.target.value)}
              placeholder="/post/old-slug"
              className="mt-1 block w-64 rounded-md border border-border px-2 py-1.5 text-sm text-ink"
            />
          </label>
          <label className="text-xs text-ink-muted">
            To URL
            <input
              value={toUrl}
              onChange={(event) => setToUrl(event.target.value)}
              placeholder="https://www.xlsexperts.co.nz/blog/new-slug"
              className="mt-1 block w-96 rounded-md border border-border px-2 py-1.5 text-sm text-ink"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-60"
          >
            Add manual 301
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {redirects.length === 0 ? (
            <li className="text-sm text-ink-muted">No redirects saved.</li>
          ) : (
            redirects.map((row) => (
              <li
                key={row.fromPath}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-mono text-xs">{row.fromPath}</span>
                  <span className="mx-2 text-ink-muted">→</span>
                  <span className="text-xs">{row.toUrl}</span>
                  <span className="ml-2 text-xs text-ink-muted">
                    {row.source} · {row.hits} hits
                  </span>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void removeRedirect(row.fromPath)}
                  className="text-xs font-semibold text-red-700 disabled:opacity-60"
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
