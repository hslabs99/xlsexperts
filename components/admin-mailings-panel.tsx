'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Eye,
  MousePointerClick,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { EmailHtmlEditor } from '@/components/email-html-editor'
import { AdminDialog } from '@/components/admin-dialog'
import {
  MAILING_CONTACT_STATUSES,
  MAILING_REGIONS,
  parseMailingRegion,
  type MailingAudience,
  type MailingAudienceFilter,
  type MailingCampaign,
  type MailingContact,
  type MailingContactStatus,
  type MailingRegion,
  type MailingSend,
} from '@/lib/mailings'

type SubTab = 'clients' | 'audiences' | 'campaigns'

function formatWhen(value: unknown): string {
  if (typeof value === 'string') {
    const t = Date.parse(value)
    return Number.isFinite(t) ? new Date(t).toLocaleString('en-NZ') : '—'
  }
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    try {
      return (value as { toDate: () => Date }).toDate().toLocaleString('en-NZ')
    } catch {
      return '—'
    }
  }
  if (
    value &&
    typeof value === 'object' &&
    '_seconds' in value &&
    typeof (value as { _seconds: unknown })._seconds === 'number'
  ) {
    return new Date(
      (value as { _seconds: number })._seconds * 1000
    ).toLocaleString('en-NZ')
  }
  return '—'
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return []

  const splitLine = (line: string): string[] => {
    const out: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"'
          i += 1
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        out.push(cur.trim())
        cur = ''
      } else {
        cur += ch
      }
    }
    out.push(cur.trim())
    return out
  }

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase().trim())
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? ''
    })
    rows.push(row)
  }
  return rows
}

const emptyContactForm = {
  contact: '',
  name: '',
  email: '',
  company: '',
  sector: '',
  status: 'prospect' as MailingContactStatus,
  region: 'NZ' as MailingRegion,
  notes: '',
}

