/**
 * Infer a blog category from slug/title when Wix tags are missing.
 */

const CATEGORY_RULES: { pattern: RegExp; category: string }[] = [
  { pattern: /healthcare|health\b|hospital|clinic/i, category: 'Healthcare' },
  {
    pattern: /\bhr\b|employee|workforce|compensation|payroll/i,
    category: 'HR & Workforce',
  },
  { pattern: /property|commercial-property|real-estate/i, category: 'Property' },
  { pattern: /retail|inventory|warehouse/i, category: 'Retail' },
  { pattern: /e-?commerce|sql-integration|sql_integration/i, category: 'E-Commerce' },
  { pattern: /manufactur|production|kpi-tracker/i, category: 'Manufacturing' },
  {
    pattern: /construct|civil-engineering|infrastructure|cost-estimation/i,
    category: 'Construction',
  },
  {
    pattern: /engineering-firms|project-reporting|engineering-kpi/i,
    category: 'Construction',
  },
  { pattern: /power-bi|power_bi/i, category: 'Power BI' },
  { pattern: /google-sheets|google_sheets/i, category: 'Google Sheets' },
  { pattern: /power-query|erp/i, category: 'ERP Integration' },
  { pattern: /dashboard/i, category: 'Dashboards' },
  { pattern: /\bvba\b|office-scripts|automat/i, category: 'VBA & Automation' },
  { pattern: /financ|cash-flow|budget|claims/i, category: 'Finance' },
  { pattern: /\bsmes?\b|scale-with-automation/i, category: 'SME' },
  { pattern: /supply-chain|logistics/i, category: 'Logistics' },
  {
    pattern: /consult|specialist|excel-expert|excel-consultant/i,
    category: 'Consulting',
  },
]

export function inferCategoryForSlug(slug: string, title = ''): string {
  const hay = `${title} ${slug}`
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(hay)) return rule.category
  }
  return 'Guides'
}
