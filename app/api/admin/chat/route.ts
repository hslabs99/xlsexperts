/**
 * Admin live-chat API.
 *
 * GET    — list sessions, or one session + messages when `id` is provided
 * POST   — reply as admin
 * PATCH  — update status / mark read
 * DELETE — remove a session and its messages
 */

import { NextResponse } from 'next/server'
import {
  appendChatMessage,
  deleteChatSession,
  fetchAllChatSessions,
  fetchChatMessages,
  getChatSession,
  markChatReadByAdmin,
  setChatTyping,
  toPublicSession,
  updateChatStatus,
  validateChatMessageBody,
} from '@/lib/chat-db'
import { CHAT_STATUSES, type ChatStatus } from '@/lib/chat'
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

function serializeSession(
  row: Awaited<ReturnType<typeof fetchAllChatSessions>>[number]
) {
  const pub = toPublicSession(row)
  return {
    ...pub,
    createdAt: serializeTimestamp(pub.createdAt),
    updatedAt: serializeTimestamp(pub.updatedAt),
    lastMessageAt: serializeTimestamp(pub.lastMessageAt),
    visitorTypingAt: serializeTimestamp(pub.visitorTypingAt),
    adminTypingAt: serializeTimestamp(pub.adminTypingAt),
  }
}

function serializeMessage(
  row: Awaited<ReturnType<typeof fetchChatMessages>>[number]
) {
  return {
    ...row,
    createdAt: serializeTimestamp(row.createdAt),
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')?.trim()

    if (id) {
      const session = await withTimeout(
        getChatSession(id),
        8_000,
        'getChatSession'
      )
      if (!session) {
        return NextResponse.json(
          { ok: false, error: 'Chat not found' },
          { status: 404 }
        )
      }
      const messages = await withTimeout(
        fetchChatMessages(id),
        8_000,
        'fetchChatMessages'
      )
      if (session.unreadByAdmin) {
        void markChatReadByAdmin(id).catch(() => {})
      }
      return NextResponse.json({
        ok: true,
        session: serializeSession(session),
        messages: messages.map(serializeMessage),
      })
    }

    const rows = await withTimeout(
      fetchAllChatSessions(),
      12_000,
      'fetchAllChatSessions'
    )
    return NextResponse.json({
      ok: true,
      items: rows.map(serializeSession),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load chats',
        items: [],
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; message?: string }
    const id = body.id?.trim()
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required' },
        { status: 400 }
      )
    }
    const validationError = validateChatMessageBody(body.message)
    if (validationError) {
      return NextResponse.json(
        { ok: false, error: validationError },
        { status: 400 }
      )
    }

    const session = await withTimeout(getChatSession(id), 8_000, 'getChatSession')
    if (!session) {
      return NextResponse.json(
        { ok: false, error: 'Chat not found' },
        { status: 404 }
      )
    }

    const appended = await withTimeout(
      appendChatMessage({
        sessionId: id,
        role: 'admin',
        body: body.message!.trim(),
      }),
      8_000,
      'appendChatMessage'
    )

    return NextResponse.json({
      ok: true,
      message: serializeMessage(appended),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to reply',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string
      status?: string
      markRead?: boolean
      typing?: boolean
    }
    const id = body.id?.trim()
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required' },
        { status: 400 }
      )
    }

    if (typeof body.typing === 'boolean') {
      await withTimeout(
        setChatTyping({ sessionId: id, role: 'admin', typing: body.typing }),
        8_000,
        'setChatTyping'
      )
    }

    if (body.markRead) {
      await withTimeout(markChatReadByAdmin(id), 8_000, 'markChatReadByAdmin')
    }

    if (body.status) {
      const status = body.status as ChatStatus
      if (!CHAT_STATUSES.includes(status)) {
        return NextResponse.json(
          { ok: false, error: 'Invalid status' },
          { status: 400 }
        )
      }
      await withTimeout(
        updateChatStatus(id, status),
        8_000,
        'updateChatStatus'
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to update',
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
    await withTimeout(deleteChatSession(id), 12_000, 'deleteChatSession')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to delete',
      },
      { status: 500 }
    )
  }
}
