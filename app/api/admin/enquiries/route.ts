import { NextResponse } from 'next/server'
import {
  deleteEnquiry,
  fetchAllEnquiries,
  updateEnquiryStatus,
} from '@/lib/enquiries-db'
import { ENQUIRY_STATUSES, type EnquiryStatus } from '@/lib/enquiries'
import { withTimeout } from '@/lib/with-timeout'

function serializeEnquiry(row: Awaited<ReturnType<typeof fetchAllEnquiries>>[number]) {
  return {
    ...row,
    // Timestamps are not always JSON-friendly; coerce for the admin UI.
    createdAt: serializeTimestamp(row.createdAt),
    updatedAt: serializeTimestamp(row.updatedAt),
  }
}

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

export async function GET() {
  try {
    const rows = await withTimeout(fetchAllEnquiries(), 12_000, 'fetchAllEnquiries')
    return NextResponse.json({
      ok: true,
      items: rows.map(serializeEnquiry),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load enquiries',
        items: [],
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; status?: string }
    const id = body.id?.trim()
    const status = body.status as EnquiryStatus | undefined
    if (!id || !status || !ENQUIRY_STATUSES.includes(status)) {
      return NextResponse.json(
        { ok: false, error: 'id and valid status are required' },
        { status: 400 }
      )
    }
    await withTimeout(
      updateEnquiryStatus(id, status),
      8_000,
      'updateEnquiryStatus'
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to update',
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
      return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 })
    }
    await withTimeout(deleteEnquiry(id), 8_000, 'deleteEnquiry')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to delete',
      },
      { status: 500 }
    )
  }
}
