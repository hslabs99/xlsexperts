/**
 * Live chat sessions stored in Firestore collection `chats`
 * with messages in subcollection `messages`.
 *
 * Configurable copy / timeout / quick replies live in Site Content / chat-settings.
 */

export const CHAT_STATUSES = ['open', 'closed'] as const
export type ChatStatus = (typeof CHAT_STATUSES)[number]

export const CHAT_ROLES = ['visitor', 'admin'] as const
export type ChatRole = (typeof CHAT_ROLES)[number]

export type ChatSession = {
  id: string
  /** Secret token required for visitor read/write access to this session. */
  visitorToken: string
  status: ChatStatus
  visitorName: string
  /** Short preview of the latest message body. */
  preview: string
  lastMessageRole: ChatRole | ''
  lastMessageAt: unknown
  unreadByAdmin: boolean
  unreadByVisitor: boolean
  /**
   * False until a human admin has replied once.
   * Initial connect UI / timeout only apply while this is false.
   */
  connected: boolean
  /** Last heartbeat when the visitor was typing (ISO / Firestore timestamp). */
  visitorTypingAt: unknown
  /** Last heartbeat when the admin was typing. */
  adminTypingAt: unknown
  createdAt: unknown
  updatedAt: unknown
}

export type ChatMessage = {
  id: string
  role: ChatRole
  body: string
  createdAt: unknown
}

export type ChatSessionPublic = Omit<ChatSession, 'visitorToken'>

export const CHAT_VISITOR_STORAGE_KEY = 'xls-chat-session'

/**
 * A typing heartbeat older than this is treated as idle.
 * Clients should re-ping roughly every 2s while the draft has content.
 */
export const CHAT_TYPING_TTL_MS = 4_000

export function timestampToMs(value: unknown): number | null {
  if (!value) return null
  if (typeof value === 'string') {
    const t = Date.parse(value)
    return Number.isFinite(t) ? t : null
  }
  if (value instanceof Date) return value.getTime()
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    try {
      return (value as { toDate: () => Date }).toDate().getTime()
    } catch {
      return null
    }
  }
  return null
}

/** True when a typing heartbeat is still fresh. */
export function isChatTypingActive(
  typingAt: unknown,
  nowMs: number = Date.now()
): boolean {
  const t = timestampToMs(typingAt)
  if (t == null) return false
  return nowMs - t < CHAT_TYPING_TTL_MS
}

/** Dictionary entry: short name (chip) → full response body. */
export type ChatQuickReply = {
  id: string
  name: string
  body: string
}

export type ChatSettings = {
  /** Seconds before an unanswered visitor message escalates to the enquiry CTA. */
  timeoutSeconds: number
  /** First system message seeded when a chat starts. */
  welcomeMessage: string
  /** Rotating status lines shown while waiting for a reply. */
  waitingStatusLines: string[]
  /** Title shown when the no-reply timeout fires. */
  escalationTitle: string
  /** Body shown when the no-reply timeout fires. */
  escalationBody: string
  /** Admin one-tap reply dictionary. */
  quickReplies: ChatQuickReply[]
}

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  timeoutSeconds: 45,
  welcomeMessage: 'Connecting you now…',
  waitingStatusLines: [
    'Connecting…',
    'Still trying…',
    'One moment…',
    'Almost there…',
  ],
  escalationTitle: 'No answer right now',
  escalationBody:
    'We couldn’t connect just now. Leave an enquiry or book a discovery call and we’ll get back to you shortly.',
  quickReplies: [
    {
      id: 'qr-greeting',
      name: 'Greeting',
      body: 'Hi, how are you?',
    },
    {
      id: 'qr-intro-mike',
      name: 'Intro (Mike)',
      body: "I'm Mike. What can I do for you?",
    },
    {
      id: 'qr-understand',
      name: 'Understood',
      body: 'Thanks, I understand — we can discuss that.',
    },
    {
      id: 'qr-tell-more',
      name: 'Tell me more',
      body: 'Sure — tell me a bit more about what you need.',
    },
    {
      id: 'qr-challenge',
      name: 'Main challenge',
      body: 'Happy to help. What’s the main challenge you’re facing?',
    },
    {
      id: 'qr-book-call',
      name: 'Book a call',
      body: 'Got it. When would suit you for a quick call?',
    },
  ],
}

