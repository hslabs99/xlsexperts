'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Save, Trash2 } from 'lucide-react'
import { AdminDialog } from '@/components/admin-dialog'
import type { ClientLogoRecord, ClientLogoStatus } from '@/lib/client-logos'

const STATUS_STYLES: Record<ClientLogoStatus | 'running', string> = {
  pending: 'bg-surface-raised text-ink-muted',
  harvested: 'bg-sky-50 text-sky-900',
  saved: 'bg-emerald-50 text-emerald-800',
  failed: 'bg-red-50 text-red-800',
  running: 'bg-amber-50 text-amber-900',
}

function thumbUrl(row: ClientLogoRecord): string {
  if (row.logoUrl) return row.logoUrl
  const picked = row.candidates[row.selectedCandidateIndex] ?? row.candidates[0]
  return picked?.storedUrl || ''
}

export function AdminLogoHarvestPanel() {
  const [items, setItems] = useState<ClientLogoRecord[]>([])
  const [paste, setPaste] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [harvestQueue, setHarvestQueue] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const selectedRows = useMemo(
    () => items.filter((row) => selected.has(row.id)),
    [items, selected]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/client-logos')
      const data = (await res.json()) as {
        ok?: boolean
        items?: ClientLogoRecord[]
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load logo list')
      }
      setItems(data.items ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logo list')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function mergeRow(next: ClientLogoRecord) {
    setItems((prev) => {
      const others = prev.filter((row) => row.id !== next.id)
      return [...others, next].sort((a, b) =>
        (a.displayName || a.host).localeCompare(b.displayName || b.host)
      )
    })
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => {
      if (prev.size === items.length) return new Set()
      return new Set(items.map((row) => row.id))
    })
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    if (!paste.trim()) {
      setError('Paste company name and URL as two columns')
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/client-logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', text: paste }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        added?: number
        skipped?: number
        invalid?: string[]
        items?: ClientLogoRecord[]
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not add rows')
      }
      setItems(data.items ?? [])
      setPaste('')
      const invalid = data.invalid ?? []
      const parts = [
        `Added ${data.added ?? 0}`,
        `already in list ${data.skipped ?? 0}`,
      ]
      if (invalid.length) parts.push(`${invalid.length} invalid skipped`)
      setMessage(`${parts.join(', ')}.`)
      if (invalid.length) {
        setError(`Could not parse: ${invalid.slice(0, 8).join(', ')}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add rows')
    } finally {
      setBusy(false)
    }
  }

  async function harvestIds(ids: string[]) {
    if (!ids.length) {
      setError('Tick one or more rows, then Harvest')
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    setHarvestQueue(ids)
    let harvested = 0
    let failed = 0
    try {
      for (let i = 0; i < ids.length; i += 1) {
        const id = ids[i]
        setRunningId(id)
        const res = await fetch('/api/admin/client-logos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'harvest', id }),
        })
        const data = (await res.json()) as {
          ok?: boolean
          error?: string
          item?: ClientLogoRecord
        }
        if (!res.ok || !data.ok || !data.item) {
          failed += 1
          const msg = data.error || `Harvest failed for ${id}`
          setItems((prev) =>
            prev.map((row) =>
              row.id === id
                ? { ...row, status: 'failed', lastError: msg }
                : row
            )
          )
          if (res.status >= 500) {
            setError(msg)
            break
          }
          continue
        }
        mergeRow(data.item)
        if (data.item.status === 'failed') failed += 1
        else harvested += 1
      }
      setMessage(
        `Harvest finished: ${harvested} logo${harvested === 1 ? '' : 's'} found, ${failed} failed.`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Harvest failed')
    } finally {
      setRunningId(null)
      setHarvestQueue([])
      setBusy(false)
    }
  }

  async function saveRow(row: ClientLogoRecord, candidateIndex = row.selectedCandidateIndex) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/client-logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          id: row.id,
          candidateIndex,
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        item?: ClientLogoRecord
      }
      if (!res.ok || !data.ok || !data.item) {
        throw new Error(data.error || `Could not save ${row.host}`)
      }
      mergeRow(data.item)
      setMessage(`Saved logo for ${data.item.host}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function saveSelected() {
    const ready = selectedRows.filter((row) => row.candidates.length > 0)
    if (!ready.length) {
      setError('Harvest selected rows first, then save')
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    let saved = 0
    try {
      for (const row of ready) {
        const res = await fetch('/api/admin/client-logos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save',
            id: row.id,
            candidateIndex: row.selectedCandidateIndex,
          }),
        })
        const data = (await res.json()) as {
          ok?: boolean
          error?: string
          item?: ClientLogoRecord
        }
        if (!res.ok || !data.ok || !data.item) {
          throw new Error(data.error || `Could not save ${row.host}`)
        }
        mergeRow(data.item)
        saved += 1
      }
      setMessage(`Saved ${saved} logo${saved === 1 ? '' : 's'}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function deleteSelected() {
    const ids = selectedRows.map((row) => row.id)
    if (!ids.length) return
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/client-logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ids }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        items?: ClientLogoRecord[]
        deleted?: number
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not remove URLs')
      }
      setItems(data.items ?? [])
      setSelected(new Set())
      setMessage(`Removed ${data.deleted ?? ids.length} URL${ids.length === 1 ? '' : 's'}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove URLs')
    } finally {
      setBusy(false)
      setConfirmDelete(false)
    }
  }

  function pickCandidate(id: string, index: number) {
    setItems((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, selectedCandidateIndex: index } : row
      )
    )
  }

  const allChecked = items.length > 0 && selected.size === items.length

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-ink">Logo harvest</h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-muted">
          Paste two columns: company name, then website URL (Excel copy is
          tab-separated). New URLs are added; anything already in the list is
          skipped. Tick rows, harvest a logo thumbnail, then save the one you
          want.
        </p>
      </div>

      <form
        onSubmit={(e) => void handleImport(e)}
        className="rounded-lg border border-border bg-surface p-6"
      >
        <label htmlFor="logo-paste" className="text-sm font-semibold text-ink">
          Add domains
        </label>
        <textarea
          id="logo-paste"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={8}
          spellCheck={false}
          placeholder={
            'Aotea Electric\thttps://www.aoteaelectric.co.nz\nApartment Reno\thttps://www.apartmentreno.co.nz\nWillesden Farms\thttps://www.willesdenfarms.co.nz'
          }
          className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-sm text-ink"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={busy || !paste.trim()}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            Add to list
          </button>
          <p className="text-xs text-ink-muted">
            Column 1 = company name, column 2 = URL. Duplicate URLs are skipped.
          </p>
        </div>
      </form>

      {(message || error) && (
        <div
          className={`rounded-md border p-3 text-sm ${
            error && !message
              ? 'border-red-200 bg-red-50 text-red-800'
              : error
                ? 'border-amber-200 bg-amber-50 text-amber-950'
                : 'border-brand/30 bg-brand-light text-brand-dark'
          }`}
          role="status"
        >
          {message ? <p>{message}</p> : null}
          {error ? <p className={message ? 'mt-1' : undefined}>{error}</p> : null}
        </div>
      )}

      <section className="rounded-lg border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">
            Master list
            <span className="ml-2 text-sm font-medium text-ink-muted">
              {items.length} row{items.length === 1 ? '' : 's'}
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !selectedRows.length}
              onClick={() => void harvestIds(selectedRows.map((row) => row.id))}
              className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {busy && runningId
                ? `Harvesting… (${Math.max(1, harvestQueue.indexOf(runningId) + 1)}/${harvestQueue.length})`
                : `Harvest selected (${selectedRows.length})`}
            </button>
            <button
              type="button"
              disabled={busy || !selectedRows.some((row) => row.candidates.length)}
              onClick={() => void saveSelected()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Save selected
            </button>
            <button
              type="button"
              disabled={busy || !selectedRows.length}
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Remove selected
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-ink-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            No rows yet. Paste company name and URL columns above.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-muted">
                  <th className="w-10 py-2 pr-2">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      aria-label="Select all URLs"
                    />
                  </th>
                  <th className="py-2 pr-3 font-semibold">Company</th>
                  <th className="py-2 pr-3 font-semibold">URL</th>
                  <th className="py-2 pr-3 font-semibold">Logo</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 font-semibold"> </th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const running = runningId === row.id
                  const status = running ? 'running' : row.status
                  const preview = thumbUrl(row)
                  return (
                    <tr key={row.id} className="border-b border-border/70 align-top">
                      <td className="py-3 pr-2">
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={() => toggle(row.id)}
                          aria-label={`Select ${row.displayName || row.host}`}
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <div className="font-semibold text-ink">
                          {row.displayName || row.host}
                        </div>
                        {row.lastError ? (
                          <div className="mt-1 text-xs text-red-700">
                            {row.lastError}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3">
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-xs text-brand hover:underline"
                        >
                          {row.url}
                        </a>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex h-14 w-36 items-center justify-center rounded-md border border-border bg-white">
                          {running ? (
                            <Loader2 className="h-5 w-5 animate-spin text-ink-muted" />
                          ) : preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={preview}
                              alt={`${row.host} logo`}
                              className="max-h-12 max-w-[8.5rem] object-contain"
                            />
                          ) : (
                            <span className="text-xs text-ink-muted">—</span>
                          )}
                        </div>
                        {row.candidates.length > 1 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {row.candidates.map((candidate, index) => {
                              const active = index === row.selectedCandidateIndex
                              return (
                                <button
                                  key={`${candidate.storedUrl}-${index}`}
                                  type="button"
                                  title={`Candidate ${index + 1} (${candidate.source})`}
                                  onClick={() => pickCandidate(row.id, index)}
                                  className={
                                    active
                                      ? 'rounded border border-brand bg-brand-light p-0.5'
                                      : 'rounded border border-border bg-white p-0.5'
                                  }
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={candidate.storedUrl}
                                    alt=""
                                    className="h-7 w-12 object-contain"
                                  />
                                </button>
                              )
                            })}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void harvestIds([row.id])}
                            className="rounded-md border border-border bg-white px-2 py-1 text-xs font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
                          >
                            Harvest
                          </button>
                          <button
                            type="button"
                            disabled={busy || !row.candidates.length}
                            onClick={() => void saveRow(row)}
                            className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-xs font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
                          >
                            <Check className="h-3 w-3" />
                            Save
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminDialog
        open={confirmDelete}
        title="Remove selected URLs?"
        mode="confirm"
        tone="danger"
        confirmLabel="Remove"
        busy={busy}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void deleteSelected()}
      >
        <p className="text-sm text-ink-muted">
          This removes {selectedRows.length} URL
          {selectedRows.length === 1 ? '' : 's'} from the master list. Saved
          image files in Storage are kept.
        </p>
      </AdminDialog>
    </div>
  )
}
