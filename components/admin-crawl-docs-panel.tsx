'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { MARKET_IDS, marketLabel, type MarketId } from '@/lib/market'
import {
  defaultCrawlDocs,
  defaultCrawlDocsBundle,
  defaultLlmsTxt,
  defaultRobotsTxt,
  formatSitemapUrlLines,
  parseSitemapUrlLines,
  siteOriginForMarket,
  validateCrawlDocs,
  type CrawlDocsBundle,
  type CrawlDocsContent,
  type VerificationFile,
} from '@/lib/crawl-docs'

const MARKET_TABS: MarketId[] = MARKET_IDS

function sitemapStateFromBundle(
  bundle: CrawlDocsBundle
): Record<MarketId, string> {
  const next = {} as Record<MarketId, string>
  for (const id of MARKET_IDS) {
    next[id] = formatSitemapUrlLines(
      (bundle[id] ?? defaultCrawlDocs(id)).sitemapExtraUrls
    )
  }
  return next
}

function emptyVerification(): VerificationFile {
  return { path: '', content: '', enabled: true }
}

function cloneDocs(docs: CrawlDocsContent): CrawlDocsContent {
  return JSON.parse(JSON.stringify(docs)) as CrawlDocsContent
}

export function AdminCrawlDocsPanel() {
  const [markets, setMarkets] = useState<CrawlDocsBundle>(
    defaultCrawlDocsBundle()
  )
  const [activeMarket, setActiveMarket] = useState<MarketId>('nz')
  const [sitemapByMarket, setSitemapByMarket] = useState<
    Record<MarketId, string>
  >(() => sitemapStateFromBundle(defaultCrawlDocsBundle()))
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const form = markets[activeMarket]
  const sitemapLines = sitemapByMarket[activeMarket]
  const origin = siteOriginForMarket(activeMarket)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/crawl-docs')
      const data = (await res.json()) as {
        ok?: boolean
        markets?: CrawlDocsBundle
        error?: string
      }
      if (!res.ok || !data.ok || !data.markets) {
        throw new Error(data.error || 'Failed to load crawl documents')
      }
      const next = defaultCrawlDocsBundle()
      for (const id of MARKET_IDS) {
        next[id] = cloneDocs(data.markets[id] ?? defaultCrawlDocs(id))
      }
      setMarkets(next)
      setSitemapByMarket(sitemapStateFromBundle(next))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load crawl documents from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function setForm(updater: (prev: CrawlDocsContent) => CrawlDocsContent) {
    setMarkets((prev) => ({
      ...prev,
      [activeMarket]: updater(prev[activeMarket]),
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const next: CrawlDocsContent = {
        ...form,
        sitemapExtraUrls: parseSitemapUrlLines(sitemapLines, activeMarket),
      }
      const validationError = validateCrawlDocs(next)
      if (validationError) throw new Error(validationError)
      const res = await fetch('/api/admin/crawl-docs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market: activeMarket, docs: next }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        markets?: CrawlDocsBundle
        error?: string
      }
      if (!res.ok || !data.ok || !data.markets) {
        throw new Error(data.error || 'Save failed')
      }
      const saved = defaultCrawlDocsBundle()
      for (const id of MARKET_IDS) {
        saved[id] = cloneDocs(data.markets[id])
      }
      setMarkets(saved)
      setSitemapByMarket(sitemapStateFromBundle(saved))
      setMessage(
        `${marketLabel(activeMarket)} SEO crawl documents saved. Public robots/llms/sitemap/verification for that domain update immediately.`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  function updateVerification(
    index: number,
    patch: Partial<VerificationFile>
  ) {
    setForm((prev) => ({
      ...prev,
      verificationFiles: prev.verificationFiles.map((file, i) =>
        i === index ? { ...file, ...patch } : file
      ),
    }))
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-muted">
        Loading SEO crawl documents from Firebase…
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => void handleSave(e)}
      className="space-y-6 rounded-lg border border-border bg-surface p-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-ink">
          SEO crawl documents
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Separate sitemap extras, robots.txt, llms.txt, and Search Console
          verification files per domain. New Zealand, International, and UK never
          share crawl data. Stored in Firebase{' '}
          <code className="text-xs">Site Content / crawl-documents</code>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MARKET_TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setActiveMarket(id)
              setMessage(null)
              setError(null)
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              activeMarket === id
                ? 'bg-brand text-white'
                : 'border border-border bg-white text-ink hover:bg-surface-raised'
            }`}
          >
            {marketLabel(id)}
          </button>
        ))}
      </div>

      <p className="text-xs text-ink-muted">
        Editing for <strong>{origin}</strong>
      </p>

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

      <section className="space-y-3 border-t border-border pt-5">
        <div>
          <h3 className="text-sm font-semibold text-ink">
            Sitemap extra URLs
          </h3>
          <p className="mt-1 text-xs text-ink-muted">
            The auto-generated sitemap (pages + blog posts) always runs for
            this domain. Paste extra absolute URLs or paths here — one per
            line. Relative paths resolve to {origin}.
          </p>
        </div>
        <textarea
          value={sitemapLines}
          onChange={(e) =>
            setSitemapByMarket((prev) => ({
              ...prev,
              [activeMarket]: e.target.value,
            }))
          }
          rows={5}
          placeholder={`/case-studies/custom-landing\n${origin}/another-page`}
          className="w-full rounded-md border border-border px-3 py-2 font-mono text-xs leading-relaxed"
          spellCheck={false}
        />
      </section>

      <section className="space-y-3 border-t border-border pt-5">
        <div>
          <h3 className="text-sm font-semibold text-ink">robots.txt</h3>
          <p className="mt-1 text-xs text-ink-muted">
            Served at /robots.txt on {origin}. Leave override off to keep the
            built-in default (allow all + AI crawlers + this domain&apos;s
            sitemap link).
          </p>
        </div>
        <label className="flex items-start gap-3 rounded-md border border-border bg-white px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={form.robotsOverride}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                robotsOverride: e.target.checked,
              }))
            }
            className="mt-0.5 h-4 w-4 rounded border-border"
          />
          <span>
            <span className="font-semibold text-ink">
              Use custom robots.txt
            </span>
            <span className="mt-0.5 block text-ink-muted">
              When off, the site serves the built-in default regardless of the
              editor below.
            </span>
          </span>
        </label>
        <textarea
          value={form.robotsContent}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, robotsContent: e.target.value }))
          }
          rows={12}
          disabled={!form.robotsOverride}
          className="w-full rounded-md border border-border px-3 py-2 font-mono text-xs leading-relaxed disabled:bg-surface-raised disabled:opacity-70"
          spellCheck={false}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              robotsContent: defaultRobotsTxt(origin),
            }))
          }
          className="text-xs font-medium text-brand underline"
        >
          Reset editor to built-in default
        </button>
      </section>

      <section className="space-y-3 border-t border-border pt-5">
        <div>
          <h3 className="text-sm font-semibold text-ink">llms.txt</h3>
          <p className="mt-1 text-xs text-ink-muted">
            Served at /llms.txt on {origin}. AI crawlers use this as a site
            brief for this region only.
          </p>
        </div>
        <label className="flex items-start gap-3 rounded-md border border-border bg-white px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={form.llmsOverride}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                llmsOverride: e.target.checked,
              }))
            }
            className="mt-0.5 h-4 w-4 rounded border-border"
          />
          <span>
            <span className="font-semibold text-ink">Use custom llms.txt</span>
            <span className="mt-0.5 block text-ink-muted">
              When off, the site serves the built-in default for this market.
            </span>
          </span>
        </label>
        <textarea
          value={form.llmsContent}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, llmsContent: e.target.value }))
          }
          rows={14}
          disabled={!form.llmsOverride}
          className="w-full rounded-md border border-border px-3 py-2 font-mono text-xs leading-relaxed disabled:bg-surface-raised disabled:opacity-70"
          spellCheck={false}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              llmsContent: defaultLlmsTxt(activeMarket, origin),
            }))
          }
          className="text-xs font-medium text-brand underline"
        >
          Reset editor to built-in default
        </button>
      </section>

      <section className="space-y-3 border-t border-border pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink">
              Verification files
            </h3>
            <p className="mt-1 text-xs text-ink-muted">
              Root files for Google Search Console, Bing, etc. for{' '}
              <strong>{marketLabel(activeMarket)}</strong> only (e.g.{' '}
              <code className="text-[11px]">google123.html</code>). Served at{' '}
              <code className="text-[11px]">/filename</code> when enabled on
              this domain.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                verificationFiles: [
                  ...prev.verificationFiles,
                  emptyVerification(),
                ],
              }))
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-surface-raised disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add file
          </button>
        </div>

        {form.verificationFiles.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-ink-muted">
            No verification files yet for {marketLabel(activeMarket)}.
          </p>
        ) : (
          <ul className="space-y-4">
            {form.verificationFiles.map((file, index) => (
              <li
                key={`${file.path}-${index}`}
                className="space-y-3 rounded-md border border-border bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
                    <span className="font-medium text-ink">Filename</span>
                    <input
                      type="text"
                      value={file.path}
                      onChange={(e) =>
                        updateVerification(index, { path: e.target.value })
                      }
                      placeholder="googleXXXXXXXX.html"
                      className="rounded-md border border-border px-3 py-2 font-mono text-sm"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={file.enabled}
                      onChange={(e) =>
                        updateVerification(index, {
                          enabled: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="font-medium text-ink">Enabled</span>
                  </label>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        verificationFiles: prev.verificationFiles.filter(
                          (_, i) => i !== index
                        ),
                      }))
                    }
                    className="ml-auto inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    aria-label={`Remove ${file.path || 'verification file'}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Remove
                  </button>
                </div>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">File content</span>
                  <textarea
                    value={file.content}
                    onChange={(e) =>
                      updateVerification(index, { content: e.target.value })
                    }
                    rows={4}
                    placeholder="Paste the exact HTML or XML provided by Google / Bing…"
                    className="rounded-md border border-border px-3 py-2 font-mono text-xs leading-relaxed"
                    spellCheck={false}
                  />
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? 'Saving…' : `Save ${marketLabel(activeMarket)} crawl documents`}
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
