/**
 * Blog ↔ service internal linking.
 * New posts wire themselves via category, then slug keywords.
 * Slug overrides win when a post must point at a specific commercial page.
 */

import type { BlogListItem } from '@/lib/types'
import { getServiceByHref } from '@/lib/service-pages'

export type ContextualServiceLink = {
  href: string
  anchor: string
}

const AI_HREF = '/ai-workflow-and-business-process-automation'
const VBA_HREF = '/excel-vba-macro-development'
const DASH_HREF = '/excel-dashboard-development'
const MODEL_HREF = '/excel-financial-modelling'
const INTEG_HREF = '/excel-integrations'
const SHEETS_HREF = '/google-sheets-development'
const PQ_HREF = '/power-query-consulting'
const SPREAD_HREF = '/excel-spreadsheet-development'
const AUDIT_HREF = '/spreadsheet-auditing'
const MIGRATE_HREF = '/vba-to-office-scripts-migration'
const WEB_HREF = '/web-applications'
const ENTERPRISE_HREF = '/enterprise'
const USE_CASES_HREF = '/use-cases'

const ANCHORS: Record<string, readonly string[]> = {
  [AI_HREF]: [
    'AI workflow automation services',
    'business process automation services',
    'Excel AI workflow implementation',
  ],
  [VBA_HREF]: [
    'Excel VBA and macro development',
    'custom Excel macro development',
    'VBA automation for Excel',
  ],
  [DASH_HREF]: [
    'Excel dashboard development',
    'custom Excel dashboards',
    'management dashboard development',
  ],
  [MODEL_HREF]: [
    'Excel financial modelling services',
    'forecasting models in Excel',
    'board-ready financial models',
  ],
  [INTEG_HREF]: [
    'Excel integration with SQL and APIs',
    'Xero and SQL Excel integrations',
    'live Excel data connections',
  ],
  [SHEETS_HREF]: [
    'Google Sheets development',
    'Apps Script automation',
    'custom Google Sheets systems',
  ],
  [PQ_HREF]: [
    'Power Query consulting',
    'automated data pipelines in Excel',
    'Power Query data transformation',
  ],
  [SPREAD_HREF]: [
    'custom Excel spreadsheet development',
    'spreadsheet design and build',
    'purpose-built Excel workbooks',
  ],
  [AUDIT_HREF]: [
    'spreadsheet auditing services',
    'independent Excel model review',
    'Excel formula risk review',
  ],
  [MIGRATE_HREF]: [
    'VBA to Office Scripts migration',
    'Excel cloud automation on Microsoft 365',
    'Office Scripts migration help',
  ],
  [WEB_HREF]: [
    'custom web application development',
    'multi-user business web apps',
    'cloud applications beyond Excel',
  ],
  [ENTERPRISE_HREF]: [
    'enterprise Excel applications',
    'governed Excel systems for operations',
    'Excel in enterprise environments',
  ],
  [USE_CASES_HREF]: [
    'AI use cases for Excel',
    'practical AI patterns in Excel',
    'Excel VBA and Power Query AI examples',
  ],
}

const CATEGORY_TO_SERVICES: Record<string, readonly string[]> = {
  'A.I. Solutions': [AI_HREF, USE_CASES_HREF],
  'VBA & Automation': [VBA_HREF],
  Automation: [VBA_HREF, AI_HREF],
  Dashboards: [DASH_HREF],
  'Financial Modelling': [MODEL_HREF],
  Finance: [MODEL_HREF, DASH_HREF],
  'Google Sheets': [SHEETS_HREF],
  'Power Query': [PQ_HREF],
  'Power BI': [PQ_HREF, DASH_HREF],
  'SQL & Data': [INTEG_HREF],
  'ERP Integration': [INTEG_HREF, ENTERPRISE_HREF],
  'Office Scripts': [MIGRATE_HREF, VBA_HREF],
  Productivity: [SPREAD_HREF, VBA_HREF],
  Consulting: [SPREAD_HREF],
  SME: [SPREAD_HREF, VBA_HREF],
  Healthcare: [SPREAD_HREF, DASH_HREF],
  Construction: [MODEL_HREF, SPREAD_HREF],
  Property: [MODEL_HREF],
  Manufacturing: [DASH_HREF, INTEG_HREF],
  Logistics: [DASH_HREF, INTEG_HREF],
  Retail: [DASH_HREF, INTEG_HREF],
  Hospitality: [DASH_HREF, SPREAD_HREF],
  Insurance: [MODEL_HREF, DASH_HREF],
  Energy: [DASH_HREF, MODEL_HREF],
  'Not-for-Profit': [SPREAD_HREF, DASH_HREF],
  'HR & Workforce': [SPREAD_HREF, VBA_HREF],
  Education: [SPREAD_HREF, DASH_HREF],
  'E-Commerce': [INTEG_HREF, DASH_HREF],
  Guides: [SPREAD_HREF],
}

