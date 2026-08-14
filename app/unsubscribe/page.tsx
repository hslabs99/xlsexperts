'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function UnsubscribeInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() || ''

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [already, setAlready] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('This unsubscribe link is missing or invalid.')
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          `/api/mailings/unsubscribe?token=${encodeURIComponent(token)}`
        )
        const data = (await res.json()) as {
          email?: string
          name?: string
          unsubscribed?: boolean
          error?: string
        }
        if (cancelled) return
        if (!res.ok) {
          setError(data.error || 'Invalid unsubscribe link.')
          setLoading(false)
          return
        }
        setEmail(data.email || '')
        setName(data.name || '')
        setAlready(Boolean(data.unsubscribed))
        setDone(Boolean(data.unsubscribed))
        setLoading(false)
      } catch {
        if (!cancelled) {
          setError('Could not verify this link. Please try again later.')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const confirm = useCallback(async () => {
    if (!token || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/mailings/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error || 'Unsubscribe failed.')
        setSubmitting(false)
        return
      }
      setDone(true)
      setAlready(true)
    } catch {
      setError('Unsubscribe failed. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }, [token, submitting])

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16">
      <p className="text-xs font-bold uppercase tracking-widest text-brand">
        XLS Experts
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
        Email preferences
      </h1>

      {loading && (
        <p className="mt-6 text-sm text-ink-muted">Checking your link…</p>
      )}

      {!loading && error && (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-ink-muted">
            {done || already
              ? `${email || 'This address'} has been unsubscribed from XLS Experts marketing emails.`
              : `Unsubscribe ${name ? `${name} (${email})` : email} from future marketing emails?`}
          </p>
          {!done && !already && (
            <button
              type="button"
              onClick={confirm}
              disabled={submitting}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {submitting ? 'Unsubscribing…' : 'Confirm unsubscribe'}
            </button>
          )}
        </div>
      )}
    </main>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-4 py-16 text-sm text-ink-muted">
          Loading…
        </main>
      }
    >
      <UnsubscribeInner />
    </Suspense>
  )
}
