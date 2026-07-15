/**
 * Email template model, merge tags, and rendering helpers.
 * Safe for client + server (no secrets).
 */

export const EMAIL_TEMPLATE_KINDS = ['standard', 'discovery'] as const
export type EmailTemplateKind = (typeof EMAIL_TEMPLATE_KINDS)[number]

/** Who a recipient field resolves to at send time */
export const RECIPIENT_PARTIES = ['client', 'business'] as const
export type RecipientParty = (typeof RECIPIENT_PARTIES)[number]

export type EmailTemplateRecipients = {
  /** Primary To address */
  to: RecipientParty
  /** Zero or more parties to CC */
  cc: RecipientParty[]
  /** Zero or more parties to BCC */
  bcc: RecipientParty[]
  /** Extra fixed CC addresses (comma/semicolon separated) */
  ccExtra: string
  /** Extra fixed BCC addresses (comma/semicolon separated) */
  bccExtra: string
}

export const EMAIL_FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
  { label: 'Calibri', value: 'Calibri, Candara, Segoe, sans-serif' },
] as const

/**
 * Email font sizes in **points (pt)** — the unit Outlook / Word uses.
 *
 * CSS `px` is not the same as Outlook's size dropdown:
 *   12px ≈ Outlook 9pt   (too small)
 *   10pt = Outlook “10”  (what you want)
 *
 * Always prefer pt for SendGrid / Outlook HTML.
 */
export const EMAIL_FONT_SIZES = [
  { label: '8 (Outlook)', value: '8pt' },
  { label: '9 (Outlook)', value: '9pt' },
  { label: '10 (Outlook)', value: '10pt' },
  { label: '11 (Outlook)', value: '11pt' },
  { label: '12 (Outlook)', value: '12pt' },
  { label: '14 (Outlook)', value: '14pt' },
  { label: '16 (Outlook)', value: '16pt' },
  { label: '18 (Outlook)', value: '18pt' },
  { label: '20 (Outlook)', value: '20pt' },
  { label: '24 (Outlook)', value: '24pt' },
] as const

/** Default body size = Outlook “Verdana 10”. */
export const DEFAULT_EMAIL_BODY_FONT_SIZE = '10pt'
export const DEFAULT_EMAIL_BODY_FONT_FAMILY = 'Verdana, Geneva, sans-serif'

/**
 * Coerce legacy CSS px values to Outlook-aligned pt.
 * px→pt at 96dpi: pt = px * 0.75 (so 12px → 9pt).
 */
export function normalizeEmailFontSize(raw: string | undefined | null): string {
  const value = (raw ?? '').trim()
  if (!value) return DEFAULT_EMAIL_BODY_FONT_SIZE

  if (/^\d+(\.\d+)?pt$/i.test(value)) {
    return value.toLowerCase()
  }

  const pxMatch = value.match(/^(\d+(?:\.\d+)?)px$/i)
  if (pxMatch) {
    const px = Number(pxMatch[1])
    const pt = Math.round(px * 0.75)
    return `${pt}pt`
  }

  // Bare number — treat as Outlook point size
  if (/^\d+(\.\d+)?$/.test(value)) {
    return `${value}pt`
  }

  return value
}

export type EmailTemplate = {
  id: string
  kind: EmailTemplateKind
  name: string
  subject: string
  /** HTML body with merge tags like <name>, <concerns>, <Enquiry Type> */
  htmlBody: string
  /** Optional plain-text override; if empty, derived from HTML */
  textBody: string
  recipients: EmailTemplateRecipients
  /** Default font applied as a wrapper around the HTML body */
  bodyFontFamily: string
  bodyFontSize: string
  active: boolean
  updatedAt: unknown
  createdAt: unknown
}

export type EmailTemplateInput = {
  kind: EmailTemplateKind
  name: string
  subject: string
  htmlBody: string
  textBody?: string
  recipients?: EmailTemplateRecipients
  bodyFontFamily?: string
  bodyFontSize?: string
  active?: boolean
}

