'use client'

import { useCallback, useEffect, useState } from 'react'

type FilePublishId =
  | 'market-copy'
  | 'page-seo'
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
    editIn: 'CMS → Site CMS',
    description:
      'Site-wide copy, contact details, brand labels, hero, about, homepage SEO, FAQs, and hero background timing.',
    file: 'data/market-copy.generated.ts',
    statusUrl: '/api/admin/market-copy',
  },
  {
    id: 'page-seo',
    title: 'Pages CMS',
    editIn: 'CMS → Pages CMS',
    description:
      'H1, intro, and meta for every service and solution page (NZ, International, UK).',
    file: 'data/page-seo.generated.ts',
    statusUrl: '/api/admin/page-seo',
  },
  {
    id: 'home-services',
    title: 'Home services',
    editIn: 'CMS → Home services',
    description: 'Featured “What we do” tiles on the homepage.',
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

  useEffect(() => {
    void load()
  }, [load])

  async function handlePublishOne(id: FilePublishId) {
    setBusyId(id)
    setError(null)
    setMessage(null)
    try {
      const result = await publishFile(id)
      setMessage(result)
      await load({ silent: true })
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
