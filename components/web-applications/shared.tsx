import type { ReactNode } from 'react'
import { CheckCircle } from 'lucide-react'

export function SectionShell({
  id,
  alt,
  children,
  className = '',
}: {
  id?: string
  alt?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 ${alt ? 'bg-gray-50 py-16 sm:py-20' : 'bg-white py-16 sm:py-20'} ${className}`}
    >
      <div className="mx-auto max-w-5xl px-6">{children}</div>
    </section>
  )
}

export function SectionHeading({
  children,
  center,
  as: Tag = 'h2',
}: {
  children: ReactNode
  center?: boolean
  as?: 'h2' | 'h3'
}) {
  return (
    <Tag
      className={`font-display mb-4 text-3xl font-bold text-gray-900 ${center ? 'text-center' : ''}`}
    >
      {children}
    </Tag>
  )
}

export function Intro({ children }: { children: ReactNode }) {
  return <p className="mb-6 text-base leading-relaxed text-gray-600 md:text-lg">{children}</p>
}

export function Body({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-base leading-relaxed text-gray-600">{children}</p>
}

export function BulletGrid({ items, cols = 2 }: { items: readonly string[]; cols?: 2 | 3 }) {
  return (
    <ul
      className={`mt-6 grid gap-3 ${cols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}
    >
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm leading-relaxed text-gray-700"
        >
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6b3c]" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export function Highlight({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-8 rounded-2xl border-l-4 border-[#1a6b3c] bg-[#e8f5ee] px-6 py-5">
      <p className="font-display text-xl font-bold leading-snug text-gray-900 md:text-2xl">
        {children}
      </p>
    </blockquote>
  )
}

export function MidCta({
  title,
  body,
  primary,
  secondary,
}: {
  title: string
  body?: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
}) {
  return (
    <div className="mt-12 rounded-2xl border border-[#1a6b3c]/20 bg-[#e8f5ee]/60 px-6 py-8 text-center sm:px-10">
      <h3 className="font-display mb-2 text-xl font-bold text-gray-900">{title}</h3>
      {body && <p className="mx-auto mb-5 max-w-xl text-sm leading-relaxed text-gray-600">{body}</p>}
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href={primary.href}
          className="inline-flex items-center justify-center rounded-lg bg-[#1a6b3c] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#155a32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
        >
          {primary.label}
        </a>
        {secondary && (
          <a
            href={secondary.href}
            className="inline-flex items-center justify-center rounded-lg border border-[#1a6b3c]/40 px-6 py-3 text-sm font-semibold text-[#1a6b3c] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
          >
            {secondary.label}
          </a>
        )}
      </div>
    </div>
  )
}
