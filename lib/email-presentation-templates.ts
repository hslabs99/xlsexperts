/**
 * Code-owned presentation emails — polished first-touch client messages.
 * Edit blocks in `email-insert-blocks.ts` via vibe coding; bookings use these
 * directly (not TipTap / Firestore HTML).
 */

import { fetchEmailCaseStudyThumbs } from '@/lib/email-case-study-thumbs'
import {
  DISCOVERY_CONFIRMATION_INSERT_BLOCK,
  DISCOVERY_GREETING_HTML,
  EMAIL_UI_FONT,
  HOW_WE_WORK_INSERT_BLOCK,
  SITE_DISPLAY_NAME,
  SITE_URL,
  buildCaseStudiesEmailHtml,
  type EmailCaseStudyThumb,
} from '@/lib/email-insert-blocks'
import {
  defaultRecipientsForKind,
  type EmailTemplate,
  type EmailTemplateInput,
} from '@/lib/email-templates'

export { SITE_URL }

const FONT = EMAIL_UI_FONT

export const MIKE_SIGNATURE_HTML = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px 0;border-collapse:collapse;">
  <tr>
    <td style="padding:0;font-family:${FONT};">
      <p style="margin:0 0 14px 0;padding:0;font-size:11pt;line-height:1.5;color:#374151;font-family:${FONT};">Regards,<br />Mike</p>
      <p style="margin:0 0 2px 0;padding:0;font-size:11pt;font-weight:bold;line-height:1.4;color:#111827;font-family:${FONT};">Mike Colwill</p>
      <p style="margin:0 0 2px 0;padding:0;font-size:10pt;line-height:1.45;color:#374151;font-family:${FONT};">xlsEXPERTS &ndash; Spreadsheets | VBA | Enterprise Apps | A.I. Solutions</p>
      <p style="margin:0 0 14px 0;padding:0;font-size:10pt;line-height:1.45;font-family:${FONT};">
        <a href="${SITE_URL}" style="color:#1a6b3c;text-decoration:none;">${SITE_DISPLAY_NAME}</a>
      </p>
      <p style="margin:0 0 6px 0;padding:0;font-size:9pt;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-family:${FONT};">Contact details</p>
      <p style="margin:0;padding:0;font-size:10pt;line-height:1.55;color:#374151;font-family:${FONT};">
        Email: <a href="mailto:mike@xlsExperts.co.nz" style="color:#1a6b3c;text-decoration:none;">mike@xlsExperts.co.nz</a><br />
        Call: <a href="tel:+6421783967" style="color:#1a6b3c;text-decoration:none;">+64 (0)21 783967</a><br />
        WhatsApp: <a href="https://wa.me/6421783967" style="color:#1a6b3c;text-decoration:none;">+6421783967</a>
      </p>
    </td>
  </tr>
</table>
`.trim()

export const EMAIL_DISCLAIMER_HTML = `
<p style="margin:0;padding:0;font-size:8pt;line-height:1.45;color:#9ca3af;font-family:${FONT};">
  This email and any attachments are confidential, and may be subject to legal privilege, and are intended solely for the use of the individual(s) to whom they are addressed. If you have received this email in error or think you may have done so, you may not peruse, use, disseminate, distribute or copy this message. Please notify the sender immediately and delete the original email from your system.
</p>
<p style="margin:8px 0 0 0;padding:0;font-size:8pt;line-height:1.45;color:#9ca3af;font-family:${FONT};">
  Whilst all outgoing and incoming mail is virus scanned, the author or sender accept no responsibility for losses or damage as a result of any viruses and it is your responsibility to check attachments (if any) for viruses.
