/**
 * SEO crawl documents editable from the Marketing admin tab.
 * Stored in Firestore Site Content / crawl-documents.
 */

export const SITE_BASE_URL = 'https://www.xlsexperts.co.nz'

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

export const DEFAULT_ROBOTS_TXT = `User-agent: *
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

Sitemap: ${SITE_BASE_URL}/sitemap.xml
`

export const DEFAULT_LLMS_TXT = `# XLS Experts — Excel & Spreadsheet Consulting, New Zealand

XLS Experts is New Zealand's leading Excel and spreadsheet consulting firm. We design and build custom Excel tools, VBA automation, dashboards, financial models, and workflow automation solutions for businesses across New Zealand.

## What we do

- **Excel VBA Automation**: Custom macros and applications that automate repetitive manual processes, eliminating copy-paste workflows and reducing errors.
- **Dashboard Development**: Interactive Excel dashboards connected to live data sources including ERP systems, SQL databases, accounting platforms, and cloud APIs.
- **Financial Modelling**: Budget vs actual reporting, cash flow forecasting, scenario analysis, and management reporting tools for finance teams.
- **Power Query Solutions**: Data import, transformation, and connection management from any source — ERP exports, SQL databases, APIs, CSV files.
- **Enterprise Excel Applications**: Governance-grade solutions for large organisations including pricing tools, forecasting models, project controls, and reporting automation.
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

- Homepage: ${SITE_BASE_URL}
- Enterprise Excel VBA Development: ${SITE_BASE_URL}/enterprise-excel-vba-development
- Blog: ${SITE_BASE_URL}/blog

## Contact

Website: ${SITE_BASE_URL}
Location: Auckland, New Zealand (serving all of NZ)
`

export const DEFAULT_CRAWL_DOCS: CrawlDocsContent = {
  robotsOverride: false,
  robotsContent: DEFAULT_ROBOTS_TXT,
  llmsOverride: false,
  llmsContent: DEFAULT_LLMS_TXT,
  sitemapExtraUrls: [],
  verificationFiles: [],
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

function normalizeLoc(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${SITE_BASE_URL}${path}`
}

function normalizeVerificationPath(raw: string): string {
  return raw
    .trim()
    .replace(/^\/+/, '')
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .pop() ?? ''
}

export function normalizeCrawlDocs(raw: unknown): CrawlDocsContent {
  const data =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  const sitemapExtraUrls: SitemapExtraUrl[] = Array.isArray(
    data.sitemapExtraUrls
  )
    ? data.sitemapExtraUrls
        .map((entry) => {
          if (typeof entry === 'string') {
            const loc = normalizeLoc(entry)
            return loc ? { loc } : null
          }
          if (!entry || typeof entry !== 'object') return null
          const row = entry as Record<string, unknown>
          const loc = normalizeLoc(String(row.loc ?? ''))
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
        : DEFAULT_ROBOTS_TXT,
    llmsOverride: Boolean(data.llmsOverride),
    llmsContent:
      typeof data.llmsContent === 'string' && data.llmsContent.length > 0
        ? data.llmsContent
        : DEFAULT_LLMS_TXT,
    sitemapExtraUrls,
    verificationFiles,
  }
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

/** Effective robots.txt body for public serving. */
export function resolveRobotsTxt(docs: CrawlDocsContent): string {
  if (docs.robotsOverride && docs.robotsContent.trim()) {
    return docs.robotsContent.replace(/\r\n/g, '\n')
  }
  return DEFAULT_ROBOTS_TXT
}

/** Effective llms.txt body for public serving. */
export function resolveLlmsTxt(docs: CrawlDocsContent): string {
  if (docs.llmsOverride && docs.llmsContent.trim()) {
    return docs.llmsContent.replace(/\r\n/g, '\n')
  }
  return DEFAULT_LLMS_TXT
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
export function parseSitemapUrlLines(text: string): SitemapExtraUrl[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const loc = normalizeLoc(line)
      return loc ? { loc } : null
    })
    .filter((e): e is SitemapExtraUrl => Boolean(e))
}

export function formatSitemapUrlLines(urls: SitemapExtraUrl[]): string {
  return urls.map((u) => u.loc).join('\n')
}
