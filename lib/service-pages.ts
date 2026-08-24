/** Service landing pages listed under the Services nav dropdown. */

export type ServiceIconKey =
  | 'spreadsheet'
  | 'dashboard'
  | 'vba'
  | 'macro'
  | 'integrations'
  | 'sql'
  | 'enterprise'
  | 'web'
  | 'financial'
  | 'process'
  | 'ai'
  | 'sheets'
  | 'powerQuery'
  | 'powerApps'
  | 'audit'
  | 'migration'

export const SERVICE_ICON_KEYS: readonly ServiceIconKey[] = [
  'spreadsheet',
  'dashboard',
  'vba',
  'macro',
  'integrations',
  'sql',
  'enterprise',
  'web',
  'financial',
  'process',
  'ai',
  'sheets',
  'powerQuery',
  'powerApps',
  'audit',
  'migration',
] as const

export function isServiceIconKey(value: string): value is ServiceIconKey {
  return (SERVICE_ICON_KEYS as readonly string[]).includes(value)
}

export type ServicePage = {
  label: string
  href: string
  title: string
  description: string
  tags: string[]
  icon: ServiceIconKey
  /** Seed hint for homepage CMS defaults — live home tiles are CMS-managed */
  showOnHome?: boolean
}

export const servicePages: readonly ServicePage[] = [
  {
    label: 'AI Workflow and Business Process Automation',
    href: '/ai-workflow-and-business-process-automation',
    title: 'AI Workflow and Business Process Automation',
    description:
      'End-to-end workflow automation with AI — connecting spreadsheets, cloud tools and business software. Automate summarisation, classification, approvals and reporting so your team focuses on higher-value work.',
    tags: ['AI', 'Power Automate', 'Excel', 'Automation'],
    icon: 'ai',
    showOnHome: true,
  },
  {
    label: 'Excel Dashboard Development',
    href: '/excel-dashboard-development',
    title: 'Dashboards & Reporting',
    description:
      'Interactive charts, pivot tables, and management dashboards that turn raw data into clear decisions. Connected to live data sources or refreshed on demand.',
    tags: ['Charts', 'Pivot Tables', 'Power Query'],
    icon: 'dashboard',
    showOnHome: true,
  },
  {
    label: 'Excel Financial Modelling',
    href: '/excel-financial-modelling',
    title: 'Financial Modelling',
    description:
      'Budgets, forecasts, feasibility studies, and fund management tools built to professional standards. Reliable models that stand up to scrutiny from finance teams and boards.',
    tags: ['Forecasting', 'Feasibility', 'Fund Management'],
    icon: 'financial',
    showOnHome: true,
  },
  {
    label: 'Excel Integrations (SQL, API, etc.)',
    href: '/excel-integrations',
    title: 'Excel Integrations (SQL, API, etc.)',
    description:
      'Connect Excel to SQL databases, REST APIs, Shopify, Xero and other business systems. Live refreshes, write-back and multi-user database-backed applications — no more copy-paste exports.',
    tags: ['SQL', 'APIs', 'Power Query', 'EDI'],
    icon: 'integrations',
    showOnHome: true,
  },
  {
    label: 'Excel Spreadsheet Development',
    href: '/excel-spreadsheet-development',
    title: 'Spreadsheet Design & Build',
    description:
      'From simple calculators to complex multi-sheet models — formulas, named ranges, data validation, and clean layouts that anyone on your team can use.',
    tags: ['Formulas', 'Data Validation', 'Templates'],
    icon: 'spreadsheet',
    showOnHome: true,
  },
  {
    label: 'Excel VBA/Macro Development',
    href: '/excel-vba-macro-development',
    title: 'Excel VBA/Macro Development',
    description:
      'Eliminate repetitive manual work with clean, well-documented macros and VBA — one-click report packs, file handling, validation and automated workflows your team can trust.',
    tags: ['VBA', 'Macros', 'Automation'],
    icon: 'vba',
    showOnHome: true,
  },
  {
    label: 'Google Sheets Development',
    href: '/google-sheets-development',
    title: 'Google Sheets Development',
    description:
      'Custom Google Sheets solutions with Apps Script — shared workbooks, automations, and cloud-native tools for teams that live in Google Workspace.',
    tags: ['Google Sheets', 'Apps Script', 'Automation'],
    icon: 'sheets',
  },
  {
    label: 'Power Query Consulting',
    href: '/power-query-consulting',
    title: 'Power Query Consulting',
    description:
      'Automated data pipelines in Excel and Power BI that eliminate manual preparation, standardise messy exports, and keep dashboards always current.',
    tags: ['Power Query', 'ETL', 'Power BI'],
    icon: 'powerQuery',
  },
  {
    label: 'Microsoft Power Apps & Dataverse',
    href: '/power-apps-dataverse-development',
    title: 'Microsoft Power Apps & Dataverse Development',
    description:
      'Purpose-built Power Apps and Dataverse applications that extend Dynamics 365, Microsoft 365 and your existing Microsoft ecosystem — designed around the way the work is actually done.',
    tags: ['Power Apps', 'Dataverse', 'Dynamics 365'],
    icon: 'powerApps',
  },
  {
    label: 'Spreadsheet Auditing',
    href: '/spreadsheet-auditing',
    title: 'Spreadsheet Auditing',
    description:
      'Independent reviews of critical workbooks — formula risk, control gaps, documentation, and remediation so your models stand up to audit and board scrutiny.',
    tags: ['Audit', 'Risk', 'Controls'],
    icon: 'audit',
  },
  {
    label: 'VBA to Office Scripts Migration',
    href: '/vba-to-office-scripts-migration',
    title: 'VBA to Office Scripts Migration',
    description:
      'Migrate legacy VBA to modern Office Scripts and cloud-friendly automation so your Excel solutions work securely across Microsoft 365.',
    tags: ['Office Scripts', 'Migration', 'M365'],
    icon: 'migration',
  },
  {
    label: 'Web Applications',
    href: '/web-applications',
    title: 'Web Applications',
    description:
      'Custom web application development for New Zealand businesses—secure multi-user cloud apps, customer portals, field systems, hybrid Excel solutions and SaaS platforms.',
    tags: ['Next.js', 'Cloud', 'Multi-user'],
    icon: 'web',
    showOnHome: true,
  },
] satisfies readonly ServicePage[]

