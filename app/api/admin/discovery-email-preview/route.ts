import { NextResponse } from 'next/server'
import { getDiscoveryClientPresentationTemplate } from '@/lib/email-presentation-templates'
import { applyMergeTags, normalizeEmailHtml } from '@/lib/email-templates'
import type { EnquiryMergeContext } from '@/lib/email-templates'

const SAMPLE_DISCOVERY_CTX: EnquiryMergeContext = {
  from: 'XLS Experts',
  name: 'Jane Example',
  email: 'jane@example.com',
  phone: '+64 21 000 0000',
  company: 'Example Ltd',
  about:
    'We need help automating monthly Excel reporting and a management dashboard for regional sales.',
  hear: 'Admin panel',
  concernsPlain: 'Macros / VBA, Charts & Dashboards',
  concernsHtml: '<ul><li>Macros / VBA</li><li>Charts &amp; Dashboards</li></ul>',
  service: 'Excel VBA/Macro Development',
  solution: 'Dashboards & Business Intelligence',
  enquiryType: 'Discovery request (Microsoft Teams)',
  when: 'Tuesday · 21 July 2026 · 10:00 AM',
  method: 'Microsoft Teams',
  day: 'Tuesday',
  date: '21 July 2026',
  time: '10:00 AM',
  downloadUrl: '',
  downloadLabel: '',
}

/**
 * Server-side discovery email preview — keeps sharp / presentation assembly
 * out of the Admin Email client bundle.
 */
export async function GET() {
  try {
    const template = await getDiscoveryClientPresentationTemplate()
    const subject = applyMergeTags(template.subject, SAMPLE_DISCOVERY_CTX, {
      html: false,
    })
    const html = normalizeEmailHtml(
      applyMergeTags(template.htmlBody, SAMPLE_DISCOVERY_CTX, { html: true })
    )
    return NextResponse.json({ ok: true, subject, html })
  } catch (error) {
    console.error('[discovery-email-preview]', error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Preview failed',
        subject: "You're booked — discovery call …",
        html: '<p style="padding:24px;font-family:sans-serif;color:#6b7280;">Could not load discovery preview.</p>',
      },
      { status: 500 }
    )
  }
}
