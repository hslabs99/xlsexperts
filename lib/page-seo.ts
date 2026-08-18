/**
 * Page-level CMS content (H1, hero intro, meta) for service and solution landings.
 * Admin → CMS: edit drafts in Firebase, Publish writes data/page-seo.generated.ts.
 */

import { servicePages } from '@/lib/service-pages'
import { solutionPages } from '@/lib/solutions'
import { DEFAULT_MARKET, isMarketId, type MarketId } from '@/lib/market'

export type PageSeoKind = 'service' | 'solution'

/** Editable CMS fields for one landing page. */
export type PageSeoFields = {
  /** Visible hero H1 */
  h1: string
  /** Hero intro under the H1 (on-page body teaser, not meta description) */
  heroIntro: string
  /** Document <title> */
  metaTitle: string
  /** Meta description */
  metaDescription: string
  /** Meta keywords (comma-separated) */
  keywords: string
  /** Open Graph title — empty falls back to metaTitle */
  ogTitle: string
  /** Open Graph description — empty falls back to metaDescription */
  ogDescription: string
  /** Open Graph image path/URL — empty uses site default */
  ogImage: string
  /** Twitter title — empty falls back to og/meta title */
  twitterTitle: string
  /** Twitter description — empty falls back to og/meta description */
  twitterDescription: string
  /** Twitter image — empty falls back to ogImage / site default */
  twitterImage: string
  /** robots index */
  robotsIndex: boolean
  /** robots follow */
  robotsFollow: boolean
  /** Internal notes for SEO tech (not rendered publicly) */
  seoNotes: string
}

export type PageSeoCatalogItem = {
  path: string
  kind: PageSeoKind
  label: string
}

export type PageSeoBundle = Record<string, PageSeoFields>

/** NZ + International + UK page SEO maps. */
export type PageSeoMarkets = {
  nz: PageSeoBundle
  intl: PageSeoBundle
  uk: PageSeoBundle
}

export type PublishedPageSeoFile = {
  version: 2
  publishedAt: string
  markets: PageSeoMarkets
}

/**
 * Legacy v1 shape (pre market-split). Still readable for migration.
 * @deprecated Prefer PublishedPageSeoFile with markets.nz / markets.intl / markets.uk
 */
export type PublishedPageSeoFileV1 = {
  version?: 1
  publishedAt: string
  pages: PageSeoBundle
}

