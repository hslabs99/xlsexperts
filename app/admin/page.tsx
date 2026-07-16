'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Plus, Trash2, X } from 'lucide-react'
import {
  SEED_TIME_OPTIONS,
  formatDateKey,
  formatDisplayDate,
  groupSlotsByDate,
  parseTimeToMinutes,
  type BookingSlot,
  type BookingSlotStatus,
} from '@/lib/booking-slots'
import { AdminEmailPanel } from '@/components/admin-email-panel'
import { AdminEnquiriesPanel } from '@/components/admin-enquiries-panel'
import { AdminConfirmationContentPanel } from '@/components/admin-confirmation-content-panel'
import { AdminLogin } from '@/components/admin-login'
import { AdminUsersPanel } from '@/components/admin-users-panel'
import { AdminBlogPanel } from '@/components/admin-blog-panel'
import { AdminCaseStudiesPanel } from '@/components/admin-case-studies-panel'
import { AdminSeedingPanel } from '@/components/admin-seeding-panel'
import { AdminBookingCalendar } from '@/components/admin-booking-calendar'
import { AdminSiteTagsPanel } from '@/components/admin-site-tags-panel'
import { AdminCrawlDocsPanel } from '@/components/admin-crawl-docs-panel'
import {
  clearAdminSession,
  getEffectiveRole,
  readAdminSession,
  readAdminViewMode,
  roleCanAccessTab,
  writeAdminViewMode,
  type AdminViewMode,
} from '@/lib/admin-session'
import type { AdminSession } from '@/lib/admin-users'

type AdminTab =
  | 'bookings'
  | 'enquiries'
  | 'blog'
  | 'case-studies'
  | 'marketing'
  | 'email'
  | 'seeding'
  | 'settings'

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'bookings', label: 'Bookings' },
  { id: 'enquiries', label: 'Inquiries' },
  { id: 'blog', label: 'Blog' },
  { id: 'case-studies', label: 'Case Studies' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'email', label: 'Email' },
  { id: 'seeding', label: 'Seeding' },
  { id: 'settings', label: 'Settings' },
]

function formatBookedAt(value: BookingSlot['booking']): string {
  const bookedAt = value?.bookedAt as unknown
  if (!bookedAt) return '—'
  if (typeof bookedAt === 'string') {
    const t = Date.parse(bookedAt)
    return Number.isFinite(t) ? new Date(t).toLocaleString('en-NZ') : '—'
  }
  if (typeof bookedAt === 'object' && bookedAt !== null && 'toDate' in bookedAt) {
    try {
      return (bookedAt as { toDate: () => Date }).toDate().toLocaleString('en-NZ')
    } catch {
      return '—'
    }
  }
  return '—'
}

function statusLabel(status: BookingSlotStatus): string {
  if (status === 'available') return 'Available on public booking form'
  if (status === 'unavailable') return 'Unavailable — hidden from booking form'
  return 'Booked'
}

function StatusBadge({
  status,
  disabled,
  onClick,
}: {
  status: BookingSlotStatus
  disabled?: boolean
  onClick: () => void
}) {
  const title =
    status === 'available'
      ? 'Available — click to mark unavailable'
      : status === 'unavailable'
        ? 'Unavailable — click to mark available'
        : 'Booked — click to reopen (clears booking details)'

  if (status === 'booked') {
    return (
      <button
        type="button"
        title={title}
        onClick={onClick}
        disabled={disabled}
        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-800 transition hover:bg-sky-200 disabled:opacity-60"
        aria-label="Booked"
      >
        <span className="text-base font-black leading-none">B</span>
      </button>
    )
  }

  if (status === 'unavailable') {
    return (
      <button
        type="button"
        title={title}
        onClick={onClick}
        disabled={disabled}
        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-200 text-stone-700 transition hover:bg-stone-300 disabled:opacity-60"
        aria-label="Unavailable"
      >
        <X className="h-4 w-4" strokeWidth={2.5} />
      </button>
    )
  }

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition hover:bg-emerald-200 disabled:opacity-60"
      aria-label="Available"
    >
      <Check className="h-4 w-4" strokeWidth={2.5} />
    </button>
  )
}

