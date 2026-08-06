/**
 * Select options for homepage hero badge links (services + solutions).
 * Same catalogs as the main nav — full labels, not abbreviated short titles.
 */

import { ALL_SERVICES_HREF, servicePages } from '@/lib/service-pages'
import { ALL_SOLUTIONS_HREF, solutionPages } from '@/lib/solutions'

export type HeroBadgeLinkOption = {
  href: string
  label: string
  group: 'none' | 'services' | 'solutions' | 'other'
}

const serviceOptions: HeroBadgeLinkOption[] = [
  { href: ALL_SERVICES_HREF, label: 'All services', group: 'services' },
  ...[...servicePages]
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((p) => ({
      href: p.href,
      label: p.label,
      group: 'services' as const,
    })),
]

const solutionOptions: HeroBadgeLinkOption[] = [
  { href: ALL_SOLUTIONS_HREF, label: 'All solutions', group: 'solutions' },
  ...[...solutionPages]
    .slice()
    .sort((a, b) => a.navLabel.localeCompare(b.navLabel))
    .map((p) => ({
      href: p.href,
      label: p.navLabel,
      group: 'solutions' as const,
    })),
]

export const HERO_BADGE_LINK_OPTIONS: readonly HeroBadgeLinkOption[] = [
  { href: '', label: 'No link', group: 'none' },
  ...serviceOptions,
  ...solutionOptions,
  {
    href: '/enterprise',
    label: 'Enterprise Applications',
    group: 'other',
  },
]

export function heroBadgeLinkLabel(href: string): string {
  const match = HERO_BADGE_LINK_OPTIONS.find((o) => o.href === href)
  return match?.label ?? (href || 'No link')
}
