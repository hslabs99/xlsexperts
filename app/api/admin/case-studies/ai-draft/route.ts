import { NextResponse } from 'next/server'
import { generateCaseStudyDraft } from '@/lib/case-study-ai'
import { getOpenAIApiKey, openaiKeyMissingMessage } from '@/lib/openai'
import { withTimeout } from '@/lib/with-timeout'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    if (!getOpenAIApiKey()) {
      return NextResponse.json(
        {
          ok: false,
          error: openaiKeyMissingMessage(),
        },
        { status: 503 }
      )
    }

    const body = (await request.json()) as {
      client?: string
      title?: string
      brief?: string
      sectorHint?: string
    }

    const draft = await withTimeout(
      generateCaseStudyDraft({
        client: body.client ?? '',
        title: body.title ?? '',
        brief: body.brief ?? '',
        sectorHint: body.sectorHint,
      }),
      55_000,
      'generateCaseStudyDraft'
    )

    return NextResponse.json({ ok: true, draft })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate case-study draft',
      },
      { status: 500 }
    )
  }
}
