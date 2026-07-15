/**
 * Shared TypeScript interfaces.
 * This file is the single source of truth for data shapes across the app.
 * When migrating to Sanity, these interfaces map 1:1 to Sanity schema fields.
 */

export interface BlogSection {
  type: 'intro' | 'h2' | 'h3' | 'p' | 'ul' | 'faq'
  heading?: string
  text?: string
  items?: string[]
  faqs?: { q: string; a: string }[]
}

export interface BlogPost {
  slug: string
  title: string
  author: string
  date: string
  readTime: string
  excerpt: string
  image: string
  category: string
  sections: BlogSection[]
}

/**
 * Contact form submission payload.
 * Matches the body sent to POST /api/contact.
 */
export interface ContactPayload {
  name: string
  company: string
  email: string
  phone: string
  message: string
  services: string[]
  hear: string
}

/**
 * Discovery call booking payload.
 * Matches the body sent to POST /api/booking.
 */
export interface BookingPayload {
  name: string
  company: string
  email: string
  phone: string
  message: string
  services: string[]
  hear: string
  day: string
  time: string
  method: string
}
