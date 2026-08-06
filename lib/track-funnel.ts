/**
 * Client-side funnel beacon — never blocks navigation or UI.
 * Skips localhost so local browsing does not pollute cloud analytics.
 */

import type { FunnelEventType } from '@/lib/funnel-events'

export type TrackCtaClickInput = {
  label: string
  href: string
  path?: string
}

export type TrackPageViewInput = {
  label: string
  path: string
}

/** True when we should record visitor events into cloud Firestore. */
export function shouldRecordFunnelEvents(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    return false
  }
  if (host.endsWith('.local')) return false
  return true
}

function sendFunnelPayload(payload: {
  type: FunnelEventType
  label: string
  href: string
  path: string
}): void {
  if (!shouldRecordFunnelEvents()) return
  try {
    const body = JSON.stringify(payload)
    const url = '/api/funnel'
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.sendBeacon === 'function'
    ) {
      const ok = navigator.sendBeacon(
        url,
        new Blob([body], { type: 'application/json' })
      )
      if (ok) return
    }
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      /* ignore */
    })
  } catch {
    /* ignore */
  }
}

/** Fire-and-forget CTA click. Prefer sendBeacon; fall back to keepalive fetch. */
export function trackCtaClick(input: TrackCtaClickInput): void {
  if (typeof window === 'undefined') return
  const path =
    input.path ||
    (typeof window !== 'undefined' ? window.location.pathname : '/')
  sendFunnelPayload({
    type: 'cta_click',
    label:
      String(input.label || 'Contact CTA').trim().slice(0, 120) ||
      'Contact CTA',
    href: String(input.href || '').trim().slice(0, 500),
    path: String(path).trim().slice(0, 300) || '/',
  })
}

/** Fire-and-forget service/solution page view. */
export function trackPageView(input: TrackPageViewInput): void {
  if (typeof window === 'undefined') return
  const path = String(input.path || '').trim().slice(0, 300) || '/'
  sendFunnelPayload({
    type: 'page_view',
    label:
      String(input.label || path).trim().slice(0, 120) || path,
    href: path,
    path,
  })
}
