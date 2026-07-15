'use client'

import {
  ADMIN_SESSION_KEY,
  type AdminSession,
  type AdminUserRole,
} from '@/lib/admin-users'

/** Admin-only UI preview: pretend to be marketing to check their tabs. */
export const ADMIN_VIEW_MODE_KEY = 'xls-admin-view-mode'
export type AdminViewMode = 'admin' | 'marketing'

export function readAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as AdminSession
    if (!data?.email || !data?.role || !data?.userId) return null
    return data
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

export function roleCanAccessTab(
  role: AdminUserRole,
  tab: string
): boolean {
  if (role === 'admin') return true
  // Marketing: Inquiries, Blog, Case studies, and Marketing (tags)
  return (
    tab === 'enquiries' ||
    tab === 'blog' ||
    tab === 'case-studies' ||
    tab === 'marketing'
  )
}
