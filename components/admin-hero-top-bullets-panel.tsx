'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import {
  HERO_TOP_BULLETS_MAX,
  HERO_TOP_BULLETS_MIN,
  defaultHeroTopBullets,
  defaultHeroTopBulletsBundle,
  emptyHeroTopBullet,
  type HeroTopBullet,
  type HeroTopBulletsBundle,
} from '@/lib/hero-top-bullets'
import {
  MARKET_IDS,
  marketLabel,
  marketShortLabel,
  type MarketId,
} from '@/lib/market'

export function AdminHeroTopBulletsPanel() {
  const [content, setContent] = useState<HeroTopBulletsBundle>(
    defaultHeroTopBulletsBundle()
  )
  const [market, setMarket] = useState<MarketId>('nz')
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const bullets = content[market]
  const canAdd = bullets.length < HERO_TOP_BULLETS_MAX
  const canRemove = bullets.length > HERO_TOP_BULLETS_MIN

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/hero-top-bullets')
      const data = (await res.json()) as {
        ok?: boolean
        content?: HeroTopBulletsBundle
        publishedAt?: string | null
        updatedAt?: string | null
        error?: string
      }
      if (!res.ok || !data.ok || !data.content) {
        throw new Error(data.error || 'Failed to load top bullets')
      }
      setContent(data.content)
      setPublishedAt(data.publishedAt ?? null)
      setUpdatedAt(data.updatedAt ?? null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load top bullets from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function updateBullets(next: HeroTopBullet[]) {
    setContent((prev) => ({ ...prev, [market]: next }))
  }

  function updateBullet(index: number, text: string) {
    updateBullets(
      bullets.map((bullet, i) => (i === index ? { ...bullet, text } : bullet))
    )
  }

  function addBullet() {
    if (!canAdd) return
    updateBullets([
      ...bullets,
      emptyHeroTopBullet(bullets.map((item) => item.id)),
    ])
  }

  function removeBullet(index: number) {
    if (!canRemove) return
    updateBullets(bullets.filter((_, i) => i !== index))
  }

  function moveBullet(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= bullets.length) return
    const next = [...bullets]
    const [row] = next.splice(index, 1)
    next.splice(nextIndex, 0, row)
    updateBullets(next)
  }

  async function post(action: 'save' | 'publish') {
    const empty = MARKET_IDS.some((id) =>
      content[id].some((bullet) => !bullet.text.trim())
    )
    if (empty) {
      setError('Each bullet needs text before you save or publish.')
      setMessage(null)
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/hero-top-bullets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        content?: HeroTopBulletsBundle
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
            ? `Published to ${data.filePath ?? 'data/hero-top-bullets.generated.ts'}.`
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
        Loading top bullets from Firebase…
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Top Bullets</h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Checklist under the homepage hero intro. Each market can have{' '}
            {HERO_TOP_BULLETS_MIN}–{HERO_TOP_BULLETS_MAX} lines of text.{' '}
            <strong>Save draft</strong> writes Firebase{' '}
            <code className="text-xs">Site Content / hero-top-bullets</code>.{' '}
            <strong>Publish</strong> writes{' '}
            <code className="text-xs">data/hero-top-bullets.generated.ts</code>{' '}
            so the live homepage never queries the database. Localhost shows
            the draft after Save. After publishing locally, commit that file
            and deploy.
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
            {marketShortLabel(market)} {bullets.length} / {HERO_TOP_BULLETS_MAX}{' '}
            bullets
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              setContent((prev) => ({
                ...prev,
                [market]: defaultHeroTopBullets(market),
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
                  ? 'rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50'
              }
            >
              {marketShortLabel(id)}
            </button>
          )
        })}
        <span className="text-xs text-ink-muted">
          Editing: {marketLabel(market)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">Bullets</h3>
        <button
          type="button"
          onClick={addBullet}
          disabled={busy || !canAdd}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Add bullet
        </button>
      </div>

      <div className="space-y-3">
        {bullets.map((bullet, index) => (
          <div
            key={bullet.id}
            className="flex flex-col gap-3 rounded-md border border-border bg-white p-4 sm:flex-row sm:items-center"
          >
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
              <span className="font-medium text-ink">
                Bullet {index + 1}
              </span>
              <input
                type="text"
                value={bullet.text}
                maxLength={80}
                disabled={busy}
                onChange={(event) => updateBullet(index, event.target.value)}
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <div className="flex items-center gap-1 sm:pt-5">
              <button
                type="button"
                title="Move up"
                aria-label={`Move bullet ${index + 1} up`}
                onClick={() => moveBullet(index, -1)}
                disabled={index === 0 || busy}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink hover:bg-surface-raised disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Move down"
                aria-label={`Move bullet ${index + 1} down`}
                onClick={() => moveBullet(index, 1)}
                disabled={index === bullets.length - 1 || busy}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink hover:bg-surface-raised disabled:opacity-40"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Remove"
                aria-label={`Remove bullet ${index + 1}`}
                onClick={() => removeBullet(index)}
                disabled={busy || !canRemove}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
