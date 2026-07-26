/**
 * Admin helpers for Find out about page linking.
 * Imports solution/service registries — use from admin UI / API only.
 */

import { servicePages } from '@/lib/service-pages'
import { solutionPages } from '@/lib/solutions'
import {
  newFindOutAboutItemId,
  validateFindOutAboutShape,
  type FindOutAboutContent,
  type FindOutAboutItem,
  type FindOutAboutPageKind,
} from '@/lib/find-out-about'

export type FindOutAboutPageOption = {
  kind: FindOutAboutPageKind
  href: string
  /** Default label when adding from this page */
  label: string
  /** Select option text */
  optionLabel: string
}

/** Pages available to link from admin (solutions + services). */
export function findOutAboutPageOptions(): FindOutAboutPageOption[] {
  const solutions: FindOutAboutPageOption[] = solutionPages.map((page) => ({
    kind: 'solution',
    href: page.href,
    label: page.navLabel,
    optionLabel: `Solution — ${page.navLabel}`,
  }))
  const services: FindOutAboutPageOption[] = servicePages.map((page) => ({
    kind: 'service',
    href: page.href,
    label: page.label,
    optionLabel: `Service — ${page.label}`,
  }))
  return [...solutions, ...services]
}

function isAllowedHref(href: string): boolean {
  return findOutAboutPageOptions().some((opt) => opt.href === href)
}

export function createEmptyFindOutAboutItem(
  sortOrder = 1
): FindOutAboutItem {
  const first = findOutAboutPageOptions()[0]
  return {
    id: newFindOutAboutItemId(),
    label: first?.label ?? '',
    href: first?.href ?? '/',
    kind: first?.kind ?? 'service',
    sortOrder,
  }
}

export function validateFindOutAboutContent(
  content: FindOutAboutContent
): string | null {
  const shapeError = validateFindOutAboutShape(content)
  if (shapeError) return shapeError
  for (const [index, item] of content.items.entries()) {
    if (!isAllowedHref(item.href)) {
      return `Item ${index + 1} must link to a solution or service page.`
    }
  }
  return null
}
