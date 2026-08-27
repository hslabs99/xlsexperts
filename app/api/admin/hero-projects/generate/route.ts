import { NextResponse } from 'next/server'
import { generateHeroProjectIcon } from '@/lib/hero-trust-ai'
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

    const body = (await request.json()) as { label?: string }

    if (!body.label?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Project label is required' },
        { status: 400 }
      )
    }

    const url = await withTimeout(
      generateHeroProjectIcon({ label: body.label }),
      85_000,
      'generateHeroProjectIcon'
    )

    return NextResponse.json({ ok: true, url })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate project icon',
      },
      { status: 500 }
    )
  }
}
