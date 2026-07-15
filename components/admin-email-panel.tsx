'use client'

import { useCallback, useEffect, useState } from 'react'
import { AdminEmailTemplatesPanel } from '@/components/admin-email-templates-panel'

type DebugStep = {
  step: string
  status: 'ok' | 'fail' | 'info'
  detail?: string
  at: string
}

type EmailConfigSnapshot = {
  nodeEnv: string | undefined
  ready: boolean
  missingRequired: string[]
  fromEmail: string | null
  fromName: string | null
  notifyEmail: string | null
  testRecipient: string | null
  resolvedTestRecipient: string | null
  apiKey: {
    set: boolean
    length: number
    masked: string | null
    looksLikeSendGrid: boolean
  }
  vars: Array<{
    name: string
    set: boolean
    preview: string | null
    required: boolean
    role: string
  }>
  hints: string[]
}

type AdminEmailResponse = {
  ok: boolean
  startedAt?: string
  finishedAt?: string
  checkedAt?: string
  steps?: DebugStep[]
  config?: EmailConfigSnapshot
  requestPreview?: Record<string, unknown>
  result?: Record<string, unknown>
  error?: Record<string, unknown>
  hints?: string[]
}

function stepColor(status: DebugStep['status']): string {
  if (status === 'ok') return 'border-emerald-200 bg-emerald-50 text-emerald-900'
  if (status === 'fail') return 'border-red-200 bg-red-50 text-red-900'
  return 'border-stone-200 bg-stone-50 text-stone-800'
}

