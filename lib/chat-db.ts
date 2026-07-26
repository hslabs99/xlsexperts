import 'server-only'

import { FieldValue, type DocumentReference } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { CHATS_COLLECTION } from '@/lib/firebase'
import {
  CHAT_ROLES,
  CHAT_STATUSES,
  DEFAULT_CHAT_SETTINGS,
  type ChatMessage,
  type ChatRole,
  type ChatSession,
  type ChatStatus,
} from '@/lib/chat'

const MESSAGES_SUBCOLLECTION = 'messages'
const MAX_MESSAGE_LENGTH = 4_000
const MAX_PREVIEW_LENGTH = 160

function mapSession(id: string, data: Record<string, unknown>): ChatSession {
  const status: ChatStatus = CHAT_STATUSES.includes(data.status as ChatStatus)
    ? (data.status as ChatStatus)
    : 'open'
  const lastMessageRole = CHAT_ROLES.includes(data.lastMessageRole as ChatRole)
    ? (data.lastMessageRole as ChatRole)
    : ''

  return {
    id,
    visitorToken: String(data.visitorToken ?? ''),
    status,
    visitorName: String(data.visitorName ?? ''),
    preview: String(data.preview ?? ''),
    lastMessageRole,
    lastMessageAt: data.lastMessageAt ?? null,
    unreadByAdmin: Boolean(data.unreadByAdmin),
    unreadByVisitor: Boolean(data.unreadByVisitor),
    connected: Boolean(data.connected),
    visitorTypingAt: data.visitorTypingAt ?? null,
    adminTypingAt: data.adminTypingAt ?? null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  }
}

function mapMessage(id: string, data: Record<string, unknown>): ChatMessage {
  const role: ChatRole = CHAT_ROLES.includes(data.role as ChatRole)
    ? (data.role as ChatRole)
    : 'visitor'
  return {
    id,
    role,
    body: String(data.body ?? ''),
    createdAt: data.createdAt ?? null,
  }
}

function previewOf(body: string): string {
  const trimmed = body.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= MAX_PREVIEW_LENGTH) return trimmed
  return `${trimmed.slice(0, MAX_PREVIEW_LENGTH - 1)}…`
}

