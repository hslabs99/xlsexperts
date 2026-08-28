/**
 * Three-market copy dictionary (NZ, International, UK).
 * Public pages read the published static file — never Firestore.
 */

import type { MarketId } from '@/lib/market'

export type MarketCopy = {
  site: {
    origin: string
    htmlLang: string
    ogLocale: string
    defaultTitle: string
    defaultDescription: string
    keywords: string
    ogTitle: string
    ogDescription: string
    ogImageAlt: string
    twitterTitle: string
    twitterDescription: string
  }
  contact: {
    heading: string
    phoneDisplay: string
    phoneTel: string
    whatsapp: string
    whatsappLabel: string
    locationLine: string
    locationBadge: string
    emailPlaceholder: string
    phonePlaceholder: string
  }
  home: {
    metaTitle: string
    metaDescription: string
    schemaDescription: string
    schemaAreaServed: string
    schemaAddressCountry: string
    schemaAddressLocality: string
    faqCostQuestion: string
    faqCostAnswer: string
    faqIndustriesAnswer: string
    faqOutsideQuestion: string
    faqOutsideAnswer: string
  }
  hero: {
    line1: string
    line2: string
    badgeSpecialists: string
    badgeEnterprise: string
    badgeAi: string
    /** Optional href for badge 1 (service/solution path). Empty = no link. */
    badgeSpecialistsHref: string
    /** Optional href for badge 2. Empty = no link. */
    badgeEnterpriseHref: string
    /** Optional href for badge 3. Empty = no link. */
    badgeAiHref: string
    trustBased: string
    statValue: string
    statLabel: string
  }
  about: {
    intro: string
    pillarBasedTitle: string
    pillarBasedBody: string
    pillarSmeBody: string
    /** Link text for this region's site in Our brands (Contact Us / About). */
    brandLabel: string
  }
  caseStudies: {
    homeIntro: string
  }
}

/** Admin field metadata — flat list for the International CRUD table. */
export type MarketCopyFieldMeta = {
  path: string
  label: string
  group: string
  multiline?: boolean
  hint?: string
  /** Hide NZ → Intl / NZ → UK; each column is this region's own value. */
  independentPerMarket?: boolean
}

