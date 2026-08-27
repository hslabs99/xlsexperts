'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  DEFAULT_HERO_CLIENT_FADE,
  DEFAULT_HERO_CLIENT_HEADING,
  heroClientFadeEasing,
  type HeroClientFade,
  type HeroClientTile,
} from '@/lib/hero-trust'

const COLS = 4
const PAGE_SIZE = 12
const HOLD_MS = 3000

function slicePage(clients: HeroClientTile[], page: number): HeroClientTile[] {
  const start = page * PAGE_SIZE
  return clients.slice(start, start + PAGE_SIZE)
}

function rowsOf(items: HeroClientTile[]): HeroClientTile[][] {
  const rows: HeroClientTile[][] = []
  for (let i = 0; i < items.length; i += COLS) {
    rows.push(items.slice(i, i + COLS))
  }
  return rows
}

function ClientChip({ client }: { client: HeroClientTile }) {
  return (
    <span className="inline-flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 bg-white/90 py-1.5 pl-1.5 pr-2.5 text-xs font-semibold text-gray-800 shadow-sm">
      {client.logoSrc ? (
        <Image
          src={client.logoSrc}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded-md bg-white object-contain"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
          style={{ backgroundColor: client.color }}
        >
          {client.abbr}
        </span>
      )}
      <span>{client.name}</span>
    </span>
  )
}

function LogoSet({ items }: { items: HeroClientTile[] }) {
  return (
    <div className="flex w-full flex-col justify-center gap-2.5">
      {rowsOf(items).map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex flex-nowrap items-center justify-center gap-2.5"
        >
          {row.map((client) => (
            <ClientChip key={client.id || client.name} client={client} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function HeroClientCarousel({
  clients,
  fade = DEFAULT_HERO_CLIENT_FADE,
  heading = DEFAULT_HERO_CLIENT_HEADING,
}: {
  clients: HeroClientTile[]
  fade?: HeroClientFade
  heading?: string
}) {
  const pageCount = Math.max(1, Math.ceil(clients.length / PAGE_SIZE))
  const canRotate = clients.length > PAGE_SIZE
  const durationMs = fade.durationMs
  const easing = heroClientFadeEasing(fade.harshness)

  const [page, setPage] = useState(0)
  const [outgoing, setOutgoing] = useState<number | null>(null)
  const [incomingOpaque, setIncomingOpaque] = useState(true)
  const [outgoingOpaque, setOutgoingOpaque] = useState(true)
  const [animate, setAnimate] = useState(true)
  const pageRef = useRef(0)

  useEffect(() => {
    pageRef.current = 0
    setPage(0)
    setOutgoing(null)
    setIncomingOpaque(true)
    setOutgoingOpaque(true)
    setAnimate(true)
  }, [clients.length])

  useEffect(() => {
    if (!canRotate) return

    let cancelled = false
    const timers: number[] = []
    const later = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms))
    }

    const holdThenCrossfade = () => {
      later(HOLD_MS, () => {
        if (cancelled) return
        const from = pageRef.current
        const to = (from + 1) % pageCount

        setAnimate(false)
        setOutgoing(from)
        setOutgoingOpaque(true)
        setIncomingOpaque(false)
        setPage(to)
        pageRef.current = to

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (cancelled) return
            setAnimate(true)
            setOutgoingOpaque(false)
            setIncomingOpaque(true)
          })
        })

        later(durationMs + 40, () => {
          if (cancelled) return
          setOutgoing(null)
          setOutgoingOpaque(true)
          holdThenCrossfade()
        })
      })
    }

    holdThenCrossfade()
    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [canRotate, pageCount, durationMs])

  if (clients.length === 0) return null

  const transition = animate
    ? `opacity ${durationMs}ms ${easing}`
    : 'opacity 0ms linear'

  return (
    <div className="mt-10 flex w-full flex-col items-center gap-4 px-4">
      <span className="text-center text-sm font-bold uppercase tracking-widest text-gray-700">
        {heading}
      </span>
      <div className="relative w-full">
        <div className="invisible" aria-hidden="true">
          <LogoSet items={slicePage(clients, page)} />
        </div>
        {outgoing != null ? (
          <div
            className="absolute inset-0 flex flex-col justify-center"
            style={{ opacity: outgoingOpaque ? 1 : 0, transition }}
          >
            <LogoSet items={slicePage(clients, outgoing)} />
          </div>
        ) : null}
        <div
          className="absolute inset-0 flex flex-col justify-center"
          style={{
            opacity: incomingOpaque ? 1 : 0,
            transition: canRotate ? transition : undefined,
          }}
        >
          <LogoSet items={slicePage(clients, page)} />
        </div>
      </div>
    </div>
  )
}
