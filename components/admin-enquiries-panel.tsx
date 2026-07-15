'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Trash2, X } from 'lucide-react'
import {
  deleteEnquiry,
  fetchAllEnquiries,
  formatEnquiryCreatedAt,
  updateEnquiryStatus,
} from '@/lib/enquiries-db'
import {
  ENQUIRY_STATUSES,
  ENQUIRY_TYPES,
  type EnquiryRecord,
  type EnquiryStatus,
  type EnquiryType,
} from '@/lib/enquiries'
import {
  CONTACT_HEAR_OPTIONS,
  CONTACT_SERVICE_OPTIONS,
} from '@/lib/contact-options'

type SortKey =
  | 'createdAt'
  | 'type'
  | 'name'
  | 'email'
  | 'company'
  | 'phone'
  | 'hear'
  | 'status'
  | 'emailNotified'
  | 'services'

type SortDir = 'asc' | 'desc'

type ColumnFilters = {
  createdAt: string
  type: 'all' | EnquiryType
  name: string
  email: string
  company: string
  phone: string
  hear: string
  status: 'all' | EnquiryStatus
  emailNotified: 'all' | 'yes' | 'no'
  services: string
}

const EMPTY_FILTERS: ColumnFilters = {
  createdAt: '',
  type: 'all',
  name: '',
  email: '',
  company: '',
  phone: '',
  hear: '',
  status: 'all',
  emailNotified: 'all',
  services: '',
}

function createdAtMs(value: unknown): number {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    try {
      return (value as { toDate: () => Date }).toDate().getTime()
    } catch {
      return 0
    }
  }
  return 0
}

function SortIcon({
  active,
  dir,
}: {
  active: boolean
  dir: SortDir
}) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
  return dir === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-brand" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-brand" />
  )
}

