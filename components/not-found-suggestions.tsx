'use client'

import Link from 'next/link'

type Item = {
  href: string
  title: string
  excerpt?: string
  slug?: string
}

export function NotFoundSuggestions({
  logId,
  items,
}: {
  logId: string | null
  items: Item[]
}) {
  function beacon(slug: string | undefined) {
    if (!logId || !slug) return
    const body = JSON.stringify({ id: logId, slug })
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/not-found-click',
        new Blob([body], { type: 'application/json' })
      )
      return
    }
    void fetch('/api/not-found-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
  }

  return (
    <ul className="mt-4 space-y-4">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            onClick={() => beacon(item.slug)}
            className="font-semibold text-gray-900 underline decoration-[#1a6b3c] underline-offset-2 hover:text-[#1a6b3c]"
          >
            {item.title}
          </Link>
          {item.excerpt ? (
            <p className="mt-1 text-sm leading-6 text-gray-600">{item.excerpt}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
