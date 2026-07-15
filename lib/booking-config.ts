/**
 * Discovery call meeting method options.
 * Available days/times come from the Firestore "Booking Slots" collection.
 */

import { Monitor, Phone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface MeetOption {
  id: string
  label: string
  icon: LucideIcon
}

export const MEET_OPTIONS: MeetOption[] = [
  { id: 'teams', label: 'Microsoft Teams', icon: Monitor },
  { id: 'phone', label: 'Phone call', icon: Phone },
]
