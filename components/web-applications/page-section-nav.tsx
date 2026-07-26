'use client'

import { useEffect, useState } from 'react'
import { webAppNavItems } from '@/lib/web-applications-page'

export function PageSectionNav() {
  const [active, setActive] = useState(webAppNavItems[0]?.id ?? '')

  useEffect(() => {
    const ids = webAppNavItems.map((item) => item.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.25, 0.5] },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      aria-label="On this page"
      className="sticky top-16 z-30 border-b border-gray-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90"
    >
      <div className="mx-auto max-w-5xl px-6">
        {/* Mobile: compact select-style control */}
        <div className="py-3 md:hidden">
          <label htmlFor="web-app-section-nav" className="sr-only">
            Jump to section
          </label>
          <select
            id="web-app-section-nav"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
            value={active}
            onChange={(event) => {
              const id = event.target.value
              setActive(id)
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            {webAppNavItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop: horizontal anchors */}
        <ul className="hidden gap-1 overflow-x-auto py-2 md:flex md:items-center">
          {webAppNavItems.map((item) => {
            const isActive = active === item.id
            return (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  className={`inline-block rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c] ${
                    isActive
                      ? 'bg-[#e8f5ee] text-[#1a6b3c]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
