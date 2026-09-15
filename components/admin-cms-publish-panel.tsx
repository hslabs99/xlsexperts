'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CmsRegionHealthFinding, CmsRegionHealthReport } from '@/lib/cms-region-health'
import { marketShortLabel } from '@/lib/market'

type FilePublishId =
  | 'market-copy'
  | 'page-seo'
  | 'hero-top-bullets'
  | 'home-services'
  | 'hero-clients'
  | 'hero-projects'
  | 'case-studies-home'
  | 'domains'

type FilePublishDef = {
  id: FilePublishId
  title: string
  editIn: string
  description: string
  file: string
  statusUrl: string
}

type FilePublishStatus = {
  publishedAt: string | null
  updatedAt: string | null
}

const FILE_PUBLISHES: FilePublishDef[] = [
  {
    id: 'market-copy',
    title: 'Site CMS',
    editIn: 'CMS → Site CMS / How we work',
    description:
      'Site-wide copy, contact details, brand labels, hero, about, How we work, homepage SEO, FAQs, and hero background timing.',
    file: 'data/market-copy.generated.ts',
    statusUrl: '/api/admin/market-copy',
  },
  {
    id: 'page-seo',
    title: 'Pages CMS',
    editIn: 'CMS → Pages CMS',
    description:
      'H1, intro, meta, and FAQs for every service and solution page (NZ, International, UK).',
    file: 'data/page-seo.generated.ts',
    statusUrl: '/api/admin/page-seo',
  },
  {
    id: 'hero-top-bullets',
    title: 'Top Bullets',
    editIn: 'CMS → Top Bullets',
    description:
      'Homepage hero checklist (3–5 lines of text per market).',
    file: 'data/hero-top-bullets.generated.ts',
    statusUrl: '/api/admin/hero-top-bullets',
  },
  {
    id: 'home-services',
    title: 'Home services',
    editIn: 'CMS → Home services',
    description:
      'Featured “What we do” tiles on the homepage, with separate NZ / International / UK copy.',
    file: 'data/home-services.generated.ts',
    statusUrl: '/api/admin/home-services',
  },
  {
    id: 'hero-clients',
    title: 'Client Logos',
    editIn: 'CMS → Client Logos',
    description:
      'Homepage heading, client names and logos. Publish shuffles the order; the site then fades through 12 unique logos at a time.',
    file: 'data/hero-clients.generated.ts',
    statusUrl: '/api/admin/hero-clients',
  },
  {
    id: 'hero-projects',
    title: 'Common Projects',
    editIn: 'CMS → Common Projects',
    description:
      'Homepage hero common-project pills, lucide fallbacks, and generated icons.',
    file: 'data/hero-projects.generated.ts',
    statusUrl: '/api/admin/hero-projects',
  },
  {
    id: 'case-studies-home',
    title: 'Homepage case studies',
    editIn: 'Case Studies',
    description:
      'First-paint case study cards on the homepage. Edit selection and order in Case Studies, then publish here.',
    file: 'data/case-studies-home.generated.ts',
    statusUrl: '/api/admin/case-studies-home',
  },
  {
    id: 'domains',
    title: 'Domains',
    editIn: 'Marketing → Domains',
    description:
      'Production host → region bindings and canonical site URLs (including Our brands links).',
    file: 'data/domain-regions.generated.ts',
    statusUrl: '/api/admin/domain-regions',
  },
]

function formatWhen(value: string | null): string {
  if (!value) return 'never'
  const t = Date.parse(value)
  return Number.isFinite(t) ? new Date(t).toLocaleString('en-NZ') : value
}

/** Firestore publish writes updatedAt a moment after publishedAt. */
const PUBLISH_SKEW_MS = 30_000

function draftAhead(status: FilePublishStatus | undefined): boolean {
  if (!status?.updatedAt) return false
  if (!status.publishedAt) return true
  return (
    Date.parse(status.updatedAt) - Date.parse(status.publishedAt) >
    PUBLISH_SKEW_MS
  )
}

async function readStatus(url: string): Promise<FilePublishStatus> {
  const res = await fetch(url)
  const data = (await res.json()) as {
    ok?: boolean
    publishedAt?: string | null
    updatedAt?: string | null
    error?: string
  }
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `Failed to load ${url}`)
  }
  return {
    publishedAt: data.publishedAt ?? null,
    updatedAt: data.updatedAt ?? null,
  }
}

