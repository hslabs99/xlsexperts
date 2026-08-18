'use client'

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookmarkPlus, Plus, Send, Trash2, X } from 'lucide-react'
import {
  DEFAULT_CHAT_SETTINGS,
  isChatTypingActive,
  isSystemWelcomeMessage,
  newChatQuickReplyId,
  normalizeChatSettings,
  type ChatMessage,
  type ChatQuickReply,
  type ChatSessionPublic,
  type ChatSettings,
  type ChatStatus,
} from '@/lib/chat'
import { ChatTypingIndicator } from '@/components/chat-typing-indicator'
import { AdminDialog } from '@/components/admin-dialog'

type ApiSession = ChatSessionPublic & {
  createdAt: string | null
  updatedAt: string | null
  lastMessageAt: string | null
}

type ApiMessage = ChatMessage & { createdAt: string | null }

type ChatTab = 'active' | 'settings'

const CHAT_TABS: { id: ChatTab; label: string }[] = [
  { id: 'active', label: 'Active chats' },
  { id: 'settings', label: 'Chat settings' },
]

function formatWhen(value: string | null | undefined): string {
  if (!value) return '—'
  const t = Date.parse(value)
  if (!Number.isFinite(t)) return '—'
  return new Date(t).toLocaleString('en-NZ')
}

