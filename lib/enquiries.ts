/**
 * Enquiry records stored in Firestore collection `enquiries`.
 */

import type { MarketId } from '@/lib/market'

export const ENQUIRY_TYPES = ['standard', 'discovery', 'whitepaper'] as const
export type EnquiryType = (typeof ENQUIRY_TYPES)[number]

export const ENQUIRY_TYPE_LABELS: Record<EnquiryType, string> = {
  standard: 'Standard enquiry',
  discovery: 'Discovery request',
  whitepaper: 'White paper',
}

export function enquiryTypeLabel(type: EnquiryType): string {
  return ENQUIRY_TYPE_LABELS[type]
}

export const ENQUIRY_STATUSES = ['new', 'reviewed', 'quoted', 'closed'] as const
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number]

export type EnquiryRecord = {
  id: string
  type: EnquiryType
  status: EnquiryStatus
  name: string
  company: string
  email: string
  phone: string
  message: string
  /** Task-concern checkboxes */
  services: string[]
  /** Optional service-catalogue dropdown */
  service: string
  /** Optional solution-catalogue dropdown */
  solution: string
  hear: string
  /** Discovery-only fields */
  day: string
  date: string
  time: string
  method: string
  slotId: string
  emailNotified: boolean
  /** Arrival market (.co.nz / .com / .co.uk). Legacy rows default to nz. */
  market: MarketId
  /** Arrival hostname when submitted. */
  host: string
  createdAt: unknown
  updatedAt: unknown
}

export type EnquiryInput = {
  type: EnquiryType
  name: string
  company?: string
  email: string
  phone?: string
  message?: string
  services?: string[]
  service?: string
  solution?: string
  hear?: string
  day?: string
  date?: string
  time?: string
  method?: string
  slotId?: string
  emailNotified?: boolean
  status?: EnquiryStatus
  market?: MarketId
  host?: string
}
