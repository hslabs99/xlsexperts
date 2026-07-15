import { NextResponse } from 'next/server'
import {
  fetchConfirmationContent,
  saveConfirmationContent,
} from '@/lib/confirmation-content-db'
import {
  normalizeConfirmationContent,
  type ConfirmationContent,
} from '@/lib/confirmation-content'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const content = await withTimeout(
      fetchConfirmationContent(),
      8_000,
      'fetchConfirmationContent'
    )
    return NextResponse.json({ ok: true, content })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as ConfirmationContent
    const content = normalizeConfirmationContent(body)
    await withTimeout(
      saveConfirmationContent(content),
      8_000,
      'saveConfirmationContent'
    )
    return NextResponse.json({ ok: true, content })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to save',
      },
      { status: 500 }
    )
  }
}
