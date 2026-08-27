'use client'

import { useEffect, useState } from 'react'

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

export function HeroBackground() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % scenes.length)
    }, 6000)
    return () => clearInterval(id)
  }, [])

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
