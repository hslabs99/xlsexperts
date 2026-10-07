import { NextResponse } from 'next/server'
import {
  fetchBlogSerpPrompt,
  saveBlogSerpPrompt,
} from '@/lib/blog-serp-prompt-db'
import { normalizeBlogSerpPrompt } from '@/lib/blog-serp-prompt'
import { withTimeout } from '@/lib/with-timeout'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const prompt = await withTimeout(
      fetchBlogSerpPrompt(),
      8_000,
      'fetchBlogSerpPrompt'
    )
    return NextResponse.json({ ok: true, prompt })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load prompt',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string }
    const prompt = normalizeBlogSerpPrompt(body.prompt)
    const saved = await withTimeout(
      saveBlogSerpPrompt(prompt),
      8_000,
      'saveBlogSerpPrompt'
    )
    return NextResponse.json({ ok: true, prompt: saved })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to save prompt',
      },
      { status: 500 }
    )
  }
}