/** Built-in defaults captured from the live site at CMS introduction. */
const SERVICE_DEFAULTS: Record<string, Partial<PageSeoFields>> = {
  '/ai-workflow-and-business-process-automation': {
    h1: 'Automate the work that is keeping your staff from greatness.',
    heroIntro:
      'Every New Zealand business has processes that consume staff time, create errors and depend on someone remembering to do them — often inside fragile spreadsheets that have outgrown their original purpose. We identify those processes and improve or automate them with the right mix of Excel, VBA, Power Automate and AI — so your team focuses on work that actually needs human judgement.',
    metaTitle:
      'AI Workflow and Business Process Automation NZ | XLS Experts',
    metaDescription:
      'Business process automation and spreadsheet process modernisation for New Zealand businesses. Automate manual work with Excel, VBA, Power Automate and AI — or improve fragile spreadsheet workflows before they break.',
    ogTitle: 'AI Workflow and Business Process Automation NZ | XLS Experts',
    ogDescription:
      'Business process automation and spreadsheet modernisation for NZ businesses. Excel, VBA, Power Automate and AI — automate or improve your highest-value manual processes.',
  },
  '/excel-dashboard-development': {
    h1: 'Your data deserves a dashboard your team will actually use.',
    heroIntro:
      'Most NZ businesses already have the data they need to make better decisions. They just do not have a clear, consistent way to see it. We build custom Excel dashboards that transform raw data into actionable insight — without the cost or complexity of enterprise BI tools.',
    metaTitle: 'Excel Dashboard Development New Zealand | XLS Experts',
    metaDescription:
      'Custom Excel dashboard development for New Zealand businesses. Interactive, automated dashboards that give your leadership team clear visibility without the cost of enterprise BI tools.',
    ogTitle: 'Excel Dashboard Development New Zealand | XLS Experts',
    ogDescription:
      'Custom Excel dashboards for NZ businesses. Interactive, automated and formatted for decision-making — without the cost of enterprise BI tools.',
  },
  '/excel-financial-modelling': {
    h1: 'Financial models that hold up when it matters most.',
    heroIntro:
      'Whether you are raising capital, planning for growth or presenting to a board, the quality of your financial model matters. We build Excel financial models for New Zealand businesses to professional standards — structured, auditable and built to answer the hard questions.',
    metaTitle: 'Excel Financial Modelling Services New Zealand | XLS Experts',
    metaDescription:
      'Professional Excel financial modelling for New Zealand businesses. Three-statement models, budgets, forecasts, valuations and scenario analysis built to best practice standards.',
    ogTitle: 'Excel Financial Modelling Services New Zealand | XLS Experts',
    ogDescription:
      'Professional Excel financial modelling for NZ businesses. Three-statement models, forecasts, valuations and scenario analysis to best practice standards.',
  },
  '/excel-integrations': {
    h1: 'Connect Excel to your databases, APIs and business systems',
    heroIntro:
      'Your data lives in SQL Server, Simpro, Xero, Shopify and a dozen other systems. We connect Excel to all of them — live SQL refreshes, REST APIs and structured export workflows — so your team works in the tools they know, without manual CSV exports.',
    metaTitle: 'Excel Integrations (SQL, API, etc.) NZ | XLS Experts',
    metaDescription:
      'Connect Excel to SQL databases, REST APIs, cloud platforms and third-party software. VBA and Power Query integrations with live refresh, write-back and multi-user database-backed Excel apps for New Zealand businesses.',
    ogTitle: 'Excel Integrations (SQL, API, etc.) NZ | XLS Experts',
    ogDescription:
      'VBA and Power Query integrations connecting Excel to SQL databases, REST APIs, e-commerce platforms and legacy software. Multi-user database-backed Excel applications for New Zealand businesses.',
  },
  '/excel-spreadsheet-development': {
    h1: 'Custom Excel spreadsheets built to last — not just to work once.',
    heroIntro:
      'Most business spreadsheets are built under pressure and never properly engineered. We design and build custom Excel spreadsheets for New Zealand businesses that are structured, validated and maintainable — so they keep working as your business grows.',
    metaTitle:
      'Excel Spreadsheet Development Services New Zealand | XLS Experts',
    metaDescription:
      'Custom Excel spreadsheet development for New Zealand businesses. We design, build and optimise spreadsheets that replace manual processes, reduce errors and scale with your business.',
    ogTitle:
      'Excel Spreadsheet Development Services New Zealand | XLS Experts',
    ogDescription:
      'Custom Excel spreadsheet development for NZ businesses. Purpose-built spreadsheets that replace manual processes and scale with your business.',
  },
  '/excel-vba-macro-development': {
    h1: 'Stop doing manually what Excel can do automatically.',
    heroIntro:
      "Macros and VBA are the same capability in Excel — automated actions written in Excel's built-in programming language. In the right hands they turn repetitive, error-prone work into reliable one-click processes. We build macro and VBA solutions for New Zealand businesses that save time, reduce errors and run consistently without technical knowledge.",
    metaTitle: 'Excel VBA/Macro Development New Zealand | XLS Experts',
    metaDescription:
      'Excel VBA and macro development for New Zealand businesses. Custom macros and VBA applications that automate repetitive work, reduce errors and run reliably at the click of a button.',
    ogTitle: 'Excel VBA/Macro Development New Zealand | XLS Experts',
    ogDescription:
      'Custom Excel VBA and macro development for NZ businesses. Automate workflows, eliminate manual work and build reliable one-click processes.',
  },
  '/google-sheets-development': {
    h1: 'Google Sheets built to do more than store data.',
    heroIntro:
      "Google Sheets is more powerful than most businesses realise. With the right structure and Apps Script automation, it can replace expensive SaaS tools, automate workflows and connect your team's data in real time. We build custom Google Sheets solutions for New Zealand businesses on Google Workspace.",
    metaTitle: 'Google Sheets Development New Zealand | XLS Experts',
    metaDescription:
      'Custom Google Sheets development for New Zealand businesses. Apps Script automation, connected dashboards, form integrations and collaborative tools built by Google Sheets specialists.',
    ogTitle: 'Google Sheets Development New Zealand | XLS Experts',
    ogDescription:
      'Custom Google Sheets development for NZ businesses. Apps Script automation, connected dashboards and collaborative tools.',
  },
  '/power-query-consulting': {
    h1: 'Stop preparing data. Start analysing it.',
    heroIntro:
      'Most NZ businesses spend far too much time getting data ready and not enough time using it. Power Query is built into Excel and Power BI specifically to automate that preparation — connecting to your data sources, cleaning and transforming the data, and keeping your reports refreshed automatically.',
    metaTitle: 'Power Query Consulting New Zealand | XLS Experts',
    metaDescription:
      'Expert Power Query consulting for New Zealand businesses. We build automated data pipelines in Excel and Power BI that eliminate manual data preparation and keep your reports always current.',
    ogTitle: 'Power Query Consulting New Zealand | XLS Experts',
    ogDescription:
      'Expert Power Query consulting for NZ businesses. Automated data pipelines that eliminate manual data preparation.',
  },
  '/spreadsheet-auditing': {
    h1: 'Is the spreadsheet you rely on actually correct?',
    heroIntro:
      'Spreadsheet errors are more common — and more costly — than most businesses realise. We provide independent spreadsheet audits for New Zealand businesses, reviewing the models and workbooks that support critical decisions before those errors surface at the wrong moment.',
    metaTitle: 'Spreadsheet Auditing Services New Zealand | XLS Experts',
    metaDescription:
      'Professional spreadsheet auditing for New Zealand businesses. We independently review Excel models and spreadsheets for formula errors, structural issues and calculation risks before they cause problems.',
    ogTitle: 'Spreadsheet Auditing Services New Zealand | XLS Experts',
    ogDescription:
      'Independent spreadsheet auditing for NZ businesses. Find formula errors, structural risks and logic issues before they cause problems.',
  },
  '/vba-to-office-scripts-migration': {
    h1: 'VBA to Office Scripts Migration',
    heroIntro:
      'Moving Excel automation to the cloud is not a simple rewrite. Office Scripts have real limitations that catch organisations out — especially in SharePoint environments. We migrate VBA where it belongs in Microsoft 365, and help you modernise spreadsheet workflows so automations actually work.',
    metaTitle:
      'VBA to Office Scripts Migration | Excel Cloud Automation NZ — XLS Experts',
    metaDescription:
      'Migrate Excel VBA to Office Scripts for Microsoft 365 cloud automation. Modernise spreadsheet workflows with SharePoint, Power Automate and practical guidance on real Office Scripts limitations.',
    ogTitle:
      'VBA to Office Scripts Migration | Excel Cloud Automation NZ — XLS Experts',
    ogDescription:
      'Expert migration from Excel VBA to Office Scripts. Modernise spreadsheet automation for SharePoint, Power Automate and Microsoft 365 — with clear guidance on real limitations.',
  },
  '/web-applications': {
    h1: 'Web Applications',
    heroIntro:
      'Whether you are replacing spreadsheets, streamlining business operations, creating a customer portal, supporting field teams, or bringing a new software product to market, XLS Experts designs and builds modern web applications that work anywhere, on any device, for multiple users—with one live source of data, cloud hosting and architecture shaped around your actual requirements.',
    metaTitle:
      'Web Application Development NZ | Custom Business Apps | XLS Experts',
    metaDescription:
      'Custom web application development for New Zealand businesses. Build secure, multi-user cloud applications, customer portals, business systems and SaaS platforms.',
    ogTitle:
      'Web Application Development NZ | Custom Business Apps | XLS Experts',
    ogDescription:
      'Secure, multi-user cloud applications, customer portals, business systems and SaaS platforms—built with practical business-process understanding.',
  },
}

