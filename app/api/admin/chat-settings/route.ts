import { NextResponse } from 'next/server'
import {
  fetchChatSettings,
  saveChatSettings,
} from '@/lib/chat-settings-db'
import { normalizeChatSettings, type ChatSettings } from '@/lib/chat'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const settings = await withTimeout(
      fetchChatSettings(),
      8_000,
      'fetchChatSettings'
    )
    return NextResponse.json({ ok: true, settings })
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
    const body = (await request.json()) as ChatSettings
    const settings = normalizeChatSettings(body)
    const saved = await withTimeout(
      saveChatSettings(settings),
      8_000,
      'saveChatSettings'
    )
    return NextResponse.json({ ok: true, settings: saved })
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
