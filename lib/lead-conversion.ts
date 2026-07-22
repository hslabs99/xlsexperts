/**
 * Client helpers for thank-you / lead conversion tracking.
 * Form success sets a one-time token; `/thank-you` fires analytics once.
 */

export const LEAD_CONVERSION_TOKEN_KEY = 'xls_lead_conversion_token'
export const LEAD_CONVERSION_FIRED_KEY = 'xls_lead_conversion_fired'

export type LeadConversionType = 'enquiry' | 'discovery'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
  }
}

/** Call after a successful contact or booking API response, before navigating. */
export function markLeadConversionPending(type: LeadConversionType): string {
  const token = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  try {
    sessionStorage.setItem(LEAD_CONVERSION_TOKEN_KEY, token)
  } catch {
    // Private mode / blocked storage — thank-you page still works without event
  }
  return token
}

export function consumeLeadConversionToken(): string | null {
  try {
    const token = sessionStorage.getItem(LEAD_CONVERSION_TOKEN_KEY)
    if (!token) return null
    sessionStorage.removeItem(LEAD_CONVERSION_TOKEN_KEY)
    return token
  } catch {
    return null
  }
}

/**
 * Fire GA4 / GTM lead conversion once per successful submit token.
 * Returns true if the event was pushed.
 */
export function fireLeadConversionEvent(options: {
  type: LeadConversionType
  token: string
  day?: string
  time?: string
  method?: string
}): boolean {
  try {
    const fired = sessionStorage.getItem(LEAD_CONVERSION_FIRED_KEY)
    if (fired === options.token) return false
    sessionStorage.setItem(LEAD_CONVERSION_FIRED_KEY, options.token)
  } catch {
    // Still attempt to push once this page load
  }

  const payload: Record<string, unknown> = {
    event: 'generate_lead',
    lead_type: options.type,
    form_name:
      options.type === 'discovery' ? 'discovery_call' : 'standard_enquiry',
  }
  if (options.day) payload.booking_day = options.day
  if (options.time) payload.booking_time = options.time
  if (options.method) payload.booking_method = options.method

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', {
      lead_type: options.type,
      form_name: payload.form_name,
      send_to: undefined,
    })
  }

  return true
}

export function buildThankYouPath(options: {
  type: LeadConversionType
  day?: string
  time?: string
  method?: string
}): string {
  const params = new URLSearchParams()
  params.set('type', options.type)
  if (options.day) params.set('day', options.day)
  if (options.time) params.set('time', options.time)
  if (options.method) params.set('method', options.method)
  return `/thank-you?${params.toString()}`
}