function emptyFields(): PageSeoFields {
  return {
    h1: '',
    heroIntro: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    robotsIndex: true,
    robotsFollow: true,
    seoNotes: '',
  }
}

function fieldsFromPartial(
  partial: Partial<PageSeoFields> | null | undefined
): PageSeoFields {
  const base = emptyFields()
  if (!partial || typeof partial !== 'object') return base
  return {
    h1: typeof partial.h1 === 'string' ? partial.h1 : base.h1,
    heroIntro:
      typeof partial.heroIntro === 'string' ? partial.heroIntro : base.heroIntro,
    metaTitle:
      typeof partial.metaTitle === 'string' ? partial.metaTitle : base.metaTitle,
    metaDescription:
      typeof partial.metaDescription === 'string'
        ? partial.metaDescription
        : base.metaDescription,
    keywords:
      typeof partial.keywords === 'string' ? partial.keywords : base.keywords,
    ogTitle: typeof partial.ogTitle === 'string' ? partial.ogTitle : base.ogTitle,
    ogDescription:
      typeof partial.ogDescription === 'string'
        ? partial.ogDescription
        : base.ogDescription,
    ogImage: typeof partial.ogImage === 'string' ? partial.ogImage : base.ogImage,
    twitterTitle:
      typeof partial.twitterTitle === 'string'
        ? partial.twitterTitle
        : base.twitterTitle,
    twitterDescription:
      typeof partial.twitterDescription === 'string'
        ? partial.twitterDescription
        : base.twitterDescription,
    twitterImage:
      typeof partial.twitterImage === 'string'
        ? partial.twitterImage
        : base.twitterImage,
    robotsIndex:
      typeof partial.robotsIndex === 'boolean'
        ? partial.robotsIndex
        : base.robotsIndex,
    robotsFollow:
      typeof partial.robotsFollow === 'boolean'
        ? partial.robotsFollow
        : base.robotsFollow,
    seoNotes:
      typeof partial.seoNotes === 'string' ? partial.seoNotes : base.seoNotes,
  }
}

