import 'server-only'

import sgMail from '@sendgrid/mail'
import type { MailDataRequired } from '@sendgrid/mail'
import {
  EmailConfigError,
  EmailSendError,
  EmailValidationError,
  type SendGridErrorItem,
} from '@/lib/email/errors'
import type {
  SendEmailAttachment,
  SendEmailInput,
  SendEmailResult,
} from '@/lib/email/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LIMITS = {
  subject: 200,
  text: 50_000,
  html: 100_000,
  recipients: 50,
  filename: 255,
  attachmentContent: 20_000_000, // ~15MB base64 — 20-page PDFs
} as const

type SendGridEnv = {
  apiKey: string
  fromEmail: string
  fromName: string
}

let configuredKey: string | null = null

function readEnv(): SendGridEnv {
  const apiKey = process.env.SENDGRID_API_KEY?.trim()
  const fromEmail = process.env.SENDGRID_FROM_EMAIL?.trim()
  const fromName = process.env.SENDGRID_FROM_NAME?.trim()

  const missing: string[] = []
  if (!apiKey) missing.push('SENDGRID_API_KEY')
  if (!fromEmail) missing.push('SENDGRID_FROM_EMAIL')
  if (!fromName) missing.push('SENDGRID_FROM_NAME')

  if (missing.length > 0) {
    throw new EmailConfigError(
      `Missing required SendGrid environment variable(s): ${missing.join(', ')}`
    )
  }

  // Narrowed above
  return {
    apiKey: apiKey as string,
    fromEmail: fromEmail as string,
    fromName: fromName as string,
  }
}

function ensureClient(apiKey: string): void {
  if (configuredKey !== apiKey) {
    sgMail.setApiKey(apiKey)
    configuredKey = apiKey
  }
}

function normalizeRecipients(value: string | string[] | undefined): string[] {
  if (value === undefined) return []
  return (Array.isArray(value) ? value : [value])
    .map((v) => v.trim())
    .filter(Boolean)
}

function assertEmails(label: string, emails: string[]): void {
  if (emails.length > LIMITS.recipients) {
    throw new EmailValidationError(
      `${label} exceeds maximum of ${LIMITS.recipients} addresses`
    )
  }
  for (const email of emails) {
    if (!EMAIL_RE.test(email) || email.length > 254) {
      throw new EmailValidationError(`Invalid ${label} email address`)
    }
  }
}

function validateAttachment(attachment: SendEmailAttachment, index: number): void {
  const label = `attachments[${index}]`
  if (!attachment.filename?.trim()) {
    throw new EmailValidationError(`${label}.filename is required`)
  }
  if (attachment.filename.length > LIMITS.filename) {
    throw new EmailValidationError(`${label}.filename is too long`)
  }
  if (!attachment.content || typeof attachment.content !== 'string') {
    throw new EmailValidationError(`${label}.content is required`)
  }
  if (attachment.content.length > LIMITS.attachmentContent) {
    throw new EmailValidationError(`${label}.content exceeds size limit`)
  }
  if (
    attachment.disposition &&
    attachment.disposition !== 'attachment' &&
    attachment.disposition !== 'inline'
  ) {
    throw new EmailValidationError(`${label}.disposition is invalid`)
  }
}

function validateInput(input: SendEmailInput): {
  to: string[]
  cc: string[]
  bcc: string[]
  replyTo?: string
} {
  const to = normalizeRecipients(input.to)
  if (to.length === 0) {
    throw new EmailValidationError('At least one recipient is required')
  }
  assertEmails('to', to)

  const cc = normalizeRecipients(input.cc)
  assertEmails('cc', cc)

  const bcc = normalizeRecipients(input.bcc)
  assertEmails('bcc', bcc)

  if (!input.subject?.trim()) {
    throw new EmailValidationError('Subject is required')
  }
  if (input.subject.length > LIMITS.subject) {
    throw new EmailValidationError(`Subject exceeds ${LIMITS.subject} characters`)
  }

  if (!input.text?.trim()) {
    throw new EmailValidationError('Plain-text content is required')
  }
  if (input.text.length > LIMITS.text) {
    throw new EmailValidationError(`Text content exceeds ${LIMITS.text} characters`)
  }

  if (input.html !== undefined) {
    if (typeof input.html !== 'string' || !input.html.trim()) {
      throw new EmailValidationError('HTML content, if provided, must be non-empty')
    }
    if (input.html.length > LIMITS.html) {
      throw new EmailValidationError(`HTML content exceeds ${LIMITS.html} characters`)
    }
  }

  let replyTo: string | undefined
  if (input.replyTo !== undefined) {
    replyTo = input.replyTo.trim()
    if (!EMAIL_RE.test(replyTo) || replyTo.length > 254) {
      throw new EmailValidationError('Invalid replyTo email address')
    }
  }

  if (input.attachments) {
    if (!Array.isArray(input.attachments)) {
      throw new EmailValidationError('attachments must be an array')
    }
    input.attachments.forEach(validateAttachment)
  }

  if (input.category !== undefined) {
    if (!input.category.trim() || input.category.length > 100) {
      throw new EmailValidationError('category must be 1–100 characters')
    }
  }

  if (input.referenceId !== undefined) {
    if (!input.referenceId.trim() || input.referenceId.length > 100) {
      throw new EmailValidationError('referenceId must be 1–100 characters')
    }
  }

  if (input.customArgs !== undefined) {
    if (
      !input.customArgs ||
      typeof input.customArgs !== 'object' ||
      Array.isArray(input.customArgs)
    ) {
      throw new EmailValidationError('customArgs must be an object')
    }
    for (const [key, value] of Object.entries(input.customArgs)) {
      if (!key.trim() || key.length > 100) {
        throw new EmailValidationError('customArgs keys must be 1–100 characters')
      }
      if (typeof value !== 'string' || value.length > 255) {
        throw new EmailValidationError(
          `customArgs.${key} must be a string up to 255 characters`
        )
      }
    }
  }

  return { to, cc, bcc, replyTo }
}