export const MARKET_COPY_FIELDS: MarketCopyFieldMeta[] = [
  { path: 'site.htmlLang', label: 'HTML lang', group: 'Site' },
  { path: 'site.ogLocale', label: 'Open Graph locale', group: 'Site' },
  { path: 'site.defaultTitle', label: 'Default document title', group: 'Site' },
  {
    path: 'site.defaultDescription',
    label: 'Default meta description',
    group: 'Site',
    multiline: true,
  },
  {
    path: 'site.keywords',
    label: 'Meta keywords (comma-separated)',
    group: 'Site',
    multiline: true,
  },
  { path: 'site.ogTitle', label: 'Open Graph title', group: 'Site' },
  {
    path: 'site.ogDescription',
    label: 'Open Graph description',
    group: 'Site',
    multiline: true,
  },
  { path: 'site.ogImageAlt', label: 'Open Graph image alt', group: 'Site' },
  { path: 'site.twitterTitle', label: 'Twitter title', group: 'Site' },
  {
    path: 'site.twitterDescription',
    label: 'Twitter description',
    group: 'Site',
    multiline: true,
  },

  { path: 'home.metaTitle', label: 'Homepage title', group: 'Homepage SEO' },
  {
    path: 'home.metaDescription',
    label: 'Homepage description',
    group: 'Homepage SEO',
    multiline: true,
  },
  {
    path: 'home.schemaDescription',
    label: 'Schema.org description',
    group: 'Homepage SEO',
    multiline: true,
  },
  { path: 'home.schemaAreaServed', label: 'Schema areaServed', group: 'Homepage SEO' },
  {
    path: 'home.schemaAddressCountry',
    label: 'Schema addressCountry',
    group: 'Homepage SEO',
  },
  {
    path: 'home.schemaAddressLocality',
    label: 'Schema addressLocality',
    group: 'Homepage SEO',
  },
  { path: 'home.faqCostQuestion', label: 'FAQ: cost question', group: 'Homepage FAQ' },
  {
    path: 'home.faqCostAnswer',
    label: 'FAQ: cost answer',
    group: 'Homepage FAQ',
    multiline: true,
  },
  {
    path: 'home.faqIndustriesAnswer',
    label: 'FAQ: industries answer',
    group: 'Homepage FAQ',
    multiline: true,
  },
  {
    path: 'home.faqOutsideQuestion',
    label: 'FAQ: outside / coverage question',
    group: 'Homepage FAQ',
  },
  {
    path: 'home.faqOutsideAnswer',
    label: 'FAQ: outside / coverage answer',
    group: 'Homepage FAQ',
    multiline: true,
  },

  { path: 'hero.line1', label: 'Hero line 1 (e.g. NEW ZEALAND)', group: 'Hero' },
  { path: 'hero.line2', label: 'Hero line 2 (e.g. BUSINESS AUTOMATION SPECIALISTS)', group: 'Hero' },
  // Badge label + link are edited in the dedicated Homepage hero badges panel
  { path: 'hero.trustBased', label: 'Trust point (based)', group: 'Hero' },
  { path: 'hero.statValue', label: 'Stat value (e.g. 100% NZ)', group: 'Hero' },
  { path: 'hero.statLabel', label: 'Stat label', group: 'Hero' },

  {
    path: 'about.intro',
    label: 'About intro paragraph',
    group: 'About',
    multiline: true,
  },
  { path: 'about.pillarBasedTitle', label: 'Based pillar title', group: 'About' },
  {
    path: 'about.pillarBasedBody',
    label: 'Based pillar body',
    group: 'About',
    multiline: true,
  },
  {
    path: 'about.pillarSmeBody',
    label: 'SMEs pillar body',
    group: 'About',
    multiline: true,
  },
  {
    path: 'about.brandLabel',
    label: 'Brand link label',
    group: 'About',
    hint: "Name for this region's site on Contact Us and About. All three regions are listed on every site.",
    independentPerMarket: true,
  },

  {
    path: 'caseStudies.homeIntro',
    label: 'Homepage case studies intro',
    group: 'Case studies',
    multiline: true,
  },
]

