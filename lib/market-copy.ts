/**
 * Dual-market copy dictionary (NZ vs International).
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
    phoneDisplay: string
    phoneTel: string
    whatsapp: string
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
    brandNzLabel: string
    brandIntlLabel: string
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
}

export const MARKET_COPY_FIELDS: MarketCopyFieldMeta[] = [
  { path: 'site.origin', label: 'Site origin URL', group: 'Site' },
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

  { path: 'contact.phoneDisplay', label: 'Phone (display)', group: 'Contact' },
  { path: 'contact.phoneTel', label: 'Phone (tel: href, digits)', group: 'Contact' },
  { path: 'contact.whatsapp', label: 'WhatsApp number (digits)', group: 'Contact' },
  { path: 'contact.locationLine', label: 'Location line', group: 'Contact' },
  { path: 'contact.locationBadge', label: 'Location badge short code', group: 'Contact' },
  { path: 'contact.emailPlaceholder', label: 'Email field placeholder', group: 'Contact' },
  { path: 'contact.phonePlaceholder', label: 'Phone field placeholder', group: 'Contact' },

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
  { path: 'about.brandNzLabel', label: 'Brand link label (NZ)', group: 'About' },
  { path: 'about.brandIntlLabel', label: 'Brand link label (USA)', group: 'About' },

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
    phoneDisplay: '+64 21 783 967',
    phoneTel: '+6421783967',
    whatsapp: '6421783967',
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
    brandNzLabel: 'Excel Experts NZ',
    brandIntlLabel: 'Excel Experts USA',
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
      'Excel consultant USA, Excel VBA developer USA, spreadsheet automation USA, Excel dashboard, Excel financial modelling, Power Query, business process automation, Excel expert USA Australia Canada UK',
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
    locationLine: 'Serving clients across USA, Canada, United Kingdom, Australia',
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
    schemaAreaServed: 'USA, Canada, United Kingdom, Australia',
    schemaAddressCountry: 'US',
    schemaAddressLocality: 'Global',
  },
  hero: {
    ...cloneMarketCopy(DEFAULT_NZ_MARKET_COPY).hero,
    badgeSpecialists: 'Global Microsoft Excel Specialists',
  },
}

export type MarketCopyBundle = {
  nz: MarketCopy
  intl: MarketCopy
}

export type PublishedMarketCopyFile = {
  version: 1
  publishedAt: string
  markets: MarketCopyBundle
}

export function defaultMarketCopyBundle(): MarketCopyBundle {
  return {
    nz: cloneMarketCopy(DEFAULT_NZ_MARKET_COPY),
    intl: cloneMarketCopy(DEFAULT_INTL_MARKET_COPY),
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

export function normalizeMarketCopy(raw: unknown, fallback: MarketCopy): MarketCopy {
  if (!raw || typeof raw !== 'object') return cloneMarketCopy(fallback)
  const data = raw as Record<string, unknown>
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
    about: normalizeSection(data.about, fallback.about),
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
    nz: normalizeMarketCopy(markets.nz, defaults.nz),
    intl: normalizeMarketCopy(markets.intl, defaults.intl),
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
  return market === 'intl' ? bundle.intl : bundle.nz
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
