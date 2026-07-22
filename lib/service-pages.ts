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
  | 'audit'
  | 'migration'

export type ServicePage = {
  label: string
  href: string
  title: string
  description: string
  tags: string[]
  icon: ServiceIconKey
  /** Shown as one of the 8 homepage service tiles */
  showOnHome?: boolean
}

export const servicePages: readonly ServicePage[] = [
  {
    label: 'AI Workflow Automation',
    href: '/ai-workflow-automation',
    title: 'A.I. Workflow Solutions',
    description:
      'We integrate AI tools into your existing spreadsheet and data workflows — automated summarisation, data classification, anomaly detection, and intelligent reporting.',
    tags: ['AI Integration', 'OpenAI', 'Automation'],
    icon: 'ai',
    showOnHome: true,
  },
  {
    label: 'Business Process Automation',
    href: '/business-process-automation',
    title: 'Business Process Automation',
    description:
      'End-to-end workflow automation connecting spreadsheets, cloud tools, and business software. Reduce manual effort, cut errors, and free your team for higher-value work.',
    tags: ['Google Sheets', 'Airtable', 'Zapier', 'Make'],
    icon: 'process',
    showOnHome: true,
  },
  {
    label: 'Enterprise Excel Applications',
    href: '/enterprise-excel-applications',
    title: 'Enterprise Excel Applications',
    description:
      'Purpose-built Excel applications for large organisations — governed VBA tools, SharePoint deployment and SQL-connected hybrids that scale across teams.',
    tags: ['VBA', 'SQL', 'SharePoint'],
    icon: 'enterprise',
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
    label: 'Excel Integrations',
    href: '/excel-integrations',
    title: 'Data Connections & Integration',
    description:
      'Connect your spreadsheets to SQL databases, REST APIs, Shopify, Xero, and other business systems. Pull live data in, push results out — no more copy-paste.',
    tags: ['SQL', 'APIs', 'Power Query', 'EDI'],
    icon: 'integrations',
    showOnHome: true,
  },
  {
    label: 'Excel Macro Automation',
    href: '/excel-macro-automation',
    title: 'Excel Macro Automation',
    description:
      'Purpose-built macros that remove repetitive Excel tasks — formatting, report packs, file handling, and one-click process runners your team can trust.',
    tags: ['Macros', 'Automation', 'Excel'],
    icon: 'macro',
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
    label: 'Excel SQL Integration',
    href: '/excel-sql-integration',
    title: 'Excel SQL Integration',
    description:
      'Connect Excel to SQL Server and other databases so reports refresh from live data. Secure queries, scheduled refreshes, and reliable enterprise data pipelines.',
    tags: ['SQL', 'ADO', 'Power Query'],
    icon: 'sql',
  },
  {
    label: 'Excel VBA Development',
    href: '/excel-vba-development',
    title: 'Macros & VBA Automation',
    description:
      'Eliminate repetitive manual work. We write clean, well-documented VBA code that automates your workflows, generates reports, and runs processes at the click of a button.',
    tags: ['VBA', 'Macros', 'Workflow Automation'],
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
      'Browser-based apps built with Java, cloud databases and platforms like Google Cloud — to extend Excel or migrate spreadsheet tools into full multi-user web applications.',
    tags: ['Java', 'Cloud DB', 'Google Cloud'],
    icon: 'web',
    showOnHome: true,
  },
] satisfies readonly ServicePage[]

export const servicePageHrefs: readonly string[] = servicePages.map((p) => p.href)

/** Homepage services section — 8 featured tiles in display order. */
const homeHrefs = [
  '/excel-spreadsheet-development',
  '/excel-dashboard-development',
  '/excel-vba-development',
  '/excel-integrations',
  '/web-applications',
  '/excel-financial-modelling',
  '/business-process-automation',
  '/ai-workflow-automation',
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
  return servicePages.find((p) => p.href === href)
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
  if (pathname.startsWith('/enterprise-excel-vba-development')) return true
  return servicePageHrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  )
}
