'use client'

import { useEffect, useId, useState, type ReactNode } from 'react'

export type AdminDialogTone = 'default' | 'danger'

export type AdminDialogProps = {
  open: boolean
  title: string
  children?: ReactNode
  /** alert = single dismiss button; confirm = cancel + confirm */
  mode?: 'alert' | 'confirm'
  tone?: AdminDialogTone
  confirmLabel?: string
  cancelLabel?: string
  dismissLabel?: string
  busy?: boolean
  /**
   * When set, user must type this exact value (case-sensitive trim) before
   * Confirm unlocks — used for enquiry delete password, never for booking clear.
   */
  requireText?: string
  requireTextLabel?: string
  requireTextPlaceholder?: string
  onConfirm?: () => void | Promise<void>
  onClose: () => void
}

/**
 * In-app modal for admin confirms / alerts. Prefer this over window.alert,
 * window.confirm, and window.prompt everywhere in the admin portal.
 */
export function AdminDialog({
  open,
  title,
  children,
  mode = 'confirm',
  tone = 'default',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  dismissLabel = 'OK',
  busy = false,
  requireText,
  requireTextLabel,
  requireTextPlaceholder,
  onConfirm,
  onClose,
}: AdminDialogProps) {
  const titleId = useId()
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (!open) setTyped('')
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  if (!open) return null

  const requireOk =
    !requireText || typed.trim() === requireText.trim()

  async function handleConfirm() {
    if (!requireOk || busy) return
    await onConfirm?.()
  }

  const confirmClass =
    tone === 'danger'
      ? 'bg-red-700 text-white hover:bg-red-800 disabled:opacity-60'
      : 'bg-brand text-white hover:bg-brand-dark disabled:opacity-60'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-lg"
      >
        <h2 id={titleId} className="text-lg font-semibold text-ink">
          {title}
        </h2>
        {children ? (
          <div className="mt-3 space-y-2 text-sm text-ink-muted">{children}</div>
        ) : null}

        {requireText ? (
          <label className="mt-4 flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">
              {requireTextLabel || 'Type to confirm'}
            </span>
            <input
              type="password"
              autoComplete="off"
              value={typed}
              disabled={busy}
              placeholder={requireTextPlaceholder}
              onChange={(e) => setTyped(e.target.value)}
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {mode === 'alert' ? (
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {dismissLabel}
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={busy || !requireOk}
                onClick={() => void handleConfirm()}
                className={`rounded-md px-4 py-2 text-sm font-semibold ${confirmClass}`}
              >
                {busy ? 'Working…' : confirmLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
