/**
 * Enquiry records stored in Firestore collection `enquiries`.
 */

export const ENQUIRY_TYPES = ['standard', 'discovery'] as const
export type EnquiryType = (typeof ENQUIRY_TYPES)[number]

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
}
