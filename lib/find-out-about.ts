/**
 * Quick-nav “Find out about” links shown in the floating CTA.
 * Stored in Firestore Site Content / find-out-about.
 *
 * Keep this module free of solution/service page registries so public
 * client components do not pull those large data files into the bundle.
 */

export type FindOutAboutPageKind = 'solution' | 'service'

export type FindOutAboutItem = {
  id: string
  /** Menu label shown to visitors */
  label: string
  /** Absolute site path, e.g. /web-applications */
  href: string
  kind: FindOutAboutPageKind
  sortOrder: number
}

/** “See all …” link shown under the quick links, with copy explaining the difference. */
export type FindOutAboutBrowseLink = {
  /** Hidden from the menu when false */
  enabled: boolean
  label: string
  description: string
}

export type FindOutAboutContent = {
  items: FindOutAboutItem[]
  /** Eyebrow above the two browse-all links */
  browseHeading: string
  services: FindOutAboutBrowseLink
  solutions: FindOutAboutBrowseLink
}

export const ALL_SERVICES_MENU_HREF = '/services'
export const ALL_SOLUTIONS_MENU_HREF = '/solutions'

export const DEFAULT_FIND_OUT_ABOUT: FindOutAboutContent = {
  items: [
    {
      id: 'nc-web-applications',
      label: 'NC Web Applications',
      href: '/web-applications',
      kind: 'service',
      sortOrder: 1,
    },
    {
      id: 'dba-macro-automations',
      label: 'DBA Macro Automations',
      href: '/excel-vba-macro-development',
      kind: 'service',
      sortOrder: 2,
    },
    {
      id: 'project-costing-solutions',
      label: 'Project Costing Solutions',
      href: '/solutions/project-costing-financial-modelling',
      kind: 'solution',
      sortOrder: 3,
    },
  ],
  browseHeading: 'Not listed? Browse the full range',
  services: {
    enabled: true,
    label: 'See all services',
    description:
      'The technical work we do: Excel VBA and macros, dashboards, financial modelling, Power Query, SQL and API integrations, Google Sheets, web applications and AI automation.',
  },
  solutions: {
    enabled: true,
    label: 'See all solutions',
    description:
      'Complete systems we have delivered for specific industries: manufacturing costing, quoting and estimating, project costing, resource planning, asset maintenance, field apps and client portals.',
  },
}

export function newFindOutAboutItemId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `foa-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function resolveKind(href: string): FindOutAboutPageKind {
  return href.startsWith('/solutions/') ? 'solution' : 'service'
}

function isPlausibleHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//') && href.length > 1
}

function normalizeBrowseLink(
  raw: unknown,
  fallback: FindOutAboutBrowseLink
): FindOutAboutBrowseLink {
  const data =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const label = String(data.label ?? '').trim()
  const description = String(data.description ?? '').trim()
  return {
    enabled: data.enabled === undefined ? fallback.enabled : Boolean(data.enabled),
    label: label || fallback.label,
    description: description || fallback.description,
  }
}

export function normalizeFindOutAboutContent(
  raw: unknown
): FindOutAboutContent {
  const data =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const list = Array.isArray(data.items) ? data.items : []
  const items: FindOutAboutItem[] = []

  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue
    const row = entry as Record<string, unknown>
    const href = String(row.href ?? '').trim()
    const label = String(row.label ?? '').trim()
    if (!href || !label || !isPlausibleHref(href)) continue
    const kindRaw = String(row.kind ?? '').trim()
    const kind: FindOutAboutPageKind =
      kindRaw === 'solution' || kindRaw === 'service'
        ? kindRaw
        : resolveKind(href)
    const sortOrder = Number(row.sortOrder)
    items.push({
      id: String(row.id ?? '').trim() || newFindOutAboutItemId(),
      label,
      href,
      kind,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : items.length + 1,
    })
  }

  items.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
  return {
    items: items.map((item, index) => ({
      ...item,
      sortOrder: index + 1,
    })),
    browseHeading:
      String(data.browseHeading ?? '').trim() ||
      DEFAULT_FIND_OUT_ABOUT.browseHeading,
    services: normalizeBrowseLink(
      data.services,
      DEFAULT_FIND_OUT_ABOUT.services
    ),
    solutions: normalizeBrowseLink(
      data.solutions,
      DEFAULT_FIND_OUT_ABOUT.solutions
    ),
  }
}

export function validateFindOutAboutShape(
  content: FindOutAboutContent
): string | null {
  if (!Array.isArray(content.items)) {
    return 'Items must be a list.'
  }
  for (const [index, item] of content.items.entries()) {
    if (!item.label.trim()) {
      return `Item ${index + 1} needs a label.`
    }
    if (!item.href.trim() || !isPlausibleHref(item.href)) {
      return `Item ${index + 1} must link to a solution or service page.`
    }
  }
  const labels = content.items.map((i) => i.label.trim().toLowerCase())
  if (new Set(labels).size !== labels.length) {
    return 'Each menu label must be unique.'
  }
  if (!content.browseHeading.trim()) {
    return 'The browse-all heading needs text.'
  }
  for (const [name, link] of [
    ['services', content.services],
    ['solutions', content.solutions],
  ] as const) {
    if (!link.enabled) continue
    if (!link.label.trim()) {
      return `The “see all ${name}” link needs a label.`
    }
    if (!link.description.trim()) {
      return `The “see all ${name}” link needs descriptive text.`
    }
  }
  return null
}
