import { NextResponse } from 'next/server'
import { generateBlogImage } from '@/lib/blog-ai'
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
      systemPrompt?: string
      imagePrompt?: string
      brief?: string
      userPrompt?: string
    }

    if (!body.title?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const image = await withTimeout(
      generateBlogImage({
        title: body.title,
        systemPrompt: body.systemPrompt ?? '',
        imagePrompt: body.imagePrompt,
        brief: body.brief,
        userPrompt: body.userPrompt,
      }),
      85_000,
      'generateBlogImage'
    )

    return NextResponse.json({
      ok: true,
      imageBase64: image.imageBase64,
      mimeType: image.mimeType,
      revisedPrompt: image.revisedPrompt ?? null,
      dataUrl: `data:${image.mimeType};base64,${image.imageBase64}`,
      width: image.width ?? null,
      height: image.height ?? null,
      originalBytes: image.originalBytes ?? null,
      optimizedBytes: image.optimizedBytes ?? null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate blog image',
      },
      { status: 500 }
    )
  }
}
