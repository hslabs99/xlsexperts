'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { serviceIcons } from '@/components/service-icons'
import {
  HOME_SERVICES_MAX_TILES,
  HOME_SERVICES_MIN_TILES,
  SERVICE_ICON_LABELS,
  defaultHomeServicesContent,
  tileFromServicePage,
  unusedServicePages,
  type HomeServiceTile,
  type HomeServicesContent,
} from '@/lib/home-services'
import {
  SERVICE_ICON_KEYS,
  getServiceByHref,
  servicePages,
} from '@/lib/service-pages'

export function AdminHomeServicesPanel() {
  const [content, setContent] = useState<HomeServicesContent>(
    defaultHomeServicesContent()
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
      const res = await fetch('/api/admin/home-services')
      const data = (await res.json()) as {
        ok?: boolean
        content?: HomeServicesContent
        publishedAt?: string | null
        updatedAt?: string | null
        error?: string
      }
      if (!res.ok || !data.ok || !data.content) {
        throw new Error(data.error || 'Failed to load homepage services')
      }
      setContent(data.content)
      setPublishedAt(data.publishedAt ?? null)
      setUpdatedAt(data.updatedAt ?? null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load homepage services from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const availableToAdd = useMemo(
    () => unusedServicePages(content.tiles),
    [content.tiles]
  )

  function updateChrome<K extends keyof HomeServicesContent>(
    key: K,
    value: HomeServicesContent[K]
  ) {
    setContent((prev) => ({ ...prev, [key]: value }))
  }

  function updateTile(index: number, patch: Partial<HomeServiceTile>) {
    setContent((prev) => ({
      ...prev,
      tiles: prev.tiles.map((tile, i) =>
        i === index ? { ...tile, ...patch } : tile
      ),
    }))
  }

  function onServiceChange(index: number, href: string) {
    const page = getServiceByHref(href)
    if (!page) return
    setContent((prev) => ({
      ...prev,
      tiles: prev.tiles.map((tile, i) => {
        if (i !== index) return tile
        return tileFromServicePage(page)
      }),
    }))
  }

  function addTile() {
    const next = availableToAdd[0]
    if (!next) return
    setContent((prev) => {
      if (prev.tiles.length >= HOME_SERVICES_MAX_TILES) return prev
      return { ...prev, tiles: [...prev.tiles, tileFromServicePage(next)] }
    })
  }

  function removeTile(index: number) {
    setContent((prev) => {
      if (prev.tiles.length <= HOME_SERVICES_MIN_TILES) return prev
      return {
        ...prev,
        tiles: prev.tiles.filter((_, i) => i !== index),
      }
    })
  }

  function moveTile(index: number, direction: -1 | 1) {
    setContent((prev) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.tiles.length) return prev
      const tiles = [...prev.tiles]
      const [row] = tiles.splice(index, 1)
      tiles.splice(nextIndex, 0, row)
      return { ...prev, tiles }
    })
  }

  async function post(action: 'save' | 'publish') {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/home-services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        content?: HomeServicesContent
        publishedAt?: string
        filePath?: string
        message?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.content) {
        throw new Error(data.error || `${action} failed`)
      }
      setContent(data.content)
      if (action === 'publish') {
        setPublishedAt(data.publishedAt ?? null)
      } else {
        setUpdatedAt(new Date().toISOString())
      }
      setMessage(
        data.message ||
          (action === 'publish'
            ? `Published to ${data.filePath ?? 'data/home-services.generated.ts'}.`
            : 'Draft saved. Click Publish to update the static file used by the public site.')
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : `${action} failed`)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-muted">
        Loading homepage services from Firebase…
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Home services
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Featured tiles on the homepage “What we do” section. Pick 4–8
            existing service pages, then edit title, description, tags, icon and
            order. Save stores a draft in Firebase{' '}
            <code className="text-xs">Site Content / home-services</code>.{' '}
            <strong>Publish</strong> writes{' '}
            <code className="text-xs">data/home-services.generated.ts</code>{' '}
            so the live homepage never queries the database. Localhost shows
            the draft after Save.
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
            {content.tiles.length} / {HOME_SERVICES_MAX_TILES} tiles
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setContent(defaultHomeServicesContent())}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-60"
          >
            Reset to original
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void post('save')}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-60"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void post('publish')}
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
          role="status"
        >
          {error || message}
        </div>
      )}

      <div className="space-y-4 rounded-md border border-border bg-white p-4">
        <h3 className="text-base font-semibold text-ink">Section copy</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Eyebrow</span>
            <input
              type="text"
              value={content.eyebrow}
              onChange={(e) => updateChrome('eyebrow', e.target.value)}
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Heading</span>
            <input
              type="text"
              value={content.heading}
              onChange={(e) => updateChrome('heading', e.target.value)}
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Intro</span>
          <textarea
            value={content.intro}
            onChange={(e) => updateChrome('intro', e.target.value)}
            rows={3}
            className="rounded-md border border-border px-3 py-2"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">View-all label</span>
            <input
              type="text"
              value={content.viewAllLabel}
              onChange={(e) => updateChrome('viewAllLabel', e.target.value)}
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Use-cases label</span>
            <input
              type="text"
              value={content.useCasesLabel}
              onChange={(e) => updateChrome('useCasesLabel', e.target.value)}
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">CTA prompt</span>
            <input
              type="text"
              value={content.ctaPrompt}
              onChange={(e) => updateChrome('ctaPrompt', e.target.value)}
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">CTA button</span>
            <input
              type="text"
              value={content.ctaLabel}
              onChange={(e) => updateChrome('ctaLabel', e.target.value)}
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">Service tiles</h3>
          <button
            type="button"
            onClick={addTile}
            disabled={
              busy ||
              availableToAdd.length === 0 ||
              content.tiles.length >= HOME_SERVICES_MAX_TILES
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add tile
          </button>
        </div>

        {content.tiles.map((tile, index) => {
          const Icon = serviceIcons[tile.icon] ?? serviceIcons.spreadsheet
          const usedElsewhere = new Set(
            content.tiles
              .filter((_, i) => i !== index)
              .map((item) => item.href)
          )
          const hrefOptions = servicePages.filter(
            (page) => page.href === tile.href || !usedElsewhere.has(page.href)
          )
          return (
            <div
              key={`${tile.href}-${index}`}
              className="space-y-3 rounded-md border border-border bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center"
                    style={{ backgroundColor: '#e8f5ee' }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: '#1a6b3c' }}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Tile {index + 1}
                    </p>
                    <p className="text-xs text-ink-muted">{tile.href}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Move up"
                    aria-label={`Move tile ${index + 1} up`}
                    onClick={() => moveTile(index, -1)}
                    disabled={index === 0}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink hover:bg-surface-raised disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    aria-label={`Move tile ${index + 1} down`}
                    onClick={() => moveTile(index, 1)}
                    disabled={index === content.tiles.length - 1}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink hover:bg-surface-raised disabled:opacity-40"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Remove"
                    aria-label={`Remove tile ${index + 1}`}
                    onClick={() => removeTile(index)}
                    disabled={content.tiles.length <= HOME_SERVICES_MIN_TILES}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">Service page</span>
                  <select
                    value={tile.href}
                    onChange={(e) => onServiceChange(index, e.target.value)}
                    className="rounded-md border border-border px-3 py-2"
                  >
                    {hrefOptions.map((page) => (
                      <option key={page.href} value={page.href}>
                        {page.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">Icon</span>
                  <select
                    value={tile.icon}
                    onChange={(e) =>
                      updateTile(index, {
                        icon: e.target.value as HomeServiceTile['icon'],
                      })
                    }
                    className="rounded-md border border-border px-3 py-2"
                  >
                    {SERVICE_ICON_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {SERVICE_ICON_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-ink">Title</span>
                <input
                  type="text"
                  value={tile.title}
                  onChange={(e) => updateTile(index, { title: e.target.value })}
                  className="rounded-md border border-border px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-ink">Description</span>
                <textarea
                  value={tile.description}
                  onChange={(e) =>
                    updateTile(index, { description: e.target.value })
                  }
                  rows={3}
                  className="rounded-md border border-border px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-ink">Tags</span>
                <input
                  type="text"
                  value={tile.tags.join(', ')}
                  onChange={(e) =>
                    updateTile(index, {
                      tags: e.target.value.split(',').map((tag) => tag.trim()),
                    })
                  }
                  className="rounded-md border border-border px-3 py-2"
                />
                <span className="text-xs text-ink-muted">
                  Comma-separated, e.g. Formulas, Data Validation, Templates
                </span>
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
