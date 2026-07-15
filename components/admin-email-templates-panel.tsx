'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { EmailHtmlEditor } from '@/components/email-html-editor'
import {
  createEmailTemplate,
  deleteEmailTemplate,
  fetchEmailTemplates,
  seedDefaultEmailTemplates,
  updateEmailTemplate,
} from '@/lib/email-templates-db'
import {
  DEFAULT_EMAIL_BODY_FONT_FAMILY,
  DEFAULT_EMAIL_BODY_FONT_SIZE,
  EMAIL_FONT_FAMILIES,
  EMAIL_FONT_SIZES,
  MERGE_TAGS,
  applyMergeTags,
  defaultRecipientsForKind,
  normalizeEmailFontSize,
  normalizeEmailHtml,
  type EmailTemplate,
  type EmailTemplateInput,
  type EmailTemplateKind,
  type EmailTemplateRecipients,
  type EnquiryMergeContext,
  type RecipientParty,
} from '@/lib/email-templates'
import {
  EMAIL_INSERT_BLOCKS,
  type EmailInsertBlock,
} from '@/lib/email-insert-blocks'

const SAMPLE_CTX: EnquiryMergeContext = {
  from: 'XLS Experts',
  name: 'Jane Example',
  email: 'jane@example.com',
  phone: '+64 21 000 0000',
  company: 'Example Ltd',
  about: 'We need help automating monthly Excel reporting.',
  hear: 'Google Search',
  concernsPlain: 'Macros / VBA, Charts & Dashboards',
  concernsHtml: '<ul><li>Macros / VBA</li><li>Charts &amp; Dashboards</li></ul>',
  enquiryType: 'Standard enquiry',
  when: '',
  method: '',
  day: '',
  date: '',
  time: '',
}

const SAMPLE_DISCOVERY_CTX: EnquiryMergeContext = {
  ...SAMPLE_CTX,
  about:
    'We need help automating monthly Excel reporting and a management dashboard for regional sales.',
  enquiryType: 'Discovery request (Microsoft Teams)',
  when: 'Tuesday · 21 July 2026 · 10:00 AM',
  method: 'Microsoft Teams',
  day: 'Tuesday',
  date: '21 July 2026',
  time: '10:00 AM',
}

type TemplateForm = EmailTemplateInput & {
  textBody: string
  recipients: EmailTemplateRecipients
  bodyFontFamily: string
  bodyFontSize: string
  active: boolean
}

function emptyForm(kind: EmailTemplateKind = 'standard'): TemplateForm {
  const recipients = defaultRecipientsForKind(kind)
  return {
    kind,
    name: kind === 'discovery' ? 'Discovery call request' : 'Standard enquiry',
    subject:
      kind === 'discovery'
        ? 'Discovery call — {{name}} on {{when}}'
        : 'Thanks for contacting {{from}}, {{name}}',
    htmlBody:
      kind === 'discovery'
        ? '<p><strong>New discovery call</strong> from {{name}} ({{email}}).</p><p>{{when}} · {{method}}</p><p>{{about}}</p>{{concerns}}'
        : '<p>Hi {{name}},</p><p>Thanks for contacting <strong>{{from}}</strong>. We received your enquiry and will be in touch shortly.</p><p>{{about}}</p><p>Concerns:</p>{{concerns}}<p>Kind regards,<br />{{from}}</p>',
    textBody: '',
    recipients,
    bodyFontFamily: DEFAULT_EMAIL_BODY_FONT_FAMILY,
    bodyFontSize: DEFAULT_EMAIL_BODY_FONT_SIZE,
    active: true,
  }
}

function partyLabel(party: RecipientParty): string {
  return party === 'client' ? 'Client email' : 'Our email (From / notify)'
}

function toggleParty(
  list: RecipientParty[],
  party: RecipientParty,
  checked: boolean
): RecipientParty[] {
  if (checked) {
    return list.includes(party) ? list : [...list, party]
  }
  return list.filter((p) => p !== party)
}