function formatTime(value: string | null | undefined): string {
  if (!value) return ''
  const t = Date.parse(value)
  if (!Number.isFinite(t)) return ''
  return new Date(t).toLocaleTimeString('en-NZ', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function parseMs(value: string | null | undefined): number | null {
  if (!value) return null
  const t = Date.parse(value)
  return Number.isFinite(t) ? t : null
}

function isAwaitingReply(
  session: Pick<ApiSession, 'lastMessageRole' | 'status'> | null | undefined
): boolean {
  if (!session || session.status === 'closed') return false
  return session.lastMessageRole === 'visitor'
}

/** Session is still in the initial hookup until a human admin has replied. */
function isConnectingThread(
  messages: ApiMessage[],
  welcomeMessage: string
): boolean {
  const hasVisitor = messages.some((m) => m.role === 'visitor')
  if (!hasVisitor) return false
  const hasHumanReply = messages.some(
    (m) =>
      m.role === 'admin' &&
      !isSystemWelcomeMessage(m.body, welcomeMessage)
  )
  return !hasHumanReply
}

function remainingReplyMs(
  lastMessageAt: string | null | undefined,
  nowMs: number,
  timeoutSeconds: number
): number | null {
  const started = parseMs(lastMessageAt)
  if (started == null) return null
  return Math.max(0, timeoutSeconds * 1000 - (nowMs - started))
}

function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m <= 0) return `${s}s`
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Append a quick reply to the draft so several can be stacked before sending. */
function appendToDraft(draft: string, body: string): string {
  const addition = body.trim()
  if (!addition) return draft
  const base = draft.trimEnd()
  if (!base) return addition
  return `${base} ${addition}`
}

function ReplyCountdownBadge({
  remainingMs,
  compact,
}: {
  remainingMs: number
  compact?: boolean
}) {
  const urgent = remainingMs <= 10_000
  const expired = remainingMs <= 0
  const label = expired
    ? 'Timed out'
    : compact
      ? formatCountdown(remainingMs)
      : `${formatCountdown(remainingMs)} left to reply`

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
        expired
          ? 'bg-stone-200 text-stone-600'
          : urgent
            ? 'bg-red-100 text-red-700'
            : 'bg-amber-100 text-amber-800'
      }`}
      title={
        expired
          ? 'Visitor may already see the enquiry / book-a-call fallback'
          : 'Time left before the visitor is shown the default enquiry CTA'
      }
    >
      {label}
    </span>
  )
}

function ChatSettingsEditor({
  settings,
  onChange,
  onSave,
  onReset,
  saving,
  dirty,
  message,
  error,
}: {
  settings: ChatSettings
  onChange: (next: ChatSettings) => void
  onSave: () => void
  onReset: () => void
  saving: boolean
  dirty: boolean
  message: string | null
  error: string | null
}) {
  function updateQuickReply(id: string, patch: Partial<ChatQuickReply>) {
    onChange({
      ...settings,
      quickReplies: settings.quickReplies.map((row) =>
        row.id === id ? { ...row, ...patch } : row
      ),
    })
  }

  function removeQuickReply(id: string) {
    onChange({
      ...settings,
      quickReplies: settings.quickReplies.filter((row) => row.id !== id),
    })
  }

  function addQuickReply() {
    onChange({
      ...settings,
      quickReplies: [
        ...settings.quickReplies,
        { id: newChatQuickReplyId(), name: 'New reply', body: '' },
      ],
    })
  }

  return (
    <div className="space-y-5 rounded-lg border border-border bg-surface p-4">
      <div>
        <h3 className="text-sm font-semibold text-ink">Response settings</h3>
        <p className="mt-0.5 text-xs text-ink-muted">
          Timeout, visitor-facing messages, and the quick-reply dictionary used
          on the Active chats tab.
        </p>
      </div>

      <label className="block max-w-xs text-sm">
        <span className="font-semibold text-ink">
          Default reply timeout (seconds)
        </span>
        <input
          type="number"
          min={10}
          max={600}
          value={settings.timeoutSeconds}
          onChange={(e) =>
            onChange({
              ...settings,
              timeoutSeconds: Number(e.target.value) || 45,
            })
          }
          className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <span className="mt-1 block text-xs text-ink-muted">
          How long the visitor waits before the enquiry / book-a-call fallback.
        </span>
      </label>

      <label className="block text-sm">
        <span className="font-semibold text-ink">First system message</span>
        <input
          type="text"
          value={settings.welcomeMessage}
          onChange={(e) =>
            onChange({ ...settings, welcomeMessage: e.target.value })
          }
          className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>

      <label className="block text-sm">
        <span className="font-semibold text-ink">Waiting status lines</span>
        <textarea
          rows={4}
          value={settings.waitingStatusLines.join('\n')}
          onChange={(e) =>
            onChange({
              ...settings,
              waitingStatusLines: e.target.value.split('\n'),
            })
          }
          className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <span className="mt-1 block text-xs text-ink-muted">
          One line per rotating status shown while waiting for a reply.
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold text-ink">Timeout message title</span>
          <input
            type="text"
            value={settings.escalationTitle}
            onChange={(e) =>
              onChange({ ...settings, escalationTitle: e.target.value })
            }
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-semibold text-ink">Timeout message body</span>
          <textarea
            rows={3}
            value={settings.escalationBody}
            onChange={(e) =>
              onChange({ ...settings, escalationBody: e.target.value })
            }
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-ink">
              Quick-reply dictionary
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              Name is the tag label; body is the text added to the reply box.
            </p>
          </div>
          <button
            type="button"
            onClick={addQuickReply}
            className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
            Add reply
          </button>
        </div>

        <ul className="mt-3 space-y-2">
          {settings.quickReplies.map((row) => (
            <li
              key={row.id}
              className="grid gap-2 rounded-md border border-border bg-background p-3 sm:grid-cols-[minmax(8rem,12rem)_1fr_auto]"
            >
              <input
                type="text"
                value={row.name}
                onChange={(e) =>
                  updateQuickReply(row.id, { name: e.target.value })
                }
                placeholder="Tag label"
                className="rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="text"
                value={row.body}
                onChange={(e) =>
                  updateQuickReply(row.id, { body: e.target.value })
                }
                placeholder="Message text"
                className="rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="button"
                onClick={() => removeQuickReply(row.id)}
                className="inline-flex items-center justify-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                aria-label={`Remove ${row.name || 'reply'}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {dirty ? (
          <button
            type="button"
            disabled={saving}
            onClick={onReset}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-ink transition hover:bg-muted disabled:opacity-50"
          >
            Discard changes
          </button>
        ) : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
    </div>
  )
}

