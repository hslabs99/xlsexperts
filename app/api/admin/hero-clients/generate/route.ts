import { NextResponse } from 'next/server'
import { generateHeroClientLogo } from '@/lib/hero-trust-ai'
import { getOpenAIApiKey, openaiKeyMissingMessage } from '@/lib/openai'
import { withTimeout } from '@/lib/with-timeout'

export const runtime = 'nodejs'
export const maxDuration = 90

export async function POST(request: Request) {
  try {
    if (!getOpenAIApiKey()) {
      return NextResponse.json(
        { ok: false, error: openaiKeyMissingMessage() },
        { status: 503 }
      )
    }

    const body = (await request.json()) as {
      name?: string
      abbr?: string
      color?: string
    }

    if (!body.name?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Client name is required' },
        { status: 400 }
      )
    }

    const url = await withTimeout(
      generateHeroClientLogo({
        name: body.name,
        abbr: body.abbr ?? '',
        color: body.color ?? '',
      }),
      85_000,
      'generateHeroClientLogo'
    )

    return NextResponse.json({ ok: true, url })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate client logo',
      },
      { status: 500 }
    )
  }
}
