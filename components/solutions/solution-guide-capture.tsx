'use client'

import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import type { SolutionLeadMagnet } from '@/lib/solutions'

type SolutionGuideCaptureProps = {
  magnet: SolutionLeadMagnet
  /** Visually quieter repeat near the contact block. */
  compact?: boolean
}

export function SolutionGuideCapture({
  magnet,
  compact = false,
}: SolutionGuideCaptureProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/guides/ten-pillars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          company,
          companyWebsite: honeypot,
          sourcePath: window.location.pathname,
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        downloadUrl?: string
        filename?: string
      }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Could not send the guide. Please try again.')
        return
      }
      setDone(true)
      if (!data.downloadUrl) return
      const link = document.createElement('a')
      link.href = data.downloadUrl
      link.rel = 'nofollow'
      link.target = '_blank'
      if (data.filename) link.download = data.filename
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      setError('Could not send the guide. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      id={compact ? `${magnet.id}-footer` : magnet.id}
      className={compact ? 'bg-white py-16 sm:py-20' : 'bg-[#e8f5ee] py-16 sm:py-20'}
    >
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
          {magnet.heading}
        </h2>
        <p className="mb-2 text-base leading-relaxed text-gray-600">
          {magnet.body}
        </p>
        <p className="mb-8 text-sm text-gray-500">{magnet.emailHint}</p>

        {done ? (
          <p className="rounded-xl border border-[#1a6b3c]/20 bg-white px-5 py-4 text-sm leading-relaxed text-gray-700">
            The guide is on its way to {email}. Check your inbox — and a copy
            should also download in this browser.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm text-gray-700">
                Name
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={200}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#1a6b3c] focus:ring-2 focus:ring-[#1a6b3c]/20"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Company
                <input
                  type="text"
                  name="company"
                  autoComplete="organization"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  maxLength={200}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#1a6b3c] focus:ring-2 focus:ring-[#1a6b3c]/20"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Email
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={254}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#1a6b3c] focus:ring-2 focus:ring-[#1a6b3c]/20"
                />
              </label>
            </div>
            <div className="hidden" aria-hidden="true">
              <label>
                Company website
                <input
                  type="text"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>
            {error && (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a6b3c] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#155832] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c] disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                <>
                  {magnet.ctaLabel}{' '}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
            <p className="text-xs leading-relaxed text-gray-500">
              Name, company and email are required. We use them to send this
              guide. You can unsubscribe from other XLS Experts emails at any
              time.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
