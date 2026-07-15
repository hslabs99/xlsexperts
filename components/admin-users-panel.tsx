'use client'

import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  createUser,
  deleteUser,
  ensureDefaultAdminUser,
  fetchAllUsers,
  updateUser,
} from '@/lib/admin-users-db'
import {
  ADMIN_USER_ROLES,
  DEFAULT_ADMIN_EMAIL,
  type AdminUser,
  type AdminUserRole,
} from '@/lib/admin-users'

type AdminUsersPanelProps = {
  currentUserId: string
}

type UserFormState = {
  name: string
  email: string
  password: string
  role: AdminUserRole
  active: boolean
}

function emptyForm(): UserFormState {
  return {
    name: '',
    email: '',
    password: '',
    role: 'marketing',
    active: true,
  }
}

function formFromUser(user: AdminUser): UserFormState {
  return {
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
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

  const isEditing = editingId !== null

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await ensureDefaultAdminUser()
      setUsers(await fetchAllUsers())
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      if (!form.name.trim()) throw new Error('Name is required.')
      if (!form.email.trim()) throw new Error('Email is required.')
      if (!form.password.trim()) throw new Error('Password is required.')

      if (isEditing && editingId) {
        if (editingId === currentUserId && form.role !== 'admin') {
          throw new Error('You cannot demote the account you are signed in as.')
        }
        if (editingId === currentUserId && !form.active) {
          throw new Error('You cannot deactivate the account you are signed in as.')
        }
        await updateUser(editingId, {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          active: form.active,
        })
        setMessage(`Updated ${form.email.trim().toLowerCase()}.`)
        setEditingId(null)
        setForm(emptyForm())
      } else {
        await createUser({
          email: form.email,
          password: form.password,
          name: form.name,
          role: form.role,
          active: form.active,
        })
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

  async function handleDelete(user: AdminUser) {
    if (user.id === currentUserId) {
      window.alert('You cannot delete the account you are signed in as.')
      return
    }
    if (user.email === DEFAULT_ADMIN_EMAIL) {
      window.alert('The seeded admin account cannot be deleted.')
      return
    }
    if (!window.confirm(`Delete user ${user.email}?`)) return
    setBusy(true)
    setError(null)
    try {
      await deleteUser(user.id)
      setMessage(`Deleted ${user.email}.`)
      if (editingId === user.id) {
        setEditingId(null)
        setForm(emptyForm())
      }
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
              <code className="text-xs">users</code>. Roles:{' '}
              <strong>admin</strong> (full panel) and <strong>marketing</strong>{' '}
              (Inquiries + Blog + Marketing).
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
          className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
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
              required
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              className="rounded-md border border-border px-3 py-2 font-mono text-sm"
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Role</span>
            <select
              value={form.role}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  role: e.target.value as AdminUserRole,
                }))
              }
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
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Password</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isCurrent = user.id === currentUserId
                  const isRowEditing = editingId === user.id
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
                      <td className="py-2.5 pr-3 font-mono text-xs text-ink-muted">
                        {user.password}
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
                            onClick={() => void handleDelete(user)}
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
    </div>
  )
}
