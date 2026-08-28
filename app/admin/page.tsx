'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Plus, Trash2, X } from 'lucide-react'
import {
  SEED_TIME_OPTIONS,
  applyBookingRegionChange,
  formatDateKey,
  formatDisplayDate,
  hasAnyBookingRegion,
  parseTimeToMinutes,
  type BookingSlot,
  type BookingSlotStatus,
  type SeedTemplateConfig,
} from '@/lib/booking-slots'
import { AdminEmailPanel } from '@/components/admin-email-panel'
import { AdminEnquiriesPanel } from '@/components/admin-enquiries-panel'
import { AdminAnalyticsPanel } from '@/components/admin-analytics-panel'
import { AdminChatPanel } from '@/components/admin-chat-panel'
import { AdminConfirmationContentPanel } from '@/components/admin-confirmation-content-panel'
import { AdminDomainRegionsPanel } from '@/components/admin-domain-regions-panel'
import { AdminLogin } from '@/components/admin-login'
import { AdminUsersPanel } from '@/components/admin-users-panel'
import { AdminBlogPanel } from '@/components/admin-blog-panel'
import { AdminBlogQueuePanel } from '@/components/admin-blog-queue-panel'
import { AdminCaseStudiesPanel } from '@/components/admin-case-studies-panel'
import { AdminServicePageTilesPanel } from '@/components/admin-service-page-tiles-panel'
import { AdminFindOutAboutPanel } from '@/components/admin-find-out-about-panel'
import { AdminSeedingPanel } from '@/components/admin-seeding-panel'
import { AdminLogoHarvestPanel } from '@/components/admin-logo-harvest-panel'
import { AdminBookingCalendar } from '@/components/admin-booking-calendar'
import { AdminBookingSeedPanel } from '@/components/admin-booking-seed-panel'
import { AdminBookingTimezonePanel } from '@/components/admin-booking-timezone-panel'
import { AdminSiteTagsPanel } from '@/components/admin-site-tags-panel'
import { AdminCrawlDocsPanel } from '@/components/admin-crawl-docs-panel'
import { AdminMarketCopyPanel } from '@/components/admin-market-copy-panel'
import { AdminPageSeoPanel } from '@/components/admin-page-seo-panel'
import { AdminHomeServicesPanel } from '@/components/admin-home-services-panel'
import { AdminHeroClientsPanel } from '@/components/admin-hero-clients-panel'
import { AdminHeroProjectsPanel } from '@/components/admin-hero-projects-panel'
import { AdminCmsPublishPanel } from '@/components/admin-cms-publish-panel'
import { AdminMailingsPanel } from '@/components/admin-mailings-panel'
import {
  clearAdminSession,
  canAccessTab,
  readAdminSession,
  readAdminViewMode,
  writeAdminViewMode,
  type AdminViewMode,
} from '@/lib/admin-session'
import {
  ADMIN_TABS,
  type AdminSession,
  type AdminTabId,
} from '@/lib/admin-users'

type AdminTab = AdminTabId

type BookingSubTab = 'bookings' | 'settings'
type BlogSubTab = 'blogs' | 'queue'
type SettingsSubTab = 'users' | 'thank-you'
type CmsSubTab =
  | 'site'
  | 'pages'
  | 'home-services'
  | 'client-logos'
  | 'common-projects'
  | 'logos'
  | 'publish'
type MarketingSubTab = 'tags' | 'crawl' | 'domains'

