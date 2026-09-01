/**
 * Homepage hero “common projects” and client tiles.
 * Admin drafts live in Firestore; Publish writes generated files that the
 * public homepage imports — no database or image generation on page load.
 */

export const HERO_PROJECT_ICON_KEYS = [
  'lineChart',
  'calculator',
  'calendarRange',
  'clipboardCheck',
  'listChecks',
  'zap',
  'barChart3',
  'users',
  'mapPin',
  'shoppingCart',
] as const

export type HeroProjectIconKey = (typeof HERO_PROJECT_ICON_KEYS)[number]

export const HERO_PROJECT_ICON_LABELS: Record<HeroProjectIconKey, string> = {
  lineChart: 'Line chart',
  calculator: 'Calculator',
  calendarRange: 'Calendar',
  clipboardCheck: 'Clipboard',
  listChecks: 'Checklist',
  zap: 'Zap',
  barChart3: 'Bar chart',
  users: 'Users',
  mapPin: 'Map pin',
  shoppingCart: 'Shopping cart',
}

export const HERO_PROJECTS_MAX = 24

export const HERO_MONOGRAM_COLORS = [
  '#0b4f9c',
  '#e2523b',
  '#1a6b3c',
  '#2b6cb0',
  '#00857d',
  '#7a4bd0',
  '#c2185b',
  '#d97706',
  '#b91c1c',
  '#0f766e',
  '#e0a800',
  '#334155',
] as const

export function isHeroProjectIconKey(
  value: unknown
): value is HeroProjectIconKey {
  return (
    typeof value === 'string' &&
    (HERO_PROJECT_ICON_KEYS as readonly string[]).includes(value)
  )
}

export type HeroProjectTile = {
  id: string
  label: string
  icon: HeroProjectIconKey
  /** Published generated icon URL. Empty = lucide fallback. */
  iconSrc: string
}

export type HeroClientTile = {
  id: string
  name: string
  abbr: string
  color: string
  /** Published generated/harvested logo URL. Empty = initial monogram. */
  logoSrc: string
}

export type HeroClientFade = {
  /** Length of the opacity crossfade, in milliseconds. */
  durationMs: number
  /** 0 = soft ease-in-out, 100 = abrupt. */
  harshness: number
}

export const DEFAULT_HERO_CLIENT_FADE: HeroClientFade = {
  durationMs: 1000,
  harshness: 12,
}

export const HERO_CLIENT_FADE_DURATION_MIN = 200
export const HERO_CLIENT_FADE_DURATION_MAX = 2000

export function clampHeroClientFade(fade: {
  durationMs: number
  harshness: number
}): HeroClientFade {
  return {
    durationMs: Math.min(
      HERO_CLIENT_FADE_DURATION_MAX,
      Math.max(
        HERO_CLIENT_FADE_DURATION_MIN,
        Math.round(fade.durationMs / 50) * 50
      )
    ),
    harshness: Math.min(100, Math.max(0, Math.round(fade.harshness))),
  }
}

export function normalizeHeroClientFade(raw: unknown): HeroClientFade {
  let rec: unknown = raw
  if (raw && typeof raw === 'object' && 'content' in raw) {
    rec = (raw as { content: unknown }).content
  }
  const fadeRaw =
    rec && typeof rec === 'object' && rec !== null && 'fade' in rec
      ? (rec as { fade: unknown }).fade
      : rec
  if (!fadeRaw || typeof fadeRaw !== 'object') {
    return { ...DEFAULT_HERO_CLIENT_FADE }
  }
  const row = fadeRaw as Record<string, unknown>
  const durationMs =
    typeof row.durationMs === 'number' && Number.isFinite(row.durationMs)
      ? row.durationMs
      : DEFAULT_HERO_CLIENT_FADE.durationMs
  const harshness =
    typeof row.harshness === 'number' && Number.isFinite(row.harshness)
      ? row.harshness
      : DEFAULT_HERO_CLIENT_FADE.harshness
  return clampHeroClientFade({ durationMs, harshness })
}

/** CSS cubic-bezier: soft dissolve at 0, near-cut at 100. */
export function heroClientFadeEasing(harshness: number): string {
  const t = Math.min(100, Math.max(0, harshness)) / 100
  const x1 = (0.4 + t * 0.55).toFixed(2)
  const x2 = (0.6 - t * 0.55).toFixed(2)
  return `cubic-bezier(${x1}, 0, ${x2}, 1)`
}

