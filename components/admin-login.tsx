'use client'

import { useState } from 'react'
import { writeAdminSession } from '@/lib/admin-session'
import type { AdminSession } from '@/lib/admin-users'

type AdminLoginProps = {
  onLoggedIn: (session: AdminSession) => void
}

type FirebaseDebugReport = {
  ok?: boolean
  checkedAt?: string
  summary?: {
    firebaseKeysLocated?: boolean
    firebaseApiKeyLocated?: boolean
    datastoreAccessLocated?: boolean
    accessVia?: string
    projectId?: string | null
    note?: string
    rule?: string
  }
  env?: {
    projectId?: string | null
    firebaseKeys?: { name: string; set: boolean; length: number }[]
    appHostingHints?: { name: string; set: boolean; length: number }[]
  }
  adminInit?: { ok: boolean; error?: string }
  access?: {
    located: boolean
    via: string
    error?: string
    elapsedMs?: number
    users?: number
    blogPosts?: number
    bookingSlots?: number
  }
  restProbe?: {
    attempted: boolean
    ok: boolean
    status?: number
    error?: string
  }
  error?: string
}

export function AdminLogin({ onLoggedIn }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugBusy, setDebugBusy] = useState(false)
  const [debug, setDebug] = useState<FirebaseDebugReport | null>(null)

  async function runFirebaseDebug() {
    setDebugBusy(true)
    setDebug(null)
    try {
      const res = await fetch('/api/admin/firebase-debug', {
        cache: 'no-store',
      })
      const data = (await res.json()) as FirebaseDebugReport
      setDebug(data)
    } catch (err) {
      setDebug({
        ok: false,
        error: err instanceof Error ? err.message : 'Debug request failed',
      })
    } finally {
      setDebugBusy(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const controller = new AbortController()
    const abortTimer = window.setTimeout(() => controller.abort(), 15_000)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ email, password }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        session?: AdminSession
        error?: string
      }
      if (!res.ok || !data.ok || !data.session) {
        setError(data.error || 'Invalid email or password.')
        return
      }
      writeAdminSession(data.session)
      onLoggedIn(data.session)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Sign-in timed out. Please try again.')
      } else {
        setError(err instanceof Error ? err.message : 'Login failed')
      }
    } finally {
      window.clearTimeout(abortTimer)
      setBusy(false)
    }
  }

  const keysOk = Boolean(debug?.summary?.firebaseKeysLocated)
  const accessOk = Boolean(debug?.summary?.datastoreAccessLocated)

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-raised px-4 py-10">
      <div className="flex w-full max-w-lg flex-col gap-4">
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="w-full rounded-lg border border-border bg-surface p-8 shadow-sm"
        >
          <p className="text-sm font-medium text-brand">Admin</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Access is role-based. Marketing users can open Inquiries and Blog.
            Admins can open everything.
          </p>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <label className="mt-6 flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Email</span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border px-3 py-2"
            />
          </label>

          <label className="mt-4 flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border px-3 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Firebase connection debug
              </h2>
              <p className="mt-1 text-xs text-ink-muted">
                First locates your Firebase keys in App Hosting Environment,
                then confirms datastore access. Without the key there is no
                access. Secret values are never shown.
              </p>
            </div>
            <button
              type="button"
              disabled={debugBusy}
              onClick={() => void runFirebaseDebug()}
              className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              {debugBusy ? 'Checking…' : 'Run Firebase check'}
            </button>
          </div>

          {debug && (
            <div className="mt-4 space-y-3 text-xs">
              <div className="grid gap-2">
                <p
                  className={`rounded-md border px-3 py-2 font-medium ${
                    keysOk
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  {keysOk
                    ? 'Firebase keys located in environment'
                    : 'Firebase keys NOT located — without the key you cannot access the datastore'}
                </p>
                <p
                  className={`rounded-md border px-3 py-2 font-medium ${
                    accessOk
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  {accessOk
                    ? `Datastore access located${
                        debug.access?.elapsedMs != null
                          ? ` (${debug.access.elapsedMs}ms)`
                          : ''
                      } via ${debug.summary?.accessVia || 'firebase-admin'}`
                    : debug.error ||
                      debug.access?.error ||
                      debug.adminInit?.error ||
                      'Datastore access NOT located'}
                </p>
              </div>

              {debug.summary && (
                <ul className="space-y-1 text-ink-muted">
                  <li>
                    API key present:{' '}
                    <strong>
                      {debug.summary.firebaseApiKeyLocated ? 'yes' : 'no'}
                    </strong>
                  </li>
                  <li>
                    Full NEXT_PUBLIC_FIREBASE_* set:{' '}
                    <strong>
                      {debug.summary.firebaseKeysLocated ? 'yes' : 'no'}
                    </strong>
                  </li>
                  <li>
                    Project id: {debug.summary.projectId || '(none)'}
                  </li>
                  {debug.summary.rule ? (
                    <li className="font-medium text-ink">{debug.summary.rule}</li>
                  ) : null}
                  {debug.summary.note ? <li>{debug.summary.note}</li> : null}
                </ul>
              )}

              {accessOk && debug.access && (
                <p className="text-ink-muted">
                  Sample reads (max 5 each): users={debug.access.users ?? 0},
                  blogs={debug.access.blogPosts ?? 0}, booking slots=
                  {debug.access.bookingSlots ?? 0}
                </p>
              )}

              {debug.restProbe?.attempted && (
                <p className="text-ink-muted">
                  API-key REST probe:{' '}
                  <strong>
                    {debug.restProbe.ok
                      ? `reached Firestore (HTTP ${debug.restProbe.status ?? '—'})`
                      : debug.restProbe.error || 'failed'}
                  </strong>
                </p>
              )}

              {debug.env?.firebaseKeys && (
                <details className="rounded-md border border-border bg-white p-3">
                  <summary className="cursor-pointer font-semibold text-ink">
                    Key flags (set / not set — values hidden)
                  </summary>
                  <ul className="mt-2 space-y-1 text-ink-muted">
                    {[
                      ...(debug.env.firebaseKeys ?? []),
                      ...(debug.env.appHostingHints ?? []),
                    ].map((row) => (
                      <li key={row.name}>
                        {row.name}:{' '}
                        <strong>
                          {row.set ? `located (${row.length} chars)` : 'missing'}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