const TABS = ADMIN_TABS

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
  const [bookingSubTab, setBookingSubTab] = useState<BookingSubTab>('bookings')
  const [blogSubTab, setBlogSubTab] = useState<BlogSubTab>('blogs')
  const [settingsSubTab, setSettingsSubTab] =
    useState<SettingsSubTab>('users')
  const [cmsSubTab, setCmsSubTab] = useState<CmsSubTab>('site')
  const [marketingSubTab, setMarketingSubTab] =
    useState<MarketingSubTab>('tags')

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

  const visibleTabs = useMemo(() => {
    if (!session) return []
    return TABS.filter((item) => canAccessTab(session, item.id, viewMode))
  }, [session, viewMode])

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

  const loadSlots = useCallback(async (opts?: { quiet?: boolean }) => {
    if (!opts?.quiet) setLoading(true)
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
      if (!opts?.quiet) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session || !canAccessTab(session, 'bookings', viewMode)) return
    loadSlots()
  }, [loadSlots, session, viewMode])

  const bookedCount = useMemo(
    () => slots.filter((s) => s.status === 'booked').length,
    [slots]
  )
  const bookedSlots = useMemo(() => {
    return slots
      .filter((s) => s.status === 'booked')
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
      })
  }, [slots])
  const todayKey = useMemo(() => formatDateKey(new Date()), [])
  const upcomingBookings = useMemo(
    () => bookedSlots.filter((s) => s.date >= todayKey),
    [bookedSlots, todayKey]
  )
  const pastBookings = useMemo(
    () => bookedSlots.filter((s) => s.date < todayKey).reverse(),
    [bookedSlots, todayKey]
  )

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
            regions: { nz: true, uk: true, intl: true },
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

  async function setCells(
    cells: { date: string; time: string }[],
    scope: 'all' | 'nz' | 'uk' | 'intl',
    enabled: boolean
  ) {
    if (cells.length === 0) return
    const singleCell = cells.length === 1
    const cellKeys = new Set(cells.map((cell) => `${cell.date}|${cell.time}`))
    if (!singleCell) {
      setBusy(true)
      setMessage(null)
    }
    setError(null)
    setSlots((prev) =>
      prev.map((slot) => {
        if (!cellKeys.has(`${slot.date}|${slot.time}`)) return slot
        if (slot.status === 'booked') return slot
        const regions = applyBookingRegionChange(slot.regions, scope, enabled)
        return {
          ...slot,
          regions,
          status: hasAnyBookingRegion(regions) ? 'available' : 'unavailable',
        }
      })
    )
    try {
      const res = await fetch('/api/admin/booking-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-cells', scope, enabled, cells }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        created?: number
        updated?: number
        skipped?: number
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not update cells')
      }
      const created = data.created ?? 0
      const updated = data.updated ?? 0
      const changed = created + updated
      const regionLabel =
        scope === 'all' ? 'all regions' : scope === 'intl' ? 'INT' : scope.toUpperCase()
      if (!singleCell) {
        if (enabled) {
          setMessage(
            changed === 0
              ? `Nothing to open for ${regionLabel} — those cells are already on or booked.`
              : `Opened ${changed} cell${changed === 1 ? '' : 's'} for ${regionLabel}${
                  created > 0 ? ` (${created} new)` : ''
                }.`
          )
        } else {
          setMessage(
            changed === 0
              ? `Nothing to block for ${regionLabel}.`
              : `Blocked ${changed} cell${changed === 1 ? '' : 's'} for ${regionLabel}.`
          )
        }
      }
      await loadSlots({ quiet: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update cells')
      await loadSlots({ quiet: true })
    } finally {
      if (!singleCell) setBusy(false)
    }
  }

  async function copyWeekToNext(fromMonday: string) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/booking-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'copy-week', fromMonday }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        created?: number
        updated?: number
        skippedBooked?: number
        toMonday?: string
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not copy week')
      }
      const changed = (data.created ?? 0) + (data.updated ?? 0)
      const booked = data.skippedBooked ?? 0
      const nextLabel = data.toMonday
        ? formatDisplayDate(data.toMonday)
        : 'next week'
      setMessage(
        changed === 0 && booked === 0
          ? `Next week already matches this week (${nextLabel}).`
          : `Copied this week onto the week of ${nextLabel}: ${changed} cell${
              changed === 1 ? '' : 's'
            } updated.${
              booked > 0
                ? ` Left ${booked} booked slot${booked === 1 ? '' : 's'} unchanged.`
                : ''
            }`
      )
      await loadSlots({ quiet: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not copy week')
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

  async function seedBookingSlots(config: SeedTemplateConfig) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/booking-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed', config }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        created?: number
        skipped?: number
        planned?: number
        error?: string
      }
      if (!res.ok || !data.ok) throw new Error(data.error || 'Booking seed failed')
      setMessage(
        `Availability seeded: created ${data.created ?? 0}, skipped ${data.skipped ?? 0} existing (${data.planned ?? 0} planned).`
      )
      await loadSlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking seed failed')
    } finally {
      setBusy(false)
    }
  }

  async function normalizeBookingDurations() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/booking-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'normalize-durations' }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        updated?: number
        total?: number
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not normalize slot durations')
      }
      const updated = data.updated ?? 0
      const total = data.total ?? 0
      setMessage(
        updated === 0
          ? `All ${total} booking slot${total === 1 ? '' : 's'} are already 30 minutes.`
          : `Normalized ${updated} of ${total} slot${total === 1 ? '' : 's'} to 30 minutes.`
      )
      await loadSlots()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not normalize slot durations'
      )
    } finally {
      setBusy(false)
    }
  }

  async function clearAllBookingSlots() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/booking-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-all' }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        deleted?: number
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not empty booking slots')
      }
      const deleted = data.deleted ?? 0
      setMessage(
        deleted === 0
          ? 'Booking slots were already empty.'
          : `Deleted ${deleted} booking slot${deleted === 1 ? '' : 's'}.`
      )
      await loadSlots()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not empty booking slots'
      )
    } finally {
      setBusy(false)
    }
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
          session &&
          canAccessTab(session, 'bookings', viewMode) && (
          <div className="mt-8 space-y-6" role="tabpanel">
            <div
              className="flex flex-wrap gap-1 border-b border-border"
              role="tablist"
              aria-label="Bookings sections"
            >
              {(
                [
                  { id: 'bookings' as const, label: 'Bookings' },
                  { id: 'settings' as const, label: 'Booking settings' },
                ] as const
              ).map((item) => {
                const active = bookingSubTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setBookingSubTab(item.id)}
                    className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
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

            {bookingSubTab === 'bookings' ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">
                      Discovery bookings
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      Actual booked calls. Manage availability under Booking
                      settings.
                    </p>
                  </div>
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

                <div className="rounded-lg border border-border bg-surface p-5">
                  <h3 className="text-base font-semibold text-ink">
                    Upcoming ({upcomingBookings.length})
                  </h3>
                  {loading ? (
                    <p className="mt-3 text-sm text-ink-muted">Loading…</p>
                  ) : upcomingBookings.length === 0 ? (
                    <p className="mt-3 text-sm text-ink-muted">
                      No upcoming booked discovery calls.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {upcomingBookings.map((slot) => (
                        <li
                          key={slot.id}
                          className="rounded-md border border-sky-200 bg-sky-50/50 px-4 py-3"
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
                                  {formatDisplayDate(slot.date)} · {slot.time}
                                </p>
                                <p className="text-xs text-ink-muted">
                                  {slot.date}
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
                          <div className="mt-3 rounded-md border border-sky-200 bg-white p-3 text-sm text-ink">
                            {slot.booking ? (
                              <dl className="grid gap-2 sm:grid-cols-2">
                                <div>
                                  <dt className="text-xs text-ink-muted">Name</dt>
                                  <dd className="font-medium">
                                    {slot.booking.name || '—'}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-ink-muted">
                                    Company
                                  </dt>
                                  <dd className="font-medium">
                                    {slot.booking.company || '—'}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-ink-muted">Email</dt>
                                  <dd className="font-medium">
                                    {slot.booking.email || '—'}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-ink-muted">Phone</dt>
                                  <dd className="font-medium">
                                    {slot.booking.phone || '—'}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-ink-muted">
                                    Method
                                  </dt>
                                  <dd className="font-medium">
                                    {slot.booking.method || '—'}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-ink-muted">
                                    How they heard
                                  </dt>
                                  <dd className="font-medium">
                                    {slot.booking.hear || '—'}
                                  </dd>
                                </div>
                                <div className="sm:col-span-2">
                                  <dt className="text-xs text-ink-muted">
                                    Services
                                  </dt>
                                  <dd className="font-medium">
                                    {slot.booking.services.length
                                      ? slot.booking.services.join(', ')
                                      : '—'}
                                  </dd>
                                </div>
                                <div className="sm:col-span-2">
                                  <dt className="text-xs text-ink-muted">
                                    Message
                                  </dt>
                                  <dd className="whitespace-pre-wrap font-medium">
                                    {slot.booking.message || '—'}
                                  </dd>
                                </div>
                                <div className="sm:col-span-2">
                                  <dt className="text-xs text-ink-muted">
                                    Booked at
                                  </dt>
                                  <dd className="font-medium">
                                    {formatBookedAt(slot.booking)}
                                  </dd>
                                </div>
                              </dl>
                            ) : (
                              <p className="text-ink-muted">
                                Marked booked with no customer details yet.
                                Click B to reopen the slot.
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {pastBookings.length > 0 ? (
                  <div className="rounded-lg border border-border bg-surface p-5">
                    <h3 className="text-base font-semibold text-ink">
                      Past ({pastBookings.length})
                    </h3>
                    <ul className="mt-4 space-y-2">
                      {pastBookings.map((slot) => (
                        <li
                          key={slot.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-4 py-3 text-sm"
                        >
                          <div>
                            <p className="font-semibold text-ink">
                              {formatDisplayDate(slot.date)} · {slot.time}
                            </p>
                            <p className="text-ink-muted">
                              {slot.booking?.name || 'Name not recorded'}
                              {slot.booking?.company
                                ? ` · ${slot.booking.company}`
                                : ''}
                            </p>
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
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">
                      Booking settings
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      Use NZ / UK / INT on each cell so a time can be offered in
                      one region without showing in another. Australia uses INT.
                      Open / Block follows the bulk region selected on the grid.
                    </p>
                  </div>
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

                <AdminBookingTimezonePanel />

                <AdminBookingCalendar
                  slots={slots}
                  loading={loading}
                  busy={busy}
                  onToggleStatus={handleStatusClick}
                  onSetCells={setCells}
                  onCopyWeekToNext={copyWeekToNext}
                />

                <AdminBookingSeedPanel
                  busy={busy}
                  slots={slots}
                  onSeed={seedBookingSlots}
                  onNormalizeDurations={normalizeBookingDurations}
                  onClearAll={clearAllBookingSlots}
                />

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
              </>
            )}
          </div>
        )}

        {tab === 'enquiries' &&
          session &&
          canAccessTab(session, 'enquiries', viewMode) && (
          <div className="mt-8" role="tabpanel">
            <AdminEnquiriesPanel
              canDelete={
                session.role === 'admin' && viewMode === 'admin'
              }
            />
          </div>
        )}

        {tab === 'analytics' &&
          session &&
          canAccessTab(session, 'analytics', viewMode) && (
          <div className="mt-8" role="tabpanel">
            <AdminAnalyticsPanel />
          </div>
        )}

        {tab === 'chat' &&
          session &&
          canAccessTab(session, 'chat', viewMode) && (
          <div className="mt-8" role="tabpanel">
            <AdminChatPanel />
          </div>
        )}

        {tab === 'blog' &&
          session &&
          canAccessTab(session, 'blog', viewMode) && (
          <div className="mt-8 space-y-6" role="tabpanel">
            <div
              className="flex flex-wrap gap-1 border-b border-border"
              role="tablist"
              aria-label="Blog sections"
            >
              {(
                [
                  { id: 'blogs' as const, label: 'Blogs' },
                  { id: 'queue' as const, label: 'Blog queue' },
                ] as const
              ).map((item) => {
                const active = blogSubTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setBlogSubTab(item.id)}
                    className={
                      active
                        ? 'border-b-2 border-brand px-4 py-2.5 text-sm font-semibold text-brand'
                        : 'border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:text-ink'
                    }
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>

            {blogSubTab === 'blogs' && <AdminBlogPanel />}
            {blogSubTab === 'queue' && <AdminBlogQueuePanel />}
          </div>
        )}

        {tab === 'case-studies' &&
          session &&
          canAccessTab(session, 'case-studies', viewMode) && (
          <div className="mt-8" role="tabpanel">
            <AdminCaseStudiesPanel />
          </div>
        )}

        {tab === 'service-tiles' &&
          session &&
          canAccessTab(session, 'service-tiles', viewMode) && (
          <div className="mt-8" role="tabpanel">
            <AdminServicePageTilesPanel />
          </div>
        )}

        {tab === 'find-out-about' &&
          session &&
          canAccessTab(session, 'find-out-about', viewMode) && (
          <div className="mt-8" role="tabpanel">
            <AdminFindOutAboutPanel />
          </div>
        )}

        {tab === 'cms' &&
          session &&
          canAccessTab(session, 'cms', viewMode) && (
          <div className="mt-8 space-y-6" role="tabpanel">
            <div
              className="flex flex-wrap gap-1 border-b border-border"
              role="tablist"
              aria-label="CMS sections"
            >
              {(
                [
                  { id: 'site' as const, label: 'Site CMS' },
                  { id: 'pages' as const, label: 'Pages CMS' },
                  { id: 'home-services' as const, label: 'Home services' },
                  { id: 'client-logos' as const, label: 'Client Logos' },
                  { id: 'common-projects' as const, label: 'Common Projects' },
                  { id: 'logos' as const, label: 'Logo Harvest' },
                  { id: 'publish' as const, label: 'Publish' },
                ] as const
              ).map((item) => {
                const active = cmsSubTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCmsSubTab(item.id)}
                    className={
                      active
                        ? 'border-b-2 border-brand px-4 py-2.5 text-sm font-semibold text-brand'
                        : 'border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:text-ink'
                    }
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>

            {cmsSubTab === 'site' && <AdminMarketCopyPanel />}
            {cmsSubTab === 'pages' && <AdminPageSeoPanel />}
            {cmsSubTab === 'home-services' && <AdminHomeServicesPanel />}
            {cmsSubTab === 'client-logos' && <AdminHeroClientsPanel />}
            {cmsSubTab === 'common-projects' && <AdminHeroProjectsPanel />}
            {cmsSubTab === 'logos' && <AdminLogoHarvestPanel />}
            {cmsSubTab === 'publish' && <AdminCmsPublishPanel />}
          </div>
        )}

        {tab === 'marketing' &&
          session &&
          canAccessTab(session, 'marketing', viewMode) && (
          <div className="mt-8 space-y-6" role="tabpanel">
            <div
              className="flex flex-wrap gap-1 border-b border-border"
              role="tablist"
              aria-label="Marketing sections"
            >
              {(
                [
                  { id: 'tags' as const, label: 'Analytics tags' },
                  { id: 'crawl' as const, label: 'SEO crawl' },
                  { id: 'domains' as const, label: 'Domains' },
                ] as const
              ).map((item) => {
                const active = marketingSubTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setMarketingSubTab(item.id)}
                    className={
                      active
                        ? 'border-b-2 border-brand px-4 py-2.5 text-sm font-semibold text-brand'
                        : 'border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:text-ink'
                    }
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>

            {marketingSubTab === 'tags' && <AdminSiteTagsPanel />}
            {marketingSubTab === 'crawl' && <AdminCrawlDocsPanel />}
            {marketingSubTab === 'domains' && <AdminDomainRegionsPanel />}
          </div>
        )}

        {tab === 'mailings' &&
          session &&
          canAccessTab(session, 'mailings', viewMode) && (
          <div className="mt-8" role="tabpanel">
            <AdminMailingsPanel />
          </div>
        )}

        {tab === 'email' &&
          session &&
          canAccessTab(session, 'email', viewMode) && (
          <div className="mt-8" role="tabpanel">
            <AdminEmailPanel />
          </div>
        )}

        {tab === 'seeding' &&
          session &&
          canAccessTab(session, 'seeding', viewMode) && (
          <div className="mt-8" role="tabpanel">
            <AdminSeedingPanel />
          </div>
        )}

        {tab === 'settings' &&
          session &&
          canAccessTab(session, 'settings', viewMode) && (
          <div className="mt-8 space-y-6" role="tabpanel">
            <div
              className="flex flex-wrap gap-1 border-b border-border"
              role="tablist"
              aria-label="Settings sections"
            >
              {(
                [
                  { id: 'users' as const, label: 'Users' },
                  { id: 'thank-you' as const, label: 'Thank you copy' },
                ] as const
              ).map((item) => {
                const active = settingsSubTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSettingsSubTab(item.id)}
                    className={
                      active
                        ? 'border-b-2 border-brand px-4 py-2.5 text-sm font-semibold text-brand'
                        : 'border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:text-ink'
                    }
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>

            {settingsSubTab === 'users' && (
              <AdminUsersPanel currentUserId={session.userId} />
            )}

            {settingsSubTab === 'thank-you' && (
              <AdminConfirmationContentPanel />
            )}

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
                <code className="text-xs">users</code>, domain-to-region
                bindings in{' '}
                <code className="text-xs">Site Content / domain-regions</code>
                , booking display options in{' '}
                <code className="text-xs">Site Content / booking-display</code>
                , blog posts in{' '}
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
