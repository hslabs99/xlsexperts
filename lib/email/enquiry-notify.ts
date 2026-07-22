import 'server-only'

import {
  DEFAULT_STANDARD_TEMPLATE,
  defaultRecipientsForKind,
  escapeHtml,
  renderEmailTemplate,
  type EmailTemplate,
  type EmailTemplateKind,
  type EmailTemplateRecipients,
  type EnquiryMergeContext,
  type RecipientParty,
} from '@/lib/email-templates'
import { getDiscoveryClientPresentationTemplate } from '@/lib/email-presentation-templates'
import { fetchActiveEmailTemplate } from '@/lib/email-templates-db'
import { sendEmail } from '@/lib/email/sendgrid'
import { withTimeout } from '@/lib/with-timeout'
import type { BookingPayload, ContactPayload } from '@/lib/types'

function concernsHtml(services: string[] | undefined): string {
  if (!services || services.length === 0) {
    return '<p style="margin:0;font-style:italic;color:#6b7280;">None selected</p>'
  }
  const items = services
    .map(
      (s) =>
        `<li style="margin:0 0 4px 0;padding:0;color:#374151;">${escapeHtml(s.trim())}</li>`
    )
    .join('')
  return `<ul style="margin:0;padding:0 0 0 18px;">${items}</ul>`
}

/** YYYY-MM-DD → e.g. 21 July 2026 (safe fallback to original). */
export function formatDisplayDate(raw: string): string {
  const value = raw.trim()
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return value
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  const dt = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(dt.getTime())) return value
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dt)
}

function concernsPlain(services: string[] | undefined): string {
  if (!services || services.length === 0) return 'None selected'
  return services.map((s) => s.trim()).filter(Boolean).join(', ')
}

/** Our inbox / authenticated sender used as the "business" party */
export function getBusinessEmail(): string | null {
  return (
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    process.env.SENDGRID_FROM_EMAIL?.trim() ||
    null
  )
}

export function buildStandardMergeContext(
  payload: ContactPayload
): EnquiryMergeContext {
  const from =
    process.env.SENDGRID_FROM_NAME?.trim() ||
    process.env.SENDGRID_FROM_EMAIL?.trim() ||
    'XLS Experts'

  return {
    from,
    name: payload.name?.trim() || '',
    email: payload.email?.trim() || '',
    phone: payload.phone?.trim() || 'Not provided',
    company: payload.company?.trim() || 'Not provided',
    about: payload.message?.trim() || '',
    hear: payload.hear?.trim() || 'Not provided',
    concernsPlain: concernsPlain(payload.services),
    concernsHtml: concernsHtml(payload.services),
    service: payload.service?.trim() || 'Not selected',
    solution: payload.solution?.trim() || 'Not selected',
    enquiryType: 'Standard enquiry',
    when: '',
    method: '',
    day: '',
    date: '',
    time: '',
  }
}

export function buildDiscoveryMergeContext(
  payload: BookingPayload
): EnquiryMergeContext {
  const base = buildStandardMergeContext(payload)
  const day = payload.day?.trim() || ''
  const dateRaw = payload.date?.trim() || ''
  const date = formatDisplayDate(dateRaw)
  const time = payload.time?.trim() || ''
  const when = [day, date, time].filter(Boolean).join(' · ')

  return {
    ...base,
    about: payload.message?.trim() || 'No additional details provided.',
    enquiryType: `Discovery request${payload.method ? ` (${payload.method})` : ''}`,
    when,
    method: payload.method?.trim() || '',
    day,
    date,
    time,
  }
}

async function fallbackTemplate(kind: EmailTemplateKind): Promise<
  Pick<
    EmailTemplate,
    | 'kind'
    | 'name'
    | 'subject'
    | 'htmlBody'
    | 'textBody'
    | 'recipients'
    | 'bodyFontFamily'
    | 'bodyFontSize'
  >
> {
  if (kind === 'discovery') {
    return getDiscoveryClientPresentationTemplate()
  }
  const base = DEFAULT_STANDARD_TEMPLATE
  return {
    kind: base.kind,
    name: base.name,
    subject: base.subject,
    htmlBody: base.htmlBody,
    textBody: base.textBody ?? '',
    recipients: base.recipients ?? defaultRecipientsForKind(kind),
    bodyFontFamily: base.bodyFontFamily ?? 'Verdana, Geneva, sans-serif',
    bodyFontSize: base.bodyFontSize ?? '10pt',
  }
}

