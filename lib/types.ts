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
  /** Topic tag shown on cards and used for blog list filtering */
  category: string
  sections: BlogSection[]
}

/** List card payload — no article body (keeps /blog fast). */
export type BlogListItem = Omit<BlogPost, 'sections'>

/**
 * Public case study card payload (homepage + “More”).
 * Matches admin / Firestore content once seeded.
 */
export interface CaseStudy {
  slug: string
  client: string
  sector: string
  title: string
  image: string
  problem: string
  solution: string
  outcome: string
  tags: string[]
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
  date: string
  time: string
  method: string
  slotId: string
}