export const DEFAULT_NZ_MARKET_COPY: MarketCopy = {
  site: {
    origin: 'https://www.xlsexperts.co.nz',
    htmlLang: 'en-NZ',
    ogLocale: 'en_NZ',
    defaultTitle: 'Excel & Spreadsheet Consulting NZ | XLS Experts',
    defaultDescription:
      "XLS Experts are New Zealand's leading Excel and spreadsheet consultants. We build models, automate data, and create dashboards that transform how your business works.",
    keywords:
      'Excel consultant New Zealand, Excel VBA developer NZ, spreadsheet automation New Zealand, Excel dashboard NZ, Excel financial modelling NZ, Power Query NZ, business process automation New Zealand, Excel expert Auckland',
    ogTitle: 'Excel & Spreadsheet Consulting NZ | XLS Experts',
    ogDescription:
      "New Zealand's leading Excel and spreadsheet consultants. VBA automation, dashboards, financial modelling, and workflow automation.",
    ogImageAlt: 'XLS Experts — Excel & Spreadsheet Consulting NZ',
    twitterTitle: 'Excel & Spreadsheet Consulting NZ | XLS Experts',
    twitterDescription:
      "New Zealand's leading Excel and spreadsheet consultants. VBA automation, dashboards, financial modelling.",
  },
  contact: {
    heading: 'Contact directly',
    phoneDisplay: '+64 21 783 967',
    phoneTel: '+6421783967',
    whatsapp: '6421783967',
    whatsappLabel: 'WhatsApp us',
    locationLine: 'Auckland, New Zealand — serving clients nationwide',
    locationBadge: 'NZ',
    emailPlaceholder: 'jane@acme.co.nz',
    phonePlaceholder: '+64 21 000 000',
  },
  home: {
    metaTitle:
      'Excel Experts, Excel Data Analysis, Consulting & Solutions in New Zealand',
    metaDescription:
      'Spreadsheet experts in Auckland, New Zealand ready to help with Excel tables, charts, formulas, macros, VBA, data automation, and custom Excel solutions.',
    schemaDescription:
      "New Zealand's leading Excel and spreadsheet consulting firm. We provide VBA automation, dashboard development, financial modelling, Power Query, and workflow automation services.",
    schemaAreaServed: 'New Zealand',
    schemaAddressCountry: 'NZ',
    schemaAddressLocality: 'Auckland',
    faqCostQuestion: 'How much does Excel consulting cost in New Zealand?',
    faqCostAnswer:
      'XLS Experts projects typically start from $1,000 NZD for small automation tasks. Most projects fall in the $2,000–$10,000 range depending on complexity. We provide a clear scope and fixed price before starting any work.',
    faqIndustriesAnswer:
      'XLS Experts works with businesses across finance, insurance, energy, healthcare, construction, logistics, retail, hospitality, education, and not-for-profit sectors throughout New Zealand.',
    faqOutsideQuestion: 'Do you work with businesses outside Auckland?',
    faqOutsideAnswer:
      'Yes. We work with businesses across all of New Zealand including Wellington, Christchurch, Hamilton, Tauranga, and other regions. Most project work can be delivered remotely.',
  },
  hero: {
    line1: 'NEW ZEALAND',
    line2: 'BUSINESS AUTOMATION SPECIALISTS',
    badgeSpecialists: 'New Zealand Microsoft Excel Specialists',
    badgeEnterprise: 'Enterprise Applications',
    badgeAi: 'A.I. Solutions',
    badgeSpecialistsHref: '',
    badgeEnterpriseHref: '',
    badgeAiHref: '',
    trustBased: 'New Zealand based',
    statValue: '100% NZ',
    statLabel: 'Based team, local expertise',
  },
  about: {
    intro:
      'We are an Auckland-based data automation consultancy with expertise in Excel, VBA, Google Sheets, and modern workflow automation tools. We specialise in transforming data management tasks into valuable business tools — for businesses of every size.',
    pillarBasedTitle: '100% New Zealand based',
    pillarBasedBody:
      'Our entire team works from Auckland. No offshore handoffs, no timezone delays — you deal directly with the people doing the work.',
    pillarSmeBody:
      'We work with solo operators, engineers, construction firms, retailers, and NZX-listed corporates alike. Every client gets the same quality of attention.',
    brandLabel: 'XLS Experts NZ',
  },
  caseStudies: {
    homeIntro:
      'Real problems, real solutions. A sample of what we have built for NZ businesses across industries.',
  },
}

/** Deep clone helper for seeding intl = nz until regionalized in admin. */
export function cloneMarketCopy(source: MarketCopy): MarketCopy {
  return JSON.parse(JSON.stringify(source)) as MarketCopy
}