export default function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [viewMode, setViewMode] = useState<AdminViewMode>('admin')
  const [tab, setTab] = useState<AdminTab>('enquiries')

  const [slots, setSlots] = useState<BookingSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [newDate, setNewDate] = useState(() => formatDateKey(new Date()))
  const [newTime, setNewTime] = useState('9:00 AM')
  const [newType, setNewType] = useState('discovery')

  useEffect(() => {
    const existing = readAdminSession()
    setSession(existing)
    setViewMode(readAdminViewMode())
    setAuthReady(true)
  }, [])

  const effectiveRole = useMemo(() => {
    if (!session) return null
    return getEffectiveRole(session, viewMode)
  }, [session, viewMode])

  const visibleTabs = useMemo(() => {
    if (!effectiveRole) return []
    return TABS.filter((item) => roleCanAccessTab(effectiveRole, item.id))
  }, [effectiveRole])

  useEffect(() => {
    if (!session || visibleTabs.length === 0) return
    if (!visibleTabs.some((t) => t.id === tab)) {
      setTab(visibleTabs[0].id)
    }
  }, [session, visibleTabs, tab])

  function handleViewModeChange(mode: AdminViewMode) {
    setViewMode(mode)
    writeAdminViewMode(mode)
  }

  const loadSlots = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/booking-slots')
      const data = (await res.json()) as {
        ok?: boolean
        items?: BookingSlot[]
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load slots')
      }
      setSlots(data.items ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load slots')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session || !effectiveRole || !roleCanAccessTab(effectiveRole, 'bookings'))
      return
    loadSlots()
  }, [loadSlots, session, effectiveRole])

  const grouped = useMemo(() => groupSlotsByDate(slots), [slots])
  const dates = useMemo(() => Object.keys(grouped).sort(), [grouped])
  const bookedCount = useMemo(
    () => slots.filter((s) => s.status === 'booked').length,
    [slots]
  )
  const upcomingBookings = useMemo(() => {
    const todayKey = formatDateKey(new Date())
    return slots
      .filter((s) => s.status === 'booked' && s.date >= todayKey)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
      })
      .slice(0, 3)
  }, [slots])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/admin/booking-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          slot: {
            date: newDate,
            time: newTime,
            type: newType.trim() || 'discovery',
            status: 'available',
            durationMinutes: 30,
          },
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not add slot')
      setMessage(`Added ${newDate} ${newTime}`)
      await loadSlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add slot')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(id: string) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/booking-slots?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not remove slot')
      setSlots((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove slot')
    } finally {
      setBusy(false)
    }
  }

  async function markAvailable(slot: BookingSlot) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/booking-slots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: slot.id, action: 'reopen' }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not update slot')
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slot.id ? { ...s, status: 'available', booking: null } : s
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update slot')
    } finally {
      setBusy(false)
    }
  }

  async function markUnavailable(slot: BookingSlot) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/booking-slots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: slot.id, action: 'unavailable' }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not update slot')
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slot.id ? { ...s, status: 'unavailable', booking: null } : s
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update slot')
    } finally {
      setBusy(false)
    }
  }

  async function handleStatusClick(slot: BookingSlot) {
    if (slot.status === 'available') {
      await markUnavailable(slot)
      return
    }
    if (slot.status === 'unavailable') {
      await markAvailable(slot)
      return
    }
    await markAvailable(slot)
  }

  function handleSignOut() {
    clearAdminSession()
    setSession(null)
  }

  if (!authReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-raised text-sm text-ink-muted">
        Loading…
      </main>
    )
  }

  if (!session) {
    return <AdminLogin onLoggedIn={setSession} />
  }

  return (
    <main className="min-h-screen bg-surface-raised px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand">Admin</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
              Control panel
            </h1>
            <p className="mt-3 text-ink-muted">
              Signed in as <strong>{session.name || session.email}</strong> (
              <span className="capitalize">{session.role}</span>
              {session.role === 'admin' && viewMode === 'marketing'
                ? ' · viewing as marketing'
                : ''}
              )
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {session.role === 'admin' ? (
              <label className="flex items-center gap-2 text-sm text-ink">
                <span className="font-medium text-ink-muted">View as</span>
                <select
                  value={viewMode}
                  onChange={(e) =>
                    handleViewModeChange(e.target.value as AdminViewMode)
                  }
                  className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink"
                  aria-label="Admin view mode"
                >
                  <option value="admin">Admin</option>
                  <option value="marketing">Marketing</option>
                </select>
              </label>
            ) : null}
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
            >
              Sign out
            </button>
          </div>
        </div>

        <div
          className="mt-8 flex flex-wrap gap-1 border-b border-border"
          role="tablist"
          aria-label="Admin sections"
        >
          {visibleTabs.map((item) => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'border-brand text-brand'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                {item.label}
                {item.id === 'bookings' && bookedCount > 0 ? (
                  <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                    {bookedCount}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        {tab === 'bookings' &&
          effectiveRole &&
          roleCanAccessTab(effectiveRole, 'bookings') && (
          <div className="mt-8 space-y-6" role="tabpanel">
            <div className="rounded-lg border border-border bg-surface p-5">
              <h2 className="text-lg font-semibold text-ink">Next 3 upcoming bookings</h2>
              {loading ? (
                <p className="mt-3 text-sm text-ink-muted">Loading…</p>
              ) : upcomingBookings.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">No upcoming bookings yet.</p>
              ) : (
                <ol className="mt-4 space-y-3">
                  {upcomingBookings.map((slot, index) => (
                    <li
                      key={slot.id}
                      className="flex items-start gap-3 rounded-md border border-sky-200 bg-sky-50/70 px-4 py-3"
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-800">
                        <span className="text-base font-black leading-none">B</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">
                          {index + 1}. {formatDisplayDate(slot.date)} · {slot.time}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted">{slot.date}</p>
                        <p className="mt-1 text-sm text-ink">
                          {slot.booking?.name || 'Name not recorded'}
                          {slot.booking?.company ? ` · ${slot.booking.company}` : ''}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {[slot.booking?.method, slot.booking?.email, slot.booking?.phone]
                            .filter(Boolean)
                            .join(' · ') || 'No contact details'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <AdminBookingCalendar
              slots={slots}
              loading={loading}
              busy={busy}
              onRemove={handleRemove}
              onMarkOccupied={markUnavailable}
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadSlots}
                disabled={busy || loading}
                className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-raised disabled:opacity-60"
              >
                Refresh
              </button>
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

            <form
              onSubmit={handleAdd}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <h2 className="text-lg font-semibold text-ink">Add slot</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">Date</span>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="rounded-md border border-border px-3 py-2"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">Time</span>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="rounded-md border border-border px-3 py-2"
                  >
                    {SEED_TIME_OPTIONS.map((t) => (
                      <option key={t.time} value={t.time}>
                        {t.time}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">Type</span>
                  <input
                    type="text"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="rounded-md border border-border px-3 py-2"
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>
            </form>

            <div className="rounded-lg border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">
                  Booking slots ({slots.length})
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    Available
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-stone-700">
                      <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    Unavailable
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-base font-black leading-none text-sky-800">
                      B
                    </span>
                    Booked
                  </span>
                </div>
              </div>

              {loading ? (
                <p className="mt-4 text-sm text-ink-muted">Loading…</p>
              ) : dates.length === 0 ? (
                <p className="mt-4 text-sm text-ink-muted">
                  No slots yet. Use Add slot below, or open the Seeding tab
                  (admin only) to import from a template.
                </p>
              ) : (
                <div className="mt-6 space-y-6">
                  {dates.map((date) => (
                    <div key={date}>
                      <h3 className="text-sm font-semibold text-ink">
                        {formatDisplayDate(date)}
                        <span className="ml-2 font-normal text-ink-muted">{date}</span>
                      </h3>
                      <ul className="mt-2 space-y-3">
                        {grouped[date].map((slot) => {
                          const booking = slot.booking
                          const rowTone =
                            slot.status === 'booked'
                              ? 'border-sky-200 bg-sky-50/50'
                              : slot.status === 'unavailable'
                                ? 'border-stone-200 bg-stone-50'
                                : 'border-border bg-surface'
                          return (
                            <li
                              key={slot.id}
                              className={`rounded-md border px-4 py-3 ${rowTone}`}
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <StatusBadge
                                    status={slot.status}
                                    disabled={busy}
                                    onClick={() => handleStatusClick(slot)}
                                  />
                                  <div>
                                    <p className="text-sm font-semibold text-ink">
                                      {slot.time}
                                      <span className="ml-2 font-normal text-ink-muted">
                                        {slot.durationMinutes} min · {slot.type}
                                      </span>
                                    </p>
                                    <p className="text-xs text-ink-muted">
                                      {statusLabel(slot.status)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemove(slot.id)}
                                  disabled={busy}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Remove
                                </button>
                              </div>

                              {slot.status === 'booked' && (
                                <div className="mt-3 rounded-md border border-sky-200 bg-white p-3 text-sm text-ink">
                                  <p className="text-xs font-bold uppercase tracking-widest text-sky-800">
                                    Booking details
                                  </p>
                                  {booking ? (
                                    <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                                      <div>
                                        <dt className="text-xs text-ink-muted">Name</dt>
                                        <dd className="font-medium">{booking.name || '—'}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs text-ink-muted">Company</dt>
                                        <dd className="font-medium">{booking.company || '—'}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs text-ink-muted">Email</dt>
                                        <dd className="font-medium">{booking.email || '—'}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs text-ink-muted">Phone</dt>
                                        <dd className="font-medium">{booking.phone || '—'}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs text-ink-muted">Method</dt>
                                        <dd className="font-medium">{booking.method || '—'}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs text-ink-muted">How they heard</dt>
                                        <dd className="font-medium">{booking.hear || '—'}</dd>
                                      </div>
                                      <div className="sm:col-span-2">
                                        <dt className="text-xs text-ink-muted">Services</dt>
                                        <dd className="font-medium">
                                          {booking.services.length
                                            ? booking.services.join(', ')
                                            : '—'}
                                        </dd>
                                      </div>
                                      <div className="sm:col-span-2">
                                        <dt className="text-xs text-ink-muted">Message</dt>
                                        <dd className="whitespace-pre-wrap font-medium">
                                          {booking.message || '—'}
                                        </dd>
                                      </div>
                                      <div className="sm:col-span-2">
                                        <dt className="text-xs text-ink-muted">Booked at</dt>
                                        <dd className="font-medium">{formatBookedAt(booking)}</dd>
                                      </div>
                                    </dl>
                                  ) : (
                                    <p className="mt-2 text-ink-muted">
                                      Marked booked with no customer details yet.
                                    </p>
                                  )}
                                </div>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'enquiries' &&
          effectiveRole &&
          roleCanAccessTab(effectiveRole, 'enquiries') && (
          <div className="mt-8" role="tabpanel">
            <AdminEnquiriesPanel />
          </div>
        )}

        {tab === 'blog' &&
          effectiveRole &&
          roleCanAccessTab(effectiveRole, 'blog') && (
          <div className="mt-8" role="tabpanel">
            <AdminBlogPanel />
          </div>
        )}

        {tab === 'case-studies' &&
          effectiveRole &&
          roleCanAccessTab(effectiveRole, 'case-studies') && (
          <div className="mt-8" role="tabpanel">
            <AdminCaseStudiesPanel />
          </div>
        )}

        {tab === 'marketing' &&
          effectiveRole &&
          roleCanAccessTab(effectiveRole, 'marketing') && (
          <div className="mt-8 space-y-6" role="tabpanel">
            <AdminSiteTagsPanel />
            <AdminCrawlDocsPanel />
          </div>
        )}

        {tab === 'email' &&
          effectiveRole &&
          roleCanAccessTab(effectiveRole, 'email') && (
          <div className="mt-8" role="tabpanel">
            <AdminEmailPanel />
          </div>
        )}

        {tab === 'seeding' &&
          effectiveRole &&
          roleCanAccessTab(effectiveRole, 'seeding') && (
          <div className="mt-8" role="tabpanel">
            <AdminSeedingPanel />
          </div>
        )}

        {tab === 'settings' &&
          effectiveRole &&
          roleCanAccessTab(effectiveRole, 'settings') && (
          <div className="mt-8 space-y-6" role="tabpanel">
            <AdminUsersPanel currentUserId={session.userId} />
            <AdminConfirmationContentPanel />
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold text-ink">
                Firebase storage
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                All operational data for this app is stored in the live Firebase
                project configured by{' '}
                <code className="text-xs">
                  NEXT_PUBLIC_FIREBASE_PROJECT_ID
                </code>
                . Email templates live in{' '}
                <code className="text-xs">Email Templates</code>, enquiries
                in <code className="text-xs">enquiries</code>, users in{' '}
                <code className="text-xs">users</code>, blog posts in{' '}
                <code className="text-xs">blogPosts</code> (images in Firebase
                Storage), booking slots in{' '}
                <code className="text-xs">Booking Slots</code>, and site
                content (confirmation, analytics tags, SEO crawl documents) in{' '}
                <code className="text-xs">Site Content</code>. Nothing is
                persisted in a local database while developing.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
