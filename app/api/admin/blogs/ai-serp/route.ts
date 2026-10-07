import { NextResponse } from 'next/server'
import { generateBlogSerpListings } from '@/lib/blog-ai'
import { fetchBlogSerpPrompt } from '@/lib/blog-serp-prompt-db'
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
      title?: string
      excerpt?: string
      category?: string
      body?: string
      prompt?: string
    }

    const prompt =
      body.prompt?.trim() ||
      (await fetchBlogSerpPrompt())

    const listings = await withTimeout(
      generateBlogSerpListings({
        title: body.title ?? '',
        excerpt: body.excerpt,
        category: body.category,
        body: body.body,
        prompt,
      }),
      80_000,
      'generateBlogSerpListings'
    )

    return NextResponse.json({ ok: true, listings })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate Google listing',
      },
      { status: 500 }
    )
  }
}
