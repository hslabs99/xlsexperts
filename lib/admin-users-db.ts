import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { USERS_COLLECTION } from '@/lib/firebase'
import {
  ADMIN_USER_ROLES,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_NAME,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_NON_ADMIN_TABS,
  normalizeAllowedTabs,
  resolveUserAllowedTabs,
  type AdminTabId,
  type AdminUser,
  type AdminUserInput,
  type AdminUserRole,
} from '@/lib/admin-users'

function mapUser(id: string, data: Record<string, unknown>): AdminUser {
  const roleRaw = data.role
  const role: AdminUserRole = ADMIN_USER_ROLES.includes(roleRaw as AdminUserRole)
    ? (roleRaw as AdminUserRole)
    : 'marketing'

  // Firestore may omit the field for legacy users → treat as null (defaults apply)
  const rawTabs =
    data.allowedTabs === undefined ? null : (data.allowedTabs as unknown)

  const allowedTabs: AdminTabId[] =
    role === 'admin'
      ? resolveUserAllowedTabs({ role: 'admin' })
      : rawTabs == null
        ? [...DEFAULT_NON_ADMIN_TABS]
        : normalizeAllowedTabs(rawTabs, { fallbackToDefault: false })

  return {
    id,
    email: String(data.email ?? '').trim().toLowerCase(),
    password: String(data.password ?? ''),
    name: String(data.name ?? ''),
    role,
    allowedTabs,
    active: data.active !== false,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  }
}

export async function fetchAllUsers(): Promise<AdminUser[]> {
  const snap = await getAdminDb().collection(USERS_COLLECTION).get()
  return snap.docs
    .map((d) => mapUser(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => a.email.localeCompare(b.email))
}

export async function findUserByEmail(
  email: string
): Promise<AdminUser | null> {
  const normalized = email.trim().toLowerCase()
  const snap = await getAdminDb()
    .collection(USERS_COLLECTION)
    .where('email', '==', normalized)
    .limit(1)
    .get()
  if (snap.empty) return null
  const d = snap.docs[0]
  return mapUser(d.id, d.data() as Record<string, unknown>)
}

/**
 * Look up one user by email and check the password.
 * No collection-wide scan. Bootstraps the default admin only if the email
 * is missing (empty `users` collection).
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AdminUser | null> {
  let user = await findUserByEmail(email)
  if (!user) {
    await ensureDefaultAdminUser()
    user = await findUserByEmail(email)
  }
  if (!user || !user.active) return null
  if (user.password !== password) return null
  return user
}

export async function createUser(input: AdminUserInput): Promise<string> {
  const email = input.email.trim().toLowerCase()
  const existing = await findUserByEmail(email)
  if (existing) {
    throw new Error('A user with that email already exists.')
  }
  if (!input.password.trim()) {
    throw new Error('Password is required.')
  }

  const role = input.role
  const allowedTabs =
    role === 'admin'
      ? []
      : input.allowedTabs != null
        ? normalizeAllowedTabs(input.allowedTabs, { fallbackToDefault: false })
        : [...DEFAULT_NON_ADMIN_TABS]

  const ref = await getAdminDb().collection(USERS_COLLECTION).add({
    email,
    password: input.password,
    name: input.name.trim() || email,
    role,
    allowedTabs,
    active: input.active !== false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateUser(
  id: string,
  input: Partial<AdminUserInput>
): Promise<void> {
  if (input.email !== undefined) {
    const email = input.email.trim().toLowerCase()
    const existing = await findUserByEmail(email)
    if (existing && existing.id !== id) {
      throw new Error('A user with that email already exists.')
    }
  }

  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (input.email !== undefined) {
    payload.email = input.email.trim().toLowerCase()
  }
  if (input.password !== undefined && input.password.trim()) {
    payload.password = input.password
  }
  if (input.name !== undefined) payload.name = input.name.trim()
  if (input.role !== undefined) payload.role = input.role
  if (input.active !== undefined) payload.active = input.active
  if (input.allowedTabs !== undefined) {
    const role =
      input.role ??
      (await getAdminDb().collection(USERS_COLLECTION).doc(id).get()).data()
        ?.role
    if (role === 'admin') {
      payload.allowedTabs = []
    } else {
      payload.allowedTabs = normalizeAllowedTabs(input.allowedTabs, {
        fallbackToDefault: false,
      })
    }
  }

  await getAdminDb().collection(USERS_COLLECTION).doc(id).update(payload)
}

export async function deleteUser(id: string): Promise<void> {
  await getAdminDb().collection(USERS_COLLECTION).doc(id).delete()
}

/** Create the seeded admin account if the users collection has no admin yet. */
export async function ensureDefaultAdminUser(): Promise<{
  created: boolean
}> {
  const users = await fetchAllUsers()
  if (users.some((u) => u.role === 'admin')) {
    return { created: false }
  }

  const existing = await findUserByEmail(DEFAULT_ADMIN_EMAIL)
  if (existing) {
    if (existing.role !== 'admin' || !existing.active) {
      await updateUser(existing.id, {
        role: 'admin',
        active: true,
        password: existing.password || DEFAULT_ADMIN_PASSWORD,
        name: existing.name || DEFAULT_ADMIN_NAME,
        allowedTabs: [],
      })
    }
    return { created: false }
  }

  await createUser({
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    name: DEFAULT_ADMIN_NAME,
    role: 'admin',
    allowedTabs: [],
    active: true,
  })
  return { created: true }
}