async function publishFile(id: FilePublishId): Promise<string> {
  const routes: Record<FilePublishId, string> = {
    'market-copy': '/api/admin/market-copy',
    'page-seo': '/api/admin/page-seo',
    'hero-top-bullets': '/api/admin/hero-top-bullets',
    'home-services': '/api/admin/home-services',
    'hero-clients': '/api/admin/hero-clients',
    'hero-projects': '/api/admin/hero-projects',
    'case-studies-home': '/api/admin/case-studies-home',
    domains: '/api/admin/domain-regions',
  }
  const res = await fetch(routes[id], {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'publish' }),
  })
  const data = (await res.json()) as {
    ok?: boolean
    filePath?: string
    message?: string
    error?: string
  }
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `Publish failed (${id})`)
  }
  return data.message || `Published ${data.filePath ?? id}.`
}

export function AdminCmsPublishPanel() {
  const [statuses, setStatuses] = useState<
    Partial<Record<FilePublishId, FilePublishStatus>>
  >({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<FilePublishId | 'all' | 'thumbs' | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [health, setHealth] = useState<CmsRegionHealthReport | null>(null)
  const [healthLoading, setHealthLoading] = useState(true)
  const [healthError, setHealthError] = useState<string | null>(null)

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true)
      setError(null)
    }
    try {
      const entries = await Promise.all(
        FILE_PUBLISHES.map(async (item) => {
          const status = await readStatus(item.statusUrl)
          return [item.id, status] as const
        })
      )
      setStatuses(Object.fromEntries(entries))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load publish status'
      )
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }, [])

  const loadHealth = useCallback(async () => {
    setHealthLoading(true)
    setHealthError(null)
    try {
      const res = await fetch('/api/admin/cms-region-health')
      const data = (await res.json()) as CmsRegionHealthReport & {
        ok?: boolean
        error?: string
      }
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || 'Regional health check failed')
      }
      setHealth(data)
    } catch (err) {
      setHealthError(
        err instanceof Error ? err.message : 'Regional health check failed'
      )
    } finally {
      setHealthLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    void loadHealth()
  }, [load, loadHealth])

  const healthBySource = useMemo(() => {
    const groups: Array<{
      source: string
      label: string
      items: CmsRegionHealthFinding[]
    }> = []
    if (!health) return groups
    for (const item of health.findings) {
      const existing = groups.find((group) => group.source === item.source)
      if (existing) existing.items.push(item)
      else {
        groups.push({
          source: item.source,
          label: item.sourceLabel,
          items: [item],
        })
      }
    }
    return groups
  }, [health])

  async function handlePublishOne(id: FilePublishId) {
    setBusyId(id)
    setError(null)
    setMessage(null)
    try {
      const result = await publishFile(id)
      setMessage(result)
      await load({ silent: true })
      await loadHealth()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setBusyId(null)
    }
  }

  async function handlePublishAll() {
    setBusyId('all')
    setError(null)
    setMessage(null)
    const done: string[] = []
    try {
      // Domains first so later Site CMS publish picks up the new origins.
      const ids: FilePublishId[] = [
        'domains',
        ...FILE_PUBLISHES.map((item) => item.id).filter((id) => id !== 'domains'),
      ]
      for (const id of ids) {
        done.push(await publishFile(id))
      }
      setMessage(
        `Published all generated files. ${done.length} of ${ids.length} succeeded.`
      )
      await load({ silent: true })
      await loadHealth()
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}${done.length ? ` (${done.length} already published.)` : ''}`
          : 'Publish all failed'
      )
      await load({ silent: true })
    } finally {
      setBusyId(null)
    }
  }

  async function handlePublishEmailThumbs() {
    setBusyId('thumbs')
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/publish-email-case-study-thumbs', {
        method: 'POST',
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        uploaded?: number
        failed?: number
        lastError?: string
        hint?: string
      }
      if (!res.ok || data.ok === false) {
        throw new Error(
          data.error ||
            data.lastError ||
            'Failed to publish email thumbs to Storage'
        )
      }
      setMessage(
        `Email thumbs → uploaded ${data.uploaded ?? 0}, failed ${data.failed ?? 0}.${data.lastError ? ` Last error: ${data.lastError}` : ''}${data.hint ? ` — ${data.hint}` : ''}`
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Email thumbs publish failed'
      )
    } finally {
      setBusyId(null)
    }
  }

  const busy = busyId !== null

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-muted">
        Loading publish status…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Publish</h2>
            <p className="mt-1 max-w-3xl text-sm text-ink-muted">
              Each action below writes a generated file from the last{' '}
              <strong>saved draft</strong>. Save first on the edit screen if you
              have unsaved changes. After publishing locally,{' '}
              <strong>commit those files and deploy</strong>. Do not publish
              again on the live site — production uses the files in git.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handlePublishAll()}
            className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {busyId === 'all' ? 'Publishing all…' : 'Publish all generated files'}
          </button>
        </div>

        {(message || error) && (
          <div
            className={`mt-4 rounded-md border p-3 text-sm ${
              error
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-brand/30 bg-brand-light text-brand-dark'
            }`}
            role="status"
          >
            {error || message}
          </div>
        )}

        <div className="mt-6 rounded-md border border-border bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Regional health check
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-ink-muted">
                Scans the last saved CMS drafts (NZ / International / UK) for
                country wording that does not belong on that market, including
                page FAQs. Click a finding to open it in the editor.
              </p>
            </div>
            <button
              type="button"
              disabled={busy || healthLoading}
              onClick={() => void loadHealth()}
              className="shrink-0 rounded-md border border-border bg-white px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-60"
            >
              {healthLoading ? 'Scanning…' : 'Rescan'}
            </button>
          </div>

          {healthError ? (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {healthError}
            </p>
          ) : healthLoading && !health ? (
            <p className="mt-3 text-sm text-ink-muted">Scanning drafts…</p>
          ) : health && health.findingCount === 0 ? (
            <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              No out-of-region wording in Site CMS, Pages CMS (including FAQs),
              How we work, Home services, or Top Bullets.
            </p>
          ) : health ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm font-medium text-amber-900">
                {health.findingCount} finding
                {health.findingCount === 1 ? '' : 's'} in unpublished / draft CMS
                copy.
              </p>
              {health.errors.length > 0 ? (
                <p className="text-xs text-amber-800">
                  Partial scan: {health.errors.join(' · ')}
                </p>
              ) : null}
              {healthBySource.map((group) => (
                <div key={group.source} className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {group.label} ({group.items.length})
                  </h4>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={item.href}
                          className="block rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-ink transition hover:border-amber-400 hover:bg-amber-100"
                        >
                          <span className="font-semibold">{item.title}</span>
                          <span className="ml-2 rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium text-amber-900">
                            {marketShortLabel(item.market)}
                          </span>
                          <span className="mt-1 block text-xs text-ink-muted">
                            {item.detail}
                          </span>
                          {item.samples[0] ? (
                            <span className="mt-1 block truncate text-[11px] text-ink-muted">
                              {item.samples[0]}
                            </span>
                          ) : null}
                          <span className="mt-1 block text-[11px] font-medium text-brand">
                            Edit in {item.sourceLabel} →
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-6 space-y-3">
          {FILE_PUBLISHES.map((item) => {
            const status = statuses[item.id]
            const ahead = draftAhead(status)
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-md border border-border bg-white p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">
                      {item.title}
                    </h3>
                    {ahead ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                        Unpublished draft
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                        In sync
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    {item.description}
                  </p>
                  <p className="mt-2 text-[11px] text-ink-muted">
                    Edit in {item.editIn}
                    {' · '}
                    <code className="text-[11px]">{item.file}</code>
                  </p>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    Last draft: {formatWhen(status?.updatedAt ?? null)}
                    {' · '}
                    Last publish: {formatWhen(status?.publishedAt ?? null)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handlePublishOne(item.id)}
                  className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {busyId === item.id ? 'Publishing…' : 'Publish'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-ink">
          Email assets (not page content)
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-muted">
          Discovery booking emails load images from Firebase Storage. This does
          not affect homepage speed. Blog posts and individual case studies are
          still published from their own tabs.
        </p>

        <div className="mt-6 space-y-3">
          <div className="flex flex-col gap-3 rounded-md border border-border bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Discovery email thumbs
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                Compress case-study heroes into Firebase Storage for discovery
                booking emails.
              </p>
              <p className="mt-2 text-[11px] text-ink-muted">
                Also on Seeding
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handlePublishEmailThumbs()}
              className="shrink-0 rounded-md border border-brand/40 bg-brand-light px-4 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand/15 disabled:opacity-60"
            >
              {busyId === 'thumbs' ? 'Publishing…' : 'Publish email thumbs'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
