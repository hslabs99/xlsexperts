/**
 * Discovery call booking configuration.
 *
 * TIME_SLOTS and UNAVAILABLE are placeholder static config.
 *
 * TO MIGRATE TO MICROSOFT BOOKINGS in Cursor:
 *   1. Replace TIME_SLOTS with a fetch to the Graph API:
 *      GET /solutions/bookingBusinesses/{id}/calendarView
 *   2. Replace UNAVAILABLE with slots returned as "busy" from the API.
 *   3. This file (and the API route) are the only two files that need to change.
 *
 * Google Meet has been intentionally removed — only Teams and Phone are supported
 * until the Microsoft Graph integration is live.
 */

import { Monitor, Phone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const TIME_SLOTS: string[] = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
]

/** Statically unavailable slots per day label. Replace with live API data. */
export const UNAVAILABLE: Record<string, string[]> = {
  Mon: ['9:00 AM', '10:00 AM', '2:00 PM'],
  Tue: ['11:00 AM', '11:30 AM', '3:00 PM', '3:30 PM'],
  Wed: ['9:00 AM', '9:30 AM', '1:00 PM'],
  Thu: ['12:00 PM', '4:00 PM', '4:30 PM'],
  Fri: ['9:00 AM', '10:30 AM', '2:30 PM'],
}

export interface MeetOption {
  id: string
  label: string
  icon: LucideIcon
}

export const MEET_OPTIONS: MeetOption[] = [
  { id: 'teams', label: 'Microsoft Teams', icon: Monitor },
  { id: 'phone', label: 'Phone call',       icon: Phone   },
]