</p>
`.trim()

export const MIKE_SIGNATURE_TEXT = [
  'Regards,',
  'Mike',
  '',
  'Mike Colwill',
  'xlsEXPERTS – Spreadsheets | VBA | Enterprise Apps | A.I. Solutions',
  'www.xlsExperts.co.nz',
  '',
  'Contact Details',
  'Email: mike@xlsExperts.co.nz',
  'Call: +64 (0)21 783967',
  'WhatsApp: +6421783967',
].join('\n')

export const EMAIL_DISCLAIMER_TEXT = [
  'This email and any attachments are confidential, and may be subject to legal privilege, and are intended solely for the use of the individual(s) to whom they are addressed. If you have received this email in error or think you may have done so, you may not peruse, use, disseminate, distribute or copy this message. Please notify the sender immediately and delete the original email from your system.',
  '',
  'Whilst all outgoing and incoming mail is virus scanned, the author or sender accept no responsibility for losses or damage as a result of any viruses and it is your responsibility to check attachments (if any) for viruses.',
].join('\n')

/**
 * Outer chrome: centred 600px document on a soft wash.
 * Light / white masthead with a slim brand accent — not a heavy green slab.
 */
export function wrapPresentationEmail(
  innerHtml: string,
  options?: { preheader?: string }
): string {
  const preheader = options?.preheader?.trim() || ''
  const preheaderBlock = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f3f4f6;opacity:0;">${preheader}</div>`
    : ''

  return `
${preheaderBlock}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;border-collapse:collapse;background-color:#f3f4f6;">
  <tr>
    <td align="center" style="padding:28px 12px;font-family:${FONT};">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;border-collapse:collapse;background-color:#ffffff;border:1px solid #e5e7eb;">
        <!-- Light masthead -->
        <tr>
          <td style="padding:0;background-color:#ffffff;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:22px 28px 18px 28px;font-family:${FONT};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td valign="middle" width="40" height="40" align="center" style="width:40px;height:40px;background-color:#e8f5ee;color:#1a6b3c;font-size:9pt;font-weight:bold;letter-spacing:0.04em;line-height:40px;text-align:center;font-family:${FONT};">
                        XLS
                      </td>
                      <td valign="middle" style="padding:0 0 0 12px;font-family:${FONT};">
                        <p style="margin:0;padding:0;font-size:13pt;font-weight:bold;letter-spacing:0.01em;color:#111827;font-family:${FONT};">XLS Experts</p>
                        <p style="margin:2px 0 0 0;padding:0;font-size:8pt;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-family:${FONT};">NZ Trusted Excel Specialists</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height:2px;line-height:2px;font-size:0;background-color:#1a6b3c;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 28px 8px 28px;font-family:${FONT};font-size:11pt;line-height:1.55;color:#222222;">
            ${innerHtml}
          </td>
        </tr>

        <!-- Disclaimer -->
        <tr>
          <td style="padding:0 28px 24px 28px;font-family:${FONT};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid #e5e7eb;">
              <tr>
                <td style="padding:16px 0 0 0;font-family:${FONT};">
                  ${EMAIL_DISCLAIMER_HTML}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`.trim()
}

/**
 * Full discovery client confirmation:
 * greeting → Mike signature → booking details → process → case studies.
 * Disclaimer stays in the outer footer.
 * Case-study thumbs must be absolute Firebase Storage HTTPS URLs.
 */
export function buildDiscoveryClientPresentationHtml(
  thumbs: EmailCaseStudyThumb[] = []
): string {
  const inner = [
    DISCOVERY_GREETING_HTML,
    MIKE_SIGNATURE_HTML,
    DISCOVERY_CONFIRMATION_INSERT_BLOCK.html,
    HOW_WE_WORK_INSERT_BLOCK.html,
    buildCaseStudiesEmailHtml(thumbs),
  ].join('\n')

  return wrapPresentationEmail(inner, {
    preheader:
      'Your discovery call is confirmed — Mike Colwill will contact you personally.',
  })
}

/**
 * Template object used at send time for discovery bookings.
 * Loads case-study thumb URLs from Firestore / Storage (not local / public paths).
 */
export async function getDiscoveryClientPresentationTemplate(): Promise<
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
  const thumbs = await fetchEmailCaseStudyThumbs()
  return {
    kind: 'discovery',
    name: 'Discovery confirmation (presentation)',
    subject: "You're booked — discovery call {{when}}",
    htmlBody: buildDiscoveryClientPresentationHtml(thumbs),
    textBody: [
      'Hi {{name}},',
      '',
      'Thank you for booking a discovery call with XLS Experts. Your call slot is confirmed. I will personally contact you to discuss your project — I am your point of contact from here.',
      '',
      MIKE_SIGNATURE_TEXT,
      '',
      'When: {{when}}',
      'Method: {{method}}',
      '',
      'Day: {{day}}',
      'Date: {{date}}',
      'Time: {{time}}',
      '',
      'Name: {{name}}',
      'Company: {{company}}',
      'Email: {{email}}',
      'Phone: {{phone}}',
      '',
      'About your enquiry:',
      '{{about}}',
      '',
      'Areas of interest:',
      '{{concerns}}',
      '',
      'Service: {{service}}',
      'Solution: {{solution}}',
      '',
      'I will personally get in touch shortly to confirm the dial-in or meeting link and talk through your project. If anything changes, reply to this email — it comes straight to me.',
      '',
      'How we work: Discovery call → Scoping & quote → Build & review → Handover & support',
      '',
      `Recent case studies: ${SITE_URL}/#case-studies`,
      '',
      '---',
      EMAIL_DISCLAIMER_TEXT,
    ].join('\n'),
    recipients: defaultRecipientsForKind('discovery'),
    bodyFontFamily: EMAIL_UI_FONT,
    bodyFontSize: '11pt',
  }
}

/** Seed / docs shape aligned with the presentation send path. */
export async function discoveryPresentationAsTemplateInput(): Promise<
  Omit<EmailTemplateInput, 'active'>
> {
  const t = await getDiscoveryClientPresentationTemplate()
  return {
    kind: t.kind,
    name: t.name,
    subject: t.subject,
    htmlBody: t.htmlBody,
    textBody: t.textBody,
    recipients: t.recipients,
    bodyFontFamily: t.bodyFontFamily,
    bodyFontSize: t.bodyFontSize,
  }
}