export function defaultRecipientsForKind(
  kind: EmailTemplateKind
): EmailTemplateRecipients {
  if (kind === 'standard') {
    // Client confirmation + CC ourselves
    return {
      to: 'client',
      cc: ['business'],
      bcc: [],
      ccExtra: '',
      bccExtra: '',
    }
  }
  // Discovery: polished client confirmation + CC ourselves
  return {
    to: 'client',
    cc: ['business'],
    bcc: [],
    ccExtra: '',
    bccExtra: '',
  }
}

export function normalizeRecipients(
  raw: unknown,
  kind: EmailTemplateKind
): EmailTemplateRecipients {
  const fallback = defaultRecipientsForKind(kind)
  if (!raw || typeof raw !== 'object') return fallback
  const data = raw as Record<string, unknown>
  const to: RecipientParty =
    data.to === 'business' || data.to === 'client' ? data.to : fallback.to

  const asParties = (value: unknown): RecipientParty[] => {
    if (!Array.isArray(value)) return []
    return value.filter(
      (v): v is RecipientParty => v === 'client' || v === 'business'
    )
  }

  return {
    to,
    cc: data.cc !== undefined ? asParties(data.cc) : fallback.cc,
    bcc: data.bcc !== undefined ? asParties(data.bcc) : fallback.bcc,
    ccExtra: typeof data.ccExtra === 'string' ? data.ccExtra : '',
    bccExtra: typeof data.bccExtra === 'string' ? data.bccExtra : '',
  }
}

export type EnquiryMergeContext = {
  from: string
  name: string
  email: string
  phone: string
  company: string
  about: string
  hear: string
  concernsPlain: string
  concernsHtml: string
  enquiryType: string
  when: string
  method: string
  day: string
  date: string
  time: string
}

export type MergeTagDefinition = {
  /** Canonical tag shown in the UI, e.g. <name> */
  tag: string
  /** Aliases matched case-insensitively */
  aliases: string[]
  description: string
  /** Which context field to use for plain / HTML subject & text */
  field: keyof EnquiryMergeContext
  /** Prefer HTML-safe list markup when rendering HTML body */
  htmlField?: keyof EnquiryMergeContext
}

export const MERGE_TAGS: MergeTagDefinition[] = [
  {
    tag: '<from>',
    aliases: ['from', 'from_name', 'sender'],
    description: 'Configured From display name (or business name)',
    field: 'from',
  },
  {
    tag: '<name>',
    aliases: ['name', 'full_name'],
    description: 'Enquirer name',
    field: 'name',
  },
  {
    tag: '<email>',
    aliases: ['email', 'e-mail'],
    description: 'Enquirer email',
    field: 'email',
  },
  {
    tag: '<phone>',
    aliases: ['phone', 'mobile', 'tel'],
    description: 'Enquirer phone',
    field: 'phone',
  },
  {
    tag: '<company>',
    aliases: ['company', 'organisation', 'organization'],
    description: 'Company name',
    field: 'company',
  },
  {
    tag: '<about>',
    aliases: ['about', 'message', 'project'],
    description: 'Free-text message / about the project',
    field: 'about',
  },
  {
    tag: '<concerns>',
    aliases: ['concerns', 'services', 'interests'],
    description: 'Multi-list of selected services / concerns',
    field: 'concernsPlain',
    htmlField: 'concernsHtml',
  },
  {
    tag: '<Enquiry Type>',
    aliases: ['enquiry type', 'enquiry_type', 'type', 'enquirytype'],
    description: 'Standard enquiry or Discovery request (+ booking details summary)',
    field: 'enquiryType',
  },
  {
    tag: '<when>',
    aliases: ['when', 'schedule', 'appointment'],
    description: 'Discovery slot: day, date and time (empty for standard)',
    field: 'when',
  },
  {
    tag: '<method>',
    aliases: ['method', 'meeting_method', 'call_method'],
    description: 'Discovery meeting method (Phone / Teams / etc.)',
    field: 'method',
  },
  {
    tag: '<day>',
    aliases: ['day'],
    description: 'Discovery day label',
    field: 'day',
  },
  {
    tag: '<date>',
    aliases: ['date'],
    description: 'Discovery date (YYYY-MM-DD)',
    field: 'date',
  },
  {
    tag: '<time>',
    aliases: ['time'],
    description: 'Discovery time',
    field: 'time',
  },
  {
    tag: '<hear>',
    aliases: ['hear', 'source', 'how_heard'],
    description: 'How they heard about us',
    field: 'hear',
  },
]

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeTagName(raw: string): string {
  return raw.trim().replace(/[_\s]+/g, ' ').toLowerCase()
}