function parseExtraEmails(raw: string): string[] {
  return raw
    .split(/[,;]+/)
    .map((e) => e.trim())
    .filter(Boolean)
}

function partyAddress(
  party: RecipientParty,
  clientEmail: string,
  businessEmail: string
): string {
  return party === 'client' ? clientEmail : businessEmail
}

function uniqueEmails(list: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const email of list) {
    const key = email.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(email)
  }
  return out
}

export type ResolvedRecipients = {
  to: string
  cc: string[]
  bcc: string[]
  replyTo: string
}

/**
 * Resolve template To/Cc/Bcc parties to real addresses.
 * - client  → enquirer email from the form
 * - business → CONTACT_NOTIFY_EMAIL or SENDGRID_FROM_EMAIL
 */
export function resolveTemplateRecipients(
  recipients: EmailTemplateRecipients,
  clientEmail: string,
  businessEmail: string
): ResolvedRecipients {
  const to = partyAddress(recipients.to, clientEmail, businessEmail)

  const cc = uniqueEmails([
    ...recipients.cc.map((p) => partyAddress(p, clientEmail, businessEmail)),
    ...parseExtraEmails(recipients.ccExtra),
  ]).filter((e) => e.toLowerCase() !== to.toLowerCase())

  const bcc = uniqueEmails([
    ...recipients.bcc.map((p) => partyAddress(p, clientEmail, businessEmail)),
    ...parseExtraEmails(recipients.bccExtra),
  ]).filter(
    (e) =>
      e.toLowerCase() !== to.toLowerCase() &&
      !cc.some((c) => c.toLowerCase() === e.toLowerCase())
  )

  // When the client is the primary recipient, replies should come back to us.
  const replyTo =
    recipients.to === 'client' ? businessEmail : clientEmail

  return { to, cc, bcc, replyTo }
}

export async function loadEnquiryTemplate(
  kind: EmailTemplateKind
): Promise<
  Pick<
    EmailTemplate,
    | 'name'
    | 'subject'
    | 'htmlBody'
    | 'textBody'
    | 'recipients'
    | 'bodyFontFamily'
    | 'bodyFontSize'
  >
> {
  // Discovery confirmations are always the branded presentation email.
  if (kind === 'discovery') {
    return getDiscoveryClientPresentationTemplate()
  }
  const stored = await withTimeout(
    fetchActiveEmailTemplate(kind),
    6_000,
    `fetchActiveEmailTemplate(${kind})`
  ).catch((error) => {
    console.error(
      '[email] Template load failed; using built-in fallback',
      error instanceof Error ? error.message : undefined
    )
    return null
  })
  return stored ?? (await fallbackTemplate(kind))
}

/**
 * Load active Firestore template (or built-in default) and render merge tags.
 */
export async function renderEnquiryNotification(
  kind: EmailTemplateKind,
  ctx: EnquiryMergeContext
): Promise<{
  subject: string
  html: string
  text: string
  templateName: string
  recipients: EmailTemplateRecipients
}> {
  const template = await loadEnquiryTemplate(kind)
  const rendered = renderEmailTemplate(template, ctx)

  return {
    ...rendered,
    templateName: template.name,
    recipients: template.recipients,
  }
}

export async function sendEnquiryNotificationEmail(options: {
  kind: EmailTemplateKind
  ctx: EnquiryMergeContext
  category: string
  referenceId?: string
}): Promise<{ accepted: boolean; statusCode?: number; messageId?: string }> {
  const businessEmail = getBusinessEmail()
  const clientEmail = options.ctx.email?.trim()
  if (!businessEmail) {
    throw new Error('No CONTACT_NOTIFY_EMAIL or SENDGRID_FROM_EMAIL configured')
  }
  if (!clientEmail) {
    throw new Error('Client email is required to send enquiry mail')
  }

  const template = await loadEnquiryTemplate(options.kind)
  const rendered = renderEmailTemplate(template, options.ctx)
  const resolved = resolveTemplateRecipients(
    template.recipients,
    clientEmail,
    businessEmail
  )

  return sendEmail({
    to: resolved.to,
    cc: resolved.cc.length > 0 ? resolved.cc : undefined,
    bcc: resolved.bcc.length > 0 ? resolved.bcc : undefined,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
    replyTo: resolved.replyTo,
    category: options.category,
    referenceId: options.referenceId,
  })
}