function EnquiryDetailModal({
  enquiry,
  busy,
  onClose,
  onStatusChange,
  onDelete,
}: {
  enquiry: EnquiryRecord
  busy: boolean
  onClose: () => void
  onStatusChange: (status: EnquiryStatus) => void
  onDelete: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const selectedServices = new Set(enquiry.services)
  // Include any free-form service values not in the canonical list
  const extraServices = enquiry.services.filter(
    (s) => !(CONTACT_SERVICE_OPTIONS as readonly string[]).includes(s)
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-detail-title"
      onClick={onClose}
    >
      <div
        className="relative my-4 w-full max-w-xl rounded-lg border border-border bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              Submitted enquiry
            </p>
            <h2
              id="enquiry-detail-title"
              className="mt-1 text-lg font-semibold text-ink"
            >
              {enquiry.name || 'Untitled enquiry'}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {formatEnquiryCreatedAt(enquiry.createdAt)} ·{' '}
              <span className="capitalize">{enquiry.type}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border p-2 text-ink-muted hover:bg-surface-raised hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          {/* Mirror of the public contact form fields (read-only) */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Name
              </span>
              <input
                readOnly
                value={enquiry.name}
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Company
              </span>
              <input
                readOnly
                value={enquiry.company}
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Email
              </span>
              <input
                readOnly
                value={enquiry.email}
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Phone
              </span>
              <input
                readOnly
                value={enquiry.phone}
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-ink"
              />
            </label>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-600">
              What do you need help with?
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {CONTACT_SERVICE_OPTIONS.map((opt) => {
                const checked = selectedServices.has(opt)
                return (
                  <div
                    key={opt}
                    className="flex items-center gap-2 border px-3 py-2 text-left text-xs font-medium"
                    style={{
                      borderColor: checked ? '#1a6b3c' : '#e5e7eb',
                      backgroundColor: checked ? '#e8f5ee' : '#f9fafb',
                      color: checked ? '#1a6b3c' : '#374151',
                    }}
                    aria-checked={checked}
                    role="checkbox"
                  >
                    <span
                      className="flex h-3.5 w-3.5 shrink-0 items-center justify-center border"
                      style={{
                        borderColor: checked ? '#1a6b3c' : '#d1d5db',
                        backgroundColor: checked ? '#1a6b3c' : 'white',
                      }}
                    >
                      {checked ? (
                        <span className="text-[9px] font-black leading-none text-white">
                          ✓
                        </span>
                      ) : null}
                    </span>
                    {opt}
                  </div>
                )
              })}
              {extraServices.map((opt) => (
                <div
                  key={opt}
                  className="flex items-center gap-2 border px-3 py-2 text-left text-xs font-medium"
                  style={{
                    borderColor: '#1a6b3c',
                    backgroundColor: '#e8f5ee',
                    color: '#1a6b3c',
                  }}
                >
                  <span
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center border text-[9px] font-black text-white"
                    style={{ borderColor: '#1a6b3c', backgroundColor: '#1a6b3c' }}
                  >
                    ✓
                  </span>
                  {opt} <span className="text-[10px] opacity-70">(custom)</span>
                </div>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
              Tell us about your project
            </span>
            <textarea
              readOnly
              value={enquiry.message}
              rows={5}
              className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-ink whitespace-pre-wrap"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
              How did you hear about us?
            </span>
            <select
              disabled
              value={enquiry.hear || ''}
              className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-ink disabled:opacity-100"
            >
              <option value="">
                {enquiry.hear ? enquiry.hear : 'Not provided'}
              </option>
              {CONTACT_HEAR_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
              {enquiry.hear &&
              !(CONTACT_HEAR_OPTIONS as readonly string[]).includes(enquiry.hear) ? (
                <option value={enquiry.hear}>{enquiry.hear}</option>
              ) : null}
            </select>
            <p className="text-xs text-ink-muted">
              Selected: <strong>{enquiry.hear || 'Not provided'}</strong>
            </p>
          </label>

          {enquiry.type === 'discovery' && (
            <div className="rounded-md border border-sky-200 bg-sky-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-sky-800">
                Discovery call details
              </p>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-ink-muted">Day</dt>
                  <dd className="font-medium">{enquiry.day || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Date</dt>
                  <dd className="font-medium">{enquiry.date || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Time</dt>
                  <dd className="font-medium">{enquiry.time || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Method</dt>
                  <dd className="font-medium">{enquiry.method || '—'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-ink-muted">Slot ID</dt>
                  <dd className="font-mono text-xs">{enquiry.slotId || '—'}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Status
              </span>
              <select
                value={enquiry.status}
                disabled={busy}
                onChange={(e) =>
                  onStatusChange(e.target.value as EnquiryStatus)
                }
                className="rounded-md border border-border px-3 py-2 capitalize"
              >
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Email notified
              </span>
              <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                {enquiry.emailNotified ? (
                  <span className="font-semibold text-emerald-700">Yes</span>
                ) : (
                  <span className="font-semibold text-amber-700">No</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-white px-5 py-3">
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminEnquiriesPanel() {
  const [rows, setRows] = useState<EnquiryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ColumnFilters>(EMPTY_FILTERS)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await fetchAllEnquiries())
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load enquiries from Firebase'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredSorted = useMemo(() => {
    const f = filters
    let list = rows.filter((row) => {
      if (f.type !== 'all' && row.type !== f.type) return false
      if (f.status !== 'all' && row.status !== f.status) return false
      if (f.emailNotified === 'yes' && !row.emailNotified) return false
      if (f.emailNotified === 'no' && row.emailNotified) return false

      const includes = (value: string, q: string) =>
        !q.trim() || value.toLowerCase().includes(q.trim().toLowerCase())

      if (!includes(formatEnquiryCreatedAt(row.createdAt), f.createdAt)) return false
      if (!includes(row.name, f.name)) return false
      if (!includes(row.email, f.email)) return false
      if (!includes(row.company, f.company)) return false
      if (!includes(row.phone, f.phone)) return false
      if (!includes(row.hear, f.hear)) return false
      if (!includes(row.services.join(' '), f.services)) return false

      return true
    })

    const dir = sortDir === 'asc' ? 1 : -1
    list = [...list].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'createdAt':
          cmp = createdAtMs(a.createdAt) - createdAtMs(b.createdAt)
          break
        case 'type':
          cmp = a.type.localeCompare(b.type)
          break
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'email':
          cmp = a.email.localeCompare(b.email)
          break
        case 'company':
          cmp = a.company.localeCompare(b.company)
          break
        case 'phone':
          cmp = a.phone.localeCompare(b.phone)
          break
        case 'hear':
          cmp = a.hear.localeCompare(b.hear)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'emailNotified':
          cmp = Number(a.emailNotified) - Number(b.emailNotified)
          break
        case 'services':
          cmp = a.services.join(',').localeCompare(b.services.join(','))
          break
      }
      return cmp * dir
    })

    return list
  }, [rows, filters, sortKey, sortDir])

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? null,
    [rows, selectedId]
  )

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'createdAt' ? 'desc' : 'asc')
    }
  }

  async function handleStatusChange(id: string, status: EnquiryStatus) {
    setBusy(true)
    setError(null)
    try {
      await updateEnquiryStatus(id, status)
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update status')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id: string) {
    const password = window.prompt(
      'Enter delete password to permanently remove this enquiry from Firebase:'
    )
    if (password === null) return
    if (password.trim() !== '2166') {
      window.alert('Incorrect password. Enquiry was not deleted.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await deleteEnquiry(id)
      setRows((prev) => prev.filter((r) => r.id !== id))
      if (selectedId === id) setSelectedId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete enquiry')
    } finally {
      setBusy(false)
    }
  }

  const filterInputClass =
    'w-full rounded border border-border bg-white px-2 py-1.5 text-xs text-ink'

  function SortableHeader({
    label,
    column,
  }: {
    label: string
    column: SortKey
  }) {
    return (
      <button
        type="button"
        onClick={() => toggleSort(column)}
        className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-ink-muted hover:text-ink"
      >
        {label}
        <SortIcon active={sortKey === column} dir={sortDir} />
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Inquiries</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Click a row to open the submission exactly as filled in. Filter
              above each column; click headers to sort. Data is live Firebase{' '}
              <code className="text-xs">enquiries</code>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
            >
              Clear filters
            </button>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading || busy}
              className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <p className="mt-4 text-xs text-ink-muted">
          Showing {filteredSorted.length} of {rows.length} enquiry(ies)
        </p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-raised/80">
                <th className="px-2 pb-1 pt-2">
                  <input
                    type="search"
                    value={filters.createdAt}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, createdAt: e.target.value }))
                    }
                    placeholder="Filter date…"
                    className={filterInputClass}
                  />
                </th>
                <th className="px-2 pb-1 pt-2">
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        type: e.target.value as ColumnFilters['type'],
                      }))
                    }
                    className={filterInputClass}
                  >
                    <option value="all">All types</option>
                    {ENQUIRY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-2 pb-1 pt-2">
                  <input
                    type="search"
                    value={filters.name}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Filter name…"
                    className={filterInputClass}
                  />
                </th>
                <th className="px-2 pb-1 pt-2">
                  <input
                    type="search"
                    value={filters.email}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="Filter email…"
                    className={filterInputClass}
                  />
                </th>
                <th className="px-2 pb-1 pt-2">
                  <input
                    type="search"
                    value={filters.company}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, company: e.target.value }))
                    }
                    placeholder="Filter company…"
                    className={filterInputClass}
                  />
                </th>
                <th className="px-2 pb-1 pt-2">
                  <input
                    type="search"
                    value={filters.phone}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="Filter phone…"
                    className={filterInputClass}
                  />
                </th>
                <th className="px-2 pb-1 pt-2">
                  <select
                    value={filters.hear}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, hear: e.target.value }))
                    }
                    className={filterInputClass}
                  >
                    <option value="">All sources</option>
                    {CONTACT_HEAR_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-2 pb-1 pt-2">
                  <input
                    type="search"
                    value={filters.services}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, services: e.target.value }))
                    }
                    placeholder="Filter concerns…"
                    className={filterInputClass}
                  />
                </th>
                <th className="px-2 pb-1 pt-2">
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        status: e.target.value as ColumnFilters['status'],
                      }))
                    }
                    className={filterInputClass}
                  >
                    <option value="all">All statuses</option>
                    {ENQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-2 pb-1 pt-2">
                  <select
                    value={filters.emailNotified}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        emailNotified: e.target.value as ColumnFilters['emailNotified'],
                      }))
                    }
                    className={filterInputClass}
                  >
                    <option value="all">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </th>
                <th className="px-2 pb-1 pt-2" />
              </tr>
              <tr className="border-b border-border text-[11px]">
                <th className="px-2 py-2">
                  <SortableHeader label="Created" column="createdAt" />
                </th>
                <th className="px-2 py-2">
                  <SortableHeader label="Type" column="type" />
                </th>
                <th className="px-2 py-2">
                  <SortableHeader label="Name" column="name" />
                </th>
                <th className="px-2 py-2">
                  <SortableHeader label="Email" column="email" />
                </th>
                <th className="px-2 py-2">
                  <SortableHeader label="Company" column="company" />
                </th>
                <th className="px-2 py-2">
                  <SortableHeader label="Phone" column="phone" />
                </th>
                <th className="px-2 py-2">
                  <SortableHeader label="Heard" column="hear" />
                </th>
                <th className="px-2 py-2">
                  <SortableHeader label="Concerns" column="services" />
                </th>
                <th className="px-2 py-2">
                  <SortableHeader label="Status" column="status" />
                </th>
                <th className="px-2 py-2">
                  <SortableHeader label="Mailed" column="emailNotified" />
                </th>
                <th className="px-2 py-2 text-ink-muted">Open</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-2 py-8 text-ink-muted">
                    Loading from Firebase…
                  </td>
                </tr>
              ) : filteredSorted.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-2 py-8 text-ink-muted">
                    No enquiries match these filters.
                  </td>
                </tr>
              ) : (
                filteredSorted.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-border/70 hover:bg-brand-light/30"
                    onClick={() => setSelectedId(row.id)}
                  >
                    <td className="whitespace-nowrap px-2 py-2.5 text-xs text-ink-muted">
                      {formatEnquiryCreatedAt(row.createdAt)}
                    </td>
                    <td className="px-2 py-2.5 capitalize">{row.type}</td>
                    <td className="px-2 py-2.5 font-medium text-ink">
                      {row.name || '—'}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-xs">{row.email}</td>
                    <td className="px-2 py-2.5">{row.company || '—'}</td>
                    <td className="px-2 py-2.5">{row.phone || '—'}</td>
                    <td className="px-2 py-2.5 text-xs">{row.hear || '—'}</td>
                    <td className="max-w-[180px] truncate px-2 py-2.5 text-xs" title={row.services.join(', ')}>
                      {row.services.length ? row.services.join(', ') : '—'}
                    </td>
                    <td className="px-2 py-2.5">
                      <select
                        value={row.status}
                        disabled={busy}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          void handleStatusChange(
                            row.id,
                            e.target.value as EnquiryStatus
                          )
                        }
                        className="rounded border border-border bg-white px-2 py-1 text-xs capitalize"
                      >
                        {ENQUIRY_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2.5 text-xs">
                      {row.emailNotified ? (
                        <span className="font-semibold text-emerald-700">Yes</span>
                      ) : (
                        <span className="text-amber-700">No</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      <button
                        type="button"
                        className="text-xs font-semibold text-brand hover:underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedId(row.id)
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <EnquiryDetailModal
          enquiry={selected}
          busy={busy}
          onClose={() => setSelectedId(null)}
          onStatusChange={(status) => void handleStatusChange(selected.id, status)}
          onDelete={() => void handleDelete(selected.id)}
        />
      )}
    </div>
  )
}
