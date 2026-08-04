'use client'

import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  ADMIN_TABS,
  ADMIN_USER_ROLES,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_NON_ADMIN_TABS,
  type AdminTabId,
  type AdminUser,
  type AdminUserRole,
} from '@/lib/admin-users'
import { AdminDialog } from '@/components/admin-dialog'

type AdminUsersPanelProps = {
  currentUserId: string
}

type UserFormState = {
  name: string
  email: string
  password: string
  role: AdminUserRole
  allowedTabs: AdminTabId[]
  active: boolean
}

function emptyForm(): UserFormState {
  return {
    name: '',
    email: '',
    password: '',
    role: 'marketing',
    allowedTabs: [...DEFAULT_NON_ADMIN_TABS],
    active: true,
  }
}

function formFromUser(user: AdminUser): UserFormState {
  return {
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
    allowedTabs:
      user.role === 'admin'
        ? [...DEFAULT_NON_ADMIN_TABS]
        : user.allowedTabs?.length
          ? [...user.allowedTabs]
          : [...DEFAULT_NON_ADMIN_TABS],
    active: user.active,
  }
}

export function AdminUsersPanel({ currentUserId }: AdminUsersPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [form, setForm] = useState<UserFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  const isEditing = editingId !== null

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/users')
      const data = (await res.json()) as {
        ok?: boolean
        items?: AdminUser[]
        error?: string
      }
      if (!res.ok || !data.ok || !data.items) {
        throw new Error(data.error || 'Failed to load users')
      }
      setUsers(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setMessage(null)
    setError(null)
  }

  function startEdit(user: AdminUser) {
    setEditingId(user.id)
    setForm(formFromUser(user))
    setMessage(null)
    setError(null)
  }

  function toggleTab(tabId: AdminTabId) {
    setForm((prev) => {
      const has = prev.allowedTabs.includes(tabId)
      return {
        ...prev,
        allowedTabs: has
          ? prev.allowedTabs.filter((id) => id !== tabId)
          : [...prev.allowedTabs, tabId],
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      if (!form.name.trim()) throw new Error('Name is required.')
      if (!form.email.trim()) throw new Error('Email is required.')
      if (!isEditing || form.password.trim()) {
        if (!form.password.trim()) throw new Error('Password is required.')
      }
      if (form.role !== 'admin' && form.allowedTabs.length === 0) {
        throw new Error('Select at least one tab for non-admin users.')
      }

      if (isEditing && editingId) {
        if (editingId === currentUserId && form.role !== 'admin') {
          throw new Error('You cannot demote the account you are signed in as.')
        }
        if (editingId === currentUserId && !form.active) {
          throw new Error('You cannot deactivate the account you are signed in as.')
        }
        const payload: Record<string, unknown> = {
          id: editingId,
          name: form.name,
          email: form.email,
          role: form.role,
          active: form.active,
          allowedTabs:
            form.role === 'admin' ? [] : form.allowedTabs,
        }
        if (form.password.trim()) {
          payload.password = form.password
        }
        const res = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = (await res.json()) as { ok?: boolean; error?: string }
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Could not update user')
        }
        setMessage(`Updated ${form.email.trim().toLowerCase()}.`)
        setEditingId(null)
        setForm(emptyForm())
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            name: form.name,
            role: form.role,
            allowedTabs:
              form.role === 'admin' ? [] : form.allowedTabs,
            active: form.active,
          }),
        })
        const data = (await res.json()) as { ok?: boolean; error?: string }
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Could not create user')
        }
        setMessage(
          `Created ${form.role} user ${form.email.trim().toLowerCase()}.`
        )
        setForm(emptyForm())
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save user')
    } finally {
      setBusy(false)
    }
  }

  function requestDelete(user: AdminUser) {
    if (user.id === currentUserId) {
      setAlertMessage('You cannot delete the account you are signed in as.')
      return
    }
    if (user.email === DEFAULT_ADMIN_EMAIL) {
      setAlertMessage('The seeded admin account cannot be deleted.')
      return
    }
    setDeleteTarget(user)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const user = deleteTarget
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/users?id=${encodeURIComponent(user.id)}`,
        { method: 'DELETE' }
      )
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not delete user')
      }
      setMessage(`Deleted ${user.email}.`)
      if (editingId === user.id) {
        setEditingId(null)
        setForm(emptyForm())
      }
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete user')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {isEditing ? 'Edit user' : 'Users'}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Plain-text passwords in Firebase collection{' '}
              <code className="text-xs">users</code>.{' '}
              <strong>Admin</strong> always sees every tab.{' '}
              <strong>Marketing</strong> (and any non-admin) only see the tabs
              you tick below — including CMS (Site + Pages sub-tabs) without a
              code change.
            </p>
          </div>
          {isEditing ? (
            <button
              type="button"
              disabled={busy}
              onClick={startCreate}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Cancel edit
            </button>
          ) : null}
        </div>

        {(message || error) && (
          <div
            className={`mt-4 rounded-md border p-3 text-sm ${
              error
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-brand/30 bg-brand-light text-brand-dark'
            }`}
          >
            {error || message}
          </div>
        )}

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-5 space-y-5"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Name</span>
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="rounded-md border border-border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Password</span>
              <input
                type="text"
                required={!isEditing}
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className="rounded-md border border-border px-3 py-2 font-mono text-sm"
                autoComplete="off"
                placeholder={isEditing ? 'Leave blank to keep current' : undefined}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Role</span>
              <select
                value={form.role}
                onChange={(e) => {
                  const role = e.target.value as AdminUserRole
                  setForm((prev) => ({
                    ...prev,
                    role,
                    allowedTabs:
                      role === 'marketing' && prev.allowedTabs.length === 0
                        ? [...DEFAULT_NON_ADMIN_TABS]
                        : prev.allowedTabs,
                  }))
                }}
                className="rounded-md border border-border px-3 py-2 capitalize"
              >
                {ADMIN_USER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">Status</span>
              <select
                value={form.active ? 'active' : 'inactive'}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    active: e.target.value === 'active',
                  }))
                }
                className="rounded-md border border-border px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {isEditing ? (
                  <>
                    <Pencil className="h-4 w-4" />
                    {busy ? 'Saving…' : 'Save changes'}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {busy ? 'Adding…' : 'Add user'}
                  </>
                )}
              </button>
            </div>
          </div>

          {form.role !== 'admin' ? (
            <fieldset className="rounded-md border border-border bg-white p-4">
              <legend className="px-1 text-sm font-semibold text-ink">
                Tab access
              </legend>
              <p className="mb-3 text-xs text-ink-muted">
                Tick every admin tab this user may open. Defaults include CMS
                and the usual marketing tabs; adjust per person as needed.
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ADMIN_TABS.map((tab) => {
                  const checked = form.allowedTabs.includes(tab.id)
                  return (
                    <label
                      key={tab.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm text-ink hover:bg-surface-raised"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTab(tab.id)}
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="font-medium">{tab.label}</span>
                    </label>
                  )
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border border-border px-2 py-1 text-xs font-semibold text-ink hover:bg-surface-raised"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      allowedTabs: ADMIN_TABS.map((t) => t.id),
                    }))
                  }
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="rounded border border-border px-2 py-1 text-xs font-semibold text-ink hover:bg-surface-raised"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      allowedTabs: [...DEFAULT_NON_ADMIN_TABS],
                    }))
                  }
                >
                  Marketing defaults
                </button>
                <button
                  type="button"
                  className="rounded border border-border px-2 py-1 text-xs font-semibold text-ink hover:bg-surface-raised"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, allowedTabs: [] }))
                  }
                >
                  Clear
                </button>
              </div>
            </fieldset>
          ) : (
            <p className="rounded-md border border-border bg-white px-4 py-3 text-sm text-ink-muted">
              Admins always have access to every tab. Switch the role to
              marketing to customise individual tab grants.
            </p>
          )}
        </form>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold text-ink">
          Accounts ({users.length})
        </h3>
        {loading ? (
          <p className="mt-3 text-sm text-ink-muted">Loading…</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Tabs</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isCurrent = user.id === currentUserId
                  const isRowEditing = editingId === user.id
                  const tabSummary =
                    user.role === 'admin'
                      ? 'All'
                      : user.allowedTabs?.length
                        ? `${user.allowedTabs.length} of ${ADMIN_TABS.length}`
                        : 'Default marketing set'
                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-border/70 ${
                        isRowEditing ? 'bg-brand-light/40' : ''
                      }`}
                    >
                      <td className="py-2.5 pr-3 font-medium">
                        {user.name}
                        {isCurrent ? (
                          <span className="ml-2 text-xs font-normal text-ink-muted">
                            (you)
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-xs">
                        {user.email}
                      </td>
                      <td className="py-2.5 pr-3 capitalize">{user.role}</td>
                      <td className="py-2.5 pr-3 text-xs text-ink-muted">
                        {tabSummary}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={
                            user.active
                              ? 'text-emerald-700'
                              : 'text-stone-500'
                          }
                        >
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => startEdit(user)}
                            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={busy || isCurrent}
                            onClick={() => requestDelete(user)}
                            className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminDialog
        open={alertMessage != null}
        title="Cannot delete user"
        mode="alert"
        onClose={() => setAlertMessage(null)}
      >
        <p>{alertMessage}</p>
      </AdminDialog>

      <AdminDialog
        open={deleteTarget != null}
        title="Delete user?"
        mode="confirm"
        tone="danger"
        confirmLabel="Delete user"
        busy={busy}
        onClose={() => {
          if (!busy) setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
      >
        <p>
          Delete user <strong>{deleteTarget?.email}</strong>? This cannot be
          undone.
        </p>
      </AdminDialog>
    </div>
  )
}
