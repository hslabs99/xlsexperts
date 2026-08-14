/**
 * Admin panel user accounts (stored in Firestore `users`).
 * Passwords are plain text per product request for this stage.
 *
 * Non-admin users have a per-account `allowedTabs` list so new admin tabs
 * can be granted in Settings → Users without code changes.
 */

/** All top-level admin panel tabs (source of truth for labels + access grants). */
export const ADMIN_TABS = [
  { id: 'bookings', label: 'Bookings' },
  { id: 'enquiries', label: 'Inquiries' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'chat', label: 'Chat' },
  { id: 'blog', label: 'Blog' },
  { id: 'case-studies', label: 'Case Studies' },
  { id: 'service-tiles', label: 'Service Tiles' },
  { id: 'find-out-about', label: 'Find out about' },
  { id: 'cms', label: 'CMS' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'mailings', label: 'New Mailings' },
  { id: 'email', label: 'Email' },
  { id: 'seeding', label: 'Seeding' },
  { id: 'settings', label: 'Settings' },
] as const

export type AdminTabId = (typeof ADMIN_TABS)[number]['id']

export const ADMIN_TAB_IDS: readonly AdminTabId[] = ADMIN_TABS.map((t) => t.id)

/**
 * Default tabs for new non-admin (marketing) users and for legacy accounts
 * that never had `allowedTabs` stored.
 * CMS includes Site CMS (formerly International) and Pages CMS as sub-tabs.
 */
export const DEFAULT_NON_ADMIN_TABS: readonly AdminTabId[] = [
  'enquiries',
  'analytics',
  'chat',
  'blog',
  'cms',
  'marketing',
  'mailings',
]

export const ADMIN_USER_ROLES = ['admin', 'marketing'] as const
export type AdminUserRole = (typeof ADMIN_USER_ROLES)[number]

export type AdminUser = {
  id: string
  email: string
  password: string
  name: string
  role: AdminUserRole
  /**
   * Tabs this account may open. Only applied for non-admin roles.
   * Admins always have every tab; this field is ignored.
   */
  allowedTabs: AdminTabId[]
  active: boolean
  createdAt: unknown
  updatedAt: unknown
}

export type AdminUserInput = {
  email: string
  password: string
  name: string
  role: AdminUserRole
  allowedTabs?: AdminTabId[] | string[]
  active?: boolean
}

/** Seeded admin account for first login */
export const DEFAULT_ADMIN_EMAIL = 'mike@xlsexperts.co.nz'
export const DEFAULT_ADMIN_PASSWORD = '12345678'
export const DEFAULT_ADMIN_NAME = 'Mike'

export type AdminSession = {
  userId: string
  email: string
  name: string
  role: AdminUserRole
  /** Effective grant list for non-admin; full catalog for admin. */
  allowedTabs: AdminTabId[]
}

export const ADMIN_SESSION_KEY = 'xls-admin-session'

export function isAdminTabId(value: string): value is AdminTabId {
  return (ADMIN_TAB_IDS as readonly string[]).includes(value)
}

/** Keep known tab ids only, stable catalog order, unique. */
export function normalizeAllowedTabs(
  raw: unknown,
  options?: { fallbackToDefault?: boolean }
): AdminTabId[] {
  const fallback = options?.fallbackToDefault === true
  if (!Array.isArray(raw)) {
    return fallback ? [...DEFAULT_NON_ADMIN_TABS] : []
  }
  const set = new Set<AdminTabId>()
  for (const item of raw) {
    if (typeof item !== 'string') continue
    // Legacy top-level tabs rolled into CMS
    const id =
      item === 'page-seo' || item === 'international' || item === 'h1'
        ? 'cms'
        : item
    if (isAdminTabId(id)) {
      set.add(id)
    }
  }
  return ADMIN_TAB_IDS.filter((id) => set.has(id))
}

/**
 * Resolve which tabs a user may access.
 * - admin → every tab
 * - non-admin with missing/null allowedTabs → default marketing set (legacy)
 * - non-admin with array (including empty) → that list
 */
export function resolveUserAllowedTabs(user: {
  role: AdminUserRole
  allowedTabs?: AdminTabId[] | string[] | null
}): AdminTabId[] {
  if (user.role === 'admin') {
    return [...ADMIN_TAB_IDS]
  }
  if (user.allowedTabs == null) {
    return [...DEFAULT_NON_ADMIN_TABS]
  }
  return normalizeAllowedTabs(user.allowedTabs, { fallbackToDefault: false })
}

export function adminTabLabel(id: AdminTabId | string): string {
  return ADMIN_TABS.find((t) => t.id === id)?.label ?? id
}
