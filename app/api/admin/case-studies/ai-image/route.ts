import { NextResponse } from 'next/server'
import { generateCaseStudyImage } from '@/lib/case-study-ai'
import { getOpenAIApiKey } from '@/lib/openai'
import { withTimeout } from '@/lib/with-timeout'

export const runtime = 'nodejs'
export const maxDuration = 90

export async function POST(request: Request) {
  try {
    if (!getOpenAIApiKey()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'OPENAI_API_KEY is not configured. Add it to .env.local and App Hosting.',
        },
        { status: 503 }
      )
    }

    const body = (await request.json()) as {
      client?: string
      title?: string
      sector?: string
      imagePrompt?: string
      brief?: string
    }

    if (!body.client?.trim() || !body.title?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Client and project title are required' },
        { status: 400 }
      )
    }

    const image = await withTimeout(
      generateCaseStudyImage({
        client: body.client,
        title: body.title,
        sector: body.sector,
        imagePrompt: body.imagePrompt,
        brief: body.brief,
      }),
      85_000,
      'generateCaseStudyImage'
    )

    return NextResponse.json({
      ok: true,
      imageBase64: image.imageBase64,
      mimeType: image.mimeType,
      revisedPrompt: image.revisedPrompt ?? null,
      dataUrl: `data:${image.mimeType};base64,${image.imageBase64}`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate case-study image',
      },
      { status: 500 }
    )
  }
}
