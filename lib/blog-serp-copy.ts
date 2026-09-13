/**
 * SERP title/description overlay for blog posts.
 * H1 and URL stay on the Firestore `title` / slug. These strings only
 * feed document title, meta description, Open Graph and Twitter.
 *
 * Titles must stay ≤ 46 characters before ` | XLS Experts` (14).
 * Descriptions 140–155 after `{region}` / `{modelling}` fill.
 * Batches of 20 — do not expand until the current batch is approved.
 */

import type { MarketId } from '@/lib/market'
import { MARKET_IDS } from '@/lib/market'
import { serpTokensForMarket } from '@/lib/regions'
import {
  DESC_MAX,
  DESC_MIN,
  TITLE_BODY_MAX,
  TITLE_MAX,
  fillSerpTemplate,
  renderedTitleLength,
  type SerpTemplate,
} from '@/lib/serp-copy'

/** Batch 1 of 20 — NZ Firestore order. Remaining posts are not in this map yet. */
export const BLOG_SERP_BY_SLUG: Record<string, SerpTemplate> = {
  'excel-solutions-for-healthcare-providers-in-new-zealand': {
    title: 'Excel for Healthcare in {region}',
    description:
      'Excel for {region} healthcare: reporting, rostering and compliance without extra admin. Workbooks stay consistent across sites. See how providers use them.',
  },
  'enterprise-excel-automation-scaling-business-processes': {
    title: 'Enterprise Excel Automation {region}',
    description:
      'Enterprise Excel automation with VBA and Power Query. {region} teams replace brittle workbooks with governed processes that stay accurate as volume grows.',
  },
  'excel-automation-for-e-commerce-managing-sales-inventory-fulfilment': {
    title: 'Excel Automation for E-Commerce',
    description:
      'Excel automation for {region} e-commerce: sales, stock and fulfilment in one workbook. Less copy-paste, faster ops reporting, fewer stock mistakes.',
  },
  'excel-automation-for-manufacturing': {
    title: 'Excel Automation for Manufacturing',
    description:
      'Excel automation for {region} manufacturers: production tracking, cost analysis and fewer spreadsheet errors. See how plants replace manual weekly reporting.',
  },
  'excel-consultant-new-zealand-when-should-your-business-hire-one': {
    title: 'When to Hire an Excel Consultant',
    description:
      'Signs a {region} business should hire an Excel consultant: error-prone files, slow reporting, and models nobody trusts. Check the list before you rebuild.',
  },
  'excel-vba-automation-business-reporting': {
    title: 'Excel VBA Automation for Reporting',
    description:
      'Excel VBA can cut {region} reporting hours and remove manual copy-paste. See when macros pay off, and how to keep workbooks reliable as the team grows.',
  },
  'project-costing-in-excel': {
    title: 'Project Costing in Excel {region}',
    description:
      'Track project budgets, actuals and margin in Excel. {region} teams use structured costing workbooks to spot overruns early and protect job profitability.',
  },
  'excel-financial-modelling-services-for-new-zealand-businesses': {
    title: 'Excel Financial Modelling {region}',
    description:
      'Professionally built Excel financial models for {region} businesses. Forecasts, investment cases and board packs with a structure you can audit and reuse.',
  },
  'excel-solutions-for-logistics-and-supply-chain-management-in-new-zealand': {
    title: 'Excel for Logistics in {region}',
    description:
      'Excel for {region} logistics: inventory, freight and supplier data in one place. Automation improves speed and visibility without replacing your WMS.',
  },
  'getting-started-with-ai-in-your-vba-workflow': {
    title: 'AI in Your VBA Workflow {region}',
    description:
      'Add AI to existing VBA in Excel: classify text, draft commentary and cut busywork. A practical start for {region} teams who already live in macros.',
  },
  'excel-vba-automation-new-zealand-businesses': {
    title: 'Excel VBA Automation in {region}',
    description:
      'What Excel VBA automation is, and when {region} businesses need it. Turn repetitive spreadsheet work into one-click processes without a full rebuild.',
  },
  'excel-dashboards-kpi-reporting-new-zealand': {
    title: 'Excel Dashboards and KPIs {region}',
    description:
      'Executive Excel dashboards for {region} teams. Live KPIs and board-ready views without a BI platform. See when a workbook is the practical reporting upgrade.',
  },
  'google-sheets-automation-new-zealand-small-business': {
    title: 'Google Sheets Automation {region}',
    description:
      'Google Sheets automation for {region} small businesses. Apps Script and a clean structure turn shared spreadsheets into tools the whole team can trust.',
  },
  'excel-solutions-construction-engineering-new-zealand': {
    title: 'Excel for Construction in {region}',
    description:
      'Excel for {region} construction and engineering: costing, programmes and resources. Custom workbooks reduce quote errors and keep live jobs profitable.',
  },
  'ai-workflow-automation-new-zealand-business': {
    title: 'How teams run AI workflows in Excel',
    description:
      'How {region} teams run AI on top of Excel: reading documents, classifying work and drafting commentary without ripping out the spreadsheet. Practical start.',
  },
  'power-query-data-transformation-new-zealand': {
    title: 'Power Query for {region} Businesses',
    description:
      'Power Query is in Excel and still underused. {region} teams can stop copying data from every system by hand. See the transformations that save hours weekly.',
  },
  'excel-solutions-property-development-new-zealand': {
    title: 'Excel for Property in {region}',
    description:
      'Excel for {region} property development: feasibility, cash flow and funding analysis. Custom models give developers numbers they can take to lenders.',
  },
  'excel-solutions-manufacturing-operations-new-zealand': {
    title: 'Excel for Manufacturing {region}',
    description:
      '{region} manufacturers still run planning and cost analysis in Excel beside the ERP. Custom automation bridges the gap so management sees live production.',
  },
  'excel-automation-nz-sme-guide': {
    title: 'Excel Automation Guide for SMEs',
    description:
      'A practical Excel automation guide for {region} SMEs: where to start, what a build looks like, and how to get time back without buying enterprise software.',
  },
  'automated-reporting-excel-new-zealand-businesses': {
    title: 'Automated Excel Reporting {region}',
    description:
      'Manual {region} reports steal hours every week. Excel automation can refresh the pack on a click — or skip the click. See how teams get that time back.',
  },
}