function extractStatusCode(error: unknown): number | undefined {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'number'
  ) {
    return (error as { code: number }).code
  }
  return undefined
}

function extractSendGridErrorDetails(error: unknown): {
  sendGridErrors?: SendGridErrorItem[]
  sendGridBody?: unknown
} {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return {}
  }

  const response = (error as { response?: { body?: unknown } }).response
  const body = response?.body
  if (!body || typeof body !== 'object') {
    return { sendGridBody: body }
  }

  const errorsRaw = (body as { errors?: unknown }).errors
  const sendGridErrors: SendGridErrorItem[] = []
  if (Array.isArray(errorsRaw)) {
    for (const item of errorsRaw) {
      if (!item || typeof item !== 'object') continue
      const row = item as Record<string, unknown>
      sendGridErrors.push({
        message: typeof row.message === 'string' ? row.message : undefined,
        field: typeof row.field === 'string' ? row.field : undefined,
        help: typeof row.help === 'string' ? row.help : undefined,
      })
    }
  }

  return {
    sendGridErrors: sendGridErrors.length > 0 ? sendGridErrors : undefined,
    // Keep body for admin debug — never includes the API key
    sendGridBody: body,
  }
}

/**
 * Send a transactional email via the SendGrid v3 Mail Send API.
 *
 * Sender address always comes from server env — never from the caller.
 * A successful result means SendGrid accepted the request, not inbox delivery.
 *
 * Structured for a future queue/outbox wrapper around this boundary.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const env = readEnv()
  const { to, cc, bcc, replyTo } = validateInput(input)

  ensureClient(env.apiKey)

  const msg: MailDataRequired = {
    to,
    from: {
      email: env.fromEmail,
      name: env.fromName,
    },
    subject: input.subject.trim(),
    text: input.text,
    ...(input.html ? { html: input.html } : {}),
    ...(replyTo ? { replyTo } : {}),
    ...(cc.length > 0 ? { cc } : {}),
    ...(bcc.length > 0 ? { bcc } : {}),
    ...(input.attachments && input.attachments.length > 0
      ? {
          attachments: input.attachments.map((a) => ({
            content: a.content,
            filename: a.filename,
            ...(a.type ? { type: a.type } : {}),
            ...(a.disposition ? { disposition: a.disposition } : {}),
            ...(a.contentId ? { contentId: a.contentId } : {}),
          })),
        }
      : {}),
    ...(input.category
      ? { categories: [input.category.trim()] }
      : {}),
    ...(() => {
      const customArgs: Record<string, string> = {
        ...(input.customArgs || {}),
      }
      if (input.referenceId?.trim()) {
        customArgs.reference_id = input.referenceId.trim()
      }
      return Object.keys(customArgs).length > 0 ? { customArgs } : {}
    })(),
    // Always set this. If omitted, SendGrid uses account click-tracking and
    // rewrites links to urlNNNN.xlsexperts.co.nz/ls/click?upn=...
    trackingSettings: {
      clickTracking: {
        enable: input.tracking?.click === true,
        enableText: false,
      },
      openTracking: {
        enable: input.tracking?.open === true,
      },
      subscriptionTracking: {
        enable: false,
      },
    },
  }

  try {
    const [response] = await sgMail.send(msg)
    const messageIdHeader = response.headers?.['x-message-id']
    const messageId = Array.isArray(messageIdHeader)
      ? messageIdHeader[0]
      : messageIdHeader

    return {
      accepted: true,
      statusCode: response.statusCode,
      messageId: typeof messageId === 'string' ? messageId : undefined,
    }
  } catch (error) {
    const statusCode = extractStatusCode(error)
    const details = extractSendGridErrorDetails(error)
    const firstMessage = details.sendGridErrors?.[0]?.message

    // Log diagnosis only — no API key, email bodies, or attachments
    console.error('[email] SendGrid submission failed', {
      statusCode,
      subjectLength: input.subject.length,
      recipientCount: to.length,
      hasHtml: Boolean(input.html),
      hasAttachments: Boolean(input.attachments?.length),
      category: input.category,
      referenceId: input.referenceId,
      sendGridErrors: details.sendGridErrors,
    })

    throw new EmailSendError(
      firstMessage
        ? `SendGrid rejected the request: ${firstMessage}`
        : 'SendGrid did not accept the email request',
      statusCode,
      details
    )
  }
}
