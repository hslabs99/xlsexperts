/**
 * Public unsubscribe endpoint for marketing mailings.
 * GET  — validate token, return contact summary
 * POST — confirm unsubscribe { token }
 */

import { NextResponse } from 'next/server'
import {
  fetchMailingContactById,
  markContactUnsubscribed,
} from '@/lib/mailings-db'
import { verifyUnsubscribeToken } from '@/lib/mailings-unsubscribe'
import { withTimeout } from '@/lib/with-timeout'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')?.trim() || ''
  const parsed = verifyUnsubscribeToken(token)
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 })
  }

  try {
    const contact = await withTimeout(
      fetchMailingContactById(parsed.contactId),
      8_000,
      'fetchMailingContactById'
    )
    if (!contact || contact.email.toLowerCase() !== parsed.email) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }
    return NextResponse.json({
      email: contact.email,
      name: contact.name || contact.contact,
      unsubscribed: contact.unsubscribed,
    })
  } catch {
    return NextResponse.json({ error: 'Could not load contact' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  let body: { token?: string }
  try {
    body = (await request.json()) as { token?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = verifyUnsubscribeToken(body.token?.trim() || '')
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 })
  }

  try {
    const ok = await withTimeout(
      markContactUnsubscribed(parsed.contactId, parsed.email),
      8_000,
      'markContactUnsubscribed'
    )
    if (!ok) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, unsubscribed: true })
  } catch {
    return NextResponse.json(
      { error: 'Could not unsubscribe' },
      { status: 500 }
    )
  }
}
