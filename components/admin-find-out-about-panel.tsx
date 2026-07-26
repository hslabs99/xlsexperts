'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import {
  ALL_SERVICES_MENU_HREF,
  ALL_SOLUTIONS_MENU_HREF,
  DEFAULT_FIND_OUT_ABOUT,
  type FindOutAboutBrowseLink,
  type FindOutAboutContent,
  type FindOutAboutItem,
} from '@/lib/find-out-about'
import {
  createEmptyFindOutAboutItem,
  findOutAboutPageOptions,
  validateFindOutAboutContent,
} from '@/lib/find-out-about-pages'

const BROWSE_LINKS = [
  {
    key: 'services',
    href: ALL_SERVICES_MENU_HREF,
    title: 'See all services',
  },
  {
    key: 'solutions',
    href: ALL_SOLUTIONS_MENU_HREF,
    title: 'See all solutions',
  },
] as const

export function AdminFindOutAboutPanel() {
  const [form, setForm] = useState<FindOutAboutContent>(DEFAULT_FIND_OUT_ABOUT)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const pageOptions = useMemo(() => findOutAboutPageOptions(), [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/find-out-about')
      const data = (await res.json()) as {
        ok?: boolean
        content?: FindOutAboutContent
        error?: string
      }
      if (!res.ok || !data.ok || !data.content) {
        throw new Error(data.error || 'Failed to load Find out about menu')
      }
      setForm(data.content)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load Find out about menu from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function updateItem(index: number, patch: Partial<FindOutAboutItem>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    }))
  }

  function onPageChange(index: number, href: string) {
    const option = pageOptions.find((opt) => opt.href === href)
    if (!option) return
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item
        const keepCustomLabel =
          item.label.trim() !== '' &&
          !pageOptions.some(
            (opt) =>
              opt.label === item.label.trim() ||
              opt.optionLabel === item.label.trim()
          )
        return {
          ...item,
          href: option.href,
          kind: option.kind,
          label: keepCustomLabel ? item.label : option.label,
        }
      }),
    }))
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        createEmptyFindOutAboutItem(prev.items.length + 1),
      ],
    }))
  }

  function removeItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, sortOrder: i + 1 })),
    }))
  }

  function moveItem(index: number, direction: -1 | 1) {
    setForm((prev) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.items.length) return prev
      const items = [...prev.items]
      const [row] = items.splice(index, 1)
      items.splice(nextIndex, 0, row)
      return {
        ...prev,
        items: items.map((item, i) => ({ ...item, sortOrder: i + 1 })),
      }
    })
  }

  function updateBrowseLink(
    key: 'services' | 'solutions',
    patch: Partial<FindOutAboutBrowseLink>
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const validationError = validateFindOutAboutContent(form)
      if (validationError) throw new Error(validationError)
      const res = await fetch('/api/admin/find-out-about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = (await res.json()) as {
        ok?: boolean
        content?: FindOutAboutContent
        error?: string
      }
      if (!res.ok || !data.ok || !data.content) {
        throw new Error(data.error || 'Save failed')
      }
      setForm(data.content)
      setMessage(
        'Find out about menu saved to Firebase (Site Content / find-out-about).'
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
        Loading Find out about menu from Firebase…
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => void handleSave(e)}
      className="space-y-4 rounded-lg border border-border bg-surface p-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-ink">Find out about</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Quick-nav items for the floating “Find out about” button. Each row is
          a visitor-facing label linked to a solution or service page. Stored in
          Firebase{' '}
          <code className="text-xs">Site Content / find-out-about</code>.
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

      <div className="space-y-3">
        {form.items.length === 0 && (
          <p className="rounded-md border border-dashed border-border bg-white px-4 py-6 text-center text-sm text-ink-muted">
            No quick links yet. The menu will show only the browse-all links
            below until you add some.
          </p>
        )}

        {form.items.map((item, index) => (
          <div
            key={item.id}
            className="grid gap-3 rounded-md border border-border bg-white p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Label</span>
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(index, { label: e.target.value })}
                placeholder="e.g. NC Web Applications"
                className="rounded-md border border-border px-3 py-2"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Links to page</span>
              <select
                value={item.href}
                onChange={(e) => onPageChange(index, e.target.value)}
                className="rounded-md border border-border px-3 py-2"
              >
                {pageOptions.map((opt) => (
                  <option key={opt.href} value={opt.href}>
                    {opt.optionLabel}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-1">
              <button
                type="button"
                title="Move up"
                aria-label={`Move ${item.label || 'item'} up`}
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink hover:bg-surface-raised disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Move down"
                aria-label={`Move ${item.label || 'item'} down`}
                onClick={() => moveItem(index, 1)}
                disabled={index === form.items.length - 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink hover:bg-surface-raised disabled:opacity-40"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Remove"
                aria-label={`Remove ${item.label || 'item'}`}
                onClick={() => removeItem(index)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
        >
          <Plus className="h-4 w-4" />
          Add menu item
        </button>
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <div>
          <h3 className="text-base font-semibold text-ink">
            Browse-all links
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            Shown under the quick links so a visitor who cannot see what they
            want can go to the full list. The descriptive text explains the
            difference between services and solutions before they click.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Section heading</span>
          <input
            type="text"
            value={form.browseHeading}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, browseHeading: e.target.value }))
            }
            placeholder="Not listed? Browse the full range"
            className="rounded-md border border-border px-3 py-2"
          />
        </label>

        {BROWSE_LINKS.map(({ key, href, title }) => {
          const link = form[key]
          return (
            <div
              key={key}
              className="space-y-3 rounded-md border border-border bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">
                  {title}{' '}
                  <code className="ml-1 text-xs font-normal text-ink-muted">
                    {href}
                  </code>
                </span>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={link.enabled}
                    onChange={(e) =>
                      updateBrowseLink(key, { enabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-ink">Show in menu</span>
                </label>
              </div>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-ink">Label</span>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) =>
                    updateBrowseLink(key, { label: e.target.value })
                  }
                  className="rounded-md border border-border px-3 py-2"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-ink">Descriptive text</span>
                <textarea
                  value={link.description}
                  onChange={(e) =>
                    updateBrowseLink(key, { description: e.target.value })
                  }
                  rows={3}
                  className="rounded-md border border-border px-3 py-2"
                />
                <span className="text-xs text-ink-muted">
                  {key === 'services'
                    ? 'Describe the technical services offered.'
                    : 'Describe the industries served and the systems delivered for them.'}
                </span>
              </label>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save Find out about menu'}
        </button>
      </div>
    </form>
  )
}
