/**
 * POST /api/admin/email/test
 *
 * Admin SendGrid test / debug endpoint.
 * Recipient and From are always server-controlled (env).
 * Optional subject/text from the admin UI for customizing the test message only —
 * not an open relay (no arbitrary To / From / HTML templates from the client).
 */

import { NextResponse } from 'next/server'
import {
  getEmailConfigSnapshot,
  hintsForSendGridStatus,
} from '@/lib/email/diagnostics'
import { isEmailError } from '@/lib/email/errors'
import { sendEmail } from '@/lib/email/sendgrid'
import {
  buildDiscoveryMergeContext,
  buildStandardMergeContext,
  getBusinessEmail,
  renderEnquiryNotification,
  resolveTemplateRecipients,
} from '@/lib/email/enquiry-notify'
import type { BookingPayload, ContactPayload } from '@/lib/types'

type TestMode = 'smoke' | 'contact-sample' | 'discovery-sample' | 'custom'

type AdminEmailTestBody = {
  mode?: TestMode
  subject?: string
  text?: string
}

type DebugStep = {
  step: string
  status: 'ok' | 'fail' | 'info'
  detail?: string
  at: string
}

function now(): string {
  return new Date().toISOString()
}

function push(
  steps: DebugStep[],
  step: string,
  status: DebugStep['status'],
  detail?: string
) {
  steps.push({ step, status, detail, at: now() })
}

