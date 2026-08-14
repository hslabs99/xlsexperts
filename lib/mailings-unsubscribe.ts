import 'server-only'

import { createHmac, timingSafeEqual } from 'crypto'
import { NZ_SITE_ORIGIN } from '@/lib/crawl-docs'

function unsubscribeSecret(): string {
  const dedicated = process.env.MAILINGS_UNSUBSCRIBE_SECRET?.trim()
  if (dedicated) return dedicated
  const apiKey = process.env.SENDGRID_API_KEY?.trim()
  if (apiKey) return `mailings:${apiKey}`
  return 'mailings-dev-unsub-secret'
}

export function getMailingsPublicOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return NZ_SITE_ORIGIN
}

export function createUnsubscribeToken(contactId: string, email: string): string {
  const payload = `${contactId}:${email.trim().toLowerCase()}`
  const sig = createHmac('sha256', unsubscribeSecret())
    .update(payload)
    .digest('hex')
    .slice(0, 32)
  return Buffer.from(`${payload}:${sig}`, 'utf8').toString('base64url')
}

export function verifyUnsubscribeToken(
  token: string
): { contactId: string; email: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const parts = decoded.split(':')
    if (parts.length < 3) return null
    const sig = parts[parts.length - 1]
    const email = parts[parts.length - 2]
    const contactId = parts.slice(0, -2).join(':')
    if (!contactId || !email || !sig) return null
    const expected = createHmac('sha256', unsubscribeSecret())
      .update(`${contactId}:${email.trim().toLowerCase()}`)
      .digest('hex')
      .slice(0, 32)
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    return { contactId, email: email.trim().toLowerCase() }
  } catch {
    return null
  }
}

export function buildUnsubscribeUrl(contactId: string, email: string): string {
  const token = createUnsubscribeToken(contactId, email)
  return `${getMailingsPublicOrigin()}/unsubscribe?token=${encodeURIComponent(token)}`
}

/**
 * Append a one-click unsubscribe footer to campaign HTML.
 * SendGrid click tracking still applies to other links.
 */
export function appendUnsubscribeFooter(
  html: string,
  contactId: string,
  email: string
): string {
  const url = buildUnsubscribeUrl(contactId, email)
  const footer = `
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e5e5;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#666;">
  <p style="margin:0 0 8px;">You are receiving this email from XLS Experts.</p>
  <p style="margin:0;"><a href="${url}" style="color:#666;text-decoration:underline;">Unsubscribe</a> from future marketing emails.</p>
</div>`
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${footer}</body>`)
  }
  return `${html}${footer}`
}

export function personalizeCampaignHtml(
  html: string,
  vars: { name: string; contact: string; company: string; email: string }
): string {
  return html
    .replace(/\{\{\s*name\s*\}\}/gi, vars.name || '')
    .replace(/\{\{\s*contact\s*\}\}/gi, vars.contact || vars.name || '')
    .replace(/\{\{\s*company\s*\}\}/gi, vars.company || '')
    .replace(/\{\{\s*email\s*\}\}/gi, vars.email || '')
}