function resolveTagValue(
  tagName: string,
  ctx: EnquiryMergeContext,
  asHtml: boolean
): string | null {
  const normalized = normalizeTagName(tagName)
  for (const def of MERGE_TAGS) {
    const names = [def.tag.replace(/^<|>$/g, ''), ...def.aliases].map(normalizeTagName)
    if (!names.includes(normalized)) continue
    if (asHtml && def.htmlField) {
      return ctx[def.htmlField]
    }
    const value = ctx[def.field]
    return asHtml ? escapeHtml(value).replace(/\n/g, '<br />') : value
  }
  return null
}

/**
 * Replace known merge tags only (`<name>`, `{{name}}`, etc.).
 * Does not touch real HTML elements like <p>, <strong>, <br>.
 */
export function applyMergeTags(
  template: string,
  ctx: EnquiryMergeContext,
  options?: { html?: boolean }
): string {
  const asHtml = Boolean(options?.html)

  const known = new Set<string>()
  for (const def of MERGE_TAGS) {
    known.add(normalizeTagName(def.tag.replace(/^<|>$/g, '')))
    for (const a of def.aliases) known.add(normalizeTagName(a))
  }

  const replaceIfKnown = (full: string, name: string): string => {
    if (!known.has(normalizeTagName(name))) return full
    const value = resolveTagValue(name, ctx, asHtml)
    return value === null ? full : value
  }

  return template
    .replace(/\{\{\s*([^}]+?)\s*\}\}/g, replaceIfKnown)
    .replace(/<\s*([a-zA-Z][a-zA-Z0-9 _-]*)\s*>/g, replaceIfKnown)
}

/**
 * Compact TipTap/HTML for email clients.
 * Preserves blank lines the editor creates with Enter, but keeps paragraph
 * spacing tight so Outlook doesn't show huge gaps.
 */
export function normalizeEmailHtml(html: string): string {
  let out = html

  // TipTap blank lines arrive as empty <p></p> / <p><br></p> / &nbsp;.
  // Keep them as an explicit soft blank line — do NOT delete (that strips
  // carriage returns / break lines the user entered).
  out = out.replace(
    /<p(?:\s[^>]*)?>(?:\s|&nbsp;|<br\s*\/?>|\u00a0)*<\/p>/gi,
    '<p><br></p>'
  )

  // Cap runaway blank lines (e.g. 5× Enter) at two
  out = out.replace(
    /(?:<p(?:\s[^>]*)?>\s*<br\s*\/?>\s*<\/p>\s*){3,}/gi,
    '<p><br></p><p><br></p>'
  )

  // Trailing/leading whitespace-only text inside non-empty paragraphs
  out = out.replace(/(<p(?:\s[^>]*)?>)\s+/gi, '$1')
  out = out.replace(/\s+(<\/p>)/gi, '$1')

  const withMargin = (
    tag: string,
    margin: string,
    attrs: string | undefined
  ): string => {
    const a = attrs ?? ''
    if (/style\s*=/i.test(a)) {
      if (/margin\s*:/i.test(a)) {
        return `<${tag}${a}>`
      }
      return `<${tag}${a.replace(
        /style\s*=\s*(["'])(.*?)\1/i,
        (_m, q: string, style: string) =>
          `style=${q}margin:${margin};padding:0;${style}${q}`
      )}>`
    }
    return `<${tag}${a} style="margin:${margin};padding:0;">`
  }

  out = out.replace(/<p(\s[^>]*)?>/gi, (_m, attrs?: string) =>
    withMargin('p', '0 0 6px 0', attrs)
  )
  out = out.replace(/<h([1-3])(\s[^>]*)?>/gi, (_m, level: string, attrs?: string) =>
    withMargin(`h${level}`, '12px 0 6px 0', attrs)
  )
  out = out.replace(/<(ul|ol)(\s[^>]*)?>/gi, (_m, tag: string, attrs?: string) =>
    withMargin(tag, '4px 0 8px 0', attrs)
  )
  out = out.replace(/<li(\s[^>]*)?>/gi, (_m, attrs?: string) =>
    withMargin('li', '0 0 2px 0', attrs)
  )

  // Soft line-breaks shouldn't leave large gaps either
  out = out.replace(/(?:<br\s*\/?>\s*){3,}/gi, '<br /><br />')

  // Convert inline CSS px font sizes to Outlook-aligned pt (12px → 9pt)
  out = out.replace(
    /font-size\s*:\s*(\d+(?:\.\d+)?)px/gi,
    (_m, px: string) => `font-size:${Math.round(Number(px) * 0.75)}pt`
  )

  return out
}