export async function POST(request: Request) {
  const steps: DebugStep[] = []
  const startedAt = now()

  push(steps, 'request.received', 'info', 'Admin email test started')

  let body: AdminEmailTestBody = {}
  try {
    const raw = await request.text()
    if (raw.trim()) {
      body = JSON.parse(raw) as AdminEmailTestBody
    }
    push(steps, 'request.parse', 'ok', `mode=${body.mode ?? 'smoke'}`)
  } catch {
    push(steps, 'request.parse', 'fail', 'Invalid JSON body')
    return NextResponse.json(
      {
        ok: false,
        startedAt,
        finishedAt: now(),
        steps,
        error: { kind: 'validation', message: 'Invalid JSON body' },
      },
      { status: 400 }
    )
  }

  const config = getEmailConfigSnapshot()
  push(
    steps,
    'config.snapshot',
    config.ready ? 'ok' : 'fail',
    config.ready
      ? `Ready. From=${config.fromEmail}; testTo=${config.resolvedTestRecipient}; apiKey=${config.apiKey.masked}`
      : `Not ready. Missing: ${config.missingRequired.join(', ') || 'recipient'}`
  )

  if (!config.ready) {
    return NextResponse.json(
      {
        ok: false,
        startedAt,
        finishedAt: now(),
        steps,
        config,
        error: {
          kind: 'configuration',
          message: 'SendGrid environment is incomplete',
          missingRequired: config.missingRequired,
          hints: config.hints,
        },
      },
      { status: 500 }
    )
  }

  const mode: TestMode = body.mode ?? 'smoke'
  const referenceId = `admin-${mode}-${Date.now()}`

  let to = config.resolvedTestRecipient as string
  let cc: string[] | undefined
  let bcc: string[] | undefined
  let subject = 'XLS Experts — SendGrid admin test'
  let text = [
    'This is an admin-panel test email from the XLS Experts Next.js app.',
    '',
    `Mode: ${mode}`,
    `Reference: ${referenceId}`,
    `Sent at: ${now()}`,
  ].join('\n')
  let html: string | undefined
  let replyTo: string | undefined
  let category = 'admin-test'

  if (mode === 'custom') {
    if (body.subject?.trim()) subject = body.subject.trim().slice(0, 200)
    if (body.text?.trim()) {
      text = body.text.trim().slice(0, 5000)
    }
    push(
      steps,
      'compose.custom',
      'ok',
      `Subject length=${subject.length}; text length=${text.length}`
    )
  } else if (mode === 'contact-sample') {
    const businessEmail = getBusinessEmail()
    if (!businessEmail) {
      push(steps, 'compose.contact-sample', 'fail', 'No CONTACT_NOTIFY_EMAIL / FROM')
      return NextResponse.json(
        {
          ok: false,
          startedAt,
          finishedAt: now(),
          steps,
          config,
          error: {
            kind: 'configuration',
            message: 'No business email configured',
            hints: config.hints,
          },
        },
        { status: 500 }
      )
    }

    const sample: ContactPayload = {
      name: 'Admin Test User',
      company: 'XLS Experts (test)',
      email: config.resolvedTestRecipient || 'admin-test@example.com',
      phone: '+64 21 000 0000',
      message:
        'This is a sample contact-enquiry email generated from the Admin → Email tab to verify the production notification path.',
      services: ['Macros / VBA', 'Data Analysis'],
      hear: 'Admin panel',
    }

    const rendered = await renderEnquiryNotification(
      'standard',
      buildStandardMergeContext(sample)
    )
    const resolved = resolveTemplateRecipients(
      rendered.recipients,
      sample.email,
      businessEmail
    )

    to = resolved.to
    cc = resolved.cc
    bcc = resolved.bcc
    subject = rendered.subject
    text = rendered.text
    html = rendered.html
    replyTo = resolved.replyTo
    category = 'contact-enquiry'
    push(
      steps,
      'compose.contact-sample',
      'ok',
      `Template "${rendered.templateName}" → to=${to}; cc=${cc.join(',') || 'none'}; bcc=${bcc.join(',') || 'none'}`
    )
  } else if (mode === 'discovery-sample') {
    const businessEmail = getBusinessEmail()
    if (!businessEmail) {
      push(steps, 'compose.discovery-sample', 'fail', 'No CONTACT_NOTIFY_EMAIL / FROM')
      return NextResponse.json(
        {
          ok: false,
          startedAt,
          finishedAt: now(),
          steps,
          config,
          error: {
            kind: 'configuration',
            message: 'No business email configured',
            hints: config.hints,
          },
        },
        { status: 500 }
      )
    }

    const sample: BookingPayload = {
      name: 'Admin Test User',
      company: 'Example Ltd',
      email: config.resolvedTestRecipient || 'admin-test@example.com',
      phone: '+64 21 000 0000',
      message:
        'We need help automating monthly Excel reporting and a management dashboard for regional sales.',
      services: ['Macros / VBA', 'Charts & Dashboards'],
      hear: 'Admin panel',
      day: 'Tuesday',
      date: '2026-07-21',
      time: '10:00 AM',
      method: 'Microsoft Teams',
      slotId: 'admin-test-slot',
    }

    const rendered = await renderEnquiryNotification(
      'discovery',
      buildDiscoveryMergeContext(sample)
    )

    // Always land the polished sample in the configured test inbox
    to = config.resolvedTestRecipient as string
    cc = undefined
    bcc = undefined
    subject = rendered.subject
    text = rendered.text
    html = rendered.html
    replyTo = businessEmail
    category = 'discovery-booking'
    push(
      steps,
      'compose.discovery-sample',
      'ok',
      `Presentation "${rendered.templateName}" → testTo=${to}`
    )
  } else {
    html = `
      <p>This is an admin-panel test email from the XLS Experts Next.js app.</p>
      <p><strong>Mode:</strong> ${mode}</p>
      <p><strong>Reference:</strong> ${referenceId}</p>
      <p><small>Sent at: ${now()}</small></p>
    `.trim()
    push(steps, 'compose.smoke', 'ok', `Smoke test → ${to}`)
  }

  const requestPreview = {
    to,
    cc: cc ?? [],
    bcc: bcc ?? [],
    from: {
      email: config.fromEmail,
      name: config.fromName,
    },
    replyTo: replyTo ?? null,
    subject,
    category,
    referenceId,
    hasHtml: Boolean(html),
    textPreview: text.length > 280 ? `${text.slice(0, 280)}…` : text,
    textLength: text.length,
    htmlLength: html?.length ?? 0,
  }

  push(
    steps,
    'sendgrid.prepare',
    'info',
    `POST Mail Send — to=${to}; cc=${(cc ?? []).join(',') || 'none'}; from=${config.fromEmail}; category=${category}`
  )

  try {
    const result = await sendEmail({
      to,
      cc,
      bcc,
      subject,
      text,
      html,
      replyTo,
      category,
      referenceId,
    })

    push(
      steps,
      'sendgrid.response',
      'ok',
      `Accepted by SendGrid (HTTP ${result.statusCode ?? 'n/a'}); messageId=${result.messageId ?? 'n/a'}`
    )

    return NextResponse.json({
      ok: true,
      startedAt,
      finishedAt: now(),
      steps,
      config,
      requestPreview,
      result: {
        acceptedBySendGrid: result.accepted,
        statusCode: result.statusCode,
        messageId: result.messageId,
        note: 'acceptedBySendGrid means SendGrid accepted the request, not inbox delivery.',
      },
      hints: [
        'Check the destination inbox (and spam).',
        'Confirm in SendGrid Activity Feed using messageId if shown.',
        ...config.hints.filter((h) => h.includes('acceptedBySendGrid') || h.includes('restart')),
      ],
    })
  } catch (error) {
    if (isEmailError(error)) {
      push(
        steps,
        'sendgrid.response',
        'fail',
        `${error.kind}${error.statusCode ? ` HTTP ${error.statusCode}` : ''}: ${error.message}`
      )

      const hints = [
        ...hintsForSendGridStatus(error.statusCode),
        ...config.hints,
      ]

      return NextResponse.json(
        {
          ok: false,
          startedAt,
          finishedAt: now(),
          steps,
          config,
          requestPreview,
          error: {
            kind: error.kind,
            message: error.message,
            statusCode: error.statusCode,
            sendGridErrors: error.sendGridErrors ?? null,
            sendGridBody: error.sendGridBody ?? null,
          },
          hints,
        },
        {
          status:
            error.kind === 'configuration'
              ? 500
              : error.kind === 'validation'
                ? 400
                : 502,
        }
      )
    }

    push(steps, 'sendgrid.response', 'fail', 'Unexpected non-EmailError')
    console.error('[admin/email/test] Unexpected error')
    return NextResponse.json(
      {
        ok: false,
        startedAt,
        finishedAt: now(),
        steps,
        config,
        requestPreview,
        error: { kind: 'unexpected', message: 'Unexpected server error' },
        hints: config.hints,
      },
      { status: 500 }
    )
  }
}
