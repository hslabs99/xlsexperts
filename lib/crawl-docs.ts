/**
 * SEO crawl documents editable from the Marketing admin tab.
 * Stored in Firestore Site Content / crawl-documents — one set per market
 * so NZ and International SEO campaigns never share sitemap/robots/llms data.
 */

import {
  DEFAULT_MARKET,
  MARKET_IDS,
  isMarketId,
  type MarketId,
} from '@/lib/market'

export const NZ_SITE_ORIGIN = 'https://www.xlsexperts.co.nz'
export const INTL_SITE_ORIGIN = 'https://www.xlsexperts.com'

/** @deprecated Use marketSiteOrigin() / getSiteOrigin() — NZ only. */
export const SITE_BASE_URL = NZ_SITE_ORIGIN

export function siteOriginForMarket(market: MarketId): string {
  return market === 'intl' ? INTL_SITE_ORIGIN : NZ_SITE_ORIGIN
}

export type SitemapChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

export interface SitemapExtraUrl {
  /** Absolute URL or site-relative path (e.g. /custom-landing). */
  loc: string
  lastModified?: string
  changeFrequency?: SitemapChangeFrequency
  priority?: number
}

export interface VerificationFile {
  /** Root-relative filename only, e.g. googleabc123.html or BingSiteAuth.xml */
  path: string
  content: string
  enabled: boolean
}

export interface CrawlDocsContent {
  /**
   * When true, public /robots.txt serves robotsContent instead of the
   * built-in default.
   */
  robotsOverride: boolean
  robotsContent: string
  /**
   * When true, public /llms.txt serves llmsContent instead of the
   * built-in default.
   */
  llmsOverride: boolean
  llmsContent: string
  /** Extra URLs merged into the auto-generated sitemap.xml */
  sitemapExtraUrls: SitemapExtraUrl[]
  /** Root HTML/XML verification files for Search Console etc. */
  verificationFiles: VerificationFile[]
}

export type CrawlDocsBundle = Record<MarketId, CrawlDocsContent>

export function defaultRobotsTxt(origin: string): string {
  return `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: YouBot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${origin}/sitemap.xml
`
}

