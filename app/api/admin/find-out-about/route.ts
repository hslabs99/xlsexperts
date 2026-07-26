import { NextResponse } from 'next/server'
import {
  fetchFindOutAboutContent,
  saveFindOutAboutContent,
} from '@/lib/find-out-about-db'
import {
  normalizeFindOutAboutContent,
  type FindOutAboutContent,
} from '@/lib/find-out-about'
import { validateFindOutAboutContent } from '@/lib/find-out-about-pages'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const content = await withTimeout(
      fetchFindOutAboutContent(),
      8_000,
      'fetchFindOutAboutContent'
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
    const body = (await request.json()) as FindOutAboutContent
    const content = normalizeFindOutAboutContent(body)
    const validationError = validateFindOutAboutContent(content)
    if (validationError) {
      return NextResponse.json(
        { ok: false, error: validationError },
        { status: 400 }
      )
    }
    await withTimeout(
      saveFindOutAboutContent(content),
      8_000,
      'saveFindOutAboutContent'
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