export function AdminMailingsPanel() {
  const [subTab, setSubTab] = useState<SubTab>('clients')
  const [contacts, setContacts] = useState<MailingContact[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [audiences, setAudiences] = useState<MailingAudience[]>([])
  const [campaigns, setCampaigns] = useState<MailingCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | MailingContactStatus>(
    'all'
  )
  const [engagedFilter, setEngagedFilter] = useState<
    'all' | 'engaged' | 'opened' | 'clicked' | 'unsubscribed'
  >('all')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState<'all' | MailingRegion>('all')
  const [excludeCampaignTag, setExcludeCampaignTag] = useState('')

  const [selectedContact, setSelectedContact] = useState<MailingContact | null>(
    null
  )
  const [contactSends, setContactSends] = useState<MailingSend[]>([])
  const [contactForm, setContactForm] = useState(emptyContactForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null)

  const [audienceEditor, setAudienceEditor] = useState<{
    id: string | null
    name: string
    description: string
    filter: MailingAudienceFilter
  } | null>(null)
  const [audienceManualIds, setAudienceManualIds] = useState<string[]>([])
  const [audiencePreview, setAudiencePreview] = useState<{
    count: number
    sample: { id: string; name: string; email: string }[]
  } | null>(null)
  const [deleteAudienceId, setDeleteAudienceId] = useState<string | null>(null)

  const [campaignEditor, setCampaignEditor] = useState<{
    id: string | null
    name: string
    subject: string
    htmlBody: string
    audienceId: string
  } | null>(null)
  const [campaignAudiencePreview, setCampaignAudiencePreview] = useState<{
    count: number
  } | null>(null)
  const [selectedCampaign, setSelectedCampaign] =
    useState<MailingCampaign | null>(null)
  const [campaignSends, setCampaignSends] = useState<MailingSend[]>([])
  const [sending, setSending] = useState(false)
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false)
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null)

  const loadContacts = useCallback(async () => {
    const res = await fetch('/api/admin/mailings/contacts')
    const data = (await res.json()) as {
      contacts?: MailingContact[]
      sectors?: string[]
      error?: string
    }
    if (!res.ok) throw new Error(data.error || 'Failed to load contacts')
    setContacts(data.contacts || [])
    setSectors(data.sectors || [])
  }, [])

  const loadCampaigns = useCallback(async () => {
    const res = await fetch('/api/admin/mailings/campaigns')
    const data = (await res.json()) as {
      campaigns?: MailingCampaign[]
      error?: string
    }
    if (!res.ok) throw new Error(data.error || 'Failed to load campaigns')
    setCampaigns(data.campaigns || [])
  }, [])

  const loadAudiences = useCallback(async () => {
    const res = await fetch('/api/admin/mailings/audiences')
    const data = (await res.json()) as {
      audiences?: MailingAudience[]
      error?: string
    }
    if (!res.ok) throw new Error(data.error || 'Failed to load audiences')
    setAudiences(data.audiences || [])
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      await Promise.all([loadContacts(), loadAudiences(), loadCampaigns()])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load mailings data')
    } finally {
      setLoading(false)
    }
  }, [loadContacts, loadAudiences, loadCampaigns])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const campaignNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of campaigns) map.set(c.id, c.name)
    return map
  }, [campaigns])

  const filteredContacts = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return contacts.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (sectorFilter !== 'all' && c.sector !== sectorFilter) return false
      if (regionFilter !== 'all' && c.region !== regionFilter) return false
      if (engagedFilter === 'engaged' && !c.hasEngaged) return false
      if (engagedFilter === 'opened' && !c.hasOpened) return false
      if (engagedFilter === 'clicked' && !c.hasClicked) return false
      if (engagedFilter === 'unsubscribed' && !c.unsubscribed) return false
      if (excludeCampaignTag && c.campaignTags.includes(excludeCampaignTag)) {
        return false
      }
      if (!needle) return true
      const hay = [
        c.contact,
        c.name,
        c.email,
        c.company,
        c.sector,
        c.region,
        c.status,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(needle)
    })
  }, [
    contacts,
    q,
    statusFilter,
    sectorFilter,
    regionFilter,
    engagedFilter,
    excludeCampaignTag,
  ])

  const openContact = async (contact: MailingContact) => {
    setSelectedContact(contact)
    setContactSends([])
    try {
      const res = await fetch(
        `/api/admin/mailings/contacts?id=${encodeURIComponent(contact.id)}`
      )
      const data = (await res.json()) as {
        contact?: MailingContact
        sends?: MailingSend[]
      }
      if (data.contact) setSelectedContact(data.contact)
      setContactSends(data.sends || [])
    } catch {
      setContactSends([])
    }
  }

  const saveContact = async () => {
    setError('')
    setMessage('')
    const payload = {
      ...contactForm,
      id: editingId || undefined,
    }
    const res = await fetch('/api/admin/mailings/contacts', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = (await res.json()) as { error?: string }
    if (!res.ok) {
      setError(data.error || 'Save failed')
      return
    }
    setShowContactForm(false)
    setEditingId(null)
    setContactForm(emptyContactForm)
    setMessage(editingId ? 'Contact updated.' : 'Contact created.')
    await loadContacts()
  }

  const onUploadCsv = async (file: File) => {
    setError('')
    setMessage('')
    const text = await file.text()
    const parsed = parseCsv(text)
    const rows = parsed.map((row) => ({
      contact: row.contact || row.name || '',
      name: row.name || row.contact || '',
      email: row.email || row['email address'] || '',
      company: row.company || row['company name'] || '',
      sector: row.sector || '',
      status: (row.status === 'client' ? 'client' : 'prospect') as MailingContactStatus,
      region: parseMailingRegion(row.region),
    }))
    const res = await fetch('/api/admin/mailings/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upload', rows }),
    })
    const data = (await res.json()) as {
      created?: number
      updated?: number
      errors?: string[]
      error?: string
    }
    if (!res.ok) {
      setError(data.error || 'Upload failed')
      return
    }
    setMessage(
      `Upload complete: ${data.created ?? 0} created, ${data.updated ?? 0} updated.` +
        (data.errors?.length ? ` ${data.errors.length} row error(s).` : '')
    )
    await loadContacts()
  }

  const startNewAudience = () => {
    setAudienceEditor({
      id: null,
      name: '',
      description: '',
      filter: {
        statuses: ['prospect', 'client'],
        sectors: [],
        regions: [],
        contactIds: [],
        excludeCampaignTags: [],
      },
    })
    setAudienceManualIds([])
    setAudiencePreview(null)
  }

  const editAudience = (a: MailingAudience) => {
    setAudienceEditor({
      id: a.id,
      name: a.name,
      description: a.description,
      filter: {
        ...a.filter,
        statuses: a.filter.statuses?.length
          ? a.filter.statuses
          : ['prospect', 'client'],
      },
    })
    setAudienceManualIds(a.filter.contactIds || [])
    setAudiencePreview(null)
  }

  const previewSavedAudienceFilter = async () => {
    if (!audienceEditor) return
    const filter: MailingAudienceFilter = {
      ...audienceEditor.filter,
      contactIds: audienceManualIds.length > 0 ? audienceManualIds : [],
    }
    const res = await fetch('/api/admin/mailings/audiences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'preview', filter }),
    })
    const data = (await res.json()) as {
      count?: number
      sample?: { id: string; name: string; email: string }[]
      error?: string
    }
    if (!res.ok) {
      setError(data.error || 'Audience preview failed')
      return
    }
    setAudiencePreview({
      count: data.count ?? 0,
      sample: data.sample || [],
    })
  }

  const saveAudience = async () => {
    if (!audienceEditor) return
    setError('')
    setMessage('')
    const filter: MailingAudienceFilter = {
      ...audienceEditor.filter,
      contactIds: audienceManualIds.length > 0 ? audienceManualIds : [],
    }
    const payload = {
      id: audienceEditor.id || undefined,
      name: audienceEditor.name,
      description: audienceEditor.description,
      filter,
    }
    const res = await fetch('/api/admin/mailings/audiences', {
      method: audienceEditor.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = (await res.json()) as { id?: string; error?: string }
    if (!res.ok) {
      setError(data.error || 'Could not save audience')
      return
    }
    setMessage('Audience saved.')
    setAudienceEditor(null)
    await loadAudiences()
  }

  const startNewCampaign = () => {
    setCampaignEditor({
      id: null,
      name: '',
      subject: '',
      htmlBody:
        '<p>Hi {{name}},</p><p>Write your message here.</p><p>— XLS Experts</p>',
      audienceId: audiences[0]?.id || '',
    })
    setCampaignAudiencePreview(null)
    setSelectedCampaign(null)
  }

  const editCampaign = (c: MailingCampaign) => {
    setCampaignEditor({
      id: c.id,
      name: c.name,
      subject: c.subject,
      htmlBody: c.htmlBody,
      audienceId: c.audienceId || '',
    })
    setCampaignAudiencePreview(null)
    setSelectedCampaign(null)
  }

  const previewCampaignAudience = async (audienceId: string) => {
    if (!audienceId) {
      setCampaignAudiencePreview(null)
      return
    }
    const res = await fetch('/api/admin/mailings/audiences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'preview', audienceId }),
    })
    const data = (await res.json()) as { count?: number; error?: string }
    if (!res.ok) {
      setError(data.error || 'Audience preview failed')
      return
    }
    setCampaignAudiencePreview({ count: data.count ?? 0 })
  }

  const saveCampaign = async () => {
    if (!campaignEditor) return
    setError('')
    setMessage('')
    if (!campaignEditor.audienceId) {
      setError('Select a saved audience for this campaign.')
      return
    }
    const payload = {
      id: campaignEditor.id || undefined,
      name: campaignEditor.name,
      subject: campaignEditor.subject,
      htmlBody: campaignEditor.htmlBody,
      audienceId: campaignEditor.audienceId,
    }
    const res = await fetch('/api/admin/mailings/campaigns', {
      method: campaignEditor.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = (await res.json()) as { id?: string; error?: string }
    if (!res.ok) {
      setError(data.error || 'Could not save campaign')
      return
    }
    setMessage('Campaign saved.')
    const id = campaignEditor.id || data.id || null
    await loadCampaigns()
    if (id) {
      setCampaignEditor((prev) => (prev ? { ...prev, id } : prev))
    }
  }

  const sendCampaign = async () => {
    if (!campaignEditor?.id) {
      setError('Save the campaign before sending.')
      return
    }
    setSendConfirmOpen(false)
    setSending(true)
    setError('')
    setMessage('')
    try {
      await saveCampaign()
      const res = await fetch('/api/admin/mailings/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', id: campaignEditor.id }),
      })
      const data = (await res.json()) as {
        accepted?: number
        failed?: number
        targeted?: number
        error?: string
        errors?: string[]
      }
      if (!res.ok) {
        setError(data.error || 'Send failed')
        return
      }
      setMessage(
        `Sent to ${data.accepted ?? 0} of ${data.targeted ?? 0}` +
          (data.failed ? ` (${data.failed} failed)` : '') +
          '.'
      )
      await Promise.all([loadCampaigns(), loadContacts()])
      setCampaignEditor(null)
    } finally {
      setSending(false)
    }
  }

  const openCampaignAnalytics = async (c: MailingCampaign) => {
    setSelectedCampaign(c)
    setCampaignSends([])
    setCampaignEditor(null)
    const res = await fetch(
      `/api/admin/mailings/campaigns?id=${encodeURIComponent(c.id)}`
    )
    const data = (await res.json()) as {
      campaign?: MailingCampaign
      sends?: MailingSend[]
    }
    if (data.campaign) setSelectedCampaign(data.campaign)
    setCampaignSends(data.sends || [])
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            New Mailings
          </p>
          <h2 className="mt-1 text-lg font-semibold text-ink">
            Clients, audiences & campaigns
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Build reusable audiences, then design and send campaigns with
            SendGrid open/click tracking.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-surface-raised"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(
          [
            ['clients', 'Client database'],
            ['audiences', 'Audiences'],
            ['campaigns', 'Campaigns'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubTab(id)}
            className={
              subTab === id
                ? 'border-b-2 border-brand px-3 py-2 text-sm font-medium text-brand'
                : 'px-3 py-2 text-sm text-ink-muted hover:text-ink'
            }
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-md border border-brand/30 bg-brand-light px-3 py-2 text-sm text-brand-dark">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : subTab === 'clients' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setContactForm(emptyContactForm)
                setShowContactForm(true)
              }}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              <Plus className="h-4 w-4" />
              Add contact
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-surface-raised">
              <Upload className="h-4 w-4" />
              Upload CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void onUploadCsv(file)
                  e.target.value = ''
                }}
              />
            </label>
            <span className="text-xs text-ink-muted">
              CSV headers: contact, name, email, company, sector
            </span>
          </div>

          <div className="grid gap-2 md:grid-cols-5">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="rounded-md border border-border px-3 py-2 text-sm md:col-span-2"
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              {MAILING_CONTACT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              <option value="all">All sectors</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={regionFilter}
              onChange={(e) =>
                setRegionFilter(e.target.value as typeof regionFilter)
              }
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              <option value="all">All regions</option>
              {MAILING_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={engagedFilter}
              onChange={(e) =>
                setEngagedFilter(e.target.value as typeof engagedFilter)
              }
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              <option value="all">Any engagement</option>
              <option value="engaged">Has engaged</option>
              <option value="opened">Has opened</option>
              <option value="clicked">Has clicked</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-ink-muted">
              Exclude anyone who received campaign:
            </label>
            <select
              value={excludeCampaignTag}
              onChange={(e) => setExcludeCampaignTag(e.target.value)}
              className="rounded-md border border-border px-2 py-1.5 text-sm"
            >
              <option value="">—</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-ink-muted">
              Showing {filteredContacts.length} of {contacts.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-raised text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Sector</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">Engaged</th>
                  <th className="px-3 py-2">Tags</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer border-t border-border hover:bg-surface-raised/60"
                    onClick={() => void openContact(c)}
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium text-ink">
                        {c.contact || c.name}
                      </div>
                      {c.name && c.contact && c.name !== c.contact && (
                        <div className="text-xs text-ink-muted">{c.name}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">{c.email}</td>
                    <td className="px-3 py-2">{c.company || '—'}</td>
                    <td className="px-3 py-2">{c.sector || '—'}</td>
                    <td className="px-3 py-2 capitalize">{c.status}</td>
                    <td className="px-3 py-2">{c.region}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {c.hasOpened && (
                          <span title="Opened" className="text-brand">
                            <Eye className="h-4 w-4" />
                          </span>
                        )}
                        {c.hasClicked && (
                          <span title="Clicked" className="text-brand">
                            <MousePointerClick className="h-4 w-4" />
                          </span>
                        )}
                        {c.unsubscribed && (
                          <span className="text-xs text-red-700">Unsub</span>
                        )}
                        {!c.hasEngaged && !c.unsubscribed && (
                          <span className="text-ink-muted">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-ink-muted">
                      {c.campaignTags.length
                        ? c.campaignTags
                            .map((t) => campaignNameById.get(t) || t.slice(0, 6))
                            .join(', ')
                        : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-red-700"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteContactId(c.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredContacts.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-8 text-center text-ink-muted"
                    >
                      No contacts yet. Add one or upload a CSV.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : subTab === 'audiences' ? (
        <div className="space-y-4">
          {!audienceEditor && (
            <>
              <button
                type="button"
                onClick={startNewAudience}
                className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                <Plus className="h-4 w-4" />
                New audience
              </button>
              <p className="text-sm text-ink-muted">
                Save filter sets (status, sector, manual picks, campaign
                exclusions) and reuse them when creating campaigns.
              </p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-surface-raised text-xs uppercase tracking-wide text-ink-muted">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2">Statuses</th>
                      <th className="px-3 py-2">Sectors</th>
                      <th className="px-3 py-2">Regions</th>
                      <th className="px-3 py-2">Manual picks</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {audiences.map((a) => (
                      <tr
                        key={a.id}
                        className="border-t border-border hover:bg-surface-raised/60"
                      >
                        <td className="px-3 py-2 font-medium">{a.name}</td>
                        <td className="px-3 py-2 text-ink-muted">
                          {a.description || '—'}
                        </td>
                        <td className="px-3 py-2">
                          {(a.filter.statuses || []).join(', ') || 'all'}
                        </td>
                        <td className="px-3 py-2">
                          {(a.filter.sectors || []).join(', ') || 'all'}
                        </td>
                        <td className="px-3 py-2">
                          {(a.filter.regions || []).join(', ') || 'all'}
                        </td>
                        <td className="px-3 py-2">
                          {a.filter.contactIds?.length || 0}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-sm text-ink hover:underline"
                              onClick={() => editAudience(a)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-sm text-red-700 hover:underline"
                              onClick={() => setDeleteAudienceId(a.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {audiences.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-3 py-8 text-center text-ink-muted"
                        >
                          No audiences yet. Create one to use in campaigns.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {audienceEditor && (
            <div className="space-y-4 rounded-lg border border-border bg-surface p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-ink">
                  {audienceEditor.id ? 'Edit audience' : 'New audience'}
                </h3>
                <button
                  type="button"
                  onClick={() => setAudienceEditor(null)}
                  className="rounded p-1 text-ink-muted hover:bg-surface-raised"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-ink-muted">Audience name</span>
                  <input
                    value={audienceEditor.name}
                    onChange={(e) =>
                      setAudienceEditor({
                        ...audienceEditor,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-border px-3 py-2"
                    placeholder="e.g. NZ prospects — construction"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-ink-muted">Description</span>
                  <input
                    value={audienceEditor.description}
                    onChange={(e) =>
                      setAudienceEditor({
                        ...audienceEditor,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  />
                </label>
              </div>

              <div className="space-y-3 rounded-md border border-border p-4">
                <p className="text-sm font-medium text-ink">Filters</p>
                <div className="flex flex-wrap gap-4">
                  {MAILING_CONTACT_STATUSES.map((s) => {
                    const checked =
                      audienceEditor.filter.statuses?.includes(s) ?? false
                    return (
                      <label key={s} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const current = new Set(
                              audienceEditor.filter.statuses || []
                            )
                            if (e.target.checked) current.add(s)
                            else current.delete(s)
                            setAudienceEditor({
                              ...audienceEditor,
                              filter: {
                                ...audienceEditor.filter,
                                statuses: [...current],
                              },
                            })
                          }}
                        />
                        {s}
                      </label>
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-4">
                  <span className="text-sm text-ink-muted">Regions</span>
                  {MAILING_REGIONS.map((r) => {
                    const checked =
                      audienceEditor.filter.regions?.includes(r) ?? false
                    return (
                      <label key={r} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const current = new Set(
                              audienceEditor.filter.regions || []
                            )
                            if (e.target.checked) current.add(r)
                            else current.delete(r)
                            setAudienceEditor({
                              ...audienceEditor,
                              filter: {
                                ...audienceEditor.filter,
                                regions: [...current],
                              },
                            })
                          }}
                        />
                        {r}
                      </label>
                    )
                  })}
                  <span className="text-xs text-ink-muted">
                    (none checked = all regions)
                  </span>
                </div>

                <label className="block text-sm">
                  <span className="text-ink-muted">
                    Sectors (comma-separated; blank = all)
                  </span>
                  <input
                    value={(audienceEditor.filter.sectors || []).join(', ')}
                    onChange={(e) =>
                      setAudienceEditor({
                        ...audienceEditor,
                        filter: {
                          ...audienceEditor.filter,
                          sectors: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-border px-3 py-2"
                    placeholder={sectors.slice(0, 5).join(', ')}
                  />
                </label>

                <label className="block text-sm">
                  <span className="text-ink-muted">
                    Exclude contacts who already received campaign
                  </span>
                  <select
                    value={
                      audienceEditor.filter.excludeCampaignTags?.[0] || ''
                    }
                    onChange={(e) =>
                      setAudienceEditor({
                        ...audienceEditor,
                        filter: {
                          ...audienceEditor.filter,
                          excludeCampaignTags: e.target.value
                            ? [e.target.value]
                            : [],
                        },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  >
                    <option value="">None</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <p className="mb-1 text-sm text-ink-muted">
                    Manual selection (optional — narrows to checked contacts)
                  </p>
                  <div className="max-h-40 overflow-y-auto rounded border border-border p-2 text-sm">
                    {contacts.slice(0, 200).map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={audienceManualIds.includes(c.id)}
                          onChange={(e) => {
                            setAudienceManualIds((prev) =>
                              e.target.checked
                                ? [...prev, c.id]
                                : prev.filter((id) => id !== c.id)
                            )
                          }}
                        />
                        <span>
                          {c.name || c.contact} — {c.email}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void previewSavedAudienceFilter()}
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-sm hover:bg-surface-raised"
                  >
                    Preview matches
                  </button>
                  {audiencePreview && (
                    <span className="text-sm text-ink-muted">
                      {audiencePreview.count} contact
                      {audiencePreview.count === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void saveAudience()}
                  className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"
                >
                  Save audience
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {!campaignEditor && !selectedCampaign && (
            <>
              <button
                type="button"
                onClick={startNewCampaign}
                className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                <Plus className="h-4 w-4" />
                New campaign
              </button>
              {audiences.length === 0 && (
                <p className="text-sm text-amber-800">
                  Create an audience first under the Audiences tab.
                </p>
              )}
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-surface-raised text-xs uppercase tracking-wide text-ink-muted">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Audience</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Sent</th>
                      <th className="px-3 py-2">Opened</th>
                      <th className="px-3 py-2">Clicked</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr
                        key={c.id}
                        className="border-t border-border hover:bg-surface-raised/60"
                      >
                        <td className="px-3 py-2 font-medium">{c.name}</td>
                        <td className="px-3 py-2">{c.subject}</td>
                        <td className="px-3 py-2">
                          {c.audienceName ||
                            audiences.find((a) => a.id === c.audienceId)
                              ?.name ||
                            '—'}
                        </td>
                        <td className="px-3 py-2 capitalize">{c.status}</td>
                        <td className="px-3 py-2">
                          {c.stats.accepted}/{c.stats.targeted}
                        </td>
                        <td className="px-3 py-2">{c.stats.opened}</td>
                        <td className="px-3 py-2">{c.stats.clicked}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-sm text-brand hover:underline"
                              onClick={() => void openCampaignAnalytics(c)}
                            >
                              Analytics
                            </button>
                            {c.status === 'draft' && (
                              <button
                                type="button"
                                className="text-sm text-ink hover:underline"
                                onClick={() => editCampaign(c)}
                              >
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              className="text-sm text-red-700 hover:underline"
                              onClick={() => setDeleteCampaignId(c.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {campaigns.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-3 py-8 text-center text-ink-muted"
                        >
                          No campaigns yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {campaignEditor && (
            <div className="space-y-4 rounded-lg border border-border bg-surface p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-ink">
                  {campaignEditor.id ? 'Edit campaign' : 'New campaign'}
                </h3>
                <button
                  type="button"
                  onClick={() => setCampaignEditor(null)}
                  className="rounded p-1 text-ink-muted hover:bg-surface-raised"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-ink-muted">Campaign name</span>
                  <input
                    value={campaignEditor.name}
                    onChange={(e) =>
                      setCampaignEditor({
                        ...campaignEditor,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-ink-muted">Subject</span>
                  <input
                    value={campaignEditor.subject}
                    onChange={(e) =>
                      setCampaignEditor({
                        ...campaignEditor,
                        subject: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  />
                </label>
              </div>

              <div>
                <p className="mb-1 text-sm text-ink-muted">
                  Email body (WYSIWYG). Merge tags:{' '}
                  <code className="text-xs">{'{{name}}'}</code>,{' '}
                  <code className="text-xs">{'{{company}}'}</code>,{' '}
                  <code className="text-xs">{'{{email}}'}</code>
                </p>
                <EmailHtmlEditor
                  value={campaignEditor.htmlBody}
                  onChange={(html) =>
                    setCampaignEditor({ ...campaignEditor, htmlBody: html })
                  }
                />
              </div>

              <div className="space-y-3 rounded-md border border-border p-4">
                <p className="text-sm font-medium text-ink">Audience</p>
                <label className="block text-sm">
                  <span className="text-ink-muted">
                    Saved audience (create/edit under Audiences)
                  </span>
                  <select
                    value={campaignEditor.audienceId}
                    onChange={(e) => {
                      const audienceId = e.target.value
                      setCampaignEditor({
                        ...campaignEditor,
                        audienceId,
                      })
                      void previewCampaignAudience(audienceId)
                    }}
                    className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  >
                    <option value="">Select audience…</option>
                    {audiences.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void previewCampaignAudience(campaignEditor.audienceId)
                    }
                    disabled={!campaignEditor.audienceId}
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-sm hover:bg-surface-raised disabled:opacity-50"
                  >
                    Preview recipient count
                  </button>
                  {campaignAudiencePreview && (
                    <span className="text-sm text-ink-muted">
                      {campaignAudiencePreview.count} recipient
                      {campaignAudiencePreview.count === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void saveCampaign()}
                  className="rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-surface-raised"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => {
                    if (!campaignEditor?.id) {
                      setError('Save the campaign before sending.')
                      return
                    }
                    setSendConfirmOpen(true)
                  }}
                  className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                >
                  {sending ? 'Sending…' : 'Send now'}
                </button>
              </div>
            </div>
          )}

          {selectedCampaign && (
            <div className="space-y-4 rounded-lg border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    {selectedCampaign.name}
                  </h3>
                  <p className="text-sm text-ink-muted">
                    {selectedCampaign.subject}
                    {selectedCampaign.audienceName
                      ? ` · Audience: ${selectedCampaign.audienceName}`
                      : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  className="rounded p-1 text-ink-muted hover:bg-surface-raised"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(
                  [
                    ['Targeted', selectedCampaign.stats.targeted],
                    ['Accepted', selectedCampaign.stats.accepted],
                    ['Opened', selectedCampaign.stats.opened],
                    ['Clicked', selectedCampaign.stats.clicked],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-border px-3 py-2"
                  >
                    <p className="text-xs uppercase tracking-wide text-ink-muted">
                      {label}
                    </p>
                    <p className="text-xl font-semibold text-ink">{value}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase text-ink-muted">
                    <tr>
                      <th className="px-2 py-1">Email</th>
                      <th className="px-2 py-1">Status</th>
                      <th className="px-2 py-1">Opened</th>
                      <th className="px-2 py-1">Clicked</th>
                      <th className="px-2 py-1">URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignSends.map((s) => (
                      <tr key={s.id} className="border-t border-border">
                        <td className="px-2 py-1.5">{s.email}</td>
                        <td className="px-2 py-1.5">{s.status}</td>
                        <td className="px-2 py-1.5">
                          {formatWhen(s.openedAt)}
                        </td>
                        <td className="px-2 py-1.5">
                          {formatWhen(s.clickedAt)}
                        </td>
                        <td className="max-w-[200px] truncate px-2 py-1.5 text-xs">
                          {s.lastClickUrl || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {showContactForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-ink">
                {editingId ? 'Edit contact' : 'Add contact'}
              </h3>
              <button
                type="button"
                onClick={() => setShowContactForm(false)}
                className="rounded p-1 hover:bg-surface-raised"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3">
              {(
                [
                  ['contact', 'Contact'],
                  ['name', 'Name'],
                  ['email', 'Email'],
                  ['company', 'Company'],
                  ['sector', 'Sector'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-sm">
                  <span className="text-ink-muted">{label}</span>
                  <input
                    value={contactForm[key]}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, [key]: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  />
                </label>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="text-ink-muted">Status</span>
                  <select
                    value={contactForm.status}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        status: e.target.value as MailingContactStatus,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  >
                    {MAILING_CONTACT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-ink-muted">Region</span>
                  <select
                    value={contactForm.region}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        region: e.target.value as MailingRegion,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  >
                    {MAILING_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowContactForm(false)}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveContact()}
                className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedContact && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-ink">
                  {selectedContact.contact || selectedContact.name}
                </h3>
                <p className="text-sm text-ink-muted">{selectedContact.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="rounded p-1 hover:bg-surface-raised"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-ink-muted">Company</dt>
                <dd>{selectedContact.company || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Sector</dt>
                <dd>{selectedContact.sector || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Status</dt>
                <dd className="capitalize">{selectedContact.status}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Region</dt>
                <dd>{selectedContact.region}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Source</dt>
                <dd>{selectedContact.source}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Engagement</dt>
                <dd>
                  {selectedContact.hasOpened ? 'Opened' : 'No opens'}
                  {' · '}
                  {selectedContact.hasClicked ? 'Clicked' : 'No clicks'}
                  {selectedContact.unsubscribed ? ' · Unsubscribed' : ''}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-sm"
                onClick={() => {
                  setEditingId(selectedContact.id)
                  setContactForm({
                    contact: selectedContact.contact,
                    name: selectedContact.name,
                    email: selectedContact.email,
                    company: selectedContact.company,
                    sector: selectedContact.sector,
                    status: selectedContact.status,
                    region: selectedContact.region,
                    notes: selectedContact.notes,
                  })
                  setSelectedContact(null)
                  setShowContactForm(true)
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-sm"
                onClick={async () => {
                  const next =
                    selectedContact.status === 'client' ? 'prospect' : 'client'
                  await fetch('/api/admin/mailings/contacts', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: selectedContact.id,
                      status: next,
                    }),
                  })
                  setMessage(`Marked as ${next}.`)
                  setSelectedContact(null)
                  await loadContacts()
                }}
              >
                Mark as{' '}
                {selectedContact.status === 'client' ? 'prospect' : 'client'}
              </button>
              {!selectedContact.unsubscribed && (
                <button
                  type="button"
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-red-700"
                  onClick={async () => {
                    await fetch('/api/admin/mailings/contacts', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: selectedContact.id,
                        unsubscribed: true,
                      }),
                    })
                    setMessage('Contact unsubscribed.')
                    setSelectedContact(null)
                    await loadContacts()
                  }}
                >
                  Unsubscribe
                </button>
              )}
            </div>

            <h4 className="mt-6 text-sm font-semibold text-ink">
              Outbound activity
            </h4>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-ink-muted">
                  <tr>
                    <th className="px-2 py-1">Campaign</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Opened</th>
                    <th className="px-2 py-1">Clicked</th>
                  </tr>
                </thead>
                <tbody>
                  {contactSends.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-2 py-1.5">
                        {campaignNameById.get(s.campaignId) || s.campaignId}
                      </td>
                      <td className="px-2 py-1.5">{s.status}</td>
                      <td className="px-2 py-1.5">{formatWhen(s.openedAt)}</td>
                      <td className="px-2 py-1.5">{formatWhen(s.clickedAt)}</td>
                    </tr>
                  ))}
                  {contactSends.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-2 py-4 text-ink-muted"
                      >
                        No outbound sends yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <AdminDialog
        open={Boolean(deleteContactId)}
        title="Delete contact?"
        tone="danger"
        confirmLabel="Delete"
        onClose={() => setDeleteContactId(null)}
        onConfirm={async () => {
          if (!deleteContactId) return
          await fetch(
            `/api/admin/mailings/contacts?id=${encodeURIComponent(deleteContactId)}`,
            { method: 'DELETE' }
          )
          setDeleteContactId(null)
          setMessage('Contact deleted.')
          await loadContacts()
        }}
      >
        <p className="text-sm text-ink-muted">
          This removes the contact from the mailing database. Past send logs are
          kept.
        </p>
      </AdminDialog>

      <AdminDialog
        open={Boolean(deleteAudienceId)}
        title="Delete audience?"
        tone="danger"
        confirmLabel="Delete"
        onClose={() => setDeleteAudienceId(null)}
        onConfirm={async () => {
          if (!deleteAudienceId) return
          await fetch(
            `/api/admin/mailings/audiences?id=${encodeURIComponent(deleteAudienceId)}`,
            { method: 'DELETE' }
          )
          setDeleteAudienceId(null)
          setMessage('Audience deleted.')
          await loadAudiences()
        }}
      >
        <p className="text-sm text-ink-muted">
          Campaigns that already reference this audience will need a new audience
          selected before they can be sent.
        </p>
      </AdminDialog>

      <AdminDialog
        open={sendConfirmOpen}
        title="Send this campaign now?"
        confirmLabel="Send now"
        busy={sending}
        onClose={() => {
          if (!sending) setSendConfirmOpen(false)
        }}
        onConfirm={() => void sendCampaign()}
      >
        <p>
          Send this campaign now to the current audience? This cannot be undone.
        </p>
      </AdminDialog>

      <AdminDialog
        open={Boolean(deleteCampaignId)}
        title="Delete campaign?"
        tone="danger"
        confirmLabel="Delete"
        onClose={() => setDeleteCampaignId(null)}
        onConfirm={async () => {
          if (!deleteCampaignId) return
          await fetch(
            `/api/admin/mailings/campaigns?id=${encodeURIComponent(deleteCampaignId)}`,
            { method: 'DELETE' }
          )
          setDeleteCampaignId(null)
          setMessage('Campaign deleted.')
          await loadCampaigns()
        }}
      >
        <p className="text-sm text-ink-muted">
          Delete this campaign definition. Recipient tags on contacts remain.
        </p>
      </AdminDialog>
    </div>
  )
}
