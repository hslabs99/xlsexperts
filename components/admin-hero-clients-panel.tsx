'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { AdminDialog } from '@/components/admin-dialog'
import {
  addHeroClientsFromNames,
  clampHeroClientFade,
  colorFromName,
  DEFAULT_HERO_CLIENT_FADE,
  DEFAULT_HERO_CLIENT_HEADING,
  HERO_CLIENT_FADE_DURATION_MAX,
  HERO_CLIENT_FADE_DURATION_MIN,
  initialsFromName,
  parsePastedClientNames,
  type HeroClientFade,
  type HeroClientTile,
} from '@/lib/hero-trust'


type SortKey = 'name' | 'abbr' | 'logo'
type SortDir = 'asc' | 'desc'
type LogoFilter = 'all' | 'has-logo' | 'initials'

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
  return dir === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-brand" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-brand" />
  )
}

export function AdminHeroClientsPanel() {
  const [clients, setClients] = useState<HeroClientTile[]>([])
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [generateQueue, setGenerateQueue] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [logoFilter, setLogoFilter] = useState<LogoFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [addOpen, setAddOpen] = useState(false)
  const [paste, setPaste] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState<string | null>(null)
  const [confirmEmpty, setConfirmEmpty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [fade, setFade] = useState<HeroClientFade>({
    ...DEFAULT_HERO_CLIENT_FADE,
  })
  const [heading, setHeading] = useState(DEFAULT_HERO_CLIENT_HEADING)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/hero-clients')
      const data = (await res.json()) as {
        ok?: boolean
        clients?: HeroClientTile[]
        fade?: HeroClientFade
        heading?: string
        publishedAt?: string | null
        updatedAt?: string | null
        error?: string
      }
      if (!res.ok || !data.ok || !data.clients) {
        throw new Error(data.error || 'Failed to load client logos')
      }
      setClients(data.clients)
      if (data.fade) setFade(clampHeroClientFade(data.fade))
      if (typeof data.heading === 'string' && data.heading.trim()) {
        setHeading(data.heading)
      }
      setPublishedAt(data.publishedAt ?? null)
      setUpdatedAt(data.updatedAt ?? null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load client logos from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredSorted = useMemo(() => {
    let list = clients
    if (logoFilter === 'has-logo') {
      list = list.filter((row) => Boolean(row.logoSrc))
    } else if (logoFilter === 'initials') {
      list = list.filter((row) => !row.logoSrc)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((row) =>
        [row.name, row.abbr, row.id].join(' ').toLowerCase().includes(q)
      )
    }
    const dir = sortDir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'abbr') cmp = a.abbr.localeCompare(b.abbr)
      else cmp = Number(Boolean(a.logoSrc)) - Number(Boolean(b.logoSrc))
      return cmp * dir || a.name.localeCompare(b.name)
    })
  }, [clients, search, logoFilter, sortKey, sortDir])

  const selectedRows = useMemo(
    () => filteredSorted.filter((row) => selected.has(row.id)),
    [filteredSorted, selected]
  )

  const allFilteredSelected =
    filteredSorted.length > 0 &&
    filteredSorted.every((row) => selected.has(row.id))

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllFiltered() {
    setSelected((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev)
        for (const row of filteredSorted) next.delete(row.id)
        return next
      }
      return new Set([
        ...prev,
        ...filteredSorted.map((row) => row.id),
      ])
    })
  }

  function updateClient(id: string, patch: Partial<HeroClientTile>) {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, ...patch } : client
      )
    )
  }

  function onNameChange(id: string, name: string) {
    setClients((prev) =>
      prev.map((client) => {
        if (client.id !== id) return client
        const prevAuto = initialsFromName(client.name)
        const abbr =
          !client.abbr || client.abbr === prevAuto
            ? initialsFromName(name)
            : client.abbr
        return { ...client, name, abbr }
      })
    )
  }

  async function post(
    action: 'save' | 'publish',
    nextClients: HeroClientTile[] = clients
  ) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/hero-clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, clients: nextClients, fade, heading }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        clients?: HeroClientTile[]
        fade?: HeroClientFade
        heading?: string
        publishedAt?: string
        filePath?: string
        message?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.clients) {
        throw new Error(data.error || `${action} failed`)
      }
      setClients(data.clients)
      if (data.fade) setFade(clampHeroClientFade(data.fade))
      if (typeof data.heading === 'string' && data.heading.trim()) {
        setHeading(data.heading)
      }
      if (action === 'publish') {
        setPublishedAt(data.publishedAt ?? null)
      } else {
        setUpdatedAt(new Date().toISOString())
      }
      setMessage(
        data.message ||
          (action === 'publish'
            ? `Published to ${data.filePath ?? 'data/hero-clients.generated.ts'}.`
            : 'Draft saved. Click Publish to update the static file used by the public site.')
      )
      return data.clients
    } catch (err) {
      setError(err instanceof Error ? err.message : `${action} failed`)
      return null
    } finally {
      setBusy(false)
    }
  }

  async function generateForIds(ids: string[]) {
    const queue = clients.filter(
      (client) => ids.includes(client.id) && client.name.trim()
    )
    if (!queue.length) {
      setError('Select one or more named clients, then Create auto logos.')
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    setGenerateQueue(queue.map((client) => client.id))
    let next = [...clients]
    let done = 0
    try {
      for (const client of queue) {
        setGeneratingId(client.id)
        setMessage(
          `Creating auto logo ${done + 1} of ${queue.length} — ${client.name}`
        )
        const res = await fetch('/api/admin/hero-clients/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: client.name,
            abbr: client.abbr,
            color: client.color,
          }),
        })
        const data = (await res.json()) as {
          ok?: boolean
          url?: string
          error?: string
        }
        if (!res.ok || !data.ok || !data.url) {
          setClients(next)
          throw new Error(
            data.error || `Logo generation failed for ${client.name}`
          )
        }
        next = next.map((item) =>
          item.id === client.id ? { ...item, logoSrc: data.url! } : item
        )
        setClients(next)
        done += 1
      }
      setMessage(
        `Created ${done} auto logo${done === 1 ? '' : 's'}. Save draft, then Publish.`
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}${done ? ` (${done} already generated.)` : ''}`
          : 'Logo generation failed'
      )
    } finally {
      setGeneratingId(null)
      setGenerateQueue([])
      setBusy(false)
    }
  }

  function handleAddClients() {
    const names = parsePastedClientNames(paste)
    if (!names.length) {
      setAddError('Paste at least one client name.')
      return
    }
    setAddError(null)
    setError(null)
    const result = addHeroClientsFromNames(clients, names)
    setImportProgress(
      `Created ${result.added} of ${names.length}. Skipped ${result.skipped} already in the list.`
    )
    setClients(result.clients)
    const parts = [`Created ${result.added} client record${result.added === 1 ? '' : 's'}`]
    if (result.skipped) parts.push(`skipped ${result.skipped} already listed`)
    setMessage(`${parts.join(', ')}. Save draft when you are ready.`)
    setPaste('')
    setAddOpen(false)
    setImportProgress(null)
    setSelected(new Set())
  }

  function deleteSelected() {
    const ids = new Set(selectedRows.map((row) => row.id))
    const next = clients.filter((row) => !ids.has(row.id))
    setClients(next)
    setSelected(new Set())
    setConfirmDelete(false)
    setMessage(
      `Removed ${ids.size} client${ids.size === 1 ? '' : 's'} from the list. Save draft to keep this.`
    )
  }

  async function emptyAll() {
    setClients([])
    setSelected(new Set())
    setConfirmEmpty(false)
    await post('save', [])
    setMessage('Emptied the client logo list and saved the draft.')
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-muted">
        Loading client logos from Firebase…
      </div>
    )
  }

  const generating = generatingId !== null
  const pasteCount = parsePastedClientNames(paste).length

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Client Logos</h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Paste client names like Google Ads keywords. New names become rows;
            names already in the list are skipped. Select rows to delete or
            create auto logos. <strong>Save draft</strong> writes Firebase.{' '}
            <strong>Publish</strong> shuffles that list once. The homepage then
            shows the first 12, then the next 12, and so on — it never falls
            back to the original enterprise names.
          </p>
          <p className="mt-2 text-xs text-ink-muted">
            Last draft update:{' '}
            {updatedAt ? new Date(updatedAt).toLocaleString('en-NZ') : '—'}
            {' · '}
            Last publish:{' '}
            {publishedAt
              ? new Date(publishedAt).toLocaleString('en-NZ')
              : 'never'}
            {' · '}
            {clients.length} client{clients.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || generating}
            onClick={() => {
              setPaste('')
              setAddError(null)
              setImportProgress(null)
              setAddOpen(true)
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Add clients
          </button>
          <button
            type="button"
            disabled={busy || generating || !selectedRows.length}
            onClick={() =>
              void generateForIds(selectedRows.map((row) => row.id))
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50 disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {generating && generatingId
              ? `Creating auto logo… (${Math.max(1, generateQueue.indexOf(generatingId) + 1)}/${generateQueue.length})`
              : `Create auto logos (${selectedRows.length})`}
          </button>
          <button
            type="button"
            disabled={busy || generating || !selectedRows.length}
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Delete selected
          </button>
          <button
            type="button"
            disabled={busy || generating || clients.length === 0}
            onClick={() => setConfirmEmpty(true)}
            className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-60"
          >
            Empty all
          </button>
          <button
            type="button"
            disabled={busy || generating || loading}
            onClick={() => void post('save')}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50 disabled:opacity-60"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={busy || generating || loading}
            onClick={() => void post('publish')}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-white p-4">
        <h3 className="text-sm font-semibold text-ink">Homepage strip</h3>
        <p className="mt-0.5 max-w-3xl text-xs text-ink-muted">
          Heading, fade, and logos on the homepage. Save draft to preview on
          localhost, then Publish for the public site.
        </p>
        <label className="mt-4 flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Heading</span>
          <input
            type="text"
            value={heading}
            maxLength={120}
            disabled={busy || generating || loading}
            onChange={(event) => setHeading(event.target.value)}
            placeholder={DEFAULT_HERO_CLIENT_HEADING}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="flex items-center justify-between font-medium text-ink">
              Fade speed
              <span className="text-xs font-normal text-ink-muted">
                {(fade.durationMs / 1000).toFixed(1)}s
              </span>
            </span>
            <input
              type="range"
              min={HERO_CLIENT_FADE_DURATION_MIN}
              max={HERO_CLIENT_FADE_DURATION_MAX}
              step={50}
              value={fade.durationMs}
              disabled={busy || generating || loading}
              onChange={(event) =>
                setFade((prev) =>
                  clampHeroClientFade({
                    ...prev,
                    durationMs: Number(event.target.value),
                  })
                )
              }
              className="w-full accent-brand"
            />
            <span className="flex justify-between text-[11px] text-ink-muted">
              <span>Faster</span>
              <span>Slower</span>
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="flex items-center justify-between font-medium text-ink">
              Harshness
              <span className="text-xs font-normal text-ink-muted">
                {fade.harshness <= 30
                  ? 'Soft'
                  : fade.harshness >= 70
                    ? 'Abrupt'
                    : 'Medium'}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={fade.harshness}
              disabled={busy || generating || loading}
              onChange={(event) =>
                setFade((prev) =>
                  clampHeroClientFade({
                    ...prev,
                    harshness: Number(event.target.value),
                  })
                )
              }
              className="w-full accent-brand"
            />
            <span className="flex justify-between text-[11px] text-ink-muted">
              <span>Soft dissolve</span>
              <span>Abrupt</span>
            </span>
          </label>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`rounded-md border p-3 text-sm ${
            error
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-brand/30 bg-brand-light text-brand-dark'
          }`}
          role="status"
        >
          {error || message}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Filter</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or initials"
            className="rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Logo</span>
          <select
            value={logoFilter}
            onChange={(e) => setLogoFilter(e.target.value as LogoFilter)}
            className="rounded-md border border-border bg-white px-3 py-2"
          >
            <option value="all">All</option>
            <option value="has-logo">Has auto logo</option>
            <option value="initials">Initials only</option>
          </select>
        </label>
        <p className="pb-2 text-xs text-ink-muted">
          Showing {filteredSorted.length} of {clients.length}
        </p>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No clients yet. Click Add clients and paste a list of names.
        </p>
      ) : filteredSorted.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No client logos match this filter.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="w-8 py-2 pr-2">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    disabled={busy || generating || filteredSorted.length === 0}
                    onChange={toggleAllFiltered}
                    aria-label="Select all filtered client logos"
                  />
                </th>
                <th className="py-2 pr-3 font-semibold">Logo</th>
                <th className="py-2 pr-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('name')}
                    className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                  >
                    Client name
                    <SortIcon active={sortKey === 'name'} dir={sortDir} />
                  </button>
                </th>
                <th className="py-2 pr-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('abbr')}
                    className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                  >
                    Initials
                    <SortIcon active={sortKey === 'abbr'} dir={sortDir} />
                  </button>
                </th>
                <th className="py-2 pr-3 font-semibold">Colour</th>
                <th className="py-2 pr-3">
                  <button
                    type="button"
                    onClick={() => toggleSort('logo')}
                    className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
                  >
                    Status
                    <SortIcon active={sortKey === 'logo'} dir={sortDir} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((client) => {
                const running = generatingId === client.id
                return (
                  <tr
                    key={client.id}
                    className="border-b border-border/70"
                  >
                    <td className="py-2 pr-2 align-middle">
                      <input
                        type="checkbox"
                        checked={selected.has(client.id)}
                        onChange={() => toggle(client.id)}
                        aria-label={`Select ${client.name}`}
                      />
                    </td>
                    <td className="py-2 pr-3 align-middle">
                      {running ? (
                        <span className="flex h-9 w-9 items-center justify-center text-[10px] font-semibold text-ink-muted">
                          …
                        </span>
                      ) : client.logoSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={client.logoSrc}
                          alt=""
                          className="h-9 w-9 rounded-md object-contain bg-white ring-1 ring-border"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 items-center justify-center rounded-md text-[10px] font-bold text-white"
                          style={{ backgroundColor: client.color }}
                        >
                          {client.abbr || initialsFromName(client.name)}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 align-middle">
                      <input
                        type="text"
                        value={client.name}
                        onChange={(e) => onNameChange(client.id, e.target.value)}
                        className="w-full min-w-[10rem] rounded-md border border-border px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3 align-middle">
                      <input
                        type="text"
                        maxLength={4}
                        value={client.abbr}
                        onChange={(e) =>
                          updateClient(client.id, {
                            abbr: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-16 rounded-md border border-border px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3 align-middle">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={client.color}
                          onChange={(e) =>
                            updateClient(client.id, { color: e.target.value })
                          }
                          className="h-8 w-10 cursor-pointer rounded border border-border bg-white p-0.5"
                          aria-label={`Colour for ${client.name}`}
                        />
                        <button
                          type="button"
                          title="Auto colour"
                          onClick={() =>
                            updateClient(client.id, {
                              color: colorFromName(client.name),
                            })
                          }
                          className="rounded border border-border px-1.5 py-1 text-[10px] font-semibold text-ink hover:bg-gray-50"
                        >
                          Auto
                        </button>
                      </div>
                    </td>
                    <td className="py-2 align-middle">
                      <span className="text-xs text-ink-muted">
                        {client.logoSrc ? 'Auto logo' : 'Initials'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminDialog
        open={addOpen}
        title="Add clients"
        size="lg"
        confirmLabel="Add to list"
        busy={busy}
        onClose={() => {
          if (!busy) {
            setAddOpen(false)
            setImportProgress(null)
          }
        }}
        onConfirm={handleAddClients}
      >
        <p>
          Paste one client name per line (same as Google Ads keywords). Names
          already in the table are skipped.
        </p>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder={'AMP\nContact Energy\nFisher & Paykel Healthcare'}
          className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-sm text-ink"
        />
        {addError ? (
          <p className="font-medium text-red-700">{addError}</p>
        ) : (
          <p className="font-medium text-ink">
            {pasteCount} unique name{pasteCount === 1 ? '' : 's'} in paste
            {importProgress ? ` · ${importProgress}` : ''}
          </p>
        )}
      </AdminDialog>

      <AdminDialog
        open={confirmDelete}
        title="Delete selected clients?"
        mode="confirm"
        tone="danger"
        confirmLabel="Delete"
        busy={busy}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteSelected}
      >
        <p>
          This removes {selectedRows.length} client
          {selectedRows.length === 1 ? '' : 's'} from the list. Save draft to
          keep the change.
        </p>
      </AdminDialog>

      <AdminDialog
        open={confirmEmpty}
        title="Empty all client logos?"
        mode="confirm"
        tone="danger"
        confirmLabel="Empty all"
        busy={busy}
        onClose={() => setConfirmEmpty(false)}
        onConfirm={() => void emptyAll()}
      >
        <p>
          This clears every client logo row and saves an empty draft so you can
          start again. Publish when you want the homepage to match.
        </p>
      </AdminDialog>
    </div>
  )
}
