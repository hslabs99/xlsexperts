'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  fetchConfirmationContent,
  saveConfirmationContent,
} from '@/lib/confirmation-content-db'
import {
  DEFAULT_CONFIRMATION_CONTENT,
  type ConfirmationContent,
  type ConfirmationStep,
} from '@/lib/confirmation-content'

export function AdminConfirmationContentPanel() {
  const [form, setForm] = useState<ConfirmationContent>(DEFAULT_CONFIRMATION_CONTENT)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setForm(await fetchConfirmationContent())
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load confirmation copy from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function updateStep(index: number, patch: Partial<ConfirmationStep>) {
    setForm((prev) => ({
      ...prev,
      whatHappensNext: prev.whatHappensNext.map((step, i) =>
        i === index ? { ...step, ...patch } : step
      ),
    }))
  }

  function addStep() {
    setForm((prev) => ({
      ...prev,
      whatHappensNext: [
        ...prev.whatHappensNext,
        { n: String(prev.whatHappensNext.length + 1), text: '' },
      ],
    }))
  }

  function removeStep(index: number) {
    setForm((prev) => ({
      ...prev,
      whatHappensNext: prev.whatHappensNext
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, n: String(i + 1) })),
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      if (!form.heading.trim() || !form.subheading.trim()) {
        throw new Error('Heading and subheading are required.')
      }
      if (form.whatHappensNext.some((s) => !s.text.trim())) {
        throw new Error('Each “What happens next” step needs text.')
      }
      await saveConfirmationContent(form)
      setMessage('Confirmation copy saved to Firebase (Site Content).')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-muted">
        Loading confirmation copy from Firebase…
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
          Standard enquiry confirmation copy
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Shown after someone sends a standard enquiry (not discovery). Stored in
          Firebase <code className="text-xs">Site Content / contact-confirmation</code>
          .
        </p>
      </div>

      {(message || error) && (
        <div
          className={`rounded-md border p-3 text-sm ${
            error
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-brand/30 bg-brand-light text-brand-dark'
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-ink">Eyebrow</span>
          <input
            value={form.eyebrow}
            onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))}
            className="rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-ink">Heading</span>
          <input
            value={form.heading}
            onChange={(e) => setForm((p) => ({ ...p, heading: e.target.value }))}
            className="rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-ink">Subheading</span>
          <textarea
            value={form.subheading}
            onChange={(e) =>
              setForm((p) => ({ ...p, subheading: e.target.value }))
            }
            rows={3}
            className="rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Panel heading</span>
          <input
            value={form.panelHeading}
            onChange={(e) =>
              setForm((p) => ({ ...p, panelHeading: e.target.value }))
            }
            className="rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Panel body</span>
          <textarea
            value={form.panelBody}
            onChange={(e) =>
              setForm((p) => ({ ...p, panelBody: e.target.value }))
            }
            rows={3}
            className="rounded-md border border-border px-3 py-2"
          />
        </label>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex flex-col gap-1 text-sm flex-1">
            <span className="font-medium text-ink">“What happens next” title</span>
            <input
              value={form.whatHappensNextTitle}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  whatHappensNextTitle: e.target.value,
                }))
              }
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={addStep}
            className="mt-6 inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
          >
            <Plus className="h-4 w-4" />
            Add step
          </button>
        </div>

        <ul className="mt-3 space-y-3">
          {form.whatHappensNext.map((step, index) => (
            <li
              key={`${step.n}-${index}`}
              className="flex flex-col gap-2 rounded-md border border-border bg-surface-raised p-3 sm:flex-row sm:items-start"
            >
              <input
                value={step.n}
                onChange={(e) => updateStep(index, { n: e.target.value })}
                className="w-16 rounded-md border border-border px-2 py-2 text-sm"
                aria-label={`Step ${index + 1} number`}
              />
              <textarea
                value={step.text}
                onChange={(e) => updateStep(index, { text: e.target.value })}
                rows={2}
                className="min-w-0 flex-1 rounded-md border border-border px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="inline-flex items-center justify-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save to Firebase'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setForm(DEFAULT_CONFIRMATION_CONTENT)}
          className="rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
        >
          Reset to defaults
        </button>
      </div>
    </form>
  )
}