export function AdminEmailTemplatesPanel() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState<TemplateForm>(emptyForm())
  const [showHtmlSource, setShowHtmlSource] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchEmailTemplates()
      setTemplates(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId]
  )

  function startNew(kind: EmailTemplateKind = 'standard') {
    setSelectedId('new')
    setForm(emptyForm(kind))
    setMessage(null)
    setError(null)
  }

  function startEdit(t: EmailTemplate) {
    setSelectedId(t.id)
    setForm({
      kind: t.kind,
      name: t.name,
      subject: t.subject,
      htmlBody: t.htmlBody,
      textBody: t.textBody,
      recipients: t.recipients,
      bodyFontFamily: t.bodyFontFamily,
      bodyFontSize: normalizeEmailFontSize(t.bodyFontSize),
      active: t.active,
    })
    setMessage(null)
    setError(null)
  }

  async function handleSeed() {
    setBusy(true)
    setError(null)
    try {
      const result = await seedDefaultEmailTemplates()
      setMessage(
        `Seeded ${result.created} template(s); skipped ${result.skipped} existing kind(s).`
      )
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Seed failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      if (!form.name.trim() || !form.subject.trim() || !form.htmlBody.trim()) {
        throw new Error('Name, subject and HTML body are required.')
      }
      const payload = {
        ...form,
        htmlBody: normalizeEmailHtml(form.htmlBody),
      }
      if (selectedId === 'new' || !selectedId) {
        const id = await createEmailTemplate(payload)
        setMessage('Template created.')
        await load()
        setSelectedId(id)
        setForm((p) => ({ ...p, htmlBody: payload.htmlBody }))
      } else {
        await updateEmailTemplate(selectedId, payload)
        setMessage('Template saved. Standard enquiries will use these settings when Active.')
        await load()
        setForm((p) => ({ ...p, htmlBody: payload.htmlBody }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!selectedId || selectedId === 'new') return
    if (!window.confirm('Delete this email template?')) return
    setBusy(true)
    setError(null)
    try {
      await deleteEmailTemplate(selectedId)
      setMessage('Template deleted.')
      setSelectedId(null)
      setForm(emptyForm())
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  function insertTag(tag: string) {
    const inner = tag.replace(/^<|>$/g, '')
    const token = `{{${inner}}}`
    setForm((prev) => ({
      ...prev,
      htmlBody: `${prev.htmlBody}${token}`,
    }))
  }

  /** Append a graphical HTML block; open source mode so TipTap won't strip tables. */
  function insertBlock(block: EmailInsertBlock) {
    setShowHtmlSource(true)
    setForm((prev) => {
      const body = prev.htmlBody.trimEnd()
      const sep = body ? '\n\n' : ''
      return {
        ...prev,
        htmlBody: `${body}${sep}${block.html}\n`,
      }
    })
  }

  const previewCtx =
    form.kind === 'discovery' ? SAMPLE_DISCOVERY_CTX : SAMPLE_CTX
  const previewSubject = applyMergeTags(form.subject, previewCtx, { html: false })
  const previewHtml = normalizeEmailHtml(
    applyMergeTags(form.htmlBody, previewCtx, { html: true })
  )
  const previewWrapped = `<div style="font-family:${form.bodyFontFamily};font-size:${normalizeEmailFontSize(form.bodyFontSize)};line-height:1.45;color:#222;">${previewHtml}</div>`

  const [discoveryHtml, setDiscoveryHtml] = useState('')
  const [discoverySubject, setDiscoverySubject] = useState(
    "You're booked — discovery call …"
  )
  const [discoveryPreviewPending, startDiscoveryPreview] = useTransition()

  useEffect(() => {
    startDiscoveryPreview(() => {
      void fetch('/api/admin/discovery-email-preview')
        .then(async (res) => {
          const data = (await res.json()) as {
            ok?: boolean
            subject?: string
            html?: string
            error?: string
          }
          setDiscoverySubject(data.subject || "You're booked — discovery call …")
          setDiscoveryHtml(
            data.html ||
              '<p style="padding:24px;font-family:sans-serif;color:#6b7280;">Could not load discovery preview.</p>'
          )
        })
        .catch(() => {
          setDiscoveryHtml(
            '<p style="padding:24px;font-family:sans-serif;color:#6b7280;">Could not load discovery preview. Publish email thumbs from Admin → Case Studies first.</p>'
          )
        })
    })
  }, [])

  const routingSummary = (() => {
    const to = partyLabel(form.recipients.to)
    const cc = [
      ...form.recipients.cc.map(partyLabel),
      ...(form.recipients.ccExtra
        ? form.recipients.ccExtra.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
        : []),
    ]
    const bcc = [
      ...form.recipients.bcc.map(partyLabel),
      ...(form.recipients.bccExtra
        ? form.recipients.bccExtra.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
        : []),
    ]
    return { to, cc, bcc }
  })()

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Enquiry emails</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Discovery bookings always send the branded presentation email below
              (To = client, Cc = us). Edit that design in code —{' '}
              <code className="text-xs">lib/email-insert-blocks.ts</code> and{' '}
              <code className="text-xs">lib/email-presentation-templates.ts</code>.
              Standard enquiry templates remain editable here.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSeed()}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-raised disabled:opacity-60"
            >
              Seed defaults
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => startNew('standard')}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              New standard template
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-brand/30 bg-brand-light/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-ink">
                Discovery confirmation (live)
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                This is the email clients receive after booking. Subject:{' '}
                <span className="font-medium text-ink">{discoverySubject}</span>
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                Routing: To client · Cc business · Reply-To business. Case-study
                images load from Firebase Storage URLs (Site Content{' '}
                <code className="text-[10px]">email-case-study-thumbs</code>).
                {discoveryPreviewPending ? ' Refreshing preview…' : ''}
              </p>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-md border border-border bg-white">
            <iframe
              title="Discovery confirmation preview"
              sandbox=""
              srcDoc={
                discoveryHtml ||
                '<p style="padding:24px;font-family:sans-serif;color:#6b7280;">Loading discovery preview…</p>'
              }
              className="h-[720px] w-full bg-[#e8ece9]"
            />
          </div>
        </div>

        {(message || error) && (
          <div
            className={`mt-4 rounded-md border p-3 text-sm ${
              error
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-brand/30 bg-brand-light text-brand-dark'
            }`}
            role="status"
          >
            {error || message}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink-muted">
              Templates
            </h3>
            {loading ? (
              <p className="mt-3 text-sm text-ink-muted">Loading…</p>
            ) : templates.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">
                No templates yet. Seed defaults or create one.
              </p>
            ) : (
              <ul className="mt-3 space-y-1">
                {templates.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                        selectedId === t.id
                          ? 'bg-brand-light font-semibold text-brand-dark'
                          : 'hover:bg-surface-raised text-ink'
                      }`}
                    >
                      <span className="block truncate">{t.name}</span>
                      <span className="mt-0.5 block text-xs text-ink-muted">
                        {t.kind}
                        {t.active ? '' : ' · inactive'} · To:{' '}
                        {t.recipients.to}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
            {!selectedId ? (
              <p className="text-sm text-ink-muted">
                Select a template or create a new one.
              </p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-ink">Name</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="rounded-md border border-border px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-ink">Enquiry kind</span>
                    <select
                      value={form.kind}
                      onChange={(e) => {
                        const kind = e.target.value as EmailTemplateKind
                        setForm((p) => ({
                          ...p,
                          kind,
                          recipients: defaultRecipientsForKind(kind),
                        }))
                      }}
                      className="rounded-md border border-border px-3 py-2"
                    >
                      <option value="standard">Standard enquiry</option>
                      <option value="discovery">Discovery request</option>
                    </select>
                  </label>
                </div>

                <div className="rounded-md border border-border bg-surface-raised p-4">
                  <h3 className="text-sm font-semibold text-ink">Recipients</h3>
                  <p className="mt-1 text-xs text-ink-muted">
                    <strong>Client email</strong> = address from the form.&nbsp;
                    <strong>Our email</strong> ={' '}
                    <code className="text-[11px]">CONTACT_NOTIFY_EMAIL</code> or{' '}
                    <code className="text-[11px]">SENDGRID_FROM_EMAIL</code>.
                    From header always uses SendGrid From (env).
                  </p>

                  <label className="mt-4 flex flex-col gap-1 text-sm">
                    <span className="font-medium text-ink">To</span>
                    <select
                      value={form.recipients.to}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          recipients: {
                            ...p.recipients,
                            to: e.target.value as RecipientParty,
                          },
                        }))
                      }
                      className="rounded-md border border-border bg-white px-3 py-2"
                    >
                      <option value="client">Client email</option>
                      <option value="business">Our email</option>
                    </select>
                  </label>

                  <fieldset className="mt-4">
                    <legend className="text-sm font-medium text-ink">Cc</legend>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink">
                      {(['client', 'business'] as RecipientParty[]).map((party) => (
                        <label key={`cc-${party}`} className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.recipients.cc.includes(party)}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                recipients: {
                                  ...p.recipients,
                                  cc: toggleParty(
                                    p.recipients.cc,
                                    party,
                                    e.target.checked
                                  ),
                                },
                              }))
                            }
                          />
                          {partyLabel(party)}
                        </label>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={form.recipients.ccExtra}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          recipients: { ...p.recipients, ccExtra: e.target.value },
                        }))
                      }
                      placeholder="Extra Cc emails (comma-separated)"
                      className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    />
                  </fieldset>

                  <fieldset className="mt-4">
                    <legend className="text-sm font-medium text-ink">Bcc</legend>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink">
                      {(['client', 'business'] as RecipientParty[]).map((party) => (
                        <label key={`bcc-${party}`} className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.recipients.bcc.includes(party)}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                recipients: {
                                  ...p.recipients,
                                  bcc: toggleParty(
                                    p.recipients.bcc,
                                    party,
                                    e.target.checked
                                  ),
                                },
                              }))
                            }
                          />
                          {partyLabel(party)}
                        </label>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={form.recipients.bccExtra}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          recipients: { ...p.recipients, bccExtra: e.target.value },
                        }))
                      }
                      placeholder="Extra Bcc emails (comma-separated)"
                      className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    />
                  </fieldset>

                  <p className="mt-3 text-xs text-ink-muted">
                    Resolved preview: To <strong>{routingSummary.to}</strong>
                    {routingSummary.cc.length
                      ? ` · Cc ${routingSummary.cc.join(', ')}`
                      : ''}
                    {routingSummary.bcc.length
                      ? ` · Bcc ${routingSummary.bcc.join(', ')}`
                      : ''}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-ink">Default body font</span>
                    <select
                      value={form.bodyFontFamily}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, bodyFontFamily: e.target.value }))
                      }
                      className="rounded-md border border-border px-3 py-2"
                    >
                      {EMAIL_FONT_FAMILIES.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-ink">
                      Default body size (Outlook points)
                    </span>
                    <select
                      value={normalizeEmailFontSize(form.bodyFontSize)}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, bodyFontSize: e.target.value }))
                      }
                      className="rounded-md border border-border px-3 py-2"
                    >
                      {EMAIL_FONT_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-ink-muted">
                      Outlook uses <strong>pt</strong>, not px. CSS 12px ≈ Outlook
                      9. Choose <strong>10 (Outlook)</strong> for Verdana 10.
                    </span>
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">Subject</span>
                  <input
                    required
                    value={form.subject}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, subject: e.target.value }))
                    }
                    className="rounded-md border border-border px-3 py-2 font-mono text-xs"
                    placeholder="Thanks for contacting {{from}}, {{name}}"
                  />
                </label>

                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink">HTML body</span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-brand hover:underline"
                      onClick={() => setShowHtmlSource((v) => !v)}
                    >
                      {showHtmlSource ? 'Visual editor' : 'Edit HTML source'}
                    </button>
                  </div>

                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {MERGE_TAGS.map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        title={t.description}
                        onClick={() => insertTag(t.tag)}
                        className="rounded border border-border bg-surface-raised px-2 py-0.5 font-mono text-[11px] text-ink hover:border-brand hover:text-brand"
                      >
                        {t.tag}
                      </button>
                    ))}
                  </div>

                  <div className="mb-2">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Insert block
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {EMAIL_INSERT_BLOCKS.map((block) => (
                        <button
                          key={block.id}
                          type="button"
                          title={block.description}
                          onClick={() => insertBlock(block)}
                          className="rounded border border-brand/40 bg-brand-light px-2.5 py-1 text-[11px] font-semibold text-brand-dark hover:border-brand hover:bg-brand/15"
                        >
                          {block.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11px] text-ink-muted">
                      Opens HTML source so table-based layout is kept. Check the
                      live preview below — vibe-code new blocks in{' '}
                      <code className="text-[10px]">lib/email-insert-blocks.ts</code>.
                    </p>
                  </div>

                  {showHtmlSource ? (
                    <textarea
                      value={form.htmlBody}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, htmlBody: e.target.value }))
                      }
                      rows={14}
                      className="w-full rounded-md border border-border px-3 py-2 font-mono text-xs"
                    />
                  ) : (
                    <EmailHtmlEditor
                      value={form.htmlBody}
                      onChange={(html) =>
                        setForm((p) => ({ ...p, htmlBody: html }))
                      }
                    />
                  )}
                </div>

                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-ink">
                    Plain-text body (optional)
                  </span>
                  <textarea
                    value={form.textBody}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, textBody: e.target.value }))
                    }
                    rows={4}
                    placeholder="Leave blank to auto-derive from HTML"
                    className="rounded-md border border-border px-3 py-2 font-mono text-xs"
                  />
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, active: e.target.checked }))
                    }
                  />
                  Active (used when sending this enquiry kind)
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    {busy ? 'Saving…' : selectedId === 'new' ? 'Create' : 'Save changes'}
                  </button>
                  {selectedId !== 'new' && selected && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleDelete()}
                      className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                </div>

                <div className="rounded-md border border-border bg-surface-raised p-4">
                  <h3 className="text-sm font-semibold text-ink">Live preview</h3>
                  <p className="mt-1 text-xs text-ink-muted">
                    Sample {form.kind} data — tags and default font applied.
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Subject
                  </p>
                  <p className="mt-1 text-sm text-ink">{previewSubject}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    HTML body
                  </p>
                  <div
                    className="mt-2 rounded border border-border bg-white p-3 text-sm text-ink"
                    dangerouslySetInnerHTML={{ __html: previewWrapped }}
                  />
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
