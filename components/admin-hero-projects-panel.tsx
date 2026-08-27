'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from 'lucide-react'
import { heroProjectIcons } from '@/components/hero-project-icons'
import {
  HERO_PROJECTS_MAX,
  HERO_PROJECT_ICON_KEYS,
  HERO_PROJECT_ICON_LABELS,
  defaultHeroProjects,
  emptyHeroProject,
  type HeroProjectIconKey,
  type HeroProjectTile,
} from '@/lib/hero-trust'

export function AdminHeroProjectsPanel() {
  const [projects, setProjects] = useState<HeroProjectTile[]>(
    defaultHeroProjects()
  )
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/hero-projects')
      const data = (await res.json()) as {
        ok?: boolean
        projects?: HeroProjectTile[]
        publishedAt?: string | null
        updatedAt?: string | null
        error?: string
      }
      if (!res.ok || !data.ok || !data.projects) {
        throw new Error(data.error || 'Failed to load common projects')
      }
      setProjects(data.projects)
      setPublishedAt(data.publishedAt ?? null)
      setUpdatedAt(data.updatedAt ?? null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load common projects from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function updateProject(index: number, patch: Partial<HeroProjectTile>) {
    setProjects((prev) =>
      prev.map((project, i) =>
        i === index ? { ...project, ...patch } : project
      )
    )
  }

  function addProject() {
    setProjects((prev) => {
      if (prev.length >= HERO_PROJECTS_MAX) return prev
      return [...prev, emptyHeroProject(prev.map((item) => item.id))]
    })
  }

  function removeProject(index: number) {
    setProjects((prev) => prev.filter((_, i) => i !== index))
  }

  function moveProject(index: number, direction: -1 | 1) {
    setProjects((prev) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.length) return prev
      const next = [...prev]
      const [row] = next.splice(index, 1)
      next.splice(nextIndex, 0, row)
      return next
    })
  }

  async function post(action: 'save' | 'publish') {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/hero-projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, projects }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        projects?: HeroProjectTile[]
        publishedAt?: string
        filePath?: string
        message?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.projects) {
        throw new Error(data.error || `${action} failed`)
      }
      setProjects(data.projects)
      if (action === 'publish') {
        setPublishedAt(data.publishedAt ?? null)
      } else {
        setUpdatedAt(new Date().toISOString())
      }
      setMessage(
        data.message ||
          (action === 'publish'
            ? `Published to ${data.filePath ?? 'data/hero-projects.generated.ts'}.`
            : 'Draft saved. Click Publish to update the static file used by the public site.')
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : `${action} failed`)
    } finally {
      setBusy(false)
    }
  }

  async function generateIcon(index: number) {
    const project = projects[index]
    if (!project?.label.trim()) {
      setError('Enter a project name before generating an icon.')
      return
    }
    setGeneratingId(project.id)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/hero-projects/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: project.label }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        url?: string
        error?: string
      }
      if (!res.ok || !data.ok || !data.url) {
        throw new Error(data.error || 'Icon generation failed')
      }
      updateProject(index, { iconSrc: data.url })
      setMessage(
        `Generated an icon for ${project.label}. Save draft, then Publish to put it on the homepage.`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Icon generation failed')
    } finally {
      setGeneratingId(null)
    }
  }

  async function generateMissing() {
    const missing = projects
      .map((project, index) => ({ project, index }))
      .filter(({ project }) => !project.iconSrc && project.label.trim())
    if (missing.length === 0) {
      setMessage('Every project already has a generated icon.')
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    let done = 0
    let next = [...projects]
    try {
      for (const { project, index } of missing) {
        setGeneratingId(project.id)
        setMessage(`Generating icon ${done + 1} of ${missing.length}…`)
        const res = await fetch('/api/admin/hero-projects/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: project.label }),
        })
        const data = (await res.json()) as {
          ok?: boolean
          url?: string
          error?: string
        }
        if (!res.ok || !data.ok || !data.url) {
          setProjects(next)
          throw new Error(
            data.error || `Icon generation failed for ${project.label}`
          )
        }
        next = next.map((item, i) =>
          i === index ? { ...item, iconSrc: data.url! } : item
        )
        setProjects(next)
        done += 1
      }
      setMessage(
        `Generated ${done} icon${done === 1 ? '' : 's'}. Save draft, then Publish.`
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}${done ? ` (${done} already generated.)` : ''}`
          : 'Icon generation failed'
      )
    } finally {
      setGeneratingId(null)
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-muted">
        Loading common projects from Firebase…
      </div>
    )
  }

  const generating = generatingId !== null

  return (
    <div className="space-y-6 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Common Projects</h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Project pills on the homepage hero. Lucide icons show until you
            generate a custom icon. Generate stores images in Firebase Storage.{' '}
            <strong>Save draft</strong> writes Firebase{' '}
            <code className="text-xs">Site Content / hero-projects</code>.{' '}
            <strong>Publish</strong> writes{' '}
            <code className="text-xs">data/hero-projects.generated.ts</code> so
            the live homepage never queries the database or runs generation.
            Localhost shows the draft after Save.
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
            {projects.length} / {HERO_PROJECTS_MAX} projects
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || generating}
            onClick={() => setProjects(defaultHeroProjects())}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-60"
          >
            Reset to original
          </button>
          <button
            type="button"
            disabled={busy || generating}
            onClick={() => void generateMissing()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Generate missing icons
          </button>
          <button
            type="button"
            disabled={busy || generating}
            onClick={() => void post('save')}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-60"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={busy || generating}
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">Projects</h3>
        <button
          type="button"
          onClick={addProject}
          disabled={busy || generating || projects.length >= HERO_PROJECTS_MAX}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Add project
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((project, index) => {
          const Icon = heroProjectIcons[project.icon] ?? heroProjectIcons.zap
          return (
            <div
              key={project.id}
              className="space-y-3 rounded-md border border-border bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {project.iconSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.iconSrc}
                      alt=""
                      className="h-10 w-10 rounded-md object-contain bg-white ring-1 ring-border"
                    />
                  ) : (
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
                  )}
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {project.label || `Project ${index + 1}`}
                    </p>
                    <p className="text-xs text-ink-muted">{project.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Move up"
                    aria-label={`Move ${project.label} up`}
                    onClick={() => moveProject(index, -1)}
                    disabled={index === 0 || busy || generating}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink hover:bg-surface-raised disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    aria-label={`Move ${project.label} down`}
                    onClick={() => moveProject(index, 1)}
                    disabled={
                      index === projects.length - 1 || busy || generating
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink hover:bg-surface-raised disabled:opacity-40"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Remove"
                    aria-label={`Remove ${project.label}`}
                    onClick={() => removeProject(index)}
                    disabled={busy || generating}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">Project name</span>
                  <input
                    type="text"
                    value={project.label}
                    onChange={(e) =>
                      updateProject(index, { label: e.target.value })
                    }
                    className="rounded-md border border-border px-3 py-2"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">
                    Fallback icon (lucide)
                  </span>
                  <select
                    value={project.icon}
                    onChange={(e) =>
                      updateProject(index, {
                        icon: e.target.value as HeroProjectIconKey,
                      })
                    }
                    className="rounded-md border border-border px-3 py-2"
                  >
                    {HERO_PROJECT_ICON_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {HERO_PROJECT_ICON_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy || generating}
                  onClick={() => void generateIcon(index)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-gray-50 disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {generatingId === project.id
                    ? 'Generating…'
                    : project.iconSrc
                      ? 'Regenerate icon'
                      : 'Generate icon'}
                </button>
                {project.iconSrc ? (
                  <button
                    type="button"
                    onClick={() => updateProject(index, { iconSrc: '' })}
                    className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-gray-50"
                  >
                    Use lucide icon instead
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
