/**
 * Reusable Outlook-safe HTML snippets for enquiry emails.
 *
 * Merge tags ({{name}}, {{when}}, {{method}}, etc.) are resolved at send time.
 * Keep markup table-based with inline styles — no Tailwind / flex / CSS classes.
 */

export type EmailInsertBlock = {
  id: string
  /** Short label on the insert button */
  label: string
  /** Hover / helper text */
  description: string
  /** Full HTML fragment (tables + inline styles + merge tags) */
  html: string
}

/** Modern web-friendly stack that still falls back well in Outlook. */
export const EMAIL_UI_FONT =
  "'Segoe UI', Candara, Calibri, 'Helvetica Neue', Helvetica, Arial, sans-serif"

const FONT = EMAIL_UI_FONT

/**
 * Deployed App Hosting URL — used for email image srcs and case-study links
 * while the custom domain is not yet connected.
 */
export const SITE_URL =
  'https://xlsexperts--xlsexperts-49c22.asia-southeast1.hosted.app'

/** Brand display text in signatures (not necessarily the asset host). */
export const SITE_DISPLAY_NAME = 'www.xlsExperts.co.nz'

export const CASE_STUDIES_URL = `${SITE_URL}/#case-studies`

/** Thumbnail row for discovery emails — `src` must be an absolute HTTPS URL (Firebase Storage). */
export type EmailCaseStudyThumb = {
  slug: string
  src: string
  label: string
  client: string
}

