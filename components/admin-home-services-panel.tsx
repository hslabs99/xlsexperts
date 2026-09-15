'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { serviceIcons } from '@/components/service-icons'
import {
  HOME_SERVICES_MAX_TILES,
  HOME_SERVICES_MIN_TILES,
  SERVICE_ICON_LABELS,
  cloneHomeServicesContent,
  defaultHomeServicesBundle,
  defaultHomeServicesContent,
  homeServiceTileText,
  homeServicesContentText,
  tileFromServicePage,
  unusedServicePages,
  type HomeServiceTile,
  type HomeServicesBundle,
  type HomeServicesContent,
} from '@/lib/home-services'
import {
  SERVICE_ICON_KEYS,
  getServiceByHref,
  servicePages,
} from '@/lib/service-pages'
import {
  MARKET_IDS,
  marketLabel,
  marketShortLabel,
  type MarketId,
} from '@/lib/market'
import { cmsAnchorId, scrollCmsAnchor } from '@/lib/admin-focus'
import { cmsFocusRingClass, useCmsEditorFocus } from '@/lib/use-cms-editor-focus'
import {
  foreignRegionalMarkets,
} from '@/lib/blog-region-copy'

function conflictClass(hasConflict: boolean, extra = '') {
  return `rounded-md border px-3 py-2 ${
    hasConflict
      ? 'border-red-500 bg-red-50 text-red-950 ring-1 ring-red-400'
      : 'border-border'
  } ${extra}`.trim()
}

function foreignHint(text: string, market: MarketId): string | null {
  const { foreign, samples } = foreignRegionalMarkets(text, market)
  if (foreign.length === 0) return null
  const bits = foreign.map((id) => {
    const snippet = samples[id]?.[0]
    return snippet
      ? `${marketShortLabel(id)} (“${snippet}”)`
      : marketShortLabel(id)
  })
  return `Out-of-market wording: ${bits.join('; ')}`
}

