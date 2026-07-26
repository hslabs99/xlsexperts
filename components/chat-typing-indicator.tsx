'use client'

import { useEffect, useRef } from 'react'

/**
 * Soft typewriter click-clack via Web Audio (no asset file).
 * Plays while `active` is true; muted when the tab is hidden or the user
 * prefers reduced motion.
 */
export function useTypingClickClack(active: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false

    function playClick() {
      if (cancelled || document.visibilityState === 'hidden') return
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
        if (!AudioCtx) return
        if (!ctxRef.current) ctxRef.current = new AudioCtx()
        const ctx = ctxRef.current
        if (ctx.state === 'suspended') void ctx.resume()

        const now = ctx.currentTime
        // Two quick stacked clicks — “click-clack”
        for (const [offset, freq, gain] of [
          [0, 1850, 0.035],
          [0.045, 1320, 0.028],
        ] as const) {
          const osc = ctx.createOscillator()
          const g = ctx.createGain()
          osc.type = 'square'
          osc.frequency.value = freq
          g.gain.setValueAtTime(0.0001, now + offset)
          g.gain.exponentialRampToValueAtTime(gain, now + offset + 0.004)
          g.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.045)
          osc.connect(g)
          g.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.06)
        }
      } catch {
        /* ignore autoplay / audio errors */
      }
    }

    playClick()
    timerRef.current = window.setInterval(playClick, 280)

    return () => {
      cancelled = true
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [active])

  useEffect(() => {
    return () => {
      void ctxRef.current?.close().catch(() => {})
      ctxRef.current = null
    }
  }, [])
}

export function ChatTypingIndicator({
  label = 'Typing',
  playSound = true,
}: {
  label?: string
  playSound?: boolean
}) {
  useTypingClickClack(playSound)

  return (
    <div
      className="flex justify-start"
      role="status"
      aria-live="polite"
      aria-label={`${label}…`}
    >
      <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-3 py-2.5 text-sm text-gray-600 ring-1 ring-gray-200">
        <span className="chat-typing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="text-xs text-gray-500">{label}…</span>
      </div>
    </div>
  )
}
