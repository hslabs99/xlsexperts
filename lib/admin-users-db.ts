import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type UpdateData,
} from 'firebase/firestore'
import { USERS_COLLECTION, getDb } from '@/lib/firebase'
import {
  ADMIN_USER_ROLES,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_NAME,
  DEFAULT_ADMIN_PASSWORD,
  type AdminUser,
  type AdminUserInput,
  type AdminUserRole,
} from '@/lib/admin-users'

function mapUser(id: string, data: DocumentData): AdminUser {
  const role: AdminUserRole = ADMIN_USER_ROLES.includes(data.role)
    ? (data.role as AdminUserRole)
    : 'marketing'

  return {
    id,
    email: String(data.email ?? '').trim().toLowerCase(),
    password: String(data.password ?? ''),
    name: String(data.name ?? ''),
    role,
    active: data.active !== false,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  }
}

export async function fetchAllUsers(): Promise<AdminUser[]> {
  const snap = await getDocs(collection(getDb(), USERS_COLLECTION))
  return snap.docs
    .map((d) => mapUser(d.id, d.data()))
    .sort((a, b) => a.email.localeCompare(b.email))
}

export async function findUserByEmail(
  email: string
): Promise<AdminUser | null> {
  const normalized = email.trim().toLowerCase()
  const snap = await getDocs(
    query(collection(getDb(), USERS_COLLECTION), where('email', '==', normalized))
  )
  if (snap.empty) return null
  const d = snap.docs[0]
  return mapUser(d.id, d.data())
}

/**
 * Plain-text password check against Firestore users.
 *
 * Looks up the email first (one indexed query). Only boots the default admin
 * when that lookup finds nothing — avoids a full collection scan on every login.
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AdminUser | null> {
  let user = await findUserByEmail(email)
  if (!user) {
    // Empty / unseeded `users` collection — create the default admin once.
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

  const ref = await addDoc(collection(getDb(), USERS_COLLECTION), {
    email,
    password: input.password,
    name: input.name.trim() || email,
    role: input.role,
    active: input.active !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
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

  const payload: UpdateData<DocumentData> = {
    updatedAt: serverTimestamp(),
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

  await updateDoc(doc(getDb(), USERS_COLLECTION, id), payload)
}

export async function deleteUser(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), USERS_COLLECTION, id))
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
      })
    }
    return { created: false }
  }

  await createUser({
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    name: DEFAULT_ADMIN_NAME,
    role: 'admin',
    active: true,
  })
  return { created: true }
}