/** Explicit commercial targets. Informational posts should not share the service page's head term. */
const SLUG_TO_SERVICES: Record<string, readonly string[]> = {
  'ai-workflow-automation-new-zealand-business': [AI_HREF],
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function pickAnchor(href: string, slug: string, slot: number): string {
  if (
    slug === 'ai-workflow-automation-new-zealand-business' &&
    href === AI_HREF
  ) {
    return 'AI workflow automation services'
  }
  const options = ANCHORS[href]
  const fallback = getServiceByHref(href)?.label ?? href
  if (!options || options.length === 0) return fallback
  return options[(hashString(`${slug}:${href}`) + slot) % options.length] ?? fallback
}

function servicesFromSlugKeywords(slug: string): string[] {
  const s = slug.toLowerCase()
  const found: string[] = []
  const add = (href: string) => {
    if (!found.includes(href)) found.push(href)
  }
  if (/ai-workflow|ai-powered|business-process-automation|\ba\.?i\.?\b/.test(s)) {
    add(AI_HREF)
  }
  if (/vba|macro/.test(s)) add(VBA_HREF)
  if (/dashboard/.test(s)) add(DASH_HREF)
  if (/financial-model|forecast|feasibility/.test(s)) add(MODEL_HREF)
  if (/integrat|sql|xero|api/.test(s)) add(INTEG_HREF)
  if (/google-sheets|apps-script/.test(s)) add(SHEETS_HREF)
  if (/power-query/.test(s)) add(PQ_HREF)
  if (/office-scripts/.test(s)) add(MIGRATE_HREF)
  if (/web-app/.test(s)) add(WEB_HREF)
  if (/enterprise/.test(s)) add(ENTERPRISE_HREF)
  if (/audit/.test(s)) add(AUDIT_HREF)
  return found
}

export function serviceHrefsForPost(slug: string, category: string): string[] {
  const fromSlug = SLUG_TO_SERVICES[slug]
  if (fromSlug && fromSlug.length > 0) return [...fromSlug]
  const fromCategory = CATEGORY_TO_SERVICES[category.trim()] ?? []
  const fromKeywords = servicesFromSlugKeywords(slug)
  const merged = [...fromCategory, ...fromKeywords]
  const unique = [...new Set(merged.filter((href) => Boolean(getServiceByHref(href) || ANCHORS[href])))]
  if (unique.length > 0) return unique.slice(0, 2)
  return [SPREAD_HREF]
}

export function contextualServiceLinksForPost(
  slug: string,
  category: string
): ContextualServiceLink[] {
  return serviceHrefsForPost(slug, category)
    .slice(0, 2)
    .map((href, slot) => ({
      href,
      anchor: pickAnchor(href, slug, slot),
    }))
}

const SOLUTION_TO_TOPIC: Record<string, string> = {
  '/solutions/dashboards-business-intelligence': DASH_HREF,
  '/solutions/resource-planning-scheduling': SPREAD_HREF,
  '/solutions/project-costing-financial-modelling': MODEL_HREF,
  '/solutions/property-development-applications': MODEL_HREF,
  '/solutions/survey-inspection-field-apps': WEB_HREF,
  '/solutions/client-staff-portals': WEB_HREF,
  '/solutions/asset-maintenance-operations-solutions': WEB_HREF,
  '/solutions/workflow-automation-systems-integration': AI_HREF,
}

export function topicHrefForPath(path: string): string {
  return SOLUTION_TO_TOPIC[path] ?? path
}

export function topicHrefs(): string[] {
  return Object.keys(ANCHORS)
}

export function relatedPostsForTopic(
  topicHref: string,
  posts: readonly BlogListItem[],
  limit = 3
): BlogListItem[] {
  const scored = posts.map((post) => {
    const hrefs = serviceHrefsForPost(post.slug, post.category)
    const exact = hrefs[0] === topicHref ? 2 : 0
    const included = hrefs.includes(topicHref) ? 1 : 0
    return { post, score: exact + included }
  })
  return scored
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.post)
}