export function renderEmailTemplate(
  template: Pick<
    EmailTemplate,
    'subject' | 'htmlBody' | 'textBody' | 'bodyFontFamily' | 'bodyFontSize'
  >,
  ctx: EnquiryMergeContext
): { subject: string; html: string; text: string } {
  const subject = applyMergeTags(template.subject, ctx, { html: false })
  let html = applyMergeTags(template.htmlBody, ctx, { html: true })
  html = normalizeEmailHtml(html)
  const fontFamily =
    template.bodyFontFamily?.trim() || DEFAULT_EMAIL_BODY_FONT_FAMILY
  const fontSize = normalizeEmailFontSize(template.bodyFontSize)
  html = `<div style="font-family:${fontFamily};font-size:${fontSize};line-height:1.45;color:#222;">${html}</div>`

  const textSource =
    template.textBody?.trim() || htmlToPlainText(template.htmlBody)
  const text = applyMergeTags(textSource, ctx, { html: false })
  return { subject, html, text }
}

export const DEFAULT_STANDARD_TEMPLATE: Omit<EmailTemplateInput, 'active'> = {
  kind: 'standard',
  name: 'Standard enquiry',
  subject: 'Thanks for contacting {{from}}, {{name}}',
  recipients: defaultRecipientsForKind('standard'),
  bodyFontFamily: DEFAULT_EMAIL_BODY_FONT_FAMILY,
  bodyFontSize: DEFAULT_EMAIL_BODY_FONT_SIZE,
  htmlBody: `
<p>Hi {{name}},</p>
<p>Thanks for getting in touch with <strong>{{from}}</strong>. We have received your enquiry and will reply shortly.</p>
<p><strong>Enquiry type:</strong> {{Enquiry Type}}</p>
<p><strong>Your details</strong><br />
Company: {{company}}<br />
Email: {{email}}<br />
Phone: {{phone}}</p>
<p><strong>What you selected:</strong></p>
{{concerns}}
<p><strong>About your project:</strong></p>
<p>{{about}}</p>
<p>Kind regards,<br />{{from}}</p>
`.trim(),
  textBody: '',
}

/**
 * Fallback shape for discovery. Live bookings ignore Firestore and use
 * `getDiscoveryClientPresentationTemplate()` from email-presentation-templates.
 */
export const DEFAULT_DISCOVERY_TEMPLATE: Omit<EmailTemplateInput, 'active'> = {
  kind: 'discovery',
  name: 'Discovery confirmation (presentation)',
  subject: "You're booked — discovery call {{when}}",
  recipients: defaultRecipientsForKind('discovery'),
  bodyFontFamily: DEFAULT_EMAIL_BODY_FONT_FAMILY,
  bodyFontSize: DEFAULT_EMAIL_BODY_FONT_SIZE,
  htmlBody:
    '<p>Hi {{name}},</p><p>Your discovery call is confirmed for <strong>{{when}}</strong> via {{method}}.</p><p>{{about}}</p>{{concerns}}<p>Kind regards,<br />{{from}}</p>',
  textBody: '',
}