export const DEFAULT_HERO_CLIENT_HEADING =
  'Trusted by SMEs and Enterprise Clients'

export const DEFAULT_HERO_PROJECTS_INTRO =
  'Hundreds of custom business solutions delivered across engineering, finance, manufacturing, logistics and professional services.'

export function normalizeHeroClientHeading(raw: unknown): string {
  let rec: unknown = raw
  if (raw && typeof raw === 'object' && 'content' in raw) {
    rec = (raw as { content: unknown }).content
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim().replace(/\s+/g, ' ')
    return trimmed || DEFAULT_HERO_CLIENT_HEADING
  }
  if (rec && typeof rec === 'object' && rec !== null && 'heading' in rec) {
    const heading = (rec as { heading: unknown }).heading
    if (typeof heading === 'string') {
      const trimmed = heading.trim().replace(/\s+/g, ' ')
      return trimmed || DEFAULT_HERO_CLIENT_HEADING
    }
  }
  return DEFAULT_HERO_CLIENT_HEADING
}

export function normalizeHeroProjectsIntro(raw: unknown): string {
  let rec: unknown = raw
  if (raw && typeof raw === 'object' && 'content' in raw) {
    rec = (raw as { content: unknown }).content
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim().replace(/\s+/g, ' ')
    return trimmed || DEFAULT_HERO_PROJECTS_INTRO
  }
  if (rec && typeof rec === 'object' && rec !== null) {
    const data = rec as Record<string, unknown>
    const value =
      typeof data.intro === 'string'
        ? data.intro
        : typeof data.projectsIntro === 'string'
          ? data.projectsIntro
          : null
    if (value != null) {
      const trimmed = value.trim().replace(/\s+/g, ' ')
      return trimmed || DEFAULT_HERO_PROJECTS_INTRO
    }
  }
  return DEFAULT_HERO_PROJECTS_INTRO
}

export type HeroTrustContent = {
  projects: HeroProjectTile[]
  clients: HeroClientTile[]
  fade: HeroClientFade
  heading: string
  /** Line above the Common projects tiles. */
  projectsIntro: string
}

export type PublishedHeroClientsFile = {
  version: 1
  publishedAt: string
  content: {
    clients: HeroClientTile[]
    fade: HeroClientFade
    heading: string
  }
}

export type PublishedHeroProjectsFile = {
  version: 1
  publishedAt: string
  content: { intro: string; projects: HeroProjectTile[] }
}

export function slugifyHeroId(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'item'
}

export function uniqueHeroId(base: string, used: Iterable<string>): string {
  const seen = new Set(used)
  const root = slugifyHeroId(base)
  if (!seen.has(root)) return root
  let n = 2
  while (seen.has(`${root}-${n}`)) n += 1
  return `${root}-${n}`
}

export function initialsFromName(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return 'XX'
  if (words.length === 1) {
    const token = words[0].replace(/[^A-Za-z0-9&]/g, '')
    return (token.slice(0, 3) || 'XX').toUpperCase()
  }
  return words
    .slice(0, 3)
    .map((word) => {
      const ch = word.replace(/[^A-Za-z0-9&]/g, '').charAt(0)
      return ch || ''
    })
    .join('')
    .slice(0, 3)
    .toUpperCase() || 'XX'
}

export function colorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return HERO_MONOGRAM_COLORS[hash % HERO_MONOGRAM_COLORS.length]
}

function asTrimmedString(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

function asHexColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed.toLowerCase() : fallback
}

function asUrl(value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed)) return trimmed
  return ''
}

