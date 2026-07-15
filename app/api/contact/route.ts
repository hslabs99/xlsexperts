/**
 * POST /api/contact
 *
 * Receives a contact form enquiry and returns 200.
 *
 * TO WIRE UP IN CURSOR — add any or all of:
 *   1. Microsoft Teams incoming webhook (simplest):
 *        POST TEAMS_WEBHOOK_URL with an Adaptive Card payload
 *        Env var: TEAMS_WEBHOOK_URL
 *
 *   2. Email notification via Resend / SendGrid:
 *        import { Resend } from 'resend'
 *        Env var: RESEND_API_KEY
 *
 *   3. CRM / database write (Neon, Supabase, etc.)
 */

import { NextResponse } from 'next/server'
import type { ContactPayload } from '@/lib/types'

export async function POST(request: Request) {
  const body: ContactPayload = await request.json()

  // Basic server-side validation
  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  // --- INTEGRATION POINT ---
  // Example Teams webhook (uncomment and add env var in Cursor):
  //
  // await fetch(process.env.TEAMS_WEBHOOK_URL!, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     type: 'message',
  //     attachments: [{
  //       contentType: 'application/vnd.microsoft.card.adaptive',
  //       content: {
  //         type: 'AdaptiveCard',
  //         version: '1.4',
  //         body: [
  //           { type: 'TextBlock', text: `New enquiry from ${body.name}`, weight: 'Bolder', size: 'Medium' },
  //           { type: 'FactSet', facts: [
  //             { title: 'Email',    value: body.email },
  //             { title: 'Phone',   value: body.phone || 'Not provided' },
  //             { title: 'Company', value: body.company || 'Not provided' },
  //             { title: 'Services', value: body.services.join(', ') || 'None selected' },
  //             { title: 'Source',  value: body.hear || 'Not provided' },
  //           ]},
  //           { type: 'TextBlock', text: body.message, wrap: true },
  //         ],
  //       },
  //     }],
  //   }),
  // })
  // --- END INTEGRATION POINT ---

  return NextResponse.json({ success: true }, { status: 200 })
}
