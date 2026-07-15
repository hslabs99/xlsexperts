/**
 * Admin panel user accounts (stored in Firestore `users`).
 * Passwords are plain text per product request for this stage.
 */

export const ADMIN_USER_ROLES = ['admin', 'marketing'] as const
export type AdminUserRole = (typeof ADMIN_USER_ROLES)[number]

export type AdminUser = {
  id: string
  email: string
  password: string
  name: string
  role: AdminUserRole
  active: boolean
  createdAt: unknown
  updatedAt: unknown
}

export type AdminUserInput = {
  email: string
  password: string
  name: string
  role: AdminUserRole
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
}

export const ADMIN_SESSION_KEY = 'xls-admin-session'
