'use client'

import {
  ADMIN_SESSION_KEY,
  ADMIN_TAB_IDS,
  DEFAULT_NON_ADMIN_TABS,
  isAdminTabId,
  resolveUserAllowedTabs,
  type AdminSession,
  type AdminTabId,
  type AdminUserRole,
} from '@/lib/admin-users'

/** Admin-only UI preview: pretend to be marketing to check their default tabs. */
export const ADMIN_VIEW_MODE_KEY = 'xls-admin-view-mode'
export type AdminViewMode = 'admin' | 'marketing'

export function readAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as AdminSession
    if (!data?.email || !data?.role || !data?.userId) return null
    // Normalize older sessions missing allowedTabs
    const allowedTabs = resolveUserAllowedTabs({
      role: data.role,
      allowedTabs: Array.isArray(data.allowedTabs) ? data.allowedTabs : null,
    })
    return {
      userId: data.userId,
      email: data.email,
      name: data.name ?? '',
      role: data.role,
      allowedTabs,
    }
  } catch {
    return null
  }
}

export function writeAdminSession(session: AdminSession): void {
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
  sessionStorage.removeItem(ADMIN_VIEW_MODE_KEY)
}

export function readAdminViewMode(): AdminViewMode {
  if (typeof window === 'undefined') return 'admin'
  try {
    const raw = sessionStorage.getItem(ADMIN_VIEW_MODE_KEY)
    return raw === 'marketing' ? 'marketing' : 'admin'
  } catch {
    return 'admin'
  }
}

export function writeAdminViewMode(mode: AdminViewMode): void {
  sessionStorage.setItem(ADMIN_VIEW_MODE_KEY, mode)
}

/**
 * Real role for marketing users is always marketing.
 * Admins can temporarily view as marketing via the mode selector.
 */
export function getEffectiveRole(
  session: AdminSession,
  viewMode: AdminViewMode
): AdminUserRole {
  if (session.role !== 'admin') return session.role
  return viewMode === 'marketing' ? 'marketing' : 'admin'
}

/**
 * Tabs visible in the current session / view mode.
 * - Real admin (view as admin) → all tabs
 * - Admin “view as marketing” → default non-admin grant set (preview)
 * - Non-admin → their saved allowedTabs from login
 */
export function resolveSessionAllowedTabs(
  session: AdminSession,
  viewMode: AdminViewMode
): AdminTabId[] {
  if (session.role === 'admin' && viewMode === 'admin') {
    return [...ADMIN_TAB_IDS]
  }
  if (session.role === 'admin' && viewMode === 'marketing') {
    return [...DEFAULT_NON_ADMIN_TABS]
  }
  return resolveUserAllowedTabs(session)
}

export function canAccessTab(
  session: AdminSession,
  tab: string,
  viewMode: AdminViewMode = 'admin'
): boolean {
  if (!isAdminTabId(tab)) return false
  return resolveSessionAllowedTabs(session, viewMode).includes(tab)
}

/**
 * @deprecated Prefer canAccessTab(session, tab, viewMode) for per-user grants.
 * Kept for call sites that only have a role string (admin preview defaults).
 */
export function roleCanAccessTab(role: AdminUserRole, tab: string): boolean {
  if (role === 'admin') return true
  return (DEFAULT_NON_ADMIN_TABS as readonly string[]).includes(tab)
}
