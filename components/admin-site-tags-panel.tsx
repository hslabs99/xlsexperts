'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_SITE_TAGS,
  validateSiteTags,
  type SiteTagsContent,
} from '@/lib/site-tags'

export function AdminSiteTagsPanel() {
  const [form, setForm] = useState<SiteTagsContent>(DEFAULT_SITE_TAGS)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/site-tags')
      const data = (await res.json()) as {
        ok?: boolean
        tags?: SiteTagsContent
        error?: string
      }
      if (!res.ok || !data.ok || !data.tags) {
        throw new Error(data.error || 'Failed to load analytics tags')
      }
      setForm(data.tags)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load analytics tags from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const validationError = validateSiteTags(form)
      if (validationError) throw new Error(validationError)
      const res = await fetch('/api/admin/site-tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Save failed')
      }
      setMessage(
        form.enabled
          ? 'Analytics tags saved and enabled on the public site.'
          : 'Analytics tags saved (currently disabled — turn on “Enable tags” to publish).'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-muted">
        Loading analytics tags from Firebase…
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => void handleSave(e)}
      className="space-y-4 rounded-lg border border-border bg-surface p-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-ink">
          Analytics & marketing tags
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Inject Google Tag Manager, Google Analytics, or any vendor tag snippets
          into the live site. Stored in Firebase{' '}
          <code className="text-xs">Site Content / analytics-tags</code>. Tags
          do not run on the admin panel.
        </p>
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

      <label className="flex items-start gap-3 rounded-md border border-border bg-white px-4 py-3 text-sm">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, enabled: e.target.checked }))
          }
          className="mt-0.5 h-4 w-4 rounded border-border"
        />
        <span>
          <span className="font-semibold text-ink">Enable tags on the public site</span>
          <span className="mt-0.5 block text-ink-muted">
            When off, saved snippets stay in Firebase but are not injected.
          </span>
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Google Tag Manager ID</span>
          <input
            type="text"
            value={form.googleTagManagerId}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                googleTagManagerId: e.target.value,
              }))
            }
            placeholder="GTM-XXXXXXX"
            className="rounded-md border border-border px-3 py-2 font-mono text-sm"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="text-xs text-ink-muted">
            Optional. Installs the standard GTM head + noscript snippets.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Google Analytics 4 ID</span>
          <input
            type="text"
            value={form.googleAnalyticsId}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                googleAnalyticsId: e.target.value,
              }))
            }
            placeholder="G-XXXXXXXXXX"
            className="rounded-md border border-border px-3 py-2 font-mono text-sm"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="text-xs text-ink-muted">
            Optional. Use this <em>or</em> GTM (not both unless you intend to).
          </span>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Custom head tags</span>
        <textarea
          value={form.headHtml}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, headHtml: e.target.value }))
          }
          rows={8}
          placeholder={`<!-- Paste Meta Pixel, LinkedIn Insight, or other <script> / <link> snippets -->`}
          className="rounded-md border border-border px-3 py-2 font-mono text-xs leading-relaxed"
          spellCheck={false}
        />
        <span className="text-xs text-ink-muted">
          Injected into <code className="text-[11px]">&lt;head&gt;</code>. Full
          vendor HTML including script tags is accepted.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Custom body tags</span>
        <textarea
          value={form.bodyHtml}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, bodyHtml: e.target.value }))
          }
          rows={6}
          placeholder={`<!-- e.g. GTM noscript iframe if not using the GTM ID field above -->`}
          className="rounded-md border border-border px-3 py-2 font-mono text-xs leading-relaxed"
          spellCheck={false}
        />
        <span className="text-xs text-ink-muted">
          Injected near the start of <code className="text-[11px]">&lt;body&gt;</code>.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save tags'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void load()}
          className="inline-flex items-center justify-center rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-raised disabled:opacity-60"
        >
          Reload
        </button>
      </div>
    </form>
  )
}
