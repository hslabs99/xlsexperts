/**
 * Shared contact-form option lists — keep contact UI and admin enquiry view in sync.
 */

import { servicePages } from '@/lib/service-pages'
import { solutionContactLabels } from '@/lib/solutions'

/** Task-concern checkboxes (not service/solution catalogue pages). */
export const CONTACT_SERVICE_OPTIONS = [
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
] as const

/** Service catalogue dropdown — labels from service landing pages. */
export const CONTACT_SERVICE_PAGE_OPTIONS = servicePages.map((p) => p.label)

/** Solution catalogue dropdown — labels from solution pages. */
export const CONTACT_SOLUTION_OPTIONS = solutionContactLabels()

export const CONTACT_HEAR_OPTIONS = [
  'Google Search',
  'Referral / Word of mouth',
  'LinkedIn',
  'Returning client',
  'Other',
] as const