/** Ordered catalog of pages manageable in Admin → CMS. */
export const PAGE_SEO_CATALOG: readonly PageSeoCatalogItem[] = [
  ...servicePages.map((p) => ({
    path: p.href,
    kind: 'service' as const,
    label: p.label,
  })),
  ...solutionPages.map((p) => ({
    path: p.href,
    kind: 'solution' as const,
    label: p.shortTitle || p.title,
  })),
]

export function catalogItemForPath(
  path: string
): PageSeoCatalogItem | undefined {
  const normalized = normalizePath(path)
  return PAGE_SEO_CATALOG.find((item) => item.path === normalized)
}

export function pagesForKind(kind: PageSeoKind): PageSeoCatalogItem[] {
  return PAGE_SEO_CATALOG.filter((item) => item.kind === kind)
}

export function normalizePath(path: string): string {
  const raw = path.trim()
  if (!raw) return ''
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`
  return withSlash.replace(/\/$/, '') || '/'
}

/** Default fields for a catalog path (code defaults before any CMS edit). */
export function defaultPageSeoForPath(path: string): PageSeoFields {
  const normalized = normalizePath(path)
  const item = catalogItemForPath(normalized)
  if (!item) return emptyFields()

  if (item.kind === 'service') {
    return fieldsFromPartial(SERVICE_DEFAULTS[normalized] ?? {
      h1: item.label,
      metaTitle: `${item.label} | XLS Experts`,
      metaDescription: '',
      ogTitle: `${item.label} | XLS Experts`,
    })
  }

  const solution = solutionPages.find((s) => s.href === normalized)
  if (!solution) {
    return fieldsFromPartial({
      h1: item.label,
      metaTitle: `${item.label} | XLS Experts`,
    })
  }

  return fieldsFromPartial({
    h1: solution.heroHeading,
    heroIntro: solution.heroIntroduction,
    metaTitle: solution.metaTitle,
    metaDescription: solution.metaDescription,
    ogTitle: `${solution.metaTitle} | XLS Experts`,
    ogDescription: solution.metaDescription,
  })
}

export function defaultPageSeoBundle(): PageSeoBundle {
  const pages: PageSeoBundle = {}
  for (const item of PAGE_SEO_CATALOG) {
    pages[item.path] = defaultPageSeoForPath(item.path)
  }
  return pages
}

/**
 * Turn NZ-flavoured default SEO into a Global starting point
 * (strip NZ/New Zealand wording so SEO can localise further).
 */
export function globalizePageSeoFields(fields: PageSeoFields): PageSeoFields {
  const scrub = (value: string) =>
    value
      .replace(/\bNew Zealand\b/gi, '')
      .replace(/\bNZ\b/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+\|\s+/g, ' | ')
      .replace(/\s+—\s+/g, ' — ')
      .replace(/\s+,/g, ',')
      .replace(/\s+\./g, '.')
      .trim()
      .replace(/^\|\s*/, '')
      .replace(/\s*\|$/, '')
      .trim()

  return {
    ...fields,
    h1: scrub(fields.h1) || fields.h1,
    heroIntro: scrub(fields.heroIntro) || fields.heroIntro,
    metaTitle: scrub(fields.metaTitle) || fields.metaTitle,
    metaDescription: scrub(fields.metaDescription) || fields.metaDescription,
    keywords: scrub(fields.keywords),
    ogTitle: scrub(fields.ogTitle) || fields.ogTitle,
    ogDescription: scrub(fields.ogDescription) || fields.ogDescription,
    twitterTitle: scrub(fields.twitterTitle),
    twitterDescription: scrub(fields.twitterDescription),
  }
}

export function defaultIntlPageSeoBundle(): PageSeoBundle {
  const pages: PageSeoBundle = {}
  for (const item of PAGE_SEO_CATALOG) {
    pages[item.path] = globalizePageSeoFields(defaultPageSeoForPath(item.path))
  }
  return pages
}

export function defaultUkPageSeoBundle(): PageSeoBundle {
  return defaultIntlPageSeoBundle()
}

export function defaultPageSeoMarkets(): PageSeoMarkets {
  return {
    nz: defaultPageSeoBundle(),
    intl: defaultIntlPageSeoBundle(),
    uk: defaultUkPageSeoBundle(),
  }
}

export function clonePageSeoBundle(source: PageSeoBundle): PageSeoBundle {
  return JSON.parse(JSON.stringify(source)) as PageSeoBundle
}

export function pickPageSeoBundle(
  markets: PageSeoMarkets,
  market: MarketId
): PageSeoBundle {
  const id = isMarketId(market) ? market : DEFAULT_MARKET
  return markets[id] ?? markets.nz
}

/** Merge a partial overlay onto defaults (overlay wins for set string fields). */
export function mergePageSeo(
  base: PageSeoFields,
  overlay: Partial<PageSeoFields> | null | undefined
): PageSeoFields {
  if (!overlay) return base
  const next = fieldsFromPartial(overlay)
  // Prefer overlay when non-empty string; always take booleans from overlay parse
  return {
    h1: next.h1 || base.h1,
    heroIntro: next.heroIntro || base.heroIntro,
    metaTitle: next.metaTitle || base.metaTitle,
    metaDescription: next.metaDescription || base.metaDescription,
    keywords: typeof overlay.keywords === 'string' ? next.keywords : base.keywords,
    ogTitle: next.ogTitle || base.ogTitle,
    ogDescription: next.ogDescription || base.ogDescription,
    ogImage: typeof overlay.ogImage === 'string' ? next.ogImage : base.ogImage,
    twitterTitle:
      typeof overlay.twitterTitle === 'string'
        ? next.twitterTitle
        : base.twitterTitle,
    twitterDescription:
      typeof overlay.twitterDescription === 'string'
        ? next.twitterDescription
        : base.twitterDescription,
    twitterImage:
      typeof overlay.twitterImage === 'string'
        ? next.twitterImage
        : base.twitterImage,
    robotsIndex:
      typeof overlay.robotsIndex === 'boolean'
        ? next.robotsIndex
        : base.robotsIndex,
    robotsFollow:
      typeof overlay.robotsFollow === 'boolean'
        ? next.robotsFollow
        : base.robotsFollow,
    seoNotes:
      typeof overlay.seoNotes === 'string' ? next.seoNotes : base.seoNotes,
  }
}

/**
 * Normalize an admin/Firestore payload into a full catalog-shaped bundle.
 * Always includes every catalog path (fills gaps from code defaults).
 * @param market - which default set to use for missing paths
 */
export function normalizePageSeoBundle(
  raw: unknown,
  market: MarketId = 'nz'
): PageSeoBundle {
  const incoming: Record<string, unknown> =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : Array.isArray(raw)
        ? Object.fromEntries(
            (raw as { path?: string }[])
              .filter((row) => row && typeof row.path === 'string')
              .map((row) => [normalizePath(row.path as string), row])
          )
        : {}

  // Support { pages: { ... } } wrapper
  const pagesRaw =
    incoming.pages && typeof incoming.pages === 'object'
      ? (incoming.pages as Record<string, unknown>)
      : incoming

  const defaultsRoot =
    market === 'nz'
      ? defaultPageSeoBundle()
      : market === 'uk'
        ? defaultUkPageSeoBundle()
        : defaultIntlPageSeoBundle()

  const pages: PageSeoBundle = {}
  for (const item of PAGE_SEO_CATALOG) {
    const fromStore = pagesRaw[item.path]
    const defaults = defaultsRoot[item.path] ?? defaultPageSeoForPath(item.path)
    if (fromStore && typeof fromStore === 'object') {
      pages[item.path] = mergePageSeo(
        defaults,
        fromStore as Partial<PageSeoFields>
      )
    } else {
      pages[item.path] = defaults
    }
  }
  return pages
}

/**
 * Normalize a full NZ + International + UK markets payload.
 * Accepts:
 * - { markets: { nz, intl, uk } }
 * - { nz, intl, uk }
 * - legacy { pages } → treated as NZ; intl/uk start from globalized NZ overlay
 * Missing `uk` is seeded from International (UK used to share that market).
 */
export function normalizePageSeoMarkets(raw: unknown): PageSeoMarkets {
  const defaults = defaultPageSeoMarkets()
  if (!raw || typeof raw !== 'object') return defaults

  const data = raw as Record<string, unknown>
  const marketsSrc =
    data.markets && typeof data.markets === 'object'
      ? (data.markets as Record<string, unknown>)
      : data

  // v2/v3 shape
  if (marketsSrc.nz != null || marketsSrc.intl != null || marketsSrc.uk != null) {
    const nz = normalizePageSeoBundle(marketsSrc.nz ?? defaults.nz, 'nz')
    const intl = normalizePageSeoBundle(
      marketsSrc.intl ?? defaults.intl,
      'intl'
    )
    const ukSource = marketsSrc.uk ?? marketsSrc.intl ?? intl
    return {
      nz,
      intl,
      uk: normalizePageSeoBundle(ukSource, 'uk'),
    }
  }

  // v1 flat pages → NZ only; seed Global and UK from globalized NZ
  if (data.pages != null || looksLikePageMap(data)) {
    const nz = normalizePageSeoBundle(data.pages ?? data, 'nz')
    const intlBase: PageSeoBundle = {}
    for (const path of Object.keys(nz)) {
      intlBase[path] = globalizePageSeoFields(nz[path])
    }
    const intl = normalizePageSeoBundle(intlBase, 'intl')
    return {
      nz,
      intl,
      uk: normalizePageSeoBundle(intlBase, 'uk'),
    }
  }

  return defaults
}

function looksLikePageMap(data: Record<string, unknown>): boolean {
  // Heuristic: at least one key looks like a site path with field-shaped object
  for (const [key, value] of Object.entries(data)) {
    if (
      key.startsWith('/') &&
      value &&
      typeof value === 'object' &&
      'h1' in (value as object)
    ) {
      return true
    }
  }
  return false
}

/** Effective public SEO: code defaults merged with published/edited fields. */
export function resolvePageSeo(
  path: string,
  published: PageSeoBundle | null | undefined,
  market: MarketId = 'nz'
): PageSeoFields {
  const normalized = normalizePath(path)
  const defaults =
    market === 'nz'
      ? defaultPageSeoForPath(normalized)
      : market === 'uk'
        ? defaultUkPageSeoBundle()[normalized] ??
          globalizePageSeoFields(defaultPageSeoForPath(normalized))
        : defaultIntlPageSeoBundle()[normalized] ??
          globalizePageSeoFields(defaultPageSeoForPath(normalized))
  const overlay = published?.[normalized]
  return mergePageSeo(defaults, overlay)
}

/** Resolved keywords list for Next Metadata.keywords */
export function keywordsList(keywords: string): string[] | undefined {
  const list = keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
  return list.length > 0 ? list : undefined
}
