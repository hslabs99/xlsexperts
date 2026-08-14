/**
 * Admin mailing contacts API.
 *
 * GET    — list contacts (+ optional activity for one contact)
 * POST   — create contact, or bulk upload { action: 'upload', rows: [...] }
 * PATCH  — update contact
 * DELETE — delete contact (?id=)
 */

import { NextResponse } from 'next/server'
import {
  bulkUpsertMailingContacts,
  createMailingContact,
  deleteMailingContact,
  fetchAllMailingContacts,
  fetchMailingContactById,
  fetchSendsForContact,
  listDistinctSectors,
  updateMailingContact,
} from '@/lib/mailings-db'
import {
  isMailingContactStatus,
  isMailingRegion,
  type MailingContactInput,
} from '@/lib/mailings'
import { withTimeout } from '@/lib/with-timeout'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')?.trim()

    if (id) {
      const contact = await withTimeout(
        fetchMailingContactById(id),
        8_000,
        'fetchMailingContactById'
      )
      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
      }
      const sends = await withTimeout(
        fetchSendsForContact(id),
        8_000,
        'fetchSendsForContact'
      )
      return NextResponse.json({ contact, sends })
    }

    const contacts = await withTimeout(
      fetchAllMailingContacts(),
      15_000,
      'fetchAllMailingContacts'
    )
    return NextResponse.json({
      contacts,
      sectors: listDistinctSectors(contacts),
    })
  } catch (error) {
    console.error(
      '[admin/mailings/contacts] GET failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { error: 'Could not load contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    if (body.action === 'upload') {
      const rowsRaw = Array.isArray(body.rows) ? body.rows : []
      if (rowsRaw.length === 0) {
        return NextResponse.json({ error: 'No rows to upload' }, { status: 400 })
      }
      if (rowsRaw.length > 2000) {
        return NextResponse.json(
          { error: 'Upload limited to 2000 rows per request' },
          { status: 400 }
        )
      }
      const rows: MailingContactInput[] = []
      for (const item of rowsRaw) {
        if (!item || typeof item !== 'object') continue
        const row = item as Record<string, unknown>
        const email = String(row.email ?? '').trim()
        const name = String(row.name ?? row.contact ?? '').trim()
        if (!email || !EMAIL_RE.test(email)) continue
        rows.push({
          contact: String(row.contact ?? name).trim(),
          name,
          email,
          company: String(row.company ?? '').trim(),
          sector: String(row.sector ?? '').trim(),
          status: isMailingContactStatus(row.status) ? row.status : 'prospect',
          region: isMailingRegion(row.region) ? row.region : 'NZ',
          source: 'upload',
          notes: String(row.notes ?? '').trim(),
        })
      }
      const result = await withTimeout(
        bulkUpsertMailingContacts(rows),
        120_000,
        'bulkUpsertMailingContacts'
      )
      return NextResponse.json({ ok: true, ...result })
    }

    const email = String(body.email ?? '').trim()
    const name = String(body.name ?? body.contact ?? '').trim()
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const id = await withTimeout(
      createMailingContact({
        contact: String(body.contact ?? name).trim(),
        name,
        email,
        company: String(body.company ?? '').trim(),
        sector: String(body.sector ?? '').trim(),
        status: isMailingContactStatus(body.status) ? body.status : 'prospect',
        region: isMailingRegion(body.region) ? body.region : 'NZ',
        source: 'manual',
        notes: String(body.notes ?? '').trim(),
      }),
      8_000,
      'createMailingContact'
    )
    return NextResponse.json({ ok: true, id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save contact'
    const status = message.includes('already exists') ? 409 : 500
    console.error('[admin/mailings/contacts] POST failed', message)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const id = String(body.id ?? '').trim()
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    const patch: Parameters<typeof updateMailingContact>[1] = {}
    if (body.contact !== undefined) patch.contact = String(body.contact)
    if (body.name !== undefined) patch.name = String(body.name)
    if (body.email !== undefined) {
      const email = String(body.email).trim()
      if (!EMAIL_RE.test(email)) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
      }
      patch.email = email
    }
    if (body.company !== undefined) patch.company = String(body.company)
    if (body.sector !== undefined) patch.sector = String(body.sector)
    if (body.status !== undefined) {
      if (!isMailingContactStatus(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      patch.status = body.status
    }
    if (body.region !== undefined) {
      if (!isMailingRegion(body.region)) {
        return NextResponse.json({ error: 'Invalid region' }, { status: 400 })
      }
      patch.region = body.region
    }
    if (body.notes !== undefined) patch.notes = String(body.notes)
    if (body.unsubscribed !== undefined) {
      patch.unsubscribed = Boolean(body.unsubscribed)
    }

    await withTimeout(
      updateMailingContact(id, patch),
      8_000,
      'updateMailingContact'
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(
      '[admin/mailings/contacts] PATCH failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { error: 'Could not update contact' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')?.trim()
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }
  try {
    await withTimeout(deleteMailingContact(id), 8_000, 'deleteMailingContact')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(
      '[admin/mailings/contacts] DELETE failed',
      error instanceof Error ? error.message : undefined
    )
    return NextResponse.json(
      { error: 'Could not delete contact' },
      { status: 500 }
    )
  }
}
