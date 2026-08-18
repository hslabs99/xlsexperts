'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckSquare, MessageSquare, Phone } from 'lucide-react'
import {
  DEFAULT_CONFIRMATION_CONTENT,
  resolveThankYouCopy,
  type ConfirmationContent,
  type ThankYouLeadType,
} from '@/lib/confirmation-content'
import {
  consumeLeadConversionToken,
  fireLeadConversionEvent,
} from '@/lib/lead-conversion'
import { useMarketCopy } from '@/components/market-provider'

function parseLeadType(raw: string | null): ThankYouLeadType {
  return raw === 'discovery' ? 'discovery' : 'enquiry'
}

export function ThankYouView() {
  const searchParams = useSearchParams()
  const marketCopy = useMarketCopy()
  const type = parseLeadType(searchParams.get('type'))
  const day = searchParams.get('day')?.trim() || ''
  const time = searchParams.get('time')?.trim() || ''
  const method = searchParams.get('method')?.trim() || ''

  const [content, setContent] = useState<ConfirmationContent>(
    DEFAULT_CONFIRMATION_CONTENT
  )

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/confirmation-content')
        const data = (await res.json()) as {
          ok?: boolean
          content?: ConfirmationContent
        }
        if (!cancelled && data.ok && data.content) setContent(data.content)
      } catch {
        // Keep defaults
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const token = consumeLeadConversionToken()
    if (!token) return
    fireLeadConversionEvent({
      type,
      token,
      day: day || undefined,
      time: time || undefined,
      method: method || undefined,
    })
  }, [type, day, time, method])

  const copy = useMemo(
    () => resolveThankYouCopy(content, type),
    [content, type]
  )

  const bookingLine =
    type === 'discovery' && (day || time || method)
      ? [day && time ? `${day} at ${time}` : day || time, method]
          .filter(Boolean)
          .join(' · ')
      : null

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: '#1a6b3c' }}
          >
            {copy.eyebrow}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {copy.heading}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-500">
            {copy.subheading}
          </p>
          {bookingLine ? (
            <p className="mt-3 text-sm font-semibold text-gray-800">
              Preferred time: {bookingLine}
            </p>
          ) : null}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-3">
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">
                {copy.whatHappensNextTitle}
              </h2>
              <ol className="mt-4 flex flex-col gap-5">
                {copy.whatHappensNext.map((s) => (
                  <li
                    key={`${s.n}-${s.text.slice(0, 24)}`}
                    className="flex gap-3"
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: '#1a6b3c' }}
                    >
                      {s.n}
                    </span>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {s.text}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-4 border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">
                Need us sooner?
              </h2>
              <a
                href={`tel:${marketCopy.contact.phoneTel}`}
                className="flex items-center gap-3 text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                <Phone
                  className="h-4 w-4 shrink-0"
                  style={{ color: '#1a6b3c' }}
                  aria-hidden="true"
                />
                {marketCopy.contact.phoneDisplay}
              </a>
              <a
                href={`https://wa.me/${marketCopy.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                <MessageSquare
                  className="h-4 w-4 shrink-0"
                  style={{ color: '#25D366' }}
                  aria-hidden="true"
                />
                {marketCopy.contact.whatsappLabel}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-2">
            <div
              className="flex flex-col items-center justify-center gap-4 p-10 text-center sm:p-12"
              style={{ backgroundColor: '#e8f5ee' }}
            >
              <CheckSquare
                className="h-10 w-10"
                style={{ color: '#1a6b3c' }}
                aria-hidden="true"
              />
              <h2 className="text-lg font-bold text-gray-900">
                {copy.panelHeading}
              </h2>
              <p className="max-w-lg text-sm text-gray-600">{copy.panelBody}</p>
            </div>

            <div className="border border-[#c5e0d0] bg-[#f7fbf8] p-8">
              <h2 className="text-base font-bold text-gray-900">
                {copy.reassureTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {copy.reassureBody}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="btn-primary inline-flex h-11 items-center px-7 text-sm font-semibold"
              >
                Back to home
              </Link>
              <Link
                href="/services"
                className="btn-outline inline-flex h-11 items-center px-7 text-sm font-semibold"
              >
                Browse services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