function caseStudyThumbCell(item: EmailCaseStudyThumb): string {
  const safeSrc = item.src.replace(/"/g, '&quot;')
  return `
<td width="33%" valign="top" align="center" style="padding:0 4px 10px 4px;font-family:${FONT};">
  <a href="${CASE_STUDIES_URL}" style="text-decoration:none;color:#111827;">
    <img src="${safeSrc}" width="96" height="60" alt="${item.client} — ${item.label}" style="display:block;width:96px;max-width:100%;height:auto;border:1px solid #e5e7eb;margin:0 auto;" />
    <p style="margin:5px 0 0 0;padding:0;font-size:7pt;font-weight:bold;letter-spacing:0.05em;text-transform:uppercase;color:#1a6b3c;font-family:${FONT};">${item.label}</p>
    <p style="margin:1px 0 0 0;padding:0;font-size:8pt;line-height:1.25;color:#374151;font-family:${FONT};">${item.client}</p>
  </a>
</td>`.trim()
}

/** Build the case-studies strip from Firebase Storage (or other absolute) URLs. */
export function buildCaseStudiesEmailHtml(
  thumbs: EmailCaseStudyThumb[]
): string {
  const items = thumbs.filter((t) => /^https?:\/\//i.test(t.src)).slice(0, 6)
  if (items.length === 0) {
    return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px 0;border-collapse:collapse;border:1px solid #e5e7eb;">
  <tr>
    <td style="padding:16px 18px;font-family:${FONT};background-color:#fafbfa;">
      <p style="margin:0 0 4px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#1a6b3c;font-family:${FONT};">Proof of work</p>
      <p style="margin:0 0 8px 0;padding:0;font-size:13pt;font-weight:bold;color:#111827;font-family:${FONT};">Recent case studies</p>
      <p style="margin:0;padding:0;font-size:9pt;line-height:1.45;color:#6b7280;font-family:${FONT};">
        <a href="${CASE_STUDIES_URL}" style="color:#1a6b3c;text-decoration:none;font-weight:bold;">View our case studies on the website &rarr;</a>
      </p>
    </td>
  </tr>
</table>`.trim()
  }

  const row1 = items.slice(0, 3).map(caseStudyThumbCell).join('\n')
  const row2 = items.slice(3, 6).map(caseStudyThumbCell).join('\n')

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px 0;border-collapse:collapse;border:1px solid #e5e7eb;">
  <tr>
    <td style="padding:0;background-color:#fafbfa;border-bottom:1px solid #e8f0eb;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="height:3px;line-height:3px;font-size:0;background-color:#1a6b3c;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:14px 18px 6px 18px;font-family:${FONT};">
            <p style="margin:0 0 4px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#1a6b3c;font-family:${FONT};">Proof of work</p>
            <p style="margin:0 0 4px 0;padding:0;font-size:13pt;font-weight:bold;line-height:1.25;color:#111827;font-family:${FONT};">Recent case studies</p>
            <p style="margin:0;padding:0;font-size:9pt;line-height:1.45;color:#6b7280;font-family:${FONT};">A quick look at solutions we deliver for NZ businesses. Tap any tile to explore.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 12px 4px 12px;background-color:#ffffff;font-family:${FONT};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          ${row1}
        </tr>
        ${
          row2
            ? `<tr>
          ${row2}
        </tr>`
            : ''
        }
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:2px 18px 16px 18px;background-color:#ffffff;font-family:${FONT};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="background-color:#1a6b3c;">
            <a href="${CASE_STUDIES_URL}" style="display:inline-block;padding:8px 14px;font-family:${FONT};font-size:9pt;font-weight:bold;color:#ffffff;text-decoration:none;">
              View all case studies &rarr;
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`.trim()
}

/** Opening lines only — signature follows, then the details card. */
export const DISCOVERY_GREETING_HTML = `
<p style="margin:0 0 16px 0;padding:0;font-family:${FONT};font-size:11pt;line-height:1.55;color:#111827;">Hi {{name}},</p>
<p style="margin:0 0 16px 0;padding:0;font-family:${FONT};font-size:11pt;line-height:1.55;color:#374151;">Thank you for booking a discovery call with <strong style="color:#1a6b3c;">XLS Experts</strong>. Your call slot is confirmed. I will personally contact you to discuss your project &mdash; I am your point of contact from here.</p>
`.trim()

/**
 * Discovery appointment / enquiry details card (no greeting — that sits above the signature).
 */
export const DISCOVERY_CONFIRMATION_INSERT_BLOCK: EmailInsertBlock = {
  id: 'discovery-confirmation',
  label: 'Discovery call confirmation',
  description:
    'Client confirmation card with {{method}}, {{day}}/{{date}}/{{time}}, and enquiry details',
  html: `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;border-collapse:collapse;border:1px solid #e5e7eb;">
  <!-- Light header -->
  <tr>
    <td style="padding:0;background-color:#ffffff;border-bottom:1px solid #e8f0eb;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="height:3px;line-height:3px;font-size:0;background-color:#1a6b3c;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:20px 24px 18px 24px;font-family:${FONT};background-color:#fafbfa;">
            <p style="margin:0 0 6px 0;padding:0;font-size:9pt;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#1a6b3c;font-family:${FONT};">Discovery call</p>
            <p style="margin:0 0 8px 0;padding:0;font-size:17pt;font-weight:bold;line-height:1.25;color:#111827;font-family:${FONT};">You&rsquo;re booked in</p>
            <p style="margin:0;padding:0;font-size:10pt;line-height:1.5;color:#6b7280;font-family:${FONT};">Please keep this email for your records. No preparation is required unless you would like to share a sample file beforehand.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Appointment details -->
  <tr>
    <td style="padding:0;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:20px 24px 8px 24px;font-family:${FONT};">
            <p style="margin:0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#1a6b3c;font-family:${FONT};">Appointment details</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 20px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td width="50%" valign="top" style="padding:0 10px 12px 0;font-family:${FONT};">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border:1px solid #e5e7eb;">
                    <tr>
                      <td style="padding:14px 16px;font-family:${FONT};">
                        <p style="margin:0 0 4px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;font-family:${FONT};">Day</p>
                        <p style="margin:0;padding:0;font-size:12pt;font-weight:bold;line-height:1.3;color:#111827;font-family:${FONT};">{{day}}</p>
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="50%" valign="top" style="padding:0 0 12px 0;font-family:${FONT};">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border:1px solid #e5e7eb;">
                    <tr>
                      <td style="padding:14px 16px;font-family:${FONT};">
                        <p style="margin:0 0 4px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;font-family:${FONT};">Date</p>
                        <p style="margin:0;padding:0;font-size:12pt;font-weight:bold;line-height:1.3;color:#111827;font-family:${FONT};">{{date}}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td width="50%" valign="top" style="padding:0 10px 0 0;font-family:${FONT};">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border:1px solid #e5e7eb;">
                    <tr>
                      <td style="padding:14px 16px;font-family:${FONT};">
                        <p style="margin:0 0 4px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;font-family:${FONT};">Time</p>
                        <p style="margin:0;padding:0;font-size:12pt;font-weight:bold;line-height:1.3;color:#111827;font-family:${FONT};">{{time}}</p>
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="50%" valign="top" style="padding:0;font-family:${FONT};">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border:1px solid #e5e7eb;">
                    <tr>
                      <td style="padding:14px 16px;font-family:${FONT};">
                        <p style="margin:0 0 4px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;font-family:${FONT};">Method</p>
                        <p style="margin:0;padding:0;font-size:12pt;font-weight:bold;line-height:1.3;color:#111827;font-family:${FONT};">{{method}}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Summary line -->
  <tr>
    <td style="padding:16px 24px;background-color:#ffffff;border-bottom:1px solid #f0f0f0;font-family:${FONT};">
      <p style="margin:0;padding:0;font-size:10pt;line-height:1.45;color:#4b5563;font-family:${FONT};"><strong style="color:#111827;">When:</strong> {{when}}&nbsp;&nbsp;&middot;&nbsp;&nbsp;<strong style="color:#111827;">Via:</strong> {{method}}</p>
    </td>
  </tr>

  <!-- Contact / company -->
  <tr>
    <td style="padding:18px 24px;background-color:#ffffff;border-bottom:1px solid #f0f0f0;font-family:${FONT};">
      <p style="margin:0 0 10px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#1a6b3c;font-family:${FONT};">Your details</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:0 0 4px 0;font-family:${FONT};font-size:10pt;line-height:1.45;color:#374151;">
            <strong style="color:#111827;">Name:</strong> {{name}}
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 4px 0;font-family:${FONT};font-size:10pt;line-height:1.45;color:#374151;">
            <strong style="color:#111827;">Company:</strong> {{company}}
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 4px 0;font-family:${FONT};font-size:10pt;line-height:1.45;color:#374151;">
            <strong style="color:#111827;">Email:</strong> {{email}}
          </td>
        </tr>
        <tr>
          <td style="padding:0;font-family:${FONT};font-size:10pt;line-height:1.45;color:#374151;">
            <strong style="color:#111827;">Phone:</strong> {{phone}}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- About / enquiry -->
  <tr>
    <td style="padding:18px 24px;background-color:#ffffff;border-bottom:1px solid #f0f0f0;font-family:${FONT};">
      <p style="margin:0 0 8px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#1a6b3c;font-family:${FONT};">About your enquiry</p>
      <p style="margin:0;padding:0;font-size:10pt;line-height:1.55;color:#374151;font-family:${FONT};">{{about}}</p>
    </td>
  </tr>

  <!-- Services / concerns -->
  <tr>
    <td style="padding:18px 24px;background-color:#ffffff;border-bottom:1px solid #f0f0f0;font-family:${FONT};">
      <p style="margin:0 0 8px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#1a6b3c;font-family:${FONT};">Areas of interest</p>
      <div style="font-family:${FONT};font-size:10pt;line-height:1.5;color:#374151;">{{concerns}}</div>
    </td>
  </tr>

  <!-- Service / solution catalogue -->
  <tr>
    <td style="padding:18px 24px;background-color:#ffffff;font-family:${FONT};">
      <p style="margin:0 0 8px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#1a6b3c;font-family:${FONT};">Catalogue interest</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:0 0 4px 0;font-family:${FONT};font-size:10pt;line-height:1.45;color:#374151;">
            <strong style="color:#111827;">Service:</strong> {{service}}
          </td>
        </tr>
        <tr>
          <td style="padding:0;font-family:${FONT};font-size:10pt;line-height:1.45;color:#374151;">
            <strong style="color:#111827;">Solution:</strong> {{solution}}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Next step strip -->
  <tr>
    <td style="padding:16px 24px;background-color:#f3f8f5;border-top:1px solid #e5e7eb;font-family:${FONT};">
      <p style="margin:0 0 4px 0;padding:0;font-size:10pt;font-weight:bold;color:#111827;font-family:${FONT};">What happens next</p>
      <p style="margin:0;padding:0;font-size:10pt;line-height:1.5;color:#374151;font-family:${FONT};">I will personally get in touch shortly to confirm the dial-in or meeting link for <strong>{{method}}</strong> and talk through your project. If anything changes on your side, just reply to this email &mdash; it comes straight to me.</p>
    </td>
  </tr>
</table>
`.trim(),
}

/**
 * Presentation-grade "How we work" process card.
 * Light header, numbered timeline steps (no principles strip).
 */
export const HOW_WE_WORK_INSERT_BLOCK: EmailInsertBlock = {
  id: 'how-we-work',
  label: 'How we work (4 steps)',
  description:
    'Presentation-grade process card: light header and four timeline steps',
  html: `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px 0;border-collapse:collapse;border:1px solid #e5e7eb;">
  <!-- Light header -->
  <tr>
    <td style="padding:0;background-color:#fafbfa;border-bottom:1px solid #e8f0eb;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="height:3px;line-height:3px;font-size:0;background-color:#1a6b3c;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:20px 24px;font-family:${FONT};">
            <p style="margin:0 0 6px 0;padding:0;font-size:9pt;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#1a6b3c;font-family:${FONT};">Our process</p>
            <p style="margin:0 0 8px 0;padding:0;font-size:17pt;font-weight:bold;line-height:1.25;color:#111827;font-family:${FONT};">How we work</p>
            <p style="margin:0;padding:0;font-size:10pt;line-height:1.5;color:#6b7280;font-family:${FONT};">Simple, transparent, and designed around you — whether this is your first spreadsheet project or a complex enterprise rollout.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Steps -->
  <tr>
    <td style="padding:0;background-color:#ffffff;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">

        <!-- 01 -->
        <tr>
          <td style="padding:22px 24px;border-bottom:1px solid #f0f0f0;font-family:${FONT};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td width="48" valign="top" style="padding:0 16px 0 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td width="44" height="44" align="center" valign="middle" style="width:44px;height:44px;background-color:#e8f5ee;color:#1a6b3c;font-size:12pt;font-weight:bold;line-height:44px;text-align:center;font-family:${FONT};">01</td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="padding:0;font-family:${FONT};">
                  <p style="margin:0 0 2px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-family:${FONT};">Step one</p>
                  <p style="margin:0 0 6px 0;padding:0;font-size:12pt;font-weight:bold;line-height:1.3;color:#111827;font-family:${FONT};">Discovery call</p>
                  <p style="margin:0;padding:0;font-size:10pt;line-height:1.5;color:#4b5563;font-family:${FONT};">We start with a free 30-minute call to understand your problem, your data, and what a good outcome looks like. No jargon, no sales pitch — a straightforward conversation about what you need.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 02 -->
        <tr>
          <td style="padding:22px 24px;border-bottom:1px solid #f0f0f0;font-family:${FONT};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td width="48" valign="top" style="padding:0 16px 0 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td width="44" height="44" align="center" valign="middle" style="width:44px;height:44px;background-color:#e8f5ee;color:#1a6b3c;font-size:12pt;font-weight:bold;line-height:44px;text-align:center;font-family:${FONT};">02</td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="padding:0;font-family:${FONT};">
                  <p style="margin:0 0 2px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-family:${FONT};">Step two</p>
                  <p style="margin:0 0 6px 0;padding:0;font-size:12pt;font-weight:bold;line-height:1.3;color:#111827;font-family:${FONT};">Scoping &amp; quote</p>
                  <p style="margin:0;padding:0;font-size:10pt;line-height:1.5;color:#4b5563;font-family:${FONT};">You receive a clear written scope of work and a fixed price or hourly estimate before anything starts. Exactly what you are getting, and what it will cost — no surprises.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 03 -->
        <tr>
          <td style="padding:22px 24px;border-bottom:1px solid #f0f0f0;font-family:${FONT};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td width="48" valign="top" style="padding:0 16px 0 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td width="44" height="44" align="center" valign="middle" style="width:44px;height:44px;background-color:#e8f5ee;color:#1a6b3c;font-size:12pt;font-weight:bold;line-height:44px;text-align:center;font-family:${FONT};">03</td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="padding:0;font-family:${FONT};">
                  <p style="margin:0 0 2px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-family:${FONT};">Step three</p>
                  <p style="margin:0 0 6px 0;padding:0;font-size:12pt;font-weight:bold;line-height:1.3;color:#111827;font-family:${FONT};">Build &amp; review</p>
                  <p style="margin:0;padding:0;font-size:10pt;line-height:1.5;color:#4b5563;font-family:${FONT};">We build in stages and share progress as we go. You review, give feedback, and request adjustments before final delivery. Your input shapes the outcome.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 04 -->
        <tr>
          <td style="padding:22px 24px;font-family:${FONT};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td width="48" valign="top" style="padding:0 16px 0 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td width="44" height="44" align="center" valign="middle" style="width:44px;height:44px;background-color:#e8f5ee;color:#1a6b3c;font-size:12pt;font-weight:bold;line-height:44px;text-align:center;font-family:${FONT};">04</td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="padding:0;font-family:${FONT};">
                  <p style="margin:0 0 2px 0;padding:0;font-size:8pt;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-family:${FONT};">Step four</p>
                  <p style="margin:0 0 6px 0;padding:0;font-size:12pt;font-weight:bold;line-height:1.3;color:#111827;font-family:${FONT};">Handover &amp; support</p>
                  <p style="margin:0;padding:0;font-size:10pt;line-height:1.5;color:#4b5563;font-family:${FONT};">Clean, well-documented work with a handover session so your team can use it with confidence. Ongoing support and enhancements whenever you need us.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`.trim(),
}

/**
 * Catalogue stub — real HTML is built at send time from Firebase Storage URLs
 * via `buildCaseStudiesEmailHtml` + `fetchEmailCaseStudyThumbs`.
 */
export const CASE_STUDIES_INSERT_BLOCK: EmailInsertBlock = {
  id: 'case-studies',
  label: 'Case studies (Firebase thumbs)',
  description:
    'Filled at send time from Site Content email-case-study-thumbs / caseStudies Storage URLs',
  html: buildCaseStudiesEmailHtml([]),
}

/** Catalogue shown in the admin insert-block row. Add more as you design them. */
export const EMAIL_INSERT_BLOCKS: EmailInsertBlock[] = [
  DISCOVERY_CONFIRMATION_INSERT_BLOCK,
  HOW_WE_WORK_INSERT_BLOCK,
  CASE_STUDIES_INSERT_BLOCK,
]