export function AdminEmailPanel() {
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [busy, setBusy] = useState(false)
  const [subject, setSubject] = useState('XLS Experts — custom admin test')
  const [text, setText] = useState(
    'Custom test body from the Admin Email tab.\n\nIf you received this, SendGrid Mail Send is working.'
  )
  const [config, setConfig] = useState<EmailConfigSnapshot | null>(null)
  const [lastResponse, setLastResponse] = useState<AdminEmailResponse | null>(null)
  const [clientLog, setClientLog] = useState<string[]>([])

  const appendLog = useCallback((line: string) => {
    const stamp = new Date().toLocaleTimeString('en-NZ')
    setClientLog((prev) => [`[${stamp}] ${line}`, ...prev].slice(0, 80))
  }, [])

  const refreshStatus = useCallback(async () => {
    setLoadingStatus(true)
    appendLog('GET /api/admin/email/status …')
    try {
      const res = await fetch('/api/admin/email/status')
      const data = (await res.json()) as AdminEmailResponse
      setConfig(data.config ?? null)
      setLastResponse(data)
      appendLog(
        data.ok
          ? `Status OK — ready for send (HTTP ${res.status})`
          : `Status incomplete (HTTP ${res.status})`
      )
    } catch (err) {
      appendLog(`Status request failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoadingStatus(false)
    }
  }, [appendLog])

  useEffect(() => {
    void refreshStatus()
  }, [refreshStatus])

  async function runTest(
    mode: 'smoke' | 'contact-sample' | 'discovery-sample' | 'custom'
  ) {
    setBusy(true)
    appendLog(`POST /api/admin/email/test mode=${mode} …`)
    try {
      const payload =
        mode === 'custom'
          ? { mode, subject, text }
          : { mode }

      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as AdminEmailResponse
      setLastResponse(data)
      if (data.config) setConfig(data.config)

      if (data.ok) {
        appendLog(
          `Accepted by SendGrid (HTTP ${res.status}) messageId=${String(
            data.result?.messageId ?? 'n/a'
          )}`
        )
      } else {
        const kind = String(data.error?.kind ?? 'unknown')
        const statusCode = data.error?.statusCode
        appendLog(
          `FAILED kind=${kind}${statusCode ? ` sgHTTP=${statusCode}` : ''} (HTTP ${res.status}): ${String(
            data.error?.message ?? 'unknown error'
          )}`
        )
        const sgErrors = data.error?.sendGridErrors
        if (Array.isArray(sgErrors)) {
          for (const item of sgErrors) {
            if (item && typeof item === 'object' && 'message' in item) {
              appendLog(`  SendGrid error: ${String((item as { message?: string }).message)}`)
            }
          }
        }
      }
    } catch (err) {
      appendLog(`Request failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  const steps = lastResponse?.steps ?? []
  const hints = lastResponse?.hints ?? config?.hints ?? []

  return (
    <div className="space-y-6">
      <AdminEmailTemplatesPanel />

      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">SendGrid configuration</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Safe snapshot from the server. API key is masked. Restart the Next.js
              server after changing <code className="text-xs">.env.local</code>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshStatus()}
            disabled={loadingStatus || busy}
            className="inline-flex items-center justify-center rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-raised disabled:opacity-60"
          >
            {loadingStatus ? 'Checking…' : 'Refresh status'}
          </button>
        </div>

        {config ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  config.ready
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {config.ready ? 'Ready to send' : 'Not ready'}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                NODE_ENV={config.nodeEnv ?? 'unknown'}
              </span>
              {config.resolvedTestRecipient ? (
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
                  Test → {config.resolvedTestRecipient}
                </span>
              ) : null}
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                    <th className="py-2 pr-3 font-semibold">Variable</th>
                    <th className="py-2 pr-3 font-semibold">Set</th>
                    <th className="py-2 pr-3 font-semibold">Preview</th>
                    <th className="py-2 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {config.vars.map((v) => (
                    <tr key={v.name} className="border-b border-border/60">
                      <td className="py-2.5 pr-3 font-mono text-xs text-ink">
                        {v.name}
                        {v.required ? (
                          <span className="ml-1 text-red-600">*</span>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={
                            v.set
                              ? 'font-semibold text-emerald-700'
                              : 'font-semibold text-red-700'
                          }
                        >
                          {v.set ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-xs text-ink-muted">
                        {v.preview ?? '—'}
                      </td>
                      <td className="py-2.5 text-ink-muted">{v.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-ink-muted">Loading configuration…</p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-ink">Send tests</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Recipient and From always come from server env — not from the browser.
          Use these buttons to exercise the SendGrid path with full step feedback.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void runTest('smoke')}
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Send smoke test'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runTest('contact-sample')}
            className="inline-flex items-center justify-center rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-raised disabled:opacity-60"
          >
            Simulate contact enquiry email
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runTest('discovery-sample')}
            className="inline-flex items-center justify-center rounded-md border border-brand bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-brand hover:text-white disabled:opacity-60"
          >
            Send discovery confirmation sample
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Discovery sample sends the branded presentation email (booking card + How
          we work) to your test recipient — the same document clients receive after
          booking.
        </p>

        <div className="mt-6 rounded-md border border-border bg-surface-raised p-4">
          <h3 className="text-sm font-semibold text-ink">Custom test message</h3>
          <p className="mt-1 text-xs text-ink-muted">
            Still sends only to the configured test recipient. Subject/body for debugging only.
          </p>
          <label className="mt-3 flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="mt-3 flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Plain text body</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              maxLength={5000}
              className="rounded-md border border-border px-3 py-2 font-mono text-xs"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runTest('custom')}
            className="mt-3 inline-flex items-center justify-center rounded-md border border-brand bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-brand hover:text-white disabled:opacity-60"
          >
            Send custom test
          </button>
        </div>
      </div>

      {(steps.length > 0 || hints.length > 0) && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-ink">Flow steps</h2>
          {lastResponse && (
            <p
              className={`mt-2 text-sm font-medium ${
                lastResponse.ok ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {lastResponse.ok
                ? 'Last run: accepted by SendGrid'
                : `Last run failed${
                    lastResponse.error?.statusCode
                      ? ` (SendGrid HTTP ${String(lastResponse.error.statusCode)})`
                      : ''
                  }`}
            </p>
          )}
          <ol className="mt-4 space-y-2">
            {steps.map((s, i) => (
              <li
                key={`${s.at}-${s.step}-${i}`}
                className={`rounded-md border px-3 py-2 text-sm ${stepColor(s.status)}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-xs font-semibold">{s.step}</span>
                  <span className="font-mono text-[11px] opacity-70">{s.at}</span>
                </div>
                {s.detail ? <p className="mt-1 text-xs opacity-90">{s.detail}</p> : null}
              </li>
            ))}
          </ol>

          {hints.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-ink">Hints</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
                {hints.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-ink">Client log</h2>
        <p className="mt-1 text-sm text-ink-muted">Browser-side timeline of admin API calls.</p>
        {clientLog.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">No activity yet.</p>
        ) : (
          <pre className="mt-3 max-h-48 overflow-auto rounded-md bg-ink px-3 py-3 font-mono text-xs text-white">
            {clientLog.join('\n')}
          </pre>
        )}
      </div>

      {lastResponse && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">Full JSON response</h2>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(JSON.stringify(lastResponse, null, 2))
                appendLog('Copied full JSON response to clipboard')
              }}
              className="inline-flex items-center justify-center rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-surface-raised"
            >
              Copy JSON
            </button>
          </div>
          <pre className="mt-3 max-h-[480px] overflow-auto rounded-md border border-border bg-surface-raised p-3 font-mono text-[11px] leading-relaxed text-ink">
            {JSON.stringify(lastResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