export const DEFAULT_INTL_MARKET_COPY: MarketCopy = {
  ...cloneMarketCopy(DEFAULT_NZ_MARKET_COPY),
  site: {
    ...cloneMarketCopy(DEFAULT_NZ_MARKET_COPY).site,
    origin: 'https://www.xlsexperts.com',
    htmlLang: 'en',
    ogLocale: 'en_US',
    defaultTitle: 'Excel & Spreadsheet Consulting | XLS Experts',
    defaultDescription:
      'XLS Experts are leading Excel and spreadsheet consultants. We build models, automate data, and create dashboards that transform how your business works.',
    keywords:
      'Excel consultant USA, Excel VBA developer USA, spreadsheet automation USA, Excel dashboard, Excel financial modelling, Power Query, business process automation, Excel expert USA Australia Canada',
    ogTitle: 'Excel & Spreadsheet Consulting | XLS Experts',
    ogDescription:
      'Leading Excel and spreadsheet consultants. VBA automation, dashboards, financial modelling, and workflow automation.',
    ogImageAlt: 'XLS Experts — Excel & Spreadsheet Consulting',
    twitterTitle: 'Excel & Spreadsheet Consulting | XLS Experts',
    twitterDescription:
      'Leading Excel and spreadsheet consultants. VBA automation, dashboards, financial modelling.',
  },
  contact: {
    ...cloneMarketCopy(DEFAULT_NZ_MARKET_COPY).contact,
    locationLine: 'Serving clients across USA, Canada, Australia',
    locationBadge: 'USA',
    emailPlaceholder: 'jane@acme.com',
    phonePlaceholder: '+1 000 000 0000',
  },
  home: {
    ...cloneMarketCopy(DEFAULT_NZ_MARKET_COPY).home,
    metaTitle:
      'Global Excel Experts, Excel Data Analysis, Consulting & Solutions',
    metaDescription:
      'Spreadsheet experts ready to help with Excel tables, charts, formulas, macros, VBA, data automation, and custom Excel solutions.',
    schemaDescription:
      'Leading Excel and Google spreadsheet consulting firm. We provide VBA automation, dashboard development, financial modelling, Power Query, and workflow automation services.',
    schemaAreaServed: 'USA, Canada, Australia',
    schemaAddressCountry: 'US',
    schemaAddressLocality: 'Global',
  },
  hero: {
    ...cloneMarketCopy(DEFAULT_NZ_MARKET_COPY).hero,
    badgeSpecialists: 'Global Microsoft Excel Specialists',
  },
  about: {
    ...cloneMarketCopy(DEFAULT_NZ_MARKET_COPY).about,
    brandLabel: 'XLS Experts International',
  },
}

