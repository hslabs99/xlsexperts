import { NextResponse } from 'next/server'
import {
  createEmailTemplate,
  deleteEmailTemplate,
  fetchEmailTemplates,
  seedDefaultEmailTemplates,
  updateEmailTemplate,
} from '@/lib/email-templates-db'
import type { EmailTemplate, EmailTemplateInput } from '@/lib/email-templates'
import { withTimeout } from '@/lib/with-timeout'

function serializeTimestamp(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString()
    } catch {
      return null
    }
  }
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return null
}

function serializeTemplate(row: EmailTemplate) {
  return {
    ...row,
    createdAt: serializeTimestamp(row.createdAt),
    updatedAt: serializeTimestamp(row.updatedAt),
  }
}

export async function GET() {
  try {
    const items = await withTimeout(
      fetchEmailTemplates(),
      12_000,
      'fetchEmailTemplates'
    )
    return NextResponse.json({
      ok: true,
      items: items.map(serializeTemplate),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load email templates',
        items: [],
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EmailTemplateInput & {
      action?: string
    }

    if (body.action === 'seed') {
      const result = await withTimeout(
        seedDefaultEmailTemplates(),
        30_000,
        'seedDefaultEmailTemplates'
      )
      return NextResponse.json({ ok: true, ...result })
    }

    const id = await withTimeout(
      createEmailTemplate(body),
      8_000,
      'createEmailTemplate'
    )
    return NextResponse.json({ ok: true, id })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create email template',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Partial<EmailTemplateInput> & {
      id?: string
    }
    const id = body.id?.trim()
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required' },
        { status: 400 }
      )
    }
    const { id: _id, ...fields } = body
    await withTimeout(
      updateEmailTemplate(id, fields),
      8_000,
      'updateEmailTemplate'
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update email template',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')?.trim()
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required' },
        { status: 400 }
      )
    }
    await withTimeout(deleteEmailTemplate(id), 8_000, 'deleteEmailTemplate')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete email template',
      },
      { status: 500 }
    )
  }
}
