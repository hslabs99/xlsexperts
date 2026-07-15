'use client'

import { useState } from 'react'
import { authenticateUser, ensureDefaultAdminUser } from '@/lib/admin-users-db'
import { writeAdminSession } from '@/lib/admin-session'
import type { AdminSession } from '@/lib/admin-users'
import {
  DEFAULT_ADMIN_EMAIL,
} from '@/lib/admin-users'

type AdminLoginProps = {
  onLoggedIn: (session: AdminSession) => void
}

export function AdminLogin({ onLoggedIn }: AdminLoginProps) {
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await ensureDefaultAdminUser()
      const user = await authenticateUser(email, password)
      if (!user) {
        setError('Invalid email or password.')
        return
      }
      const session: AdminSession = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
      writeAdminSession(session)
      onLoggedIn(session)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-raised px-4">
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-sm"
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
    </main>
  )
}
