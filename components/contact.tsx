'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Loader2,
  MessageSquare,
  Phone,
} from 'lucide-react'
import { BookingCalendar } from '@/components/booking-calendar'
import {
  DEFAULT_CONFIRMATION_CONTENT,
  type ConfirmationContent,
} from '@/lib/confirmation-content'
import {
  CONTACT_HEAR_OPTIONS,
  CONTACT_SERVICE_OPTIONS,
  CONTACT_SERVICE_PAGE_OPTIONS,
  CONTACT_SOLUTION_OPTIONS,
} from '@/lib/contact-options'
import {
  buildThankYouPath,
  markLeadConversionPending,
} from '@/lib/lead-conversion'
import {
  contactLabelForService,
  contactLabelForServicePath,
} from '@/lib/service-pages'
import { contactLabelForSolutionSlug } from '@/lib/solutions'
import { useMarketCopy } from '@/components/market-provider'

const concernOptions = [...CONTACT_SERVICE_OPTIONS]
const servicePageOptions = [...CONTACT_SERVICE_PAGE_OPTIONS]
const solutionOptions = [...CONTACT_SOLUTION_OPTIONS]
const hearOptions = [...CONTACT_HEAR_OPTIONS]

const BOOKING_STATUS_MESSAGES = [
  'Reserving your discovery slot…',
  'Notifying the XLS Experts team…',
  'Preparing your confirmation email…',
  'Locking in your preferred time…',
  'Almost done — hang tight…',
]

type FormStep = 'form' | 'calendar' | 'booking'

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  message?: string
}

type BookedSlotSummary = { day: string; time: string; method: string }

