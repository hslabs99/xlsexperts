'use client'

import { useState } from 'react'
import { CalendarDays, CheckSquare, MessageSquare, Phone } from 'lucide-react'
import { BookingCalendar } from '@/components/booking-calendar'

const serviceOptions = [
  'Macros / VBA',
  'Google Apps Script',
  'Office Scripts',
  'Formulas & Functions',
  'Charts & Dashboards',
  'Data Connections / SQL',
  'Power Query / Power Pivot',
  'Enterprise Application',
  'A.I. Workflow Solution',
  'Web App / .NET',
  'Data Analysis',
  'Other',
]

const hearOptions = [
  'Google Search',
  'Referral / Word of mouth',
  'LinkedIn',
  'Returning client',
  'Other',
]

type FormStep = 'form' | 'calendar' | 'done'

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  message?: string
}

export function Contact() {
  const [selected, setSelected] = useState<string[]>([])
  const [step, setStep] = useState<FormStep>('form')
  const [bookedSlot, setBookedSlot] = useState<{ day: string; time: string; method: string } | null>(null)

  // Form field state
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [hear, setHear] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

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
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, company, email, phone, message, services: selected, hear }),
    })
    setStep('done')
  }

  const handleBookCall = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(true)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep('calendar')
  }

  const handleCalendarConfirm = async (day: string, time: string, method: string) => {
    await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, company, email, phone, message, services: selected, hear, day, time, method }),
    })
    setBookedSlot({ day, time, method })
    setStep('done')
  }

  return (
    <section id="contact" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">

        {/* Section header — changes once the action is complete */}
        <div className="mx-auto max-w-2xl text-center">
          {step === 'done' && bookedSlot ? (
            <>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1a6b3c' }}>
                You&apos;re all set
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {bookedSlot.method === 'Phone call'
                  ? 'We will call you then.'
                  : 'Great — look forward to connecting with you.'}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-500">
                {bookedSlot.method === 'Phone call'
                  ? `We will call you on ${bookedSlot.day} at ${bookedSlot.time}. Keep your phone handy.`
                  : `Keep an eye on your inbox — a ${bookedSlot.method} meeting request for ${bookedSlot.day} at ${bookedSlot.time} will be on its way shortly.`}
              </p>
            </>
          ) : step === 'done' ? (
            <>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1a6b3c' }}>
                Message received
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Thanks — we will be in touch.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-500">
                We have received your enquiry and will get back to you same business day. Keep an eye on your inbox.
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
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">What happens next</h3>
              <ol className="mt-4 flex flex-col gap-5">
                {[
                  { n: '1', text: 'We review your enquiry and reach out to discuss your requirements — no commitment needed.' },
                  { n: '2', text: 'We provide a no-obligation quote and estimated delivery timeframe.' },
                  { n: '3', text: 'Once agreed, we build in stages and keep you updated throughout.' },
                ].map((s) => (
                  <li key={s.n} className="flex gap-3">
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
            <div className="flex flex-col gap-4 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">Contact directly</h3>

              <a
                href="tel:+6421783967"
                className="flex items-center gap-3 text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                <Phone className="h-4 w-4 shrink-0" style={{ color: '#1a6b3c' }} aria-hidden="true" />
                +64 21 783 967
              </a>

              <a
                href="https://wa.me/6421783967"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                <MessageSquare className="h-4 w-4 shrink-0" style={{ color: '#25D366' }} aria-hidden="true" />
                WhatsApp us
              </a>

              <div className="flex items-start gap-3 text-sm text-gray-500">
                <span className="mt-0.5 text-xs font-bold" style={{ color: '#1a6b3c' }}>NZ</span>
                Auckland, New Zealand — serving clients nationwide
              </div>
            </div>
          </div>

          {/* Right — form / calendar / done */}
          <div className="lg:col-span-2">

            {/* DONE state */}
            {step === 'done' && (
              <div
                className="flex flex-col items-center justify-center gap-4 p-12 text-center"
                style={{ backgroundColor: '#e8f5ee' }}
              >
                <CheckSquare className="h-10 w-10" style={{ color: '#1a6b3c' }} />
                {bookedSlot ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900">
                      Discovery call requested — {bookedSlot.day} at {bookedSlot.time}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Thanks for letting us know your preferred time. We will be in touch to confirm the call via{' '}
                      <span className="font-semibold">{bookedSlot.method}</span> — usually same business day.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-900">Thanks — we will be in touch shortly.</h3>
                    <p className="text-sm text-gray-600">We typically respond same business day. Keep an eye on your inbox.</p>
                  </>
                )}
              </div>
            )}

            {/* CALENDAR state */}
            {step === 'calendar' && (
              <BookingCalendar
                onConfirm={handleCalendarConfirm}
                onBack={() => setStep('form')}
              />
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
                      placeholder="jane@acme.co.nz"
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
                      placeholder="+64 21 000 000"
                      className="border bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:bg-white"
                      style={{ borderColor: errors.phone ? '#ef4444' : '#e5e7eb' }}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>
                </div>

                {/* Service checkboxes */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                    What does your task concern?{' '}
                    <span className="font-normal normal-case text-gray-400">(select all that apply)</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {serviceOptions.map((opt) => (
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
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      onClick={handleSendEnquiry}
                      className="btn-primary inline-flex h-11 items-center gap-2 px-7 text-sm font-semibold"
                    >
                      Send enquiry
                    </button>
                    <button
                      type="submit"
                      onClick={handleBookCall}
                      className="btn-outline inline-flex h-11 items-center gap-2 px-7 text-sm font-semibold"
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