export const servicePageHrefs: readonly string[] = servicePages.map((p) => p.href)

/** Retired service landings — not listed in nav; old URLs redirect away. */
export const archivedServicePageHrefs = [
  '/enterprise-excel-applications',
] as const

export const archivedServiceSlugs: readonly string[] =
  archivedServicePageHrefs.map((href) => href.replace(/^\//, ''))

export function isArchivedServiceSlug(slug: string): boolean {
  const normalized = slug.trim().replace(/^\//, '')
  return archivedServiceSlugs.includes(normalized)
}

export function isArchivedServiceHref(href: string): boolean {
  const path = href.startsWith('/') ? href : `/${href}`
  return (archivedServicePageHrefs as readonly string[]).includes(path)
}

/** Strip retired service links from case-study / tile assignments. */
export function canonicalizeServiceSlug(slug: string): string {
  const normalized = slug.trim().replace(/^\//, '')
  if (!normalized) return ''
  for (const [canonical, aliases] of Object.entries(servicePageHrefAliases)) {
    const canonicalSlug = canonical.replace(/^\//, '')
    if (normalized === canonicalSlug) return canonicalSlug
    if (aliases.some((a) => a.replace(/^\//, '') === normalized)) {
      return canonicalSlug
    }
  }
  return normalized
}

export function withoutArchivedServiceSlugs(
  slugs: readonly string[],
): string[] {
  return [
    ...new Set(
      slugs
        .map(canonicalizeServiceSlug)
        .filter((s) => s && !isArchivedServiceSlug(s)),
    ),
  ]
}

export function canonicalizeServiceHref(href: string): string {
  const path = href.trim().startsWith('/')
    ? href.trim()
    : `/${href.trim()}`
  if (path === '/') return path
  for (const [canonical, aliases] of Object.entries(servicePageHrefAliases)) {
    if (path === canonical || aliases.includes(path)) return canonical
  }
  return path
}

export function withoutArchivedServiceHrefs(
  hrefs: readonly string[],
): string[] {
  return [
    ...new Set(
      hrefs
        .map(canonicalizeServiceHref)
        .filter((h) => h !== '/' && !isArchivedServiceHref(h)),
    ),
  ]
}

/** Former service paths that now redirect to a merged landing page. */
export const servicePageHrefAliases: Readonly<Record<string, readonly string[]>> =
  {
    '/ai-workflow-and-business-process-automation': [
      '/ai-workflow-automation',
      '/business-process-automation',
    ],
    '/excel-vba-macro-development': [
      '/excel-vba-development',
      '/excel-macro-automation',
    ],
    '/excel-integrations': ['/excel-sql-integration'],
  }

/** Seed order for homepage CMS defaults — live home tiles are CMS-managed. */
const homeHrefs = [
  '/excel-spreadsheet-development',
  '/excel-dashboard-development',
  '/excel-vba-macro-development',
  '/excel-integrations',
  '/web-applications',
  '/excel-financial-modelling',
  '/ai-workflow-and-business-process-automation',
] as const

export const homeServicePages: readonly ServicePage[] = homeHrefs.map(
  (href) => {
    const page = servicePages.find((s) => s.href === href)
    if (!page) throw new Error(`Missing home service page: ${href}`)
    return page
  }
)

export const ALL_SERVICES_HREF = '/services'

/** Resolve a service page from href, slug, or pathname. */
export function getServiceByHref(
  hrefOrSlug: string | null | undefined,
): ServicePage | undefined {
  if (!hrefOrSlug) return undefined
  const raw = hrefOrSlug.trim()
  if (!raw) return undefined
  const href = raw.startsWith('/') ? raw.replace(/\/$/, '') || '/' : `/${raw.replace(/\/$/, '')}`
  const direct = servicePages.find((p) => p.href === href)
  if (direct) return direct
  for (const [canonical, aliases] of Object.entries(servicePageHrefAliases)) {
    if (aliases.includes(href)) {
      return servicePages.find((p) => p.href === canonical)
    }
  }
  return undefined
}

export function contactLabelForService(
  hrefOrSlug: string | null | undefined,
): string | undefined {
  return getServiceByHref(hrefOrSlug)?.label
}

/** Prefill helper when Contact is mounted on a service landing page. */
export function contactLabelForServicePath(
  pathname: string | null | undefined,
): string | undefined {
  if (!pathname) return undefined
  const path = pathname.replace(/\/$/, '') || '/'
  return servicePages.find(
    (p) => path === p.href || path.startsWith(`${p.href}/`),
  )?.label
}

export function contactHrefForService(href: string): string {
  const path = href.startsWith('/') ? href : `/${href}`
  const slug = path.replace(/^\//, '')
  return `${path}?service=${encodeURIComponent(slug)}#contact`
}

/** Pages that mount the shared Contact / booking section. */
export function pageHasContactSection(pathname: string | null): boolean {
  if (!pathname) return false
  if (pathname === '/') return true
  if (pathname === ALL_SERVICES_HREF || pathname.startsWith(`${ALL_SERVICES_HREF}/`)) {
    return true
  }
  if (pathname === '/solutions' || pathname.startsWith('/solutions/')) {
    return true
  }
  if (pathname === '/enterprise' || pathname.startsWith('/enterprise/')) return true
  if (pathname === '/use-cases' || pathname.startsWith('/use-cases/')) return true
  return servicePageHrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  )
}