/** @deprecated Prefer DEFAULT_CHAT_SETTINGS.welcomeMessage */
export const CHAT_WELCOME_MESSAGE = DEFAULT_CHAT_SETTINGS.welcomeMessage

/** @deprecated Prefer settings.timeoutSeconds * 1000 */
export const CHAT_NO_REPLY_TIMEOUT_MS =
  DEFAULT_CHAT_SETTINGS.timeoutSeconds * 1000

const MIN_TIMEOUT_SECONDS = 10
const MAX_TIMEOUT_SECONDS = 600
const MAX_QUICK_REPLIES = 40
const MAX_WAITING_LINES = 12

export function newChatQuickReplyId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `qr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function normalizeChatSettings(raw: unknown): ChatSettings {
  const data =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  let timeoutSeconds = Number(data.timeoutSeconds)
  if (!Number.isFinite(timeoutSeconds)) {
    timeoutSeconds = DEFAULT_CHAT_SETTINGS.timeoutSeconds
  }
  timeoutSeconds = Math.round(timeoutSeconds)
  timeoutSeconds = Math.min(
    MAX_TIMEOUT_SECONDS,
    Math.max(MIN_TIMEOUT_SECONDS, timeoutSeconds)
  )

  const welcomeMessage =
    String(data.welcomeMessage ?? '').trim() ||
    DEFAULT_CHAT_SETTINGS.welcomeMessage

  const waitingRaw = Array.isArray(data.waitingStatusLines)
    ? data.waitingStatusLines
    : DEFAULT_CHAT_SETTINGS.waitingStatusLines
  const waitingStatusLines = waitingRaw
    .map((line) => String(line ?? '').trim())
    .filter(Boolean)
    .slice(0, MAX_WAITING_LINES)
  const waiting =
    waitingStatusLines.length > 0
      ? waitingStatusLines
      : [...DEFAULT_CHAT_SETTINGS.waitingStatusLines]

  const escalationTitle =
    String(data.escalationTitle ?? '').trim() ||
    DEFAULT_CHAT_SETTINGS.escalationTitle
  const escalationBody =
    String(data.escalationBody ?? '').trim() ||
    DEFAULT_CHAT_SETTINGS.escalationBody

  const list = Array.isArray(data.quickReplies) ? data.quickReplies : []
  const quickReplies: ChatQuickReply[] = []
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue
    const row = entry as Record<string, unknown>
    const body = String(row.body ?? '').trim()
    if (!body || body.length > 4_000) continue
    const name =
      String(row.name ?? '').trim() ||
      (body.length > 28 ? `${body.slice(0, 27)}…` : body)
    const id = String(row.id ?? '').trim() || newChatQuickReplyId()
    quickReplies.push({
      id: id.slice(0, 80),
      name: name.slice(0, 80),
      body,
    })
    if (quickReplies.length >= MAX_QUICK_REPLIES) break
  }

  return {
    timeoutSeconds,
    welcomeMessage: welcomeMessage.slice(0, 500),
    waitingStatusLines: waiting.map((l) => l.slice(0, 120)),
    escalationTitle: escalationTitle.slice(0, 120),
    escalationBody: escalationBody.slice(0, 1_000),
    quickReplies:
      quickReplies.length > 0
        ? quickReplies
        : DEFAULT_CHAT_SETTINGS.quickReplies.map((q) => ({ ...q })),
  }
}

/** Public fields safe to expose to the visitor chat widget. */
export type ChatSettingsPublic = Pick<
  ChatSettings,
  | 'timeoutSeconds'
  | 'welcomeMessage'
  | 'waitingStatusLines'
  | 'escalationTitle'
  | 'escalationBody'
>

export function toPublicChatSettings(
  settings: ChatSettings
): ChatSettingsPublic {
  return {
    timeoutSeconds: settings.timeoutSeconds,
    welcomeMessage: settings.welcomeMessage,
    waitingStatusLines: settings.waitingStatusLines,
    escalationTitle: settings.escalationTitle,
    escalationBody: settings.escalationBody,
  }
}

export function isSystemWelcomeMessage(
  body: string,
  welcomeMessage?: string
): boolean {
  const text = body.trim()
  if (!text) return false
  if (welcomeMessage && text === welcomeMessage) return true
  return (
    text === DEFAULT_CHAT_SETTINGS.welcomeMessage ||
    text.startsWith('Connecting you now') ||
    text.startsWith('Attempting to contact a consultant') ||
    text.startsWith('Hi — thanks for getting in touch')
  )
}
