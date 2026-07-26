/**
 * Public chat settings (timeout + visitor-facing copy only).
 */

import { NextResponse } from 'next/server'
import { fetchChatSettings } from '@/lib/chat-settings-db'
import { toPublicChatSettings } from '@/lib/chat'
import { withTimeout } from '@/lib/with-timeout'

export async function GET() {
  try {
    const settings = await withTimeout(
      fetchChatSettings(),
      8_000,
      'fetchChatSettings'
    )
    return NextResponse.json({
      ok: true,
      settings: toPublicChatSettings(settings),
    })
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
