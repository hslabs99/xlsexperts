/** Service landing pages listed under the Services nav dropdown. */
export const servicePages = [
  { label: 'AI Workflow Automation', href: '/ai-workflow-automation' },
  { label: 'Business Process Automation', href: '/business-process-automation' },
  { label: 'Enterprise Excel Applications', href: '/enterprise-excel-applications' },
  { label: 'Excel Dashboard Development', href: '/excel-dashboard-development' },
  { label: 'Excel Financial Modelling', href: '/excel-financial-modelling' },
  { label: 'Excel Integrations', href: '/excel-integrations' },
  { label: 'Excel Macro Automation', href: '/excel-macro-automation' },
  { label: 'Excel Spreadsheet Development', href: '/excel-spreadsheet-development' },
  { label: 'Excel SQL Integration', href: '/excel-sql-integration' },
  { label: 'Excel VBA Development', href: '/excel-vba-development' },
  { label: 'Google Sheets Development', href: '/google-sheets-development' },
  { label: 'Power Query Consulting', href: '/power-query-consulting' },
  { label: 'Spreadsheet Auditing', href: '/spreadsheet-auditing' },
  { label: 'VBA to Office Scripts Migration', href: '/vba-to-office-scripts-migration' },
] as const

export const servicePageHrefs: readonly string[] = servicePages.map((p) => p.href)

/** Pages that mount the shared Contact / booking section. */
export function pageHasContactSection(pathname: string | null): boolean {
  if (!pathname) return false
  if (pathname === '/') return true
  if (pathname.startsWith('/enterprise-excel-vba-development')) return true
  return servicePageHrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  )
}
