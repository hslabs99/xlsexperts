import { NextResponse } from 'next/server'
import {
  createAiSystemPrompt,
  deleteAiSystemPrompt,
  fetchAiSystemPrompts,
  seedDefaultAiSystemPrompts,
  updateAiSystemPrompt,
} from '@/lib/ai-system-prompts-db'
import {
  isAiSystemPromptKind,
  type AiSystemPrompt,
  type AiSystemPromptInput,
} from '@/lib/ai-system-prompts'
import { withTimeout } from '@/lib/with-timeout'

function serializeTimestamp(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString()
    } catch {
      return null
    }
  }
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return null
}

function serializePrompt(row: AiSystemPrompt) {
  return {
    ...row,
    createdAt: serializeTimestamp(row.createdAt),
    updatedAt: serializeTimestamp(row.updatedAt),
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const kindParam = searchParams.get('kind')?.trim()
    const kind =
      kindParam && isAiSystemPromptKind(kindParam) ? kindParam : undefined

    const items = await withTimeout(
      fetchAiSystemPrompts(kind),
      12_000,
      'fetchAiSystemPrompts'
    )
    return NextResponse.json({
      ok: true,
      items: items.map(serializePrompt),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load AI system prompts',
        items: [],
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AiSystemPromptInput & {
      action?: string
    }

    if (body.action === 'seed') {
      const result = await withTimeout(
        seedDefaultAiSystemPrompts(),
        30_000,
        'seedDefaultAiSystemPrompts'
      )
      return NextResponse.json({ ok: true, ...result })
    }

    if (!isAiSystemPromptKind(body.kind)) {
      return NextResponse.json(
        { ok: false, error: 'kind must be blog-draft or blog-image' },
        { status: 400 }
      )
    }

    const id = await withTimeout(
      createAiSystemPrompt(body),
      8_000,
      'createAiSystemPrompt'
    )
    return NextResponse.json({ ok: true, id })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create AI system prompt',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Partial<AiSystemPromptInput> & {
      id?: string
    }
    const id = body.id?.trim()
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required' },
        { status: 400 }
      )
    }
    const { id: _id, ...fields } = body
    await withTimeout(
      updateAiSystemPrompt(id, fields),
      8_000,
      'updateAiSystemPrompt'
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update AI system prompt',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')?.trim()
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required' },
        { status: 400 }
      )
    }
    await withTimeout(deleteAiSystemPrompt(id), 8_000, 'deleteAiSystemPrompt')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete AI system prompt',
      },
      { status: 500 }
    )
  }
}