export function defaultLlmsTxt(market: MarketId, origin: string): string {
  if (market === 'intl') {
    return `# XLS Experts — Excel & Spreadsheet Consulting

XLS Experts is a business systems consultancy serving clients internationally. We design and build practical systems that may combine Excel, Microsoft 365, cloud applications, databases and integrations — helping organisations improve, automate or replace spreadsheet-driven processes.

## What we do

- **Business systems solutions**: Dashboards & BI, resource planning, financial modelling, property development applications, asset maintenance operations, quoting systems, field apps, client/staff portals, and workflow automation — see ${origin}/solutions
- **Excel VBA Automation**: Custom macros and applications that automate repetitive manual processes, eliminating copy-paste workflows and reducing errors.
- **Business process automation**: Spreadsheet process modernisation, Power Automate workflows and A.I.-assisted process automation — see ${origin}/ai-workflow-and-business-process-automation
- **Dashboard Development**: Interactive Excel dashboards connected to live data sources including ERP systems, SQL databases, accounting platforms, and cloud APIs.
- **Financial Modelling**: Budget vs actual reporting, cash flow forecasting, scenario analysis, and management reporting tools for finance teams.
- **Power Query Solutions**: Data import, transformation, and connection management from any source — ERP exports, SQL databases, APIs, CSV files.
- **SQL Database Connectivity**: Connecting Excel directly to SQL Server, MySQL, PostgreSQL, Oracle, and cloud databases to eliminate manual exports.
- **ERP Integration**: Building the analytical layer on top of SAP, Oracle, Microsoft Dynamics, MYOB Acumatica, Epicor, and other ERP platforms.

## Who we work with

We work with businesses and organisations across industries internationally, including finance, insurance, energy, construction, retail, healthcare, logistics, hospitality, not-for-profit, government, and professional services.

## Key pages

- Homepage: ${origin}
- Solutions: ${origin}/solutions
- Excel in Enterprise Operational Applications: ${origin}/enterprise
- A.I. Use Cases for Excel, VBA and Power Query: ${origin}/use-cases
- Web Applications: ${origin}/web-applications
- Blog: ${origin}/blog

## Contact

Website: ${origin}
`
  }

  return `# XLS Experts — Excel & Spreadsheet Consulting, New Zealand

XLS Experts is a New Zealand business systems consultancy. We design and build practical systems that may combine Excel, Microsoft 365, cloud applications, databases and integrations — helping organisations improve, automate or replace spreadsheet-driven processes.

## What we do

- **Business systems solutions**: Dashboards & BI, resource planning, financial modelling, property development applications, asset maintenance operations, quoting systems, field apps, client/staff portals, and workflow automation — see ${origin}/solutions
- **Excel VBA Automation**: Custom macros and applications that automate repetitive manual processes, eliminating copy-paste workflows and reducing errors.
- **Business process automation**: Spreadsheet process modernisation, Power Automate workflows and A.I.-assisted process automation — see ${origin}/ai-workflow-and-business-process-automation
- **Dashboard Development**: Interactive Excel dashboards connected to live data sources including ERP systems, SQL databases, accounting platforms, and cloud APIs.
- **Financial Modelling**: Budget vs actual reporting, cash flow forecasting, scenario analysis, and management reporting tools for finance teams.
- **Power Query Solutions**: Data import, transformation, and connection management from any source — ERP exports, SQL databases, APIs, CSV files.
- **SQL Database Connectivity**: Connecting Excel directly to SQL Server, MySQL, PostgreSQL, Oracle, and cloud databases to eliminate manual exports.
- **ERP Integration**: Building the analytical layer on top of SAP, Oracle, Microsoft Dynamics, MYOB Acumatica, Epicor, and other NZ ERP platforms.

## Who we work with

We work with businesses and organisations across all industries in New Zealand, including:

- Financial services (banks, insurance, wealth management)
- Energy and utilities (including Contact Energy and other major NZ energy companies)
- Construction and infrastructure
- Retail and distribution (including Max Fashion and other NZ retailers)
- Healthcare and aged care
- Logistics and supply chain
- Hospitality and accommodation (including Pullman Hotel Auckland)
- Not-for-profit organisations and charities
- Government and public sector
- Professional services

## Our clients include

AMP Financial Services, NZI Insurance, Contact Energy, Pullman Hotel Auckland, Max Fashion, OCS Group, UKWSL, SIMPRO, and many other New Zealand businesses.

## Frequently asked questions

**What does an Excel consultant do?**
An Excel consultant designs and builds custom spreadsheet solutions including VBA automation, dashboards, financial models, and data pipelines. They help businesses replace manual processes with reliable, automated tools.

**How much does Excel consulting cost in New Zealand?**
Projects typically start from $1,000 NZD for small automation tasks. Most projects fall in the $2,000–$10,000 range depending on complexity. XLS Experts provides a clear scope and fixed price before starting any work.

**Can Excel connect to SQL databases?**
Yes. Excel can connect directly to SQL Server, MySQL, PostgreSQL, Oracle, and other databases using Power Query or VBA with ADO, eliminating manual exports and keeping reports up to date automatically.

**Do you work with businesses outside Auckland?**
Yes. XLS Experts works with businesses across all of New Zealand including Wellington, Christchurch, Hamilton, Tauranga, and other regions. Most project work is delivered remotely.

**What is the difference between Power BI and Excel?**
Excel is better for interactive analysis, financial modelling, and operational tools where users manipulate data. Power BI is better for read-only dashboards shared with large audiences. Most NZ businesses benefit from using both together.

**What is VBA automation?**
VBA (Visual Basic for Applications) is Excel's built-in programming language. VBA automation replaces manual repetitive tasks — importing data, generating reports, formatting outputs, distributing results — with code that runs automatically.

## Key pages

- Homepage: ${origin}
- Solutions: ${origin}/solutions
- Excel in Enterprise Operational Applications: ${origin}/enterprise
- A.I. Use Cases for Excel, VBA and Power Query: ${origin}/use-cases
- Web Applications: ${origin}/web-applications
- Blog: ${origin}/blog

## Contact

Website: ${origin}
Location: Auckland, New Zealand (serving all of NZ)
`
}

/** NZ defaults — kept for callers that still import the old constants. */
export const DEFAULT_ROBOTS_TXT = defaultRobotsTxt(NZ_SITE_ORIGIN)
export const DEFAULT_LLMS_TXT = defaultLlmsTxt('nz', NZ_SITE_ORIGIN)

export function defaultCrawlDocs(market: MarketId = DEFAULT_MARKET): CrawlDocsContent {
  const origin = siteOriginForMarket(market)
  return {
    robotsOverride: false,
    robotsContent: defaultRobotsTxt(origin),
    llmsOverride: false,
    llmsContent: defaultLlmsTxt(market, origin),
    sitemapExtraUrls: [],
    verificationFiles: [],
  }
}