export function AdminChatPanel() {
  const [tab, setTab] = useState<ChatTab>('active')
  const [items, setItems] = useState<ApiSession[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ApiMessage[]>([])
  const [selected, setSelected] = useState<ApiSession | null>(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_CHAT_SETTINGS)
  const [settingsDraft, setSettingsDraft] =
    useState<ChatSettings>(DEFAULT_CHAT_SETTINGS)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [dictBusy, setDictBusy] = useState(false)
  const [dictNotice, setDictNotice] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const replyInputRef = useRef<HTMLInputElement>(null)
  const selectedIdRef = useRef<string | null>(null)
  const dictNoticeTimerRef = useRef<number | null>(null)

  const showDictNotice = useCallback((text: string) => {
    setDictNotice(text)
    if (dictNoticeTimerRef.current != null) {
      window.clearTimeout(dictNoticeTimerRef.current)
    }
    dictNoticeTimerRef.current = window.setTimeout(() => {
      setDictNotice(null)
      dictNoticeTimerRef.current = null
    }, 4000)
  }, [])

  useEffect(() => {
    return () => {
      if (dictNoticeTimerRef.current != null) {
        window.clearTimeout(dictNoticeTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [])

  const loadSettings = useCallback(async () => {
    const res = await fetch('/api/admin/chat-settings')
    const data = (await res.json()) as {
      ok?: boolean
      error?: string
      settings?: ChatSettings
    }
    if (!res.ok || !data.ok || !data.settings) {
      throw new Error(data.error || 'Failed to load chat settings')
    }
    const normalized = normalizeChatSettings(data.settings)
    setSettings(normalized)
    setSettingsDraft(normalized)
  }, [])

  const loadList = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/chat')
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        items?: ApiSession[]
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load chats')
      }
      setItems(data.items ?? [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadThread = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/chat?id=${encodeURIComponent(id)}`)
    const data = (await res.json()) as {
      ok?: boolean
      error?: string
      session?: ApiSession
      messages?: ApiMessage[]
    }
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Failed to load conversation')
    }
    setSelected(data.session ?? null)
    setMessages(data.messages ?? [])
    setItems((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, unreadByAdmin: false, ...data.session } : row
      )
    )
  }, [])

  useEffect(() => {
    void loadSettings().catch((err) => {
      setSettingsError(
        err instanceof Error ? err.message : 'Failed to load settings'
      )
    })
    void loadList()
    const id = window.setInterval(() => {
      void loadList()
      const current = selectedIdRef.current
      if (current) {
        void loadThread(current).catch(() => {})
      }
    }, 4000)
    return () => window.clearInterval(id)
  }, [loadList, loadSettings, loadThread])

  // Faster poll while a conversation is open so visitor typing feels live.
  useEffect(() => {
    if (!selectedId) return
    const id = window.setInterval(() => {
      void loadThread(selectedId).catch(() => {})
    }, 1500)
    return () => window.clearInterval(id)
  }, [selectedId, loadThread])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, selectedId, selected?.visitorTypingAt])

  // Heartbeat: tell the visitor we're typing while the draft has content.
  useEffect(() => {
    if (!selectedId || tab !== 'active') return
    const typing = draft.trim().length > 0
    let cancelled = false

    async function ping(next: boolean) {
      try {
        await fetch('/api/admin/chat', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedId, typing: next }),
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
  }, [draft, selectedId, tab])

  async function saveSettings() {
    setSettingsSaving(true)
    setSettingsMessage(null)
    setSettingsError(null)
    try {
      const payload = normalizeChatSettings(settingsDraft)
      const res = await fetch('/api/admin/chat-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        settings?: ChatSettings
      }
      if (!res.ok || !data.ok || !data.settings) {
        throw new Error(data.error || 'Failed to save settings')
      }
      const saved = normalizeChatSettings(data.settings)
      setSettings(saved)
      setSettingsDraft(saved)
      setSettingsMessage('Settings saved.')
    } catch (err) {
      setSettingsError(
        err instanceof Error ? err.message : 'Failed to save settings'
      )
    } finally {
      setSettingsSaving(false)
    }
  }

  async function selectChat(id: string) {
    setSelectedId(id)
    setError(null)
    setDraft('')
    try {
      await loadThread(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open chat')
    }
  }

  const sendReply = useCallback(
    async (text: string) => {
      if (!selectedId || !text.trim() || busy) return
      setBusy(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedId, message: text.trim() }),
        })
        const data = (await res.json()) as {
          ok?: boolean
          error?: string
          message?: ApiMessage
        }
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Failed to send reply')
        }
        setDraft('')
        if (data.message) {
          setMessages((prev) => [...prev, data.message!])
        }
        await loadList()
        await loadThread(selectedId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send reply')
      } finally {
        setBusy(false)
      }
    },
    [busy, loadList, loadThread, selectedId]
  )

  async function handleReply(event: FormEvent) {
    event.preventDefault()
    await sendReply(draft)
  }

  function addQuickReplyToDraft(body: string) {
    setDraft((prev) => appendToDraft(prev, body))
    replyInputRef.current?.focus()
  }

  /** Save the current reply text as a new dictionary entry (persisted). */
  async function saveDraftToDictionary() {
    const body = draft.trim()
    if (!body || dictBusy) return
    if (settings.quickReplies.some((r) => r.body.trim() === body)) {
      showDictNotice('Already in the dictionary.')
      return
    }
    setDictBusy(true)
    try {
      const newEntry = {
        id: newChatQuickReplyId(),
        name: body.length > 28 ? `${body.slice(0, 27)}…` : body,
        body,
      }
      const payload = normalizeChatSettings({
        ...settings,
        quickReplies: [...settings.quickReplies, newEntry],
      })
      const res = await fetch('/api/admin/chat-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        settings?: ChatSettings
      }
      if (!res.ok || !data.ok || !data.settings) {
        throw new Error(data.error || 'Failed to save quick reply')
      }
      const saved = normalizeChatSettings(data.settings)
      setSettings(saved)
      // Keep any in-progress settings-tab edits, just append the new entry.
      setSettingsDraft((prev) =>
        prev.quickReplies.some((r) => r.body.trim() === body)
          ? prev
          : { ...prev, quickReplies: [...prev.quickReplies, newEntry] }
      )
      showDictNotice('Added to quick replies.')
    } catch (err) {
      showDictNotice(
        err instanceof Error ? err.message : 'Failed to save quick reply'
      )
    } finally {
      setDictBusy(false)
    }
  }

  async function setStatus(status: ChatStatus) {
    if (!selectedId || busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId, status }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update status')
      }
      await loadList()
      await loadThread(selectedId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!selectedId || busy) return
    setDeleteConfirmOpen(false)
    setBusy(true)
    try {
      const res = await fetch(
        `/api/admin/chat?id=${encodeURIComponent(selectedId)}`,
        { method: 'DELETE' }
      )
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to delete')
      }
      setSelectedId(null)
      setSelected(null)
      setMessages([])
      await loadList()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setBusy(false)
    }
  }

  const unreadCount = items.filter((i) => i.unreadByAdmin).length
  const awaitingCount = items.filter((i) => isAwaitingReply(i)).length
  const timeoutSeconds = settings.timeoutSeconds
  const settingsDirty =
    JSON.stringify(settingsDraft) !== JSON.stringify(settings)

  const selectedRemainingMs = useMemo(() => {
    if (!selected || !isAwaitingReply(selected)) return null
    // Countdown only matters during the initial connection window.
    if (!isConnectingThread(messages, settings.welcomeMessage)) return null
    return remainingReplyMs(selected.lastMessageAt, nowMs, timeoutSeconds)
  }, [selected, nowMs, timeoutSeconds, messages, settings.welcomeMessage])

  const visitorIsTyping = isChatTypingActive(selected?.visitorTypingAt, nowMs)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Live chat</h2>
          <p className="mt-1 text-sm text-ink-muted">
            On a new chat, reply within {timeoutSeconds}s before the visitor is
            shown the enquiry / book-a-call fallback. After you answer once, it
            continues as a normal conversation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {awaitingCount > 0 ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {awaitingCount} waiting
            </span>
          ) : null}
          {unreadCount > 0 ? (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              {unreadCount} unread
            </span>
          ) : null}
        </div>
      </div>

      <div
        className="flex flex-wrap gap-1 border-b border-border"
        role="tablist"
        aria-label="Chat sections"
      >
        {CHAT_TABS.map((item) => {
          const active = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'border-brand text-brand'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {item.label}
              {item.id === 'active' && awaitingCount > 0 ? (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  {awaitingCount}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {tab === 'settings' ? (
        <div role="tabpanel">
          <ChatSettingsEditor
            settings={settingsDraft}
            onChange={setSettingsDraft}
            onSave={() => void saveSettings()}
            onReset={() => setSettingsDraft(settings)}
            saving={settingsSaving}
            dirty={settingsDirty}
            message={settingsMessage}
            error={settingsError}
          />
        </div>
      ) : (
        <div className="space-y-4" role="tabpanel">
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          <div className="grid min-h-[28rem] overflow-hidden rounded-lg border border-border bg-surface lg:grid-cols-[minmax(14rem,20rem)_1fr]">
            <aside className="border-b border-border lg:border-b-0 lg:border-r">
              <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Conversations
              </div>
              {loading ? (
                <p className="p-4 text-sm text-ink-muted">Loading…</p>
              ) : items.length === 0 ? (
                <p className="p-4 text-sm text-ink-muted">
                  No chats yet. When a visitor sends a message from the site, it
                  will appear here.
                </p>
              ) : (
                <ul className="max-h-[18rem] overflow-y-auto lg:max-h-[32rem]">
                  {items.map((item) => {
                    const active = item.id === selectedId
                const awaiting = isAwaitingReply(item)
                const connectingWait = awaiting && !item.connected
                const remaining = connectingWait
                      ? remainingReplyMs(
                          item.lastMessageAt,
                          nowMs,
                          timeoutSeconds
                        )
                      : null
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => void selectChat(item.id)}
                          className={`flex w-full flex-col gap-1 border-b border-border px-3 py-3 text-left transition ${
                            active
                              ? 'bg-brand/10'
                              : connectingWait
                                ? 'bg-amber-50/80 hover:bg-amber-50'
                                : 'hover:bg-muted/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-ink">
                              {item.visitorName || 'Website visitor'}
                            </span>
                            {item.unreadByAdmin ? (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                            ) : null}
                          </div>
                          <span className="line-clamp-2 text-xs text-ink-muted">
                            {item.preview || '—'}
                          </span>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-muted">
                            <span>{formatWhen(item.lastMessageAt)}</span>
                            {remaining != null ? (
                              <ReplyCountdownBadge
                                remainingMs={remaining}
                                compact
                              />
                            ) : (
                              <span
                                className={
                                  item.status === 'open'
                                    ? 'font-semibold text-emerald-700'
                                    : 'font-semibold text-stone-500'
                                }
                              >
                                {item.status}
                              </span>
                            )}
                          </div>
                          {connectingWait ? (
                            <span className="text-[11px] font-semibold text-amber-800">
                              {isChatTypingActive(item.visitorTypingAt, nowMs)
                                ? 'Visitor typing…'
                                : 'New chat — waiting to connect'}
                            </span>
                          ) : isChatTypingActive(item.visitorTypingAt, nowMs) ? (
                            <span className="text-[11px] font-semibold text-brand">
                              Visitor typing…
                            </span>
                          ) : awaiting ? (
                            <span className="text-[11px] font-semibold text-ink-muted">
                              Awaiting your reply
                            </span>
                          ) : null}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </aside>

            <section className="flex min-h-[22rem] flex-col">
              {!selectedId ? (
                <div className="flex flex-1 items-center justify-center p-6 text-sm text-ink-muted">
                  Select a conversation to reply.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {selected?.visitorName || 'Website visitor'}
                      </p>
                      <p className="text-xs text-ink-muted">
                        Started {formatWhen(selected?.createdAt)} ·{' '}
                        {selected?.status}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {selected?.status === 'open' ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void setStatus('closed')}
                          className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-muted disabled:opacity-50"
                        >
                          Close chat
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void setStatus('open')}
                          className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-muted disabled:opacity-50"
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setDeleteConfirmOpen(true)}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {selectedRemainingMs != null ? (
                    <div
                      className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 ${
                        selectedRemainingMs <= 0
                          ? 'border-stone-200 bg-stone-100'
                          : selectedRemainingMs <= 10_000
                            ? 'border-red-200 bg-red-50'
                            : 'border-amber-200 bg-amber-50'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {selectedRemainingMs <= 0
                            ? 'Reply window ended'
                            : 'Visitor is waiting'}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {selectedRemainingMs <= 0
                            ? 'They may already see the enquiry / book-a-call message. You can still reply.'
                            : `Reply before the fallback CTA appears (${timeoutSeconds}s window).`}
                        </p>
                      </div>
                      <ReplyCountdownBadge remainingMs={selectedRemainingMs} />
                    </div>
                  ) : null}

                  <div
                    ref={listRef}
                    className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-4"
                  >
                    {messages.map((msg) => {
                      const fromAdmin = msg.role === 'admin'
                      const system = isSystemWelcomeMessage(
                        msg.body,
                        settings.welcomeMessage
                      )
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${fromAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                              fromAdmin
                                ? system
                                  ? 'rounded-br-md bg-stone-200 text-ink'
                                  : 'rounded-br-md bg-brand text-white'
                                : 'rounded-bl-md bg-white text-ink ring-1 ring-border'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {msg.body}
                            </p>
                            <p
                              className={`mt-1 text-[10px] ${
                                fromAdmin && !system
                                  ? 'text-white/70'
                                  : 'text-ink-muted'
                              }`}
                            >
                              {system ? 'System' : fromAdmin ? 'You' : 'Visitor'}
                              {msg.createdAt
                                ? ` · ${formatTime(msg.createdAt)}`
                                : ''}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    {visitorIsTyping ? (
                      <ChatTypingIndicator label="Visitor is typing" />
                    ) : null}
                  </div>

                  <div className="border-t border-border bg-surface px-3 pt-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                        Quick replies — click to build your message
                      </p>
                      <div className="flex items-center gap-3">
                        {dictNotice ? (
                          <span className="text-[11px] font-semibold text-emerald-700">
                            {dictNotice}
                          </span>
                        ) : null}
                        {draft.trim() ? (
                          <button
                            type="button"
                            onClick={() => setDraft('')}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-muted transition hover:text-ink"
                          >
                            <X className="h-3 w-3" />
                            Clear
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {settings.quickReplies.length === 0 ? (
                      <p className="mb-3 text-xs text-ink-muted">
                        No quick replies yet — add some on the Chat settings tab.
                      </p>
                    ) : (
                      <div className="mb-1 flex flex-wrap gap-2">
                        {settings.quickReplies.map((reply) => (
                          <button
                            key={reply.id}
                            type="button"
                            disabled={busy || !reply.body.trim()}
                            title={reply.body}
                            onClick={() => addQuickReplyToDraft(reply.body)}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs font-medium text-ink transition hover:border-brand hover:bg-brand/5 disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3 text-brand" />
                            {reply.name || reply.body}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={handleReply}
                    className="flex items-center gap-2 border-t border-border bg-surface p-3"
                  >
                    <input
                      ref={replyInputRef}
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Type a reply, or click quick replies above…"
                      maxLength={4000}
                      disabled={busy}
                      className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={dictBusy || !draft.trim()}
                      onClick={() => void saveDraftToDictionary()}
                      title="Add this text to the quick-reply dictionary"
                      aria-label="Add this text to the quick-reply dictionary"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-brand transition hover:border-brand hover:bg-brand/5 disabled:opacity-40"
                    >
                      <BookmarkPlus className="h-4 w-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={busy || !draft.trim()}
                      className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      Reply
                    </button>
                  </form>
                </>
              )}
            </section>
          </div>
        </div>
      )}

      <AdminDialog
        open={deleteConfirmOpen}
        title="Delete this chat?"
        mode="confirm"
        tone="danger"
        confirmLabel="Delete chat"
        busy={busy}
        onClose={() => {
          if (!busy) setDeleteConfirmOpen(false)
        }}
        onConfirm={() => void handleDelete()}
      >
        <p>Delete this chat and all messages? This cannot be undone.</p>
      </AdminDialog>
    </div>
  )
}