export const DEFAULT_UK_MARKET_COPY: MarketCopy = {
  ...cloneMarketCopy(DEFAULT_INTL_MARKET_COPY),
  site: {
    ...cloneMarketCopy(DEFAULT_INTL_MARKET_COPY).site,
    origin: 'https://www.xlsexperts.co.uk',
    htmlLang: 'en-GB',
    ogLocale: 'en_GB',
    defaultTitle: 'Excel & Spreadsheet Consulting UK | XLS Experts',
    defaultDescription:
      'XLS Experts are leading Excel and spreadsheet consultants in the United Kingdom. We build models, automate data, and create dashboards that transform how your business works.',
    keywords:
      'Excel consultant UK, Excel VBA developer UK, spreadsheet automation United Kingdom, Excel dashboard UK, Excel financial modelling UK, Power Query UK, business process automation UK, Excel expert London',
    ogTitle: 'Excel & Spreadsheet Consulting UK | XLS Experts',
    ogDescription:
      'Leading Excel and spreadsheet consultants in the United Kingdom. VBA automation, dashboards, financial modelling, and workflow automation.',
    ogImageAlt: 'XLS Experts — Excel & Spreadsheet Consulting UK',
    twitterTitle: 'Excel & Spreadsheet Consulting UK | XLS Experts',
    twitterDescription:
      'Leading Excel and spreadsheet consultants in the United Kingdom. VBA automation, dashboards, financial modelling.',
  },
  contact: {
    ...cloneMarketCopy(DEFAULT_INTL_MARKET_COPY).contact,
    heading: 'Contact directly',
    whatsappLabel: 'WhatsApp us',
    locationLine: 'United Kingdom — serving clients nationwide',
    locationBadge: 'UK',
    emailPlaceholder: 'jane@acme.co.uk',
    phonePlaceholder: '+44 20 0000 0000',
  },
  home: {
    ...cloneMarketCopy(DEFAULT_INTL_MARKET_COPY).home,
    metaTitle:
      'UK Excel Experts, Excel Data Analysis, Consulting & Solutions',
    metaDescription:
      'Spreadsheet experts in the United Kingdom ready to help with Excel tables, charts, formulas, macros, VBA, data automation, and custom Excel solutions.',
    schemaDescription:
      'Leading Excel and spreadsheet consulting firm in the United Kingdom. We provide VBA automation, dashboard development, financial modelling, Power Query, and workflow automation services.',
    schemaAreaServed: 'United Kingdom',
    schemaAddressCountry: 'GB',
    schemaAddressLocality: 'London',
    faqCostQuestion: 'How much does Excel consulting cost in the UK?',
    faqCostAnswer:
      'XLS Experts projects typically start from £500 for small automation tasks. Most projects fall in the £1,000–£6,000 range depending on complexity. We provide a clear scope and fixed price before starting any work.',
    faqIndustriesAnswer:
      'XLS Experts works with businesses across finance, insurance, energy, healthcare, construction, logistics, retail, hospitality, education, and not-for-profit sectors throughout the United Kingdom.',
    faqOutsideQuestion: 'Do you work with businesses outside London?',
    faqOutsideAnswer:
      'Yes. We work with businesses across the United Kingdom including Manchester, Birmingham, Edinburgh, Bristol, Leeds, and other regions. Most project work can be delivered remotely.',
  },
  hero: {
    ...cloneMarketCopy(DEFAULT_INTL_MARKET_COPY).hero,
    line1: 'UNITED KINGDOM',
    badgeSpecialists: 'UK Microsoft Excel Specialists',
    trustBased: 'Serving UK clients',
    statValue: 'UK',
    statLabel: 'Based expertise, delivered remotely',
  },
  about: {
    ...cloneMarketCopy(DEFAULT_INTL_MARKET_COPY).about,
    intro:
      'We are a United Kingdom data automation consultancy with expertise in Excel, VBA, Google Sheets, and modern workflow automation tools. We specialise in transforming data management tasks into valuable business tools — for businesses of every size.',
    pillarBasedTitle: 'United Kingdom',
    pillarBasedBody:
      'We work with UK organisations remotely, with one project manager as your point of contact and 20+ years of experience. No offshore handoffs — you deal directly with the people doing the work.',
    brandLabel: 'XLS Experts UK',
  },
  caseStudies: {
    homeIntro:
      'Real problems, real solutions. A sample of what we have built for businesses across the United Kingdom.',
  },
}

export type MarketCopyBundle = {
  nz: MarketCopy
  intl: MarketCopy
  uk: MarketCopy
}

/** Seconds each homepage hero background image stays before the next. */
export const DEFAULT_HERO_BACKGROUND_HOLD_SECONDS = 6
export const HERO_BACKGROUND_HOLD_SECONDS_MIN = 2
export const HERO_BACKGROUND_HOLD_SECONDS_MAX = 20

export function normalizeHeroBackgroundHoldSeconds(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return DEFAULT_HERO_BACKGROUND_HOLD_SECONDS
  return Math.min(
    HERO_BACKGROUND_HOLD_SECONDS_MAX,
    Math.max(HERO_BACKGROUND_HOLD_SECONDS_MIN, Math.round(n)),
  )
}

export function pickHeroBackgroundHoldSeconds(raw: unknown): number {
  const source =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const nested =
    source.content && typeof source.content === 'object'
      ? (source.content as Record<string, unknown>)
      : source
  return normalizeHeroBackgroundHoldSeconds(nested.heroBackgroundHoldSeconds)
}

export type PublishedMarketCopyFile = {
  version: 1
  publishedAt: string
  markets: MarketCopyBundle
  /** Global homepage setting — not per market. */
  heroBackgroundHoldSeconds?: number
}

export function defaultMarketCopyBundle(): MarketCopyBundle {
  return {
    nz: cloneMarketCopy(DEFAULT_NZ_MARKET_COPY),
    intl: cloneMarketCopy(DEFAULT_INTL_MARKET_COPY),
    uk: cloneMarketCopy(DEFAULT_UK_MARKET_COPY),
  }
}