export type BlogSerpSource = {
  serpTitle?: string
  serpDescription?: string
}

function templateForSlug(
  slug: string,
  source?: BlogSerpSource | null
): SerpTemplate | null {
  const overlay = BLOG_SERP_BY_SLUG[slug]
  if (overlay) return overlay
  const title = source?.serpTitle?.trim() ?? ''
  const description = source?.serpDescription?.trim() ?? ''
  if (!title || !description) return null
  return { title, description }
}

function containsRegionWord(text: string, region: string): boolean {
  return new RegExp(`\\b${region}\\b`, 'i').test(text)
}

function trimToLength(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return trimmed.slice(0, max).trim().replace(/[ ,;:-]+$/u, '')
}

/**
 * Shared posts stay region-neutral in the article. Metadata always names
 * the arrival market (NZ / US / UK) so Google can tell the three URLs apart.
 */
export function stampMarketOnBlogSerp(
  title: string,
  description: string,
  market: MarketId
): SerpTemplate {
  const tokens = serpTokensForMarket(market)
  let nextTitle = fillSerpTemplate(title, tokens)
  let nextDescription = fillSerpTemplate(description, tokens)

  if (!containsRegionWord(nextTitle, tokens.region)) {
    const tag = ` ${tokens.region}`
    nextTitle = `${trimToLength(nextTitle, TITLE_BODY_MAX - tag.length)}${tag}`
  } else {
    nextTitle = trimToLength(nextTitle, TITLE_BODY_MAX)
  }

  if (!containsRegionWord(nextDescription, tokens.region)) {
    const tag = ` ${tokens.region}`
    nextDescription = `${trimToLength(nextDescription, DESC_MAX - tag.length)}${tag}`
  } else if (nextDescription.length > DESC_MAX) {
    nextDescription = trimToLength(nextDescription, DESC_MAX)
  }

  return { title: nextTitle, description: nextDescription }
}

export function resolveBlogSerpCopy(
  slug: string,
  market: MarketId,
  source?: BlogSerpSource | null
): SerpTemplate | null {
  const template = templateForSlug(slug, source)
  if (!template) return null
  return stampMarketOnBlogSerp(template.title, template.description, market)
}

/** Overlay, CMS SERP fields, or title/excerpt — always stamped with the host region. */
export function blogSerpForPost(
  slug: string,
  market: MarketId,
  source?: (BlogSerpSource & { title?: string; excerpt?: string }) | null
): SerpTemplate {
  const template = templateForSlug(slug, source) ?? {
    title: source?.title?.trim() || 'XLS Experts',
    description: source?.excerpt?.trim() || source?.serpDescription?.trim() || '',
  }
  return stampMarketOnBlogSerp(template.title, template.description, market)
}

/** Error if title/description fail the service-page SERP rules on any market. */
export function blogSerpTemplateError(
  title: string,
  description: string
): string | null {
  const trimmedTitle = title.trim()
  const trimmedDescription = description.trim()
  if (!trimmedTitle) return 'SERP title is required.'
  if (!trimmedDescription) return 'SERP description is required.'
  for (const market of MARKET_IDS) {
    const copy = stampMarketOnBlogSerp(trimmedTitle, trimmedDescription, market)
    const titleLen = renderedTitleLength(copy.title)
    const descLen = copy.description.length
    if (titleLen > TITLE_MAX) {
      return `SERP title is ${titleLen} characters on ${market} (max ${TITLE_MAX} including “ | XLS Experts”).`
    }
    if (descLen < DESC_MIN || descLen > DESC_MAX) {
      return `SERP description is ${descLen} characters on ${market} (need ${DESC_MIN}–${DESC_MAX}).`
    }
  }
  return null
}

function assertBlogSerpBatch(): void {
  for (const market of MARKET_IDS) {
    for (const slug of Object.keys(BLOG_SERP_BY_SLUG)) {
      const copy = resolveBlogSerpCopy(slug, market)
      if (!copy) continue
      const titleLen = renderedTitleLength(copy.title)
      const descLen = copy.description.length
      if (titleLen > TITLE_MAX) {
        throw new Error(`blog SERP ${slug} ${market} title ${titleLen} > ${TITLE_MAX}`)
      }
      if (descLen < DESC_MIN || descLen > DESC_MAX) {
        throw new Error(
          `blog SERP ${slug} ${market} description ${descLen} not in ${DESC_MIN}-${DESC_MAX}`
        )
      }
    }
  }
}

assertBlogSerpBatch()