export function Contact() {
  const router = useRouter()
  const marketCopy = useMarketCopy()
  const [selected, setSelected] = useState<string[]>([])
  const [step, setStep] = useState<FormStep>('form')
  const [bookedSlot, setBookedSlot] = useState<BookedSlotSummary | null>(null)
  const [confirmation, setConfirmation] = useState<ConfirmationContent>(
    DEFAULT_CONFIRMATION_CONTENT
  )
  const [bookingStatusIndex, setBookingStatusIndex] = useState(0)
  const [enquirySubmitting, setEnquirySubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Form field state
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [service, setService] = useState('')
  const [solution, setSolution] = useState('')
  const [hear, setHear] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/confirmation-content')
        const data = (await res.json()) as {
          ok?: boolean
          content?: ConfirmationContent
        }
        if (!cancelled && data.ok && data.content) setConfirmation(data.content)
      } catch {
        // Keep defaults if API/Firestore is unavailable
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Prefill Service / Solution dropdowns from query params or current page path.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const path = window.location.pathname

      const solutionFromQuery = contactLabelForSolutionSlug(params.get('solution'))
      const solutionFromPath = contactLabelForSolutionSlug(
        path.match(/^\/solutions\/([^/]+)\/?$/)?.[1]
      )
      const solutionLabel = solutionFromQuery || solutionFromPath
      if (solutionLabel) setSolution(solutionLabel)

      const serviceFromQuery = contactLabelForService(params.get('service'))
      const serviceFromPath = contactLabelForServicePath(path)
      const serviceLabel = serviceFromQuery || serviceFromPath
      if (serviceLabel) setService(serviceLabel)
    } catch {
      // Ignore URL parsing failures
    }
  }, [])

  useEffect(() => {
    if (step !== 'booking') {
      setBookingStatusIndex(0)
      return
    }
    const id = window.setInterval(() => {
      setBookingStatusIndex((i) => (i + 1) % BOOKING_STATUS_MESSAGES.length)
    }, 1400)
    return () => window.clearInterval(id)
  }, [step])

  const toggle = (val: string) =>
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    )

  const validate = (requirePhone = false): FormErrors => {
    const errs: FormErrors = {}
    if (!name.trim()) errs.name = 'Your name is required.'
    if (!email.trim()) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email.'
    if (requirePhone && !phone.trim()) errs.phone = 'A phone number is required to book a call.'
    if (!message.trim()) errs.message = 'Please tell us about your project.'
    return errs
  }

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(false)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSubmitError(null)
    setEnquirySubmitting(true)
    const controller = new AbortController()
    const abortTimer = window.setTimeout(() => controller.abort(), 25_000)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name,
          company,
          email,
          phone,
          message,
          services: selected,
          service,
          solution,
          hear,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean
        error?: string
      }
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Could not send enquiry. Please try again.')
      }
      markLeadConversionPending('enquiry')
      router.push(buildThankYouPath({ type: 'enquiry' }))
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setSubmitError('Sending timed out. Please try again in a moment.')
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Could not send enquiry.')
      }
    } finally {
      window.clearTimeout(abortTimer)
      setEnquirySubmitting(false)
    }
  }

  const handleBookCall = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(true)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep('calendar')
  }

  const handleCalendarConfirm = async (payload: {
    day: string
    date: string
    time: string
    method: string
    slotId: string
  }) => {
    const summary: BookedSlotSummary = {
      day: payload.day,
      time: payload.time,
      method: payload.method,
    }
    setBookedSlot(summary)
    setStep('booking')
    setSubmitError(null)

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company,
          email,
          phone,
          message,
          services: selected,
          service,
          solution,
          hear,
          day: payload.day,
          date: payload.date,
          time: payload.time,
          method: payload.method,
          slotId: payload.slotId,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean
        error?: string
      }
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Could not book this slot. Please try again.')
      }
      markLeadConversionPending('discovery')
      router.push(
        buildThankYouPath({
          type: 'discovery',
          day: payload.day,
          time: payload.time,
          method: payload.method,
        })
      )
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Could not complete booking.'
      )
      setStep('calendar')
    }
  }

  return (
    <section id="contact" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">

        {/* Section header — changes while booking is processing */}
        <div className="mx-auto max-w-2xl text-center">
          {step === 'booking' && bookedSlot ? (
            <>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1a6b3c' }}>
                Booking in progress
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Locking in your discovery call
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-500">
                {bookedSlot.day} at {bookedSlot.time} via {bookedSlot.method}. This usually takes a
                moment — please wait while we confirm everything.
              </p>
            </>
          ) : (
            <>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1a6b3c' }}>
                Start a conversation
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Let&apos;s talk about what you need
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-500">
                Big or small, we are happy to discuss it. Send us a message or book a free discovery call — we typically respond same business day.
              </p>
            </>
          )}
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-3">

          {/* Left — reassurance panel */}
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">
                {confirmation.whatHappensNextTitle}
              </h3>
              <ol className="mt-4 flex flex-col gap-5">
                {confirmation.whatHappensNext.map((s) => (
                  <li key={`${s.n}-${s.text.slice(0, 24)}`} className="flex gap-3">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: '#1a6b3c' }}
                    >
                      {s.n}
                    </span>
                    <p className="text-sm leading-relaxed text-gray-600">{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Contact details */}
            <div
              id="contact-details"
              className="flex scroll-mt-28 flex-col gap-4 border-t border-gray-100 pt-6"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">Contact directly</h3>

              <a
                href={`tel:${marketCopy.contact.phoneTel}`}
                className="flex items-center gap-3 text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                <Phone className="h-4 w-4 shrink-0" style={{ color: '#1a6b3c' }} aria-hidden="true" />
                {marketCopy.contact.phoneDisplay}
              </a>

              <a
                href={`https://wa.me/${marketCopy.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                <MessageSquare className="h-4 w-4 shrink-0" style={{ color: '#25D366' }} aria-hidden="true" />
                WhatsApp us
              </a>

              <div className="flex items-start gap-3 text-sm text-gray-500">
                <span className="mt-0.5 text-xs font-bold" style={{ color: '#1a6b3c' }}>
                  {marketCopy.contact.locationBadge}
                </span>
                {marketCopy.contact.locationLine}
              </div>
            </div>
          </div>

          {/* Right — form / calendar / done */}
          <div className="lg:col-span-2">

            {/* BOOKING PROCESSING state */}
            {step === 'booking' && bookedSlot && (
              <div
                className="flex flex-col items-center justify-center gap-5 p-12 text-center"
                style={{ backgroundColor: '#e8f5ee' }}
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <Loader2
                  className="h-10 w-10 animate-spin"
                  style={{ color: '#1a6b3c' }}
                  aria-hidden="true"
                />
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    Booking your discovery call
                  </h3>
                  <p
                    key={bookingStatusIndex}
                    className="text-sm font-medium text-gray-700 transition-opacity duration-300"
                  >
                    {BOOKING_STATUS_MESSAGES[bookingStatusIndex]}
                  </p>
                </div>
                <p className="max-w-sm text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {bookedSlot.day} at {bookedSlot.time}
                  </span>
                  {' '}
                  via{' '}
                  <span className="font-semibold text-gray-900">
                    {bookedSlot.method}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Please don&apos;t close this page — we will take you to a
                  confirmation screen next.
                </p>
              </div>
            )}

            {/* CALENDAR state */}
            {step === 'calendar' && (
              <>
                {submitError && (
                  <p
                    className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                    role="alert"
                  >
                    {submitError}
                  </p>
                )}
                <BookingCalendar
                  onConfirm={handleCalendarConfirm}
                  onBack={() => {
                    setSubmitError(null)
                    setStep('form')
                  }}
                />
              </>
            )}

            {/* FORM state */}
            {step === 'form' && (
              <form className="flex flex-col gap-6" noValidate>

                {/* Name + company */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-gray-600">
                      Your name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Smith"
                      className="border bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:bg-white"
                      style={{ borderColor: errors.name ? '#ef4444' : '#e5e7eb' }}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company" className="text-xs font-bold uppercase tracking-widest text-gray-600">
                      Company
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Ltd"
                      className="border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Email + phone */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-600">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={marketCopy.contact.emailPlaceholder}
                      className="border bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:bg-white"
                      style={{ borderColor: errors.email ? '#ef4444' : '#e5e7eb' }}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-gray-600">
                      Phone <span className="text-gray-400 font-normal normal-case">(required to book a call)</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={marketCopy.contact.phonePlaceholder}
                      className="border bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:bg-white"
                      style={{ borderColor: errors.phone ? '#ef4444' : '#e5e7eb' }}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>
                </div>

                {/* Task concern checkboxes */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                    What does your task concern?{' '}
                    <span className="font-normal normal-case text-gray-400">(select all that apply)</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {concernOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggle(opt)}
                        className="flex items-center gap-2 border px-3 py-2 text-left text-xs font-medium transition-colors"
                        style={{
                          borderColor: selected.includes(opt) ? '#1a6b3c' : '#e5e7eb',
                          backgroundColor: selected.includes(opt) ? '#e8f5ee' : '#f9fafb',
                          color: selected.includes(opt) ? '#1a6b3c' : '#374151',
                        }}
                        aria-pressed={selected.includes(opt)}
                      >
                        <span
                          className="flex h-3.5 w-3.5 shrink-0 items-center justify-center border"
                          style={{
                            borderColor: selected.includes(opt) ? '#1a6b3c' : '#d1d5db',
                            backgroundColor: selected.includes(opt) ? '#1a6b3c' : 'white',
                          }}
                        >
                          {selected.includes(opt) && (
                            <svg viewBox="0 0 10 8" className="h-2 w-2 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M1 4l3 3 5-6" />
                            </svg>
                          )}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service + Solution dropdowns */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="service" className="text-xs font-bold uppercase tracking-widest text-gray-600">
                      Service{' '}
                      <span className="font-normal normal-case text-gray-400">(optional)</span>
                    </label>
                    <select
                      id="service"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white"
                    >
                      <option value="">Select a service…</option>
                      {servicePageOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="solution" className="text-xs font-bold uppercase tracking-widest text-gray-600">
                      Solution{' '}
                      <span className="font-normal normal-case text-gray-400">(optional)</span>
                    </label>
                    <select
                      id="solution"
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white"
                    >
                      <option value="">Select a solution…</option>
                      {solutionOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-gray-600">
                    Tell us about your task <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe what you need — the more detail the better. We love a challenge."
                    className="border bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:bg-white"
                    style={{ borderColor: errors.message ? '#ef4444' : '#e5e7eb' }}
                  />
                  {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                </div>

                {/* How did you hear */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="hear" className="text-xs font-bold uppercase tracking-widest text-gray-600">
                    How did you hear about us?
                  </label>
                  <select
                    id="hear"
                    value={hear}
                    onChange={(e) => setHear(e.target.value)}
                    className="border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white"
                  >
                    <option value="">Select...</option>
                    {hearOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>

                {/* Dual CTA */}
                <div className="flex flex-col gap-3 border-t border-gray-100 pt-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-600">How would you like to proceed?</p>
                  {submitError && (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                      {submitError}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={enquirySubmitting}
                      onClick={handleSendEnquiry}
                      className="btn-primary inline-flex h-11 items-center gap-2 px-7 text-sm font-semibold disabled:opacity-70"
                    >
                      {enquirySubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Sending…
                        </>
                      ) : (
                        'Send enquiry'
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={enquirySubmitting}
                      onClick={handleBookCall}
                      className="btn-outline inline-flex h-11 items-center gap-2 px-7 text-sm font-semibold disabled:opacity-70"
                    >
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                      Book a discovery call
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Fields marked <span className="text-red-400">*</span> are required.
                    A phone number is required to book a discovery call.
                  </p>
                </div>

              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
