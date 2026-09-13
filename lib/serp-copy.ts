/**
 * One SERP title/description template per path. `{region}` / `{based}` swap at
 * request time for the three sites (NZ, UK, global/US). UK and .com never
 * share a token set.
 *
 * Titles must stay ≤ 46 characters before ` | XLS Experts` (14) so the
 * rendered document title is ≤ 60.
 */

import type { MarketId } from '@/lib/market'
import { serpTokensForMarket, type SerpTokens } from '@/lib/regions'

export type SerpTemplate = {
  title: string
  description: string
}

export const BRAND_TITLE_SUFFIX = ' | XLS Experts'
export const TITLE_MAX = 60
export const DESC_MIN = 140
export const DESC_MAX = 155
/** Characters available before ` | XLS Experts`. */
export const TITLE_BODY_MAX = TITLE_MAX - BRAND_TITLE_SUFFIX.length

/** Homepage titles/descriptions are written per market — not a token swap. */
const HOME_BY_MARKET: Record<MarketId, SerpTemplate> = {
  nz: {
    title: 'Excel Experts NZ: Automation & VBA',
    description:
      'Auckland Excel consultants for New Zealand teams. VBA automation, dashboards and financial modelling quoted in NZD. Book a free discovery call today.',
  },
  intl: {
    title: 'US Excel Experts: Automation & VBA',
    description:
      'US-facing Excel consultants for American and global teams. VBA automation, dashboards and financial modeling scoped in USD. Talk to a specialist today.',
  },
  uk: {
    title: 'UK Excel Experts: Modelling & VBA',
    description:
      'UK Excel consultants for British organisations. VBA automation, dashboards and financial modelling with GBP quotes. Book a discovery call today.',
  },
}

