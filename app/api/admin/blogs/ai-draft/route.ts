import { NextResponse } from 'next/server'
import { generateBlogDraft } from '@/lib/blog-ai'
import { getOpenAIApiKey, openaiKeyMissingMessage } from '@/lib/openai'
import { withTimeout } from '@/lib/with-timeout'

export const runtime = 'nodejs'
export const maxDuration = 90

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
      title?: string
      brief?: string
      userPrompt?: string
      systemPrompt?: string
      categoryHint?: string
      authorHint?: string
    }

    const draft = await withTimeout(
      generateBlogDraft({
        title: body.title ?? '',
        brief: body.brief ?? '',
        userPrompt: body.userPrompt ?? '',
        systemPrompt: body.systemPrompt ?? '',
        categoryHint: body.categoryHint,
        authorHint: body.authorHint,
      }),
      85_000,
      'generateBlogDraft'
    )

    return NextResponse.json({ ok: true, draft })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate blog draft',
      },
      { status: 500 }
    )
  }
}
