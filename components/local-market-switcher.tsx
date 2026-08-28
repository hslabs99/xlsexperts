'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { GripVertical } from 'lucide-react'
import {
  LOCAL_MARKET_SWITCHES,
  stripLocalMarketPrefix,
  type MarketId,
} from '@/lib/market'
import { useMarket } from '@/components/market-provider'

const STORAGE_KEY = 'xls-local-region-picker-pos'
const MARGIN = 8
const DEFAULT_TOP = 76

type Pos = { x: number; y: number }

function readStoredPos(): Pos | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Pos>
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') return null
    if (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)) return null
    return { x: parsed.x, y: parsed.y }
  } catch {
    return null
  }
}

function clampPos(pos: Pos, width: number, height: number): Pos {
  const maxX = Math.max(MARGIN, window.innerWidth - width - MARGIN)
  const maxY = Math.max(MARGIN, window.innerHeight - height - MARGIN)
  return {
    x: Math.min(Math.max(MARGIN, pos.x), maxX),
    y: Math.min(Math.max(MARGIN, pos.y), maxY),
  }
}

/**
 * Localhost-only floating control so you can preview NZ / USA / UK without
 * changing hosts. Stay on /nz, /usa, or /uk so each region is a distinct URL.
 * Hidden in production. Draggable so it can be moved off the page chrome.
 */
export function LocalMarketSwitcher() {
  const { market, localDev } = useMarket()
  const pathname = usePathname()

  if (!localDev) return null
  if (pathname?.startsWith('/admin')) return null

  return (
    <LocalMarketSwitcherPanel
      market={market}
      pathname={pathname || '/'}
    />
  )
}

function LocalMarketSwitcherPanel({
  market,
  pathname,
}: {
  market: MarketId
  pathname: string
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    offsetX: number
    offsetY: number
  } | null>(null)
  const [pos, setPos] = useState<Pos | null>(null)
  const [dragging, setDragging] = useState(false)

  const reclamp = useCallback(() => {
    const el = panelRef.current
    if (!el) return
    setPos((current) => {
      const rect = el.getBoundingClientRect()
      const next = current ?? { x: rect.left, y: rect.top }
      return clampPos(next, rect.width, rect.height)
    })
  }, [])

  useEffect(() => {
    const stored = readStoredPos()
    if (!stored) return
    const el = panelRef.current
    const width = el?.offsetWidth ?? 220
    const height = el?.offsetHeight ?? 40
    setPos(clampPos(stored, width, height))
  }, [])

  useEffect(() => {
    window.addEventListener('resize', reclamp)
    return () => window.removeEventListener('resize', reclamp)
  }, [reclamp])

  useEffect(() => {
    if (!pos) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos))
    } catch {
      // Ignore quota / private-mode failures.
    }
  }, [pos])

  function switchTo(segment: 'nz' | 'usa' | 'uk') {
    const stripped = stripLocalMarketPrefix(pathname)
    const rest = stripped?.pathname ?? pathname
    const path = rest && rest !== '/' ? rest : ''
    const search = window.location.search
    const hash = window.location.hash
    window.location.assign(`/${segment}${path}${search}${hash}`)
  }

  function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (event.button !== 0) return
    const el = panelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    }
    el.setPointerCapture(event.pointerId)
    setDragging(true)
    setPos({ x: rect.left, y: rect.top })
    event.preventDefault()
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    const el = panelRef.current
    if (!drag || drag.pointerId !== event.pointerId || !el) return
    const next = clampPos(
      {
        x: event.clientX - drag.offsetX,
        y: event.clientY - drag.offsetY,
      },
      el.offsetWidth,
      el.offsetHeight
    )
    setPos(next)
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    setDragging(false)
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // Capture may already have been released.
    }
  }

  const regionLabel =
    market === 'uk' ? 'UK' : market === 'intl' ? 'USA' : 'NZ'

  return (
    <div
      ref={panelRef}
      role="region"
      aria-label="Local region preview"
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`fixed z-[70] flex select-none items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-1 py-1 text-amber-950 shadow-md ${
        dragging ? 'cursor-grabbing' : ''
      }`}
      style={
        pos
          ? { left: pos.x, top: pos.y, right: 'auto' }
          : { top: DEFAULT_TOP, right: 12 }
      }
    >
      <div
        aria-label="Drag region picker"
        title="Drag to move"
        onPointerDown={onPointerDown}
        className="flex cursor-grab items-center gap-0.5 rounded px-0.5 py-0.5 text-amber-800/80 hover:bg-amber-100 active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="hidden pr-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900 sm:inline">
          Local {regionLabel}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        {LOCAL_MARKET_SWITCHES.map((item) => {
          const active = item.market === market
          return (
            <button
              key={item.segment}
              type="button"
              title={`Preview ${item.hint} via /${item.segment}`}
              onClick={() => switchTo(item.segment)}
              className={`rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide transition ${
                active
                  ? 'bg-amber-900 text-amber-50'
                  : 'bg-white text-amber-900 hover:bg-amber-100'
              }`}
              aria-current={active ? 'true' : undefined}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