const TEMPLATES: Record<string, SerpTemplate> = {
  '/ai-workflow-and-business-process-automation': {
    title: 'AI Workflow Automation {region}',
    description:
      'Automate manual processes with AI-driven workflows. {based} specialists in Excel, VBA and system integration. Book a free scoping call today.',
  },
  '/excel-vba-macro-development': {
    title: 'Excel VBA & Macro Development {region}',
    description:
      'Custom VBA macros and Excel automation built by {based} developers. Cut manual work, remove errors and speed up reporting. Get a fixed-price quote.',
  },
  '/excel-financial-modelling': {
    title: 'Excel Financial Modelling {region}',
    description:
      'Budgeting, forecasting and financial models in Excel for {region} businesses. Board-ready outputs and audit-friendly structure. Talk to a modeller.',
  },
  '/excel-integrations': {
    title: 'Excel Integrations {region}: Xero & SQL',
    description:
      'Connect Excel to Xero, SQL, APIs and cloud systems. Live data instead of copy-paste exports. {based} integration specialists. Book a call today.',
  },
  '/excel-dashboard-development': {
    title: 'Excel Dashboard Development {region}',
    description:
      'We build custom Excel dashboards for {region} businesses. Live KPIs, automated refresh and board-ready views your team will use. Book a free call.',
  },
  '/excel-spreadsheet-development': {
    title: 'Excel Spreadsheet Development {region}',
    description:
      'Custom Excel workbooks for {region} businesses. Structured, validated and built to last as your process grows. Talk to a spreadsheet specialist today.',
  },
  '/google-sheets-development': {
    title: 'Google Sheets Development {region}',
    description:
      'Custom Google Sheets and Apps Script for {region} teams. Shared workbooks, automations and live data without leaving Workspace. Book a scoping call.',
  },
  '/power-query-consulting': {
    title: 'Power Query Consulting {region}',
    description:
      'Automated Excel and Power BI data pipelines for {region} businesses. Stop preparing data by hand and keep reports current. Book a Power Query review.',
  },
  '/enterprise': {
    title: 'Enterprise Excel Applications {region}',
    description:
      'Governed Excel applications for {region} enterprises. Pricing, forecasting, ERP extensions and long-term support without replacing core systems. Talk to us.',
  },
  '/use-cases': {
    title: 'AI Use Cases for Excel {region}',
    description:
      'AI use cases inside Excel, VBA and Power Query. Classification, extraction and commentary without replacing your workbooks. See how it works.',
  },
  '/power-apps-dataverse-development': {
    title: 'Power Apps & Dataverse {region}',
    description:
      'Custom Power Apps around how {region} teams actually work. Extend Dynamics 365 and Dataverse without forcing staff through generic screens. Book a call.',
  },
  '/spreadsheet-auditing': {
    title: 'Spreadsheet Auditing {region}',
    description:
      'Independent Excel audits for {region} businesses. Find formula errors, control gaps and calculation risk before they hit a board pack. Book a review.',
  },
  '/vba-to-office-scripts-migration': {
    title: 'VBA to Office Scripts {region}',
    description:
      'Migrate Excel VBA to Office Scripts for Microsoft 365. {based} guidance on real cloud limits, SharePoint and Power Automate. Get a migration plan.',
  },
  '/web-applications': {
    title: 'Web Application Development {region}',
    description:
      'Custom multi-user web apps for {region} businesses. Portals, field systems and cloud tools when Excel is no longer the right shell. Talk to us today.',
  },
  '/services': {
    title: 'Excel & Automation Services {region}',
    description:
      'VBA, dashboards, financial models, Power Query and AI workflows for {region} organisations. Browse our services and book a free discovery call today.',
  },
  '/solutions': {
    title: 'Business Systems Solutions {region}',
    description:
      'Dashboards, costing, quoting, field apps and workflow systems for {region} organisations. Built around how your team already works. Talk to us today.',
  },
  '/blog': {
    title: 'Excel Consulting Blog {region}',
    description:
      'Practical guides on Excel, VBA, dashboards and automation for {region} businesses. Examples, how-it-works notes and field stories. Browse the latest posts.',
  },
  '/solutions/dashboards-business-intelligence': {
    title: 'Dashboards & BI Systems {region}',
    description:
      'Operational dashboards and Excel BI for {region} teams. Clear KPIs, refreshable data and views leadership will actually use. Book a dashboard review.',
  },
  '/solutions/resource-planning-scheduling': {
    title: 'Resource Planning Tools {region}',
    description:
      'Scheduling and resource planning tools for {region} operations. Capacity, utilisation and roster logic in systems your team can run. Talk to us today.',
  },
  '/solutions/project-costing-financial-modelling': {
    title: 'Project Costing Models {region}',
    description:
      'Project costing and financial models for {region} businesses. Quote-to-actual control, scenarios and board-ready numbers. Talk to a modeller today.',
  },
  '/solutions/property-development-applications': {
    title: 'Property Development Models {region}',
    description:
      'Feasibility, cash-flow and development models for {region} property teams. Scenario control from concept through to settlement. Talk to a modeller.',
  },
  '/solutions/survey-inspection-field-apps': {
    title: 'Survey & Field Apps {region}',
    description:
      'Survey, inspection and field apps for {region} teams. Capture structured data on site and land it in Excel or a cloud system. Book a scoping call.',
  },
  '/solutions/client-staff-portals': {
    title: 'Client & Staff Portals {region}',
    description:
      'Client, staff and supplier portals for {region} organisations. One live dataset, controlled access, no more emailed spreadsheet copies. Talk to us.',
  },
  '/solutions/asset-maintenance-operations-solutions': {
    title: 'Asset Maintenance Systems {region}',
    description:
      'Asset maintenance and field operations systems for {region} businesses. Jobs, history and reporting without a bloated EAM rollout. Book a call today.',
  },
  '/solutions/workflow-automation-systems-integration': {
    title: 'Workflow Integration {region}',
    description:
      'Workflow automation and systems integration for {region} teams. Connect Excel, APIs and line-of-business tools so data moves once. Book a scoping call.',
  },
  '/solutions/quoting-estimating-systems': {
    title: 'Quoting & Estimating Systems {region}',
    description:
      'Quote and estimate systems for {region} {organisations}. Repeatable pricing, margin control and faster turnaround than a spreadsheet scramble. Talk to us.',
  },
  '/solutions/manufacturing-costing-estimating-quoting': {
    title: 'Manufacturing Costing {region}',
    description:
      'Manufacturing costing and quoting for {region} plants. Labour, machine time and margin in one model your team can run. Book a costing review today.',
  },
}

export function fillSerpTemplate(template: string, tokens: SerpTokens): string {
  return template
    .replaceAll('{region}', tokens.region)
    .replaceAll('{based}', tokens.based)
    .replaceAll('{modelling}', tokens.modelling)
    .replaceAll('{organisations}', tokens.organisations)
    .replaceAll('{organizations}', tokens.organisations)
    .replaceAll('{currency}', tokens.currency)
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function resolveSerpCopy(
  path: string,
  market: MarketId
): SerpTemplate | null {
  const normalized = path.startsWith('/') ? path.replace(/\/$/, '') || '/' : `/${path}`
  const home = normalized === '/' ? HOME_BY_MARKET[market] : null
  const template = home ?? TEMPLATES[normalized]
  if (!template) return null
  const tokens = serpTokensForMarket(market)
  return {
    title: fillSerpTemplate(template.title, tokens),
    description: fillSerpTemplate(template.description, tokens),
  }
}

export function serpTemplatePaths(): string[] {
  return ['/', ...Object.keys(TEMPLATES)]
}

export function renderedTitleLength(title: string): number {
  const trimmed = title.trim()
  if (trimmed.endsWith(BRAND_TITLE_SUFFIX) || trimmed === 'XLS Experts') {
    return trimmed.length
  }
  return `${trimmed}${BRAND_TITLE_SUFFIX}`.length
}