export function getByPath(obj: unknown, path: string): string {
  const parts = path.split('.')
  let cur: unknown = obj
  for (const part of parts) {
    if (!cur || typeof cur !== 'object') return ''
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === 'string' ? cur : ''
}

export function setByPath(obj: MarketCopy, path: string, value: string): MarketCopy {
  const next = cloneMarketCopy(obj)
  const parts = path.split('.')
  let cur: Record<string, unknown> = next as unknown as Record<string, unknown>
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    const child = cur[part]
    if (!child || typeof child !== 'object') {
      cur[part] = {}
    }
    cur = cur[part] as Record<string, unknown>
  }
  cur[parts[parts.length - 1]] = value
  return next
}

function pickString(raw: unknown, fallback: string): string {
  return typeof raw === 'string' && raw.trim() ? raw.trim() : fallback
}

/** Like pickString but preserves explicit empty strings (e.g. optional hrefs). */
function pickStringAllowEmpty(raw: unknown, fallback: string): string {
  if (typeof raw === 'string') return raw.trim()
  return fallback
}

function normalizeSection<T extends Record<string, string>>(
  raw: unknown,
  defaults: T,
  options?: { allowEmptyKeys?: readonly string[] }
): T {
  const out = { ...defaults }
  if (!raw || typeof raw !== 'object') return out
  const data = raw as Record<string, unknown>
  const allowEmpty = new Set(options?.allowEmptyKeys ?? [])
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const k = key as string
    out[key] = (
      allowEmpty.has(k)
        ? pickStringAllowEmpty(data[k], defaults[key])
        : pickString(data[k], defaults[key])
    ) as T[keyof T]
  }
  return out
}

const LEGACY_BRAND_LABEL_KEY: Record<
  MarketId,
  'brandNzLabel' | 'brandIntlLabel' | 'brandUkLabel'
> = {
  nz: 'brandNzLabel',
  intl: 'brandIntlLabel',
  uk: 'brandUkLabel',
}

/** Prefer brandLabel; else the old per-region key for this market. */
function pickBrandLabel(
  rawAbout: unknown,
  fallback: string,
  legacyKey: 'brandNzLabel' | 'brandIntlLabel' | 'brandUkLabel'
): string {
  if (!rawAbout || typeof rawAbout !== 'object') return fallback
  const data = rawAbout as Record<string, unknown>
  return pickString(data.brandLabel, pickString(data[legacyKey], fallback))
}

export function normalizeMarketCopy(
  raw: unknown,
  fallback: MarketCopy,
  market: MarketId = 'nz'
): MarketCopy {
  if (!raw || typeof raw !== 'object') return cloneMarketCopy(fallback)
  const data = raw as Record<string, unknown>
  const about = normalizeSection(data.about, fallback.about)
  about.brandLabel = pickBrandLabel(
    data.about,
    fallback.about.brandLabel,
    LEGACY_BRAND_LABEL_KEY[market]
  )
  return {
    site: normalizeSection(data.site, fallback.site),
    contact: normalizeSection(data.contact, fallback.contact),
    home: normalizeSection(data.home, fallback.home),
    hero: normalizeSection(data.hero, fallback.hero, {
      allowEmptyKeys: [
        'badgeSpecialistsHref',
        'badgeEnterpriseHref',
        'badgeAiHref',
      ],
    }),
    about,
    caseStudies: normalizeSection(data.caseStudies, fallback.caseStudies),
  }
}

export function normalizeMarketCopyBundle(raw: unknown): MarketCopyBundle {
  const defaults = defaultMarketCopyBundle()
  if (!raw || typeof raw !== 'object') return defaults
  const data = raw as Record<string, unknown>
  const markets =
    data.markets && typeof data.markets === 'object'
      ? (data.markets as Record<string, unknown>)
      : data
  return {
    nz: normalizeMarketCopy(markets.nz, defaults.nz, 'nz'),
    intl: normalizeMarketCopy(markets.intl, defaults.intl, 'intl'),
    uk: normalizeMarketCopy(markets.uk ?? markets.intl, defaults.uk, 'uk'),
  }
}

