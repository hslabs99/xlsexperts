import 'server-only'

import type { ContactPayload } from '@/lib/types'

/**
 * Escape text for safe inclusion in HTML email bodies.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Server-controlled recipient for contact-form notifications.
 * Prefer CONTACT_NOTIFY_EMAIL; fall back to the configured From address.
 */
export function getContactNotifyRecipient(): string | null {
  const dedicated = process.env.CONTACT_NOTIFY_EMAIL?.trim()
  if (dedicated) return dedicated
  const from = process.env.SENDGRID_FROM_EMAIL?.trim()
  return from || null
}

export type ContactEnquiryEmail = {
  to: string
  subject: string
  text: string
  html: string
  replyTo: string
  category: string
}

/**
 * Assemble contact-enquiry email content on the server.
 * Recipients and templates are never accepted from the browser.
 */
export function buildContactEnquiryEmail(
  payload: ContactPayload,
  to: string
): ContactEnquiryEmail {
  const services =
    payload.services?.length > 0 ? payload.services.join(', ') : 'None selected'
  const service = payload.service?.trim() || 'Not selected'
  const solution = payload.solution?.trim() || 'Not selected'
  const company = payload.company?.trim() || 'Not provided'
  const phone = payload.phone?.trim() || 'Not provided'
  const hear = payload.hear?.trim() || 'Not provided'

  const subject = `Website enquiry from ${payload.name.trim()}`

  const text = [
    'New website enquiry',
    '',
    `Name: ${payload.name.trim()}`,
    `Company: ${company}`,
    `Email: ${payload.email.trim()}`,
    `Phone: ${phone}`,
    `Concerns: ${services}`,
    `Service: ${service}`,
    `Solution: ${solution}`,
    `How they heard: ${hear}`,
    '',
    'Message:',
    payload.message.trim(),
  ].join('\n')

  const html = `
    <h2>New website enquiry</h2>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(payload.name.trim())}</td></tr>
      <tr><td><strong>Company</strong></td><td>${escapeHtml(company)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(payload.email.trim())}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone)}</td></tr>
      <tr><td><strong>Concerns</strong></td><td>${escapeHtml(services)}</td></tr>
      <tr><td><strong>Service</strong></td><td>${escapeHtml(service)}</td></tr>
      <tr><td><strong>Solution</strong></td><td>${escapeHtml(solution)}</td></tr>
      <tr><td><strong>How they heard</strong></td><td>${escapeHtml(hear)}</td></tr>
    </table>
    <h3>Message</h3>
    <p style="white-space:pre-wrap">${escapeHtml(payload.message.trim())}</p>
  `.trim()

  return {
    to,
    subject,
    text,
    html,
    replyTo: payload.email.trim(),
    category: 'contact-enquiry',
  }
}