export function AdminHomeServicesPanel() {
  const [bundle, setBundle] = useState<HomeServicesBundle>(
    defaultHomeServicesBundle()
  )
  const [market, setMarket] = useState<MarketId>('nz')
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const content = bundle[market]

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/home-services')
      const data = (await res.json()) as {
        ok?: boolean
        content?: HomeServicesBundle
        publishedAt?: string | null
        updatedAt?: string | null
        error?: string
      }
      if (!res.ok || !data.ok || !data.content) {
        throw new Error(data.error || 'Failed to load homepage services')
      }
      setBundle(data.content)
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

  const focusHighlight = useCmsEditorFocus('home-services', (focus) => {
    setMarket(focus.market)
    if (focus.tileHref) return cmsAnchorId(['hs', 'tile', focus.tileHref])
    if (focus.field) return cmsAnchorId(['hs', 'field', focus.field])
    return null
  })

  useEffect(() => {
    if (focusHighlight) scrollCmsAnchor(focusHighlight)
  }, [focusHighlight, market])

  const availableToAdd = useMemo(
    () => unusedServicePages(content.tiles),
    [content.tiles]
  )

  const marketConflicts = useMemo(() => {
    const map = {} as Record<MarketId, ReturnType<typeof foreignRegionalMarkets>>
    for (const id of MARKET_IDS) {
      map[id] = foreignRegionalMarkets(homeServicesContentText(bundle[id]), id)
    }
    return map
  }, [bundle])

  function updateMarketContent(
    updater: (prev: HomeServicesContent) => HomeServicesContent
  ) {
    setBundle((prev) => ({
      ...prev,
      [market]: updater(prev[market]),
    }))
  }

  function updateChrome<K extends keyof HomeServicesContent>(
    key: K,
    value: HomeServicesContent[K]
  ) {
    updateMarketContent((prev) => ({ ...prev, [key]: value }))
  }

  function updateTile(index: number, patch: Partial<HomeServiceTile>) {
    updateMarketContent((prev) => ({
      ...prev,
      tiles: prev.tiles.map((tile, i) =>
        i === index ? { ...tile, ...patch } : tile
      ),
    }))
  }

  function onServiceChange(index: number, href: string) {
    const page = getServiceByHref(href)
    if (!page) return
    updateMarketContent((prev) => ({
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
    updateMarketContent((prev) => {
      if (prev.tiles.length >= HOME_SERVICES_MAX_TILES) return prev
      return { ...prev, tiles: [...prev.tiles, tileFromServicePage(next)] }
    })
  }

  function removeTile(index: number) {
    updateMarketContent((prev) => {
      if (prev.tiles.length <= HOME_SERVICES_MIN_TILES) return prev
      return {
        ...prev,
        tiles: prev.tiles.filter((_, i) => i !== index),
      }
    })
  }

  function moveTile(index: number, direction: -1 | 1) {
    updateMarketContent((prev) => {
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
        body: JSON.stringify({ action, content: bundle }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        content?: HomeServicesBundle
        publishedAt?: string
        filePath?: string
        message?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.content) {
        throw new Error(data.error || `${action} failed`)
      }
      setBundle(data.content)
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

  const activeConflicts = marketConflicts[market]
  const chromeFields: {
    key: keyof HomeServicesContent
    label: string
    multiline?: boolean
  }[] = [
    { key: 'eyebrow', label: 'Eyebrow' },
    { key: 'heading', label: 'Heading' },
    { key: 'intro', label: 'Intro', multiline: true },
    { key: 'viewAllLabel', label: 'View-all label' },
    { key: 'useCasesLabel', label: 'Use-cases label' },
    { key: 'ctaPrompt', label: 'CTA prompt' },
    { key: 'ctaLabel', label: 'CTA button' },
  ]

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Home services — NZ / International / UK
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Featured tiles on the homepage “What we do” section. Each domain
            has its own copy — NZ text on the UK or .com site is a conflict.
            Red fields and tile banners name the out-of-market wording. Save
            stores a draft in Firebase{' '}
            <code className="text-xs">Site Content / home-services</code>.{' '}
            <strong>Publish</strong> writes{' '}
            <code className="text-xs">data/home-services.generated.ts</code>.
            Local testing: open <code className="text-xs">/nz</code>,{' '}
            <code className="text-xs">/usa</code>, or{' '}
            <code className="text-xs">/uk</code> once.
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
            disabled={busy || market === 'nz'}
            onClick={() =>
              setBundle((prev) => ({
                ...prev,
                [market]: cloneHomeServicesContent(prev.nz),
              }))
            }
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-60"
          >
            Copy NZ into this market
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              setBundle((prev) => ({
                ...prev,
                [market]: defaultHomeServicesContent(market),
              }))
            }
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-60"
          >
            Reset this market
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

      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Market"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Market
        </span>
        {MARKET_IDS.map((id) => {
          const active = market === id
          const hasForeign = marketConflicts[id].foreign.length > 0
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMarket(id)
                setMessage(null)
              }}
              className={
                active
                  ? hasForeign
                    ? 'rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white'
                    : 'rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white'
                  : hasForeign
                    ? 'rounded-md border border-red-500 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800'
                    : 'rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50'
              }
            >
              {marketShortLabel(id)}
              {hasForeign ? ' · conflict' : ''}
            </button>
          )
        })}
        <span className="text-xs text-ink-muted">
          Editing: {marketLabel(market)}
        </span>
      </div>

      {activeConflicts.foreign.length > 0 ? (
        <div
          role="status"
          className="rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-950"
        >
          This {marketLabel(market)} copy still names{' '}
          {activeConflicts.foreign.map(marketLabel).join(' and ')}. Rewrite the
          red fields before publishing to that domain.
        </div>
      ) : (
        <p className="text-xs text-ink-muted">
          No out-of-market country wording found in this {marketShortLabel(market)}{' '}
          draft.
        </p>
      )}

      <div className="space-y-4 rounded-md border border-border bg-white p-4">
        <h3 className="text-base font-semibold text-ink">Section copy</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {chromeFields.map((field) => {
            const value = String(content[field.key] ?? '')
            const hint = foreignHint(value, market)
            const input = field.multiline ? (
              <textarea
                value={value}
                onChange={(e) =>
                  updateChrome(
                    field.key,
                    e.target.value as HomeServicesContent[typeof field.key]
                  )
                }
                rows={3}
                className={conflictClass(Boolean(hint), 'sm:col-span-2')}
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) =>
                  updateChrome(
                    field.key,
                    e.target.value as HomeServicesContent[typeof field.key]
                  )
                }
                className={conflictClass(Boolean(hint))}
              />
            )
            return (
              <label
                key={field.key}
                id={cmsAnchorId(['hs', 'field', field.key])}
                className={`flex flex-col gap-1 text-sm ${
                  field.multiline ? 'sm:col-span-2' : ''
                } ${cmsFocusRingClass(
                  focusHighlight === cmsAnchorId(['hs', 'field', field.key])
                )}`}
              >
                <span
                  className={`font-medium ${hint ? 'text-red-800' : 'text-ink'}`}
                >
                  {field.label}
                </span>
                {input}
                {hint ? (
                  <span className="text-xs font-medium text-red-700">{hint}</span>
                ) : null}
              </label>
            )
          })}
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
          const titleHint = foreignHint(tile.title, market)
          const descriptionHint = foreignHint(tile.description, market)
          const tagsHint = foreignHint(tile.tags.join(', '), market)
          const tileHint = foreignHint(homeServiceTileText(tile), market)
          const tileConflict = Boolean(tileHint)
          return (
            <div
              key={`${tile.href}-${index}`}
              id={cmsAnchorId(['hs', 'tile', tile.href])}
              className={`space-y-3 rounded-md border p-4 ${
                tileConflict
                  ? 'border-red-500 bg-red-50 ring-1 ring-red-400'
                  : 'border-border bg-white'
              } ${cmsFocusRingClass(
                focusHighlight === cmsAnchorId(['hs', 'tile', tile.href])
              )}`}
            >
              <div
                className={`flex flex-wrap items-start justify-between gap-3 rounded-md px-3 py-2 ${
                  tileConflict ? 'bg-red-100' : 'bg-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center"
                    style={{
                      backgroundColor: tileConflict ? '#fecaca' : '#e8f5ee',
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: tileConflict ? '#991b1b' : '#1a6b3c' }}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted">Tile {index + 1}</p>
                    <p
                      className={`text-sm font-semibold ${
                        titleHint || tileConflict ? 'text-red-800' : 'text-ink'
                      }`}
                    >
                      {tile.title || 'Untitled service'}
                    </p>
                    <p className="text-xs text-ink-muted">{tile.href}</p>
                    {tileHint ? (
                      <p className="mt-1 text-xs font-medium text-red-700">
                        {tileHint}
                      </p>
                    ) : null}
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
                <span
                  className={`font-medium ${titleHint ? 'text-red-800' : 'text-ink'}`}
                >
                  Title
                </span>
                <input
                  type="text"
                  value={tile.title}
                  onChange={(e) => updateTile(index, { title: e.target.value })}
                  className={conflictClass(Boolean(titleHint))}
                />
                {titleHint ? (
                  <span className="text-xs font-medium text-red-700">
                    {titleHint}
                  </span>
                ) : null}
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span
                  className={`font-medium ${descriptionHint ? 'text-red-800' : 'text-ink'}`}
                >
                  Description
                </span>
                <textarea
                  value={tile.description}
                  onChange={(e) =>
                    updateTile(index, { description: e.target.value })
                  }
                  rows={3}
                  className={conflictClass(Boolean(descriptionHint))}
                />
                {descriptionHint ? (
                  <span className="text-xs font-medium text-red-700">
                    {descriptionHint}
                  </span>
                ) : null}
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span
                  className={`font-medium ${tagsHint ? 'text-red-800' : 'text-ink'}`}
                >
                  Tags
                </span>
                <input
                  type="text"
                  value={tile.tags.join(', ')}
                  onChange={(e) =>
                    updateTile(index, {
                      tags: e.target.value.split(',').map((tag) => tag.trim()),
                    })
                  }
                  className={conflictClass(Boolean(tagsHint))}
                />
                <span className="text-xs text-ink-muted">
                  Comma-separated, e.g. Formulas, Data Validation, Templates
                </span>
                {tagsHint ? (
                  <span className="text-xs font-medium text-red-700">
                    {tagsHint}
                  </span>
                ) : null}
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