export const DEFAULT_CRAWL_DOCS: CrawlDocsContent = defaultCrawlDocs('nz')

export function defaultCrawlDocsBundle(): CrawlDocsBundle {
  return {
    nz: defaultCrawlDocs('nz'),
    intl: defaultCrawlDocs('intl'),
  }
}

const CHANGE_FREQS = new Set<SitemapChangeFrequency>([
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
])

/** Reserved root filenames that have dedicated handlers. */
export const RESERVED_CRAWL_PATHS = new Set([
  'robots.txt',
  'llms.txt',
  'sitemap.xml',
])

function normalizeLoc(raw: string, origin: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${origin}${path}`
}

function normalizeVerificationPath(raw: string): string {
  return (
    raw
      .trim()
      .replace(/^\/+/, '')
      .replace(/\\/g, '/')
      .split('/')
      .filter(Boolean)
      .pop() ?? ''
  )
}

export function normalizeCrawlDocs(
  raw: unknown,
  market: MarketId = DEFAULT_MARKET
): CrawlDocsContent {
  const origin = siteOriginForMarket(market)
  const defaults = defaultCrawlDocs(market)
  const data =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  const sitemapExtraUrls: SitemapExtraUrl[] = Array.isArray(
    data.sitemapExtraUrls
  )
    ? data.sitemapExtraUrls
        .map((entry) => {
          if (typeof entry === 'string') {
            const loc = normalizeLoc(entry, origin)
            return loc ? { loc } : null
          }
          if (!entry || typeof entry !== 'object') return null
          const row = entry as Record<string, unknown>
          const loc = normalizeLoc(String(row.loc ?? ''), origin)
          if (!loc) return null
          const freq = String(row.changeFrequency ?? '') as SitemapChangeFrequency
          const priorityRaw = row.priority
          const priority =
            typeof priorityRaw === 'number' &&
            Number.isFinite(priorityRaw) &&
            priorityRaw >= 0 &&
            priorityRaw <= 1
              ? priorityRaw
              : undefined
          const lastModified =
            typeof row.lastModified === 'string' && row.lastModified.trim()
              ? row.lastModified.trim()
              : undefined
          return {
            loc,
            ...(lastModified ? { lastModified } : {}),
            ...(CHANGE_FREQS.has(freq) ? { changeFrequency: freq } : {}),
            ...(priority !== undefined ? { priority } : {}),
          }
        })
        .filter((e): e is SitemapExtraUrl => Boolean(e))
    : []

  const verificationFiles: VerificationFile[] = Array.isArray(
    data.verificationFiles
  )
    ? data.verificationFiles
        .map((entry) => {
          if (!entry || typeof entry !== 'object') return null
          const row = entry as Record<string, unknown>
          const path = normalizeVerificationPath(String(row.path ?? ''))
          if (!path) return null
          return {
            path,
            content: String(row.content ?? ''),
            enabled: Boolean(row.enabled),
          }
        })
        .filter((e): e is VerificationFile => Boolean(e))
    : []

  return {
    robotsOverride: Boolean(data.robotsOverride),
    robotsContent:
      typeof data.robotsContent === 'string' && data.robotsContent.length > 0
        ? data.robotsContent
        : defaults.robotsContent,
    llmsOverride: Boolean(data.llmsOverride),
    llmsContent:
      typeof data.llmsContent === 'string' && data.llmsContent.length > 0
        ? data.llmsContent
        : defaults.llmsContent,
    sitemapExtraUrls,
    verificationFiles,
  }
}

/**
 * Accepts `{ markets: { nz, intl } }` or a legacy flat crawl-documents doc
 * (mapped to NZ; intl starts from international defaults).
 */
export function normalizeCrawlDocsBundle(raw: unknown): CrawlDocsBundle {
  const bundle = defaultCrawlDocsBundle()
  if (!raw || typeof raw !== 'object') return bundle

  const data = raw as Record<string, unknown>
  const markets =
    data.markets && typeof data.markets === 'object'
      ? (data.markets as Record<string, unknown>)
      : null

  if (markets) {
    for (const id of MARKET_IDS) {
      if (markets[id] != null) {
        bundle[id] = normalizeCrawlDocs(markets[id], id)
      }
    }
    return bundle
  }

  if (
    'robotsOverride' in data ||
    'robotsContent' in data ||
    'llmsOverride' in data ||
    'llmsContent' in data ||
    'sitemapExtraUrls' in data ||
    'verificationFiles' in data
  ) {
    bundle.nz = normalizeCrawlDocs(data, 'nz')
  }

  return bundle
}

export function pickCrawlDocs(
  bundle: CrawlDocsBundle,
  market: MarketId | string | null | undefined
): CrawlDocsContent {
  const id = isMarketId(market) ? market : DEFAULT_MARKET
  return normalizeCrawlDocs(bundle[id] ?? bundle[DEFAULT_MARKET], id)
}

export function validateCrawlDocs(docs: CrawlDocsContent): string | null {
  if (docs.robotsOverride && !docs.robotsContent.trim()) {
    return 'Custom robots.txt is enabled but empty.'
  }
  if (docs.llmsOverride && !docs.llmsContent.trim()) {
    return 'Custom llms.txt is enabled but empty.'
  }

  const seenPaths = new Set<string>()
  for (const file of docs.verificationFiles) {
    const path = file.path.trim()
    if (!path) return 'Each verification file needs a filename.'
    if (path.includes('/') || path.includes('\\')) {
      return `Verification filename must be a single root file (no folders): ${path}`
    }
    if (RESERVED_CRAWL_PATHS.has(path.toLowerCase())) {
      return `"${path}" is reserved — edit it in the robots/llms/sitemap sections instead.`
    }
    if (!/\.(html?|xml|txt)$/i.test(path)) {
      return `Verification file "${path}" must end in .html, .htm, .xml, or .txt.`
    }
    const key = path.toLowerCase()
    if (seenPaths.has(key)) {
      return `Duplicate verification filename: ${path}`
    }
    seenPaths.add(key)
    if (file.enabled && !file.content.trim()) {
      return `Verification file "${path}" is enabled but has no content.`
    }
  }

  for (const entry of docs.sitemapExtraUrls) {
    try {
      new URL(entry.loc)
    } catch {
      return `Invalid sitemap URL: ${entry.loc}`
    }
  }

  return null
}

export function validateCrawlDocsBundle(bundle: CrawlDocsBundle): string | null {
  for (const id of MARKET_IDS) {
    const err = validateCrawlDocs(bundle[id])
    if (err) return `${id === 'nz' ? 'New Zealand' : 'International'}: ${err}`
  }
  return null
}

/** Effective robots.txt body for public serving. */
export function resolveRobotsTxt(
  docs: CrawlDocsContent,
  market: MarketId = DEFAULT_MARKET
): string {
  if (docs.robotsOverride && docs.robotsContent.trim()) {
    return docs.robotsContent.replace(/\r\n/g, '\n')
  }
  return defaultRobotsTxt(siteOriginForMarket(market))
}

/** Effective llms.txt body for public serving. */
export function resolveLlmsTxt(
  docs: CrawlDocsContent,
  market: MarketId = DEFAULT_MARKET
): string {
  if (docs.llmsOverride && docs.llmsContent.trim()) {
    return docs.llmsContent.replace(/\r\n/g, '\n')
  }
  return defaultLlmsTxt(market, siteOriginForMarket(market))
}

export function findVerificationFile(
  docs: CrawlDocsContent,
  filename: string
): VerificationFile | null {
  const needle = filename.replace(/^\/+/, '').toLowerCase()
  if (!needle || RESERVED_CRAWL_PATHS.has(needle)) return null
  return (
    docs.verificationFiles.find(
      (f) => f.enabled && f.path.toLowerCase() === needle
    ) ?? null
  )
}

export function contentTypeForCrawlPath(path: string): string {
  const lower = path.toLowerCase()
  if (lower.endsWith('.xml')) return 'application/xml; charset=utf-8'
  if (lower.endsWith('.html') || lower.endsWith('.htm')) {
    return 'text/html; charset=utf-8'
  }
  return 'text/plain; charset=utf-8'
}

/**
 * Parse a multiline paste of sitemap URLs into structured extras
 * (one absolute URL or path per line; blank lines ignored).
 */
export function parseSitemapUrlLines(
  text: string,
  market: MarketId = DEFAULT_MARKET
): SitemapExtraUrl[] {
  const origin = siteOriginForMarket(market)
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const loc = normalizeLoc(line, origin)
      return loc ? { loc } : null
    })
    .filter((e): e is SitemapExtraUrl => Boolean(e))
}

export function formatSitemapUrlLines(urls: SitemapExtraUrl[]): string {
  return urls.map((u) => u.loc).join('\n')
}
