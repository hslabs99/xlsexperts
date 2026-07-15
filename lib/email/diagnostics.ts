import 'server-only'

import { EmailConfigError } from '@/lib/email/errors'

export type EmailEnvVarStatus = {
  name: string
  set: boolean
  /** Safe preview only — never the full secret. */
  preview: string | null
  required: boolean
  role: string
}

export type EmailConfigSnapshot = {
  nodeEnv: string | undefined
  ready: boolean
  missingRequired: string[]
  fromEmail: string | null
  fromName: string | null
  notifyEmail: string | null
  testRecipient: string | null
  resolvedTestRecipient: string | null
  apiKey: {
    set: boolean
    length: number
    /** e.g. SG.…xxxx — never the full key */
    masked: string | null
    looksLikeSendGrid: boolean
  }
  vars: EmailEnvVarStatus[]
  hints: string[]
}

function maskApiKey(key: string): string {
  if (key.length < 12) return '(set, too short to mask)'
  return `${key.slice(0, 3)}…${key.slice(-4)} (len ${key.length})`
}

function previewNonSecret(value: string | undefined): string | null {
  const v = value?.trim()
  if (!v) return null
  if (v.length <= 64) return v
  return `${v.slice(0, 48)}…`
}

/**
 * Read SendGrid-related env for admin diagnostics.
 * Never returns the raw API key.
 */
export function getEmailConfigSnapshot(): EmailConfigSnapshot {
  const apiKey = process.env.SENDGRID_API_KEY?.trim() || ''
  const fromEmail = process.env.SENDGRID_FROM_EMAIL?.trim() || ''
  const fromName = process.env.SENDGRID_FROM_NAME?.trim() || ''
  const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL?.trim() || ''
  const testRecipient = process.env.SENDGRID_TEST_RECIPIENT?.trim() || ''

  const missingRequired: string[] = []
  if (!apiKey) missingRequired.push('SENDGRID_API_KEY')
  if (!fromEmail) missingRequired.push('SENDGRID_FROM_EMAIL')
  if (!fromName) missingRequired.push('SENDGRID_FROM_NAME')

  const resolvedTestRecipient =
    testRecipient || notifyEmail || fromEmail || null

  const hints: string[] = []
  if (missingRequired.length > 0) {
    hints.push(
      `Missing required env: ${missingRequired.join(', ')}. Add to .env.local and restart the Next.js server.`
    )
  }
  if (apiKey && !apiKey.startsWith('SG.')) {
    hints.push(
      'SENDGRID_API_KEY does not start with "SG." — confirm you pasted a SendGrid API key.'
    )
  }
  if (apiKey && (apiKey.includes('REPLACE') || apiKey.includes('your_key'))) {
    hints.push('SENDGRID_API_KEY still looks like a placeholder. Replace it with a real key.')
  }
  if (!resolvedTestRecipient) {
    hints.push(
      'No test recipient. Set SENDGRID_TEST_RECIPIENT, CONTACT_NOTIFY_EMAIL, or SENDGRID_FROM_EMAIL.'
    )
  }
  if (fromEmail) {
    hints.push(
      `From address is ${fromEmail}. It must be a verified sender or on an authenticated domain in SendGrid.`
    )
  }
  hints.push(
    'After changing .env.local, restart `pnpm dev` — Next.js does not hot-reload env vars.'
  )
  hints.push(
    'acceptedBySendGrid means SendGrid accepted the API request, not that the message reached the inbox.'
  )

  const vars: EmailEnvVarStatus[] = [
    {
      name: 'SENDGRID_API_KEY',
      set: Boolean(apiKey),
      preview: apiKey ? maskApiKey(apiKey) : null,
      required: true,
      role: 'Mail Send API auth',
    },
    {
      name: 'SENDGRID_FROM_EMAIL',
      set: Boolean(fromEmail),
      preview: previewNonSecret(fromEmail),
      required: true,
      role: 'Verified sender address',
    },
    {
      name: 'SENDGRID_FROM_NAME',
      set: Boolean(fromName),
      preview: previewNonSecret(fromName),
      required: true,
      role: 'Sender display name',
    },
    {
      name: 'CONTACT_NOTIFY_EMAIL',
      set: Boolean(notifyEmail),
      preview: previewNonSecret(notifyEmail),
      required: false,
      role: 'Contact-form notification inbox',
    },
    {
      name: 'SENDGRID_TEST_RECIPIENT',
      set: Boolean(testRecipient),
      preview: previewNonSecret(testRecipient),
      required: false,
      role: 'Admin/dev test recipient',
    },
  ]

  return {
    nodeEnv: process.env.NODE_ENV,
    ready: missingRequired.length === 0 && Boolean(resolvedTestRecipient),
    missingRequired,
    fromEmail: fromEmail || null,
    fromName: fromName || null,
    notifyEmail: notifyEmail || null,
    testRecipient: testRecipient || null,
    resolvedTestRecipient,
    apiKey: {
      set: Boolean(apiKey),
      length: apiKey.length,
      masked: apiKey ? maskApiKey(apiKey) : null,
      looksLikeSendGrid: apiKey.startsWith('SG.'),
    },
    vars,
    hints,
  }
}

export function assertEmailConfigReady(): void {
  const snap = getEmailConfigSnapshot()
  if (snap.missingRequired.length > 0) {
    throw new EmailConfigError(
      `Missing required SendGrid environment variable(s): ${snap.missingRequired.join(', ')}`
    )
  }
}

export function hintsForSendGridStatus(statusCode?: number): string[] {
  switch (statusCode) {
    case 401:
      return [
        '401 Unauthorized — API key is invalid, revoked, or not loaded.',
        'Create a new key in SendGrid (Mail Send only), update .env.local, restart the server.',
      ]
    case 403:
      return [
        '403 Forbidden — key lacks Mail Send permission, or account is restricted.',
        'Edit the API key permissions: Mail Send = Full Access.',
      ]
    case 400:
      return [
        '400 Bad Request — often an unverified From address, malformed payload, or suppressed recipient.',
        'Check SendGrid → Sender Authentication / Single Sender Verification.',
        'Read sendGridErrors[].message below for the exact field SendGrid rejected.',
      ]
    case 413:
      return ['413 Payload Too Large — reduce body or attachment size.']
    case 429:
      return ['429 Rate limited — wait and retry; check SendGrid plan limits.']
    case 500:
    case 502:
    case 503:
      return ['SendGrid side outage or temporary error — retry shortly.']
    default:
      return statusCode
        ? [`HTTP ${statusCode} from SendGrid — see sendGridErrors for details.`]
        : ['No HTTP status from SendGrid client — network or unexpected client error.']
  }
}