export function validateChatMessageBody(body: unknown): string | null {
  if (typeof body !== 'string') return 'Message is required.'
  const trimmed = body.trim()
  if (!trimmed) return 'Message is required.'
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`
  }
  return null
}

/**
 * Create a new chat session, seed the welcome admin message, and optionally
 * append the visitor’s first message in the same write batch.
 */
export async function createChatSession(input: {
  visitorToken: string
  visitorName?: string
  firstMessage?: string
  welcomeMessage?: string
}): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
  const token = input.visitorToken.trim()
  if (!token || token.length > 128) {
    throw new Error('Invalid visitor token.')
  }

  const welcome =
    input.welcomeMessage?.trim() || DEFAULT_CHAT_SETTINGS.welcomeMessage

  const db = getAdminDb()
  const sessionRef = db.collection(CHATS_COLLECTION).doc()
  const messagesCol = sessionRef.collection(MESSAGES_SUBCOLLECTION)
  const welcomeRef = messagesCol.doc()
  const batch = db.batch()

  const visitorName = input.visitorName?.trim().slice(0, 120) || ''
  const firstMessage = input.firstMessage?.trim() || ''

  batch.set(sessionRef, {
    visitorToken: token,
    status: 'open' satisfies ChatStatus,
    visitorName,
    preview: previewOf(firstMessage || welcome),
    lastMessageRole: (firstMessage ? 'visitor' : 'admin') as ChatRole,
    lastMessageAt: FieldValue.serverTimestamp(),
    unreadByAdmin: Boolean(firstMessage),
    unreadByVisitor: !firstMessage,
    connected: false,
    visitorTypingAt: null,
    adminTypingAt: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  batch.set(welcomeRef, {
    role: 'admin' satisfies ChatRole,
    body: welcome,
    createdAt: FieldValue.serverTimestamp(),
  })

  let visitorMsgRef: DocumentReference | null = null
  if (firstMessage) {
    visitorMsgRef = messagesCol.doc()
    batch.set(visitorMsgRef, {
      role: 'visitor' satisfies ChatRole,
      body: firstMessage,
      createdAt: FieldValue.serverTimestamp(),
    })
  }

  await batch.commit()

  const sessionSnap = await sessionRef.get()
  const session = mapSession(
    sessionRef.id,
    sessionSnap.data() as Record<string, unknown>
  )

  const messages: ChatMessage[] = [
    {
      id: welcomeRef.id,
      role: 'admin',
      body: welcome,
      createdAt: session.createdAt,
    },
  ]
  if (firstMessage && visitorMsgRef) {
    messages.push({
      id: visitorMsgRef.id,
      role: 'visitor',
      body: firstMessage,
      createdAt: session.createdAt,
    })
  }

  return { session, messages }
}

export async function getChatSession(
  sessionId: string
): Promise<ChatSession | null> {
  const snap = await getAdminDb()
    .collection(CHATS_COLLECTION)
    .doc(sessionId)
    .get()
  if (!snap.exists) return null
  return mapSession(snap.id, snap.data() as Record<string, unknown>)
}

export async function fetchChatMessages(
  sessionId: string
): Promise<ChatMessage[]> {
  const snap = await getAdminDb()
    .collection(CHATS_COLLECTION)
    .doc(sessionId)
    .collection(MESSAGES_SUBCOLLECTION)
    .orderBy('createdAt', 'asc')
    .get()
  return snap.docs.map((d) =>
    mapMessage(d.id, d.data() as Record<string, unknown>)
  )
}

export async function appendChatMessage(input: {
  sessionId: string
  role: ChatRole
  body: string
}): Promise<ChatMessage> {
  const body = input.body.trim()
  const db = getAdminDb()
  const sessionRef = db.collection(CHATS_COLLECTION).doc(input.sessionId)
  const msgRef = sessionRef.collection(MESSAGES_SUBCOLLECTION).doc()

  const batch = db.batch()
  batch.set(msgRef, {
    role: input.role,
    body,
    createdAt: FieldValue.serverTimestamp(),
  })
  batch.update(sessionRef, {
    preview: previewOf(body),
    lastMessageRole: input.role,
    lastMessageAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    status: 'open',
    unreadByAdmin: input.role === 'visitor',
    unreadByVisitor: input.role === 'admin',
    // Clear this side’s typing indicator once the message is sent.
    ...(input.role === 'visitor'
      ? { visitorTypingAt: null }
      : { adminTypingAt: null, connected: true }),
  })
  await batch.commit()

  return {
    id: msgRef.id,
    role: input.role,
    body,
    createdAt: new Date().toISOString(),
  }
}

export async function fetchAllChatSessions(): Promise<ChatSession[]> {
  const snap = await getAdminDb()
    .collection(CHATS_COLLECTION)
    .orderBy('lastMessageAt', 'desc')
    .get()
  return snap.docs.map((d) =>
    mapSession(d.id, d.data() as Record<string, unknown>)
  )
}

export async function updateChatStatus(
  sessionId: string,
  status: ChatStatus
): Promise<void> {
  await getAdminDb().collection(CHATS_COLLECTION).doc(sessionId).update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function markChatReadByAdmin(sessionId: string): Promise<void> {
  await getAdminDb().collection(CHATS_COLLECTION).doc(sessionId).update({
    unreadByAdmin: false,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function markChatReadByVisitor(sessionId: string): Promise<void> {
  await getAdminDb().collection(CHATS_COLLECTION).doc(sessionId).update({
    unreadByVisitor: false,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

/** Heartbeat or clear the typing indicator for a role. */
export async function setChatTyping(input: {
  sessionId: string
  role: ChatRole
  typing: boolean
}): Promise<void> {
  const field =
    input.role === 'visitor' ? 'visitorTypingAt' : 'adminTypingAt'
  await getAdminDb()
    .collection(CHATS_COLLECTION)
    .doc(input.sessionId)
    .update({
      [field]: input.typing ? FieldValue.serverTimestamp() : null,
    })
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const db = getAdminDb()
  const sessionRef = db.collection(CHATS_COLLECTION).doc(sessionId)
  const messagesSnap = await sessionRef.collection(MESSAGES_SUBCOLLECTION).get()
  const batch = db.batch()
  for (const doc of messagesSnap.docs) {
    batch.delete(doc.ref)
  }
  batch.delete(sessionRef)
  await batch.commit()
}

export function toPublicSession(session: ChatSession) {
  const { visitorToken: _token, ...rest } = session
  return rest
}
