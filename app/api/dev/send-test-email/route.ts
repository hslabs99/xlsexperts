/**
 * POST /api/dev/send-test-email
 *
 * Development-only SendGrid smoke test.
 * Unavailable when NODE_ENV === "production".
 *
 * Recipient is fixed from SENDGRID_TEST_RECIPIENT (or CONTACT_NOTIFY_EMAIL /
 * SENDGRID_FROM_EMAIL). Does not accept arbitrary recipients or HTML from the client.
 */

import { NextResponse } from 'next/server'
import { isEmailError } from '@/lib/email/errors'
import { sendEmail } from '@/lib/email/sendgrid'

function resolveTestRecipient(): string | null {
  return (
    process.env.SENDGRID_TEST_RECIPIENT?.trim() ||
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
    process.env.SENDGRID_FROM_EMAIL?.trim() ||
    null
  )
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  const to = resolveTestRecipient()
  if (!to) {
    return NextResponse.json(
      {
        error:
          'Set SENDGRID_TEST_RECIPIENT (or CONTACT_NOTIFY_EMAIL / SENDGRID_FROM_EMAIL) in .env.local',
      },
      { status: 400 }
    )
  }

  try {
    const result = await sendEmail({
      to,
      subject: 'XLS Experts — SendGrid test email',
      text: [
        'This is a development test email from the XLS Experts Next.js app.',
        '',
        'If you received this, SendGrid Mail Send is configured correctly.',
        `Sent at: ${new Date().toISOString()}`,
      ].join('\n'),
      html: `
        <p>This is a development test email from the XLS Experts Next.js app.</p>
        <p>If you received this, SendGrid Mail Send is configured correctly.</p>
        <p><small>Sent at: ${new Date().toISOString()}</small></p>
      `.trim(),
      category: 'dev-test',
      referenceId: `dev-test-${Date.now()}`,
    })

    return NextResponse.json({
      ok: true,
      acceptedBySendGrid: result.accepted,
      statusCode: result.statusCode,
      messageId: result.messageId,
      note: 'acceptedBySendGrid means SendGrid accepted the request, not inbox delivery.',
    })
  } catch (error) {
    if (isEmailError(error)) {
      return NextResponse.json(
        {
          ok: false,
          kind: error.kind,
          statusCode: error.statusCode,
          message: error.message,
          sendGridErrors: error.sendGridErrors ?? null,
          sendGridBody: error.sendGridBody ?? null,
        },
        { status: error.kind === 'configuration' ? 500 : 502 }
      )
    }

    console.error('[dev/send-test-email] Unexpected error')
    return NextResponse.json({ ok: false, message: 'Unexpected error' }, { status: 500 })
  }
}