export type BrandLabels = {
  nz: string
  intl: string
  uk: string
}

export function brandLabelsFromBundle(bundle: MarketCopyBundle): BrandLabels {
  return {
    nz: bundle.nz.about.brandLabel,
    intl: bundle.intl.about.brandLabel,
    uk: bundle.uk.about.brandLabel,
  }
}

export function keywordsToArray(keywords: string): string[] {
  return keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
}

export function pickMarketCopy(
  bundle: MarketCopyBundle,
  market: MarketId
): MarketCopy {
  return bundle[market] ?? bundle.nz
}

/** Canonical site URLs are owned by Settings → Domains, not Marketing copy. */
export function applySiteOrigins(
  bundle: MarketCopyBundle,
  origins: { nz: string; intl: string; uk: string }
): MarketCopyBundle {
  return {
    nz: {
      ...bundle.nz,
      site: { ...bundle.nz.site, origin: origins.nz },
    },
    intl: {
      ...bundle.intl,
      site: { ...bundle.intl.site, origin: origins.intl },
    },
    uk: {
      ...bundle.uk,
      site: { ...bundle.uk.site, origin: origins.uk },
    },
  }
}

/** Homepage hero strapline badges — text + optional service/solution link. */
export const HERO_BADGE_DEFS = [
  {
    id: 'specialists',
    label: 'Badge 1',
    textPath: 'hero.badgeSpecialists',
    hrefPath: 'hero.badgeSpecialistsHref',
  },
  {
    id: 'enterprise',
    label: 'Badge 2',
    textPath: 'hero.badgeEnterprise',
    hrefPath: 'hero.badgeEnterpriseHref',
  },
  {
    id: 'ai',
    label: 'Badge 3',
    textPath: 'hero.badgeAi',
    hrefPath: 'hero.badgeAiHref',
  },
] as const

export type HeroBadgeDef = (typeof HERO_BADGE_DEFS)[number]

/** Contact Us sidebar — phone, WhatsApp, and location, per region. */
export const CONTACT_DETAIL_FIELDS: MarketCopyFieldMeta[] = [
  {
    path: 'contact.heading',
    label: 'Section heading',
    group: 'Contact',
    hint: 'Shown above the phone number, e.g. Contact directly',
  },
  {
    path: 'contact.phoneDisplay',
    label: 'Phone (shown on site)',
    group: 'Contact',
    hint: 'Exactly as visitors see it, e.g. +44 20 0000 0000',
  },
  {
    path: 'contact.phoneTel',
    label: 'Phone (tel: link)',
    group: 'Contact',
    hint: 'Digits with country code for the click-to-call link, e.g. +442000000000',
  },
  {
    path: 'contact.whatsappLabel',
    label: 'WhatsApp link text',
    group: 'Contact',
    hint: 'e.g. WhatsApp us',
  },
  {
    path: 'contact.whatsapp',
    label: 'WhatsApp number',
    group: 'Contact',
    hint: 'Digits only for wa.me, country code first, e.g. 442000000000',
  },
  {
    path: 'contact.locationBadge',
    label: 'Location badge',
    group: 'Contact',
    hint: 'Short code beside the location line, e.g. UK, USA, NZ',
  },
  {
    path: 'contact.locationLine',
    label: 'Location line',
    group: 'Contact',
    multiline: true,
    hint: 'e.g. Serving clients across the United Kingdom',
  },
  {
    path: 'contact.emailPlaceholder',
    label: 'Email field placeholder',
    group: 'Contact',
  },
  {
    path: 'contact.phonePlaceholder',
    label: 'Phone field placeholder',
    group: 'Contact',
  },
]