export function defaultHeroProjects(): HeroProjectTile[] {
  return [
    {
      id: 'financial-modelling-dashboards',
      label: 'Financial Modelling/Dashboards',
      icon: 'lineChart',
      iconSrc: '',
    },
    {
      id: 'project-costing-calculators',
      label: 'Project Costing Calculators',
      icon: 'calculator',
      iconSrc: '',
    },
    {
      id: 'resource-planning-tools',
      label: 'Resource Planning Tools',
      icon: 'calendarRange',
      iconSrc: '',
    },
    {
      id: 'feasibility-studies',
      label: 'Feasibility Studies',
      icon: 'clipboardCheck',
      iconSrc: '',
    },
    { id: 'survey-tools', label: 'Survey Tools', icon: 'listChecks', iconSrc: '' },
    {
      id: 'sales-team-automations',
      label: 'Sales Team Automations',
      icon: 'zap',
      iconSrc: '',
    },
    { id: 'data-analysis', label: 'Data Analysis', icon: 'barChart3', iconSrc: '' },
    {
      id: 'membership-systems',
      label: 'Membership Systems',
      icon: 'users',
      iconSrc: '',
    },
    { id: 'gps-tools', label: 'GPS Tools', icon: 'mapPin', iconSrc: '' },
    {
      id: 'e-commerce-extensions',
      label: 'E-commerce Extensions',
      icon: 'shoppingCart',
      iconSrc: '',
    },
  ]
}

export function defaultHeroClients(): HeroClientTile[] {
  return [
    { id: 'amp', name: 'AMP', abbr: 'AMP', color: '#0b4f9c', logoSrc: '' },
    {
      id: 'contact-energy',
      name: 'Contact Energy',
      abbr: 'CE',
      color: '#e2523b',
      logoSrc: '',
    },
    { id: 'nzi', name: 'NZI', abbr: 'NZI', color: '#1a6b3c', logoSrc: '' },
    {
      id: 'fisher-paykel-healthcare',
      name: 'Fisher & Paykel Healthcare',
      abbr: 'F&P',
      color: '#2b6cb0',
      logoSrc: '',
    },
    {
      id: 'auckland-transport',
      name: 'Auckland Transport',
      abbr: 'AT',
      color: '#00857d',
      logoSrc: '',
    },
    { id: '1m', name: '1M', abbr: '1M', color: '#7a4bd0', logoSrc: '' },
    {
      id: 'max-fashion',
      name: 'Max Fashion',
      abbr: 'MF',
      color: '#c2185b',
      logoSrc: '',
    },
    {
      id: 'fulton-hogan',
      name: 'Fulton Hogan',
      abbr: 'FH',
      color: '#d97706',
      logoSrc: '',
    },
    { id: 'downer', name: 'Downer', abbr: 'DW', color: '#b91c1c', logoSrc: '' },
    { id: 'eqc', name: 'EQC', abbr: 'EQC', color: '#0f766e', logoSrc: '' },
    {
      id: 'asb-bank',
      name: 'ASB Bank',
      abbr: 'ASB',
      color: '#e0a800',
      logoSrc: '',
    },
    {
      id: 'pullman-hotels',
      name: 'Pullman Hotels',
      abbr: 'PH',
      color: '#334155',
      logoSrc: '',
    },
  ]
}

export function defaultHeroTrustContent(): HeroTrustContent {
  return {
    projects: defaultHeroProjects(),
    clients: defaultHeroClients(),
    fade: { ...DEFAULT_HERO_CLIENT_FADE },
    heading: DEFAULT_HERO_CLIENT_HEADING,
    projectsIntro: DEFAULT_HERO_PROJECTS_INTRO,
  }
}

export function emptyHeroClient(usedIds: Iterable<string>): HeroClientTile {
  const id = uniqueHeroId('new-client', usedIds)
  return {
    id,
    name: 'New client',
    abbr: 'NC',
    color: colorFromName(id),
    logoSrc: '',
  }
}

export function emptyHeroProject(usedIds: Iterable<string>): HeroProjectTile {
  const id = uniqueHeroId('new-project', usedIds)
  return {
    id,
    label: 'New project',
    icon: 'zap',
    iconSrc: '',
  }
}

function parseClient(value: unknown, usedIds: Set<string>): HeroClientTile | null {
  if (!value || typeof value !== 'object') return null
  const rec = value as Record<string, unknown>
  const name = asTrimmedString(rec.name, '')
  if (!name) return null
  const id = uniqueHeroId(
    asTrimmedString(rec.id, slugifyHeroId(name)),
    usedIds
  )
  usedIds.add(id)
  return {
    id,
    name,
    abbr: asTrimmedString(rec.abbr, initialsFromName(name)).slice(0, 4),
    color: asHexColor(rec.color, colorFromName(name)),
    logoSrc: asUrl(rec.logoSrc),
  }
}

