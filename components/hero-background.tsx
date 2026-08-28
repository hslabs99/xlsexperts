'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_HERO_BACKGROUND_HOLD_SECONDS } from '@/lib/market-copy'

const scenes = [
  { src: '/images/hero/construction.png', alt: '' },
  { src: '/images/hero/manufacturing.png', alt: '' },
  { src: '/images/hero/boatbuilder.png', alt: '' },
  { src: '/images/hero/finance.png', alt: '' },
  { src: '/images/hero/engineering.png', alt: '' },
  { src: '/images/hero/steel.png', alt: '' },
  { src: '/images/hero/shipping.png', alt: '' },
  { src: '/images/hero/logistics.png', alt: '' },
]

export function HeroBackground({
  holdSeconds = DEFAULT_HERO_BACKGROUND_HOLD_SECONDS,
}: {
  holdSeconds?: number
}) {
  const [active, setActive] = useState(0)
  const holdMs = Math.max(1, holdSeconds) * 1000

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % scenes.length)
    }, holdMs)
    return () => clearInterval(id)
  }, [holdMs])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {scenes.map((scene, i) => (
        <div
          key={scene.src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out"
          style={{
            backgroundImage: `url(${scene.src})`,
            opacity: i === active ? 0.45 : 0,
          }}
        />
      ))}
      {/* White wash so hero text stays crisp and readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.45) 40%, rgba(255,255,255,0.80) 100%)',
        }}
      />
    </div>
  )
}
