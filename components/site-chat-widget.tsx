'use client'

import { FormEvent, useEffect, useId, useRef, useState } from 'react'
import { ArrowRight, MessageCircle, Phone, Send, X } from 'lucide-react'
import {
  CHAT_VISITOR_STORAGE_KEY,
  DEFAULT_CHAT_SETTINGS,
  isChatTypingActive,
  isSystemWelcomeMessage,
  type ChatMessage,
  type ChatSessionPublic,
  type ChatSettingsPublic,
} from '@/lib/chat'
import { ChatTypingIndicator } from '@/components/chat-typing-indicator'

type StoredChatSession = {
  sessionId: string
  visitorToken: string
}

type ApiMessage = ChatMessage & { createdAt: string | null }

function readStoredSession(): StoredChatSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CHAT_VISITOR_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as StoredChatSession
    if (!data?.sessionId || !data?.visitorToken) return null
    return data
  } catch {
    return null
  }
}

function writeStoredSession(session: StoredChatSession): void {
  localStorage.setItem(CHAT_VISITOR_STORAGE_KEY, JSON.stringify(session))
}

function clearStoredSession(): void {
  localStorage.removeItem(CHAT_VISITOR_STORAGE_KEY)
}

function newVisitorToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `vt-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function formatTime(value: string | null | undefined): string {
  if (!value) return ''
  const t = Date.parse(value)
  if (!Number.isFinite(t)) return ''
  return new Date(t).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getPendingVisitorMessage(
  messages: ApiMessage[]
): ApiMessage | null {
  const last = messages[messages.length - 1]
  if (!last || last.role !== 'visitor') return null
  return last
}

/** True once a human (non-system) admin message exists — session is “connected”. */
function hasRealAdminReply(
  messages: ApiMessage[],
  welcomeMessage?: string
): boolean {
  return messages.some(
    (m) =>
      m.role === 'admin' &&
      !isSystemWelcomeMessage(m.body, welcomeMessage)
  )
}

function hasVisitorMessage(messages: ApiMessage[]): boolean {
  return messages.some((m) => m.role === 'visitor')
}

/**
 * Initial hookup only: visitor has written, but no real human reply yet.
 * After the first real reply, the chat is a normal conversation.
 */
function isConnectingPhase(
  messages: ApiMessage[],
  welcomeMessage?: string
): boolean {
  return (
    hasVisitorMessage(messages) &&
    !hasRealAdminReply(messages, welcomeMessage)
  )
}

function messageSentAtMs(message: ApiMessage): number {
  if (message.createdAt) {
    const t = Date.parse(message.createdAt)
    if (Number.isFinite(t)) return t
  }
  return Date.now()
}

function ChatWaitingContinuum({
  startedAtMs,
  timeoutMs,
  statusLines,
}: {
  startedAtMs: number
  timeoutMs: number
  statusLines: string[]
}) {
  const [now, setNow] = useState(() => Date.now())
  const [lineIndex, setLineIndex] = useState(0)
  const lines =
    statusLines.length > 0
      ? statusLines
      : DEFAULT_CHAT_SETTINGS.waitingStatusLines

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(tick)
  }, [])

  useEffect(() => {
    setLineIndex(0)
    const rotate = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % lines.length)
    }, 3200)
    return () => window.clearInterval(rotate)
  }, [lines])

  const elapsed = Math.max(0, now - startedAtMs)
  const progress = Math.min(1, elapsed / Math.max(1, timeoutMs))

  return (
    <div
      className="rounded-xl border border-[#1a6b3c]/15 bg-white px-3 py-3 shadow-sm"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
          <span
            className="chat-ring-wave absolute inset-0 rounded-full border-2 border-[#1a6b3c]/35"
            aria-hidden="true"
          />
          <span
            className="chat-ring-wave-delay absolute inset-0 rounded-full border-2 border-[#1a6b3c]/25"
            aria-hidden="true"
          />
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f5ee] text-[#1a6b3c]">
            <Phone className="chat-phone-wiggle h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">Connecting</p>
          <p className="chat-status-pulse mt-0.5 truncate text-xs text-gray-500">
            {lines[lineIndex % lines.length]}
          </p>
        </div>
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label="Time waiting for a reply"
      >
        <div
          className="h-full rounded-full bg-[#1a6b3c] transition-[width] duration-200 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}

export function useSiteChat(
  open: boolean,
  options?: {
    onNoReplyEscalate?: () => void
  }
) {
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const escalatedForMsgIdRef = useRef<string | null>(null)
  const onNoReplyEscalateRef = useRef(options?.onNoReplyEscalate)

  const [stored, setStored] = useState<StoredChatSession | null>(null)
  const [messages, setMessages] = useState<ApiMessage[]>([])
  const [session, setSession] = useState<ChatSessionPublic | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnread, setHasUnread] = useState(false)
  const [booted, setBooted] = useState(false)
  const [noReplyEscalated, setNoReplyEscalated] = useState(false)
  const [settings, setSettings] = useState<ChatSettingsPublic>(() =>
    toPublicDefaults()
  )
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    onNoReplyEscalateRef.current = options?.onNoReplyEscalate
  }, [options?.onNoReplyEscalate])

  useEffect(() => {
    setStored(readStoredSession())
    setBooted(true)
    let cancelled = false
    void fetch('/api/chat/settings')
      .then(async (res) => {
        const data = (await res.json()) as {
          ok?: boolean
          settings?: ChatSettingsPublic
        }
        if (cancelled || !data.ok || !data.settings) return
        setSettings(data.settings)
      })
      .catch(() => {
        /* keep defaults */
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open, noReplyEscalated, session?.adminTypingAt])

  async function loadHistory(creds: StoredChatSession) {
    const params = new URLSearchParams({
      sessionId: creds.sessionId,
      visitorToken: creds.visitorToken,
    })
    const res = await fetch(`/api/chat?${params}`)
    const data = (await res.json()) as {
      ok?: boolean
      error?: string
      session?: ChatSessionPublic
      messages?: ApiMessage[]
    }
    if (!res.ok || !data.ok) {
      if (res.status === 404) {
        clearStoredSession()
        setStored(null)
        setSession(null)
        setMessages([])
        return
      }
      throw new Error(data.error || 'Failed to load chat')
    }
    setSession(data.session ?? null)
    setMessages(data.messages ?? [])
    if (open) {
      setHasUnread(false)
    } else if (data.session?.unreadByVisitor) {
      setHasUnread(true)
    }
  }

  useEffect(() => {
    if (!booted || !stored) return
    let cancelled = false
    void loadHistory(stored).catch((err) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Failed to load chat')
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted, stored?.sessionId])

  useEffect(() => {
    if (!stored) return
    // Poll more often while the panel is open so typing indicators feel live.
    const intervalMs = open ? 1500 : 12000
    const id = window.setInterval(() => {
      void loadHistory(stored).catch(() => {})
    }, intervalMs)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stored?.sessionId, open])

  // Heartbeat: tell the admin we're typing while the draft has content.
  useEffect(() => {
    if (!stored || !open) return
    const typing = draft.trim().length > 0
    let cancelled = false

    async function ping(next: boolean) {
      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: stored!.sessionId,
            visitorToken: stored!.visitorToken,
            typing: next,
          }),
        })
      } catch {
        /* ignore */
      }
    }

    if (!typing) {
      void ping(false)
      return () => {
        cancelled = true
      }
    }

    void ping(true)
    const id = window.setInterval(() => {
      if (!cancelled) void ping(true)
    }, 2000)

    return () => {
      cancelled = true
      window.clearInterval(id)
      void ping(false)
    }
  }, [draft, stored?.sessionId, stored?.visitorToken, open])

  const timeoutMs = settings.timeoutSeconds * 1000

  // Escalate to contact CTA only during the initial connection wait —
  // not on every subsequent unanswered message.
  useEffect(() => {
    const connecting = isConnectingPhase(messages, settings.welcomeMessage)
    const pending = getPendingVisitorMessage(messages)

    if (!connecting || !pending) {
      if (!connecting) setNoReplyEscalated(false)
      return
    }

    if (escalatedForMsgIdRef.current === pending.id) {
      setNoReplyEscalated(true)
      return
    }

    setNoReplyEscalated(false)

    const sentAt = messageSentAtMs(pending)
    const remaining = timeoutMs - (Date.now() - sentAt)

    const escalate = () => {
      if (escalatedForMsgIdRef.current === pending.id) return
      escalatedForMsgIdRef.current = pending.id
      setNoReplyEscalated(true)
      onNoReplyEscalateRef.current?.()
    }

    if (remaining <= 0) {
      escalate()
      return
    }

    const timer = window.setTimeout(escalate, remaining)
    return () => window.clearTimeout(timer)
  }, [messages, timeoutMs, settings.welcomeMessage])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || busy) return

    setBusy(true)
    setError(null)
    try {
      const visitorToken = stored?.visitorToken || newVisitorToken()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: stored?.sessionId,
          visitorToken,
          message: text,
          start: !stored,
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        session?: ChatSessionPublic & { visitorToken?: string }
        messages?: ApiMessage[]
        message?: ApiMessage
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to send')
      }

      const nextCreds: StoredChatSession = {
        sessionId: data.session?.id || stored!.sessionId,
        visitorToken: data.session?.visitorToken || visitorToken,
      }
      writeStoredSession(nextCreds)
      setStored(nextCreds)
      setDraft('')
      setNoReplyEscalated(false)
      if (data.messages) {
        setMessages(data.messages)
      } else if (data.message) {
        setMessages((prev) => [...prev, data.message!])
      }
      if (data.session) {
        const { visitorToken: _t, ...pub } = data.session
        setSession(pub)
      }
      setHasUnread(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setBusy(false)
    }
  }

  const pendingVisitor = getPendingVisitorMessage(messages)
  const connectingPhase = isConnectingPhase(messages, settings.welcomeMessage)
  const otherIsTyping = isChatTypingActive(session?.adminTypingAt, nowMs)
  const showConnectingContinuum =
    connectingPhase &&
    Boolean(pendingVisitor) &&
    !noReplyEscalated &&
    !otherIsTyping

  return {
    listRef,
    inputRef,
    messages,
    session,
    draft,
    setDraft,
    busy,
    error,
    hasUnread,
    noReplyEscalated,
    connectingPhase,
    showConnectingContinuum,
    otherIsTyping,
    pendingStartedAtMs: pendingVisitor
      ? messageSentAtMs(pendingVisitor)
      : null,
    settings,
    timeoutMs,
    handleSubmit,
  }
}

function toPublicDefaults(): ChatSettingsPublic {
  return {
    timeoutSeconds: DEFAULT_CHAT_SETTINGS.timeoutSeconds,
    welcomeMessage: DEFAULT_CHAT_SETTINGS.welcomeMessage,
    waitingStatusLines: [...DEFAULT_CHAT_SETTINGS.waitingStatusLines],
    escalationTitle: DEFAULT_CHAT_SETTINGS.escalationTitle,
    escalationBody: DEFAULT_CHAT_SETTINGS.escalationBody,
  }
}

export function SiteChatPanel({
  open,
  onClose,
  panelId,
  chat,
  contactHref,
  onOpenContact,
}: {
  open: boolean
  onClose: () => void
  panelId: string
  chat: ReturnType<typeof useSiteChat>
  contactHref: string
  onOpenContact: () => void
}) {
  if (!open) return null

  const {
    listRef,
    inputRef,
    messages,
    session,
    draft,
    setDraft,
    busy,
    error,
    noReplyEscalated,
    showConnectingContinuum,
    otherIsTyping,
    pendingStartedAtMs,
    settings,
    timeoutMs,
    handleSubmit,
  } = chat

  return (
    <div
      id={panelId}
      role="dialog"
      aria-label="Chat with XLS Experts"
      className="flex h-[min(70vh,28rem)] w-[min(100vw-2.5rem,22rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/15"
    >
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-[#e8f5ee] px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1a6b3c]">
            Chat
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Ask a question — someone will reply here shortly.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-gray-500 transition hover:bg-white/70 hover:text-gray-800"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3 py-3"
      >
        {messages.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-gray-500">
            Say hello to start a conversation.
          </p>
        ) : (
          messages.map((msg) => {
            const fromVisitor = msg.role === 'visitor'
            const systemWelcome =
              msg.role === 'admin' &&
              isSystemWelcomeMessage(msg.body, settings.welcomeMessage)
            return (
              <div
                key={msg.id}
                className={`flex ${fromVisitor ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    fromVisitor
                      ? 'rounded-br-md bg-[#1a6b3c] text-white'
                      : systemWelcome
                        ? 'rounded-bl-md bg-[#e8f5ee] text-gray-800 ring-1 ring-[#1a6b3c]/15'
                        : 'rounded-bl-md bg-white text-gray-900 ring-1 ring-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  {msg.createdAt ? (
                    <p
                      className={`mt-1 text-[10px] ${
                        fromVisitor ? 'text-white/70' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })
        )}

        {otherIsTyping ? <ChatTypingIndicator label="Typing" /> : null}

        {showConnectingContinuum && pendingStartedAtMs != null ? (
          <ChatWaitingContinuum
            startedAtMs={pendingStartedAtMs}
            timeoutMs={timeoutMs}
            statusLines={settings.waitingStatusLines}
          />
        ) : null}

        {session?.status === 'closed' ? (
          <p className="text-center text-xs text-gray-500">
            This chat was marked closed. Send another message to continue.
          </p>
        ) : null}

        {noReplyEscalated ? (
          <div className="rounded-xl border border-[#1a6b3c]/20 bg-white p-3 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">
              {settings.escalationTitle}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">
              {settings.escalationBody}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={onOpenContact}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a6b3c] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#155a32]"
              >
                Enquiry or discovery call
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <a
                href={contactHref}
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold text-[#1a6b3c] transition hover:bg-[#e8f5ee]"
              >
                Go to contact form
              </a>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="border-t border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-gray-100 bg-white p-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          maxLength={4000}
          disabled={busy}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1a6b3c] focus:bg-white focus:ring-2 focus:ring-[#1a6b3c]/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a6b3c] text-white transition hover:bg-[#155a32] disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}

export function SiteChatButton({
  open,
  onOpenChange,
  panelId,
  hasUnread,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  panelId: string
  hasUnread: boolean
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      aria-haspopup="dialog"
      onClick={() => onOpenChange(!open)}
      className="relative inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#1a6b3c] shadow-lg shadow-gray-900/10 ring-1 ring-[#1a6b3c]/25 transition hover:bg-[#e8f5ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c] sm:px-5"
    >
      {open ? (
        <>
          Close chat
          <X className="h-4 w-4" aria-hidden="true" />
        </>
      ) : (
        <>
          Chat
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {hasUnread ? (
            <span
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"
              aria-label="Unread reply"
            />
          ) : null}
        </>
      )}
    </button>
  )
}

/** Hook + panel id helper for the floating CTA layout. */
export function useSiteChatUi(
  open: boolean,
  options?: {
    onNoReplyEscalate?: () => void
  }
) {
  const panelId = useId()
  const chat = useSiteChat(open, options)
  return { panelId, chat }
}