function parseProject(
  value: unknown,
  usedIds: Set<string>
): HeroProjectTile | null {
  if (!value || typeof value !== 'object') return null
  const rec = value as Record<string, unknown>
  const label = asTrimmedString(rec.label, '')
  if (!label) return null
  const id = uniqueHeroId(
    asTrimmedString(rec.id, slugifyHeroId(label)),
    usedIds
  )
  usedIds.add(id)
  return {
    id,
    label,
    icon: isHeroProjectIconKey(rec.icon) ? rec.icon : 'zap',
    iconSrc: asUrl(rec.iconSrc),
  }
}

function unwrapList(
  raw: unknown,
  key: 'clients' | 'projects'
): { items: unknown[]; present: boolean } {
  if (Array.isArray(raw)) return { items: raw, present: true }
  if (!raw || typeof raw !== 'object') return { items: [], present: false }
  const wrapper = raw as Record<string, unknown>
  const inner =
    wrapper.content && typeof wrapper.content === 'object'
      ? (wrapper.content as Record<string, unknown>)
      : wrapper
  if (Array.isArray(inner[key])) {
    return { items: inner[key] as unknown[], present: true }
  }
  return { items: [], present: false }
}

export function normalizeHeroClients(raw: unknown): HeroClientTile[] {
  const { items, present } = unwrapList(raw, 'clients')
  if (!present) return []
  const used = new Set<string>()
  const parsed: HeroClientTile[] = []
  for (const item of items) {
    const tile = parseClient(item, used)
    if (tile) parsed.push(tile)
  }
  return parsed
}

export function normalizeHeroProjects(raw: unknown): HeroProjectTile[] {
  const used = new Set<string>()
  const parsed: HeroProjectTile[] = []
  for (const item of unwrapList(raw, 'projects').items) {
    if (parsed.length >= HERO_PROJECTS_MAX) break
    const tile = parseProject(item, used)
    if (tile) parsed.push(tile)
  }
  return parsed.length > 0 ? parsed : defaultHeroProjects()
}

export function heroClientNameKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

/** Google Ads-style paste: one name per line, or comma / tab / semicolon separated. */
export function parsePastedClientNames(raw: string): string[] {
  const seen = new Set<string>()
  const names: string[] = []
  for (const token of String(raw || '').split(/[\n\r,;\t]+/)) {
    let name = token.trim()
    if (
      (name.startsWith('"') && name.endsWith('"')) ||
      (name.startsWith("'") && name.endsWith("'"))
    ) {
      name = name.slice(1, -1).trim()
    }
    if (!name) continue
    const key = heroClientNameKey(name)
    if (!key || seen.has(key)) continue
    seen.add(key)
    names.push(name.replace(/\s+/g, ' '))
  }
  return names
}

export type AddHeroClientsResult = {
  clients: HeroClientTile[]
  added: number
  skipped: number
}

export function addHeroClientsFromNames(
  existing: HeroClientTile[],
  names: string[]
): AddHeroClientsResult {
  const existingKeys = new Set(
    existing.map((client) => heroClientNameKey(client.name)).filter(Boolean)
  )
  const usedIds = new Set(existing.map((client) => client.id))
  const clients = [...existing]
  let added = 0
  let skipped = 0

  for (const name of names) {
    const key = heroClientNameKey(name)
    if (!key) continue
    if (existingKeys.has(key)) {
      skipped += 1
      continue
    }
    const id = uniqueHeroId(name, usedIds)
    usedIds.add(id)
    existingKeys.add(key)
    clients.push({
      id,
      name,
      abbr: initialsFromName(name).slice(0, 4),
      color: colorFromName(name),
      logoSrc: '',
    })
    added += 1
  }

  return { clients, added, skipped }
}

export function normalizeHeroTrustContent(raw: unknown): HeroTrustContent {
  return {
    clients: normalizeHeroClients(raw),
    projects: normalizeHeroProjects(raw),
    fade: normalizeHeroClientFade(raw),
    heading: normalizeHeroClientHeading(raw),
    projectsIntro: normalizeHeroProjectsIntro(raw),
  }
}
