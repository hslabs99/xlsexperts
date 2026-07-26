/**
 * Public live-chat API.
 *
 * POST — start a session (seeds welcome message) and/or send a visitor message
 * GET  — load session history (requires sessionId + visitorToken)
 */

import { NextResponse } from 'next/server'
import {
  appendChatMessage,
  createChatSession,
  fetchChatMessages,
  getChatSession,
  markChatReadByVisitor,
  setChatTyping,
  toPublicSession,
  validateChatMessageBody,
} from '@/lib/chat-db'
import { fetchChatSettings } from '@/lib/chat-settings-db'
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

function serializeMessage(
  row: Awaited<ReturnType<typeof fetchChatMessages>>[number]
) {
  return {
    ...row,
    createdAt: serializeTimestamp(row.createdAt),
  }
}

function serializeSession(
  row: NonNullable<Awaited<ReturnType<typeof getChatSession>>>
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')?.trim()
    const visitorToken = searchParams.get('visitorToken')?.trim()

    if (!sessionId || !visitorToken) {
      return NextResponse.json(
        { ok: false, error: 'sessionId and visitorToken are required' },
        { status: 400 }
      )
    }

    const session = await withTimeout(
      getChatSession(sessionId),
      8_000,
      'getChatSession'
    )
    if (!session || session.visitorToken !== visitorToken) {
      return NextResponse.json(
        { ok: false, error: 'Chat not found' },
        { status: 404 }
      )
    }

    const messages = await withTimeout(
      fetchChatMessages(sessionId),
      8_000,
      'fetchChatMessages'
    )

    if (session.unreadByVisitor) {
      void markChatReadByVisitor(sessionId).catch(() => {})
    }

    return NextResponse.json({
      ok: true,
      session: serializeSession(session),
      messages: messages.map(serializeMessage),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load chat',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sessionId?: string
      visitorToken?: string
      visitorName?: string
      message?: string
      /** When true and no sessionId, create an empty seeded session (welcome only). */
      start?: boolean
      /** Typing heartbeat — visitor is composing a reply. */
      typing?: boolean
    }

    const visitorToken = body.visitorToken?.trim()
    if (!visitorToken || visitorToken.length > 128) {
      return NextResponse.json(
        { ok: false, error: 'visitorToken is required' },
        { status: 400 }
      )
    }

    const sessionId = body.sessionId?.trim()
    const message = body.message
    const hasMessage = typeof message === 'string' && message.trim().length > 0

    // Typing heartbeat on an existing session (no message body).
    if (
      sessionId &&
      !hasMessage &&
      typeof body.typing === 'boolean' &&
      !body.start
    ) {
      const session = await withTimeout(
        getChatSession(sessionId),
        8_000,
        'getChatSession'
      )
      if (!session || session.visitorToken !== visitorToken) {
        return NextResponse.json(
          { ok: false, error: 'Chat not found' },
          { status: 404 }
        )
      }
      await withTimeout(
        setChatTyping({
          sessionId,
          role: 'visitor',
          typing: body.typing,
        }),
        8_000,
        'setChatTyping'
      )
      return NextResponse.json({ ok: true })
    }

    if (hasMessage) {
      const validationError = validateChatMessageBody(message)
      if (validationError) {
        return NextResponse.json(
          { ok: false, error: validationError },
          { status: 400 }
        )
      }
    }

    // New session
    if (!sessionId) {
      if (!hasMessage && !body.start) {
        return NextResponse.json(
          { ok: false, error: 'message is required to start a chat' },
          { status: 400 }
        )
      }

      const settings = await withTimeout(
        fetchChatSettings(),
        8_000,
        'fetchChatSettings'
      )

      const created = await withTimeout(
        createChatSession({
          visitorToken,
          visitorName: body.visitorName,
          firstMessage: hasMessage ? message!.trim() : undefined,
          welcomeMessage: settings.welcomeMessage,
        }),
        12_000,
        'createChatSession'
      )

      return NextResponse.json({
        ok: true,
        session: {
          ...serializeSession(created.session),
          // Return token once so the client can persist it with the session id.
          visitorToken: created.session.visitorToken,
        },
        messages: created.messages.map(serializeMessage),
      })
    }

    // Existing session — append visitor message
    if (!hasMessage) {
      return NextResponse.json(
        { ok: false, error: 'message is required' },
        { status: 400 }
      )
    }

    const session = await withTimeout(
      getChatSession(sessionId),
      8_000,
      'getChatSession'
    )
    if (!session || session.visitorToken !== visitorToken) {
      return NextResponse.json(
        { ok: false, error: 'Chat not found' },
        { status: 404 }
      )
    }
    const appended = await withTimeout(
      appendChatMessage({
        sessionId,
        role: 'visitor',
        body: message!.trim(),
      }),
      8_000,
      'appendChatMessage'
    )

    const messages = await withTimeout(
      fetchChatMessages(sessionId),
      8_000,
      'fetchChatMessages'
    )
    const refreshed = await getChatSession(sessionId)

    return NextResponse.json({
      ok: true,
      session: refreshed ? serializeSession(refreshed) : null,
      message: serializeMessage(appended),
      messages: messages.map(serializeMessage),
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      },
      { status: 500 }
    )
  }
}
