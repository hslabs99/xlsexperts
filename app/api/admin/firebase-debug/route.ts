import { NextResponse } from 'next/server'
import {
  getAdminDb,
  getFirebaseApiKey,
  getFirebaseProjectId,
  hasFirebaseWebConfigKeys,
} from '@/lib/firebase-admin'
import {
  BLOG_POSTS_COLLECTION,
  BOOKING_SLOTS_COLLECTION,
  USERS_COLLECTION,
} from '@/lib/firebase'
import { withTimeout } from '@/lib/with-timeout'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function envFlag(name: string): { name: string; set: boolean; length: number } {
  const value = process.env[name]
  return {
    name,
    set: Boolean(value && String(value).trim()),
    length: value ? String(value).trim().length : 0,
  }
}

const FIREBASE_KEY_NAMES = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const

/**
 * GET /api/admin/firebase-debug
 *
 * Confirms Firebase keys are in the runtime env, then proves datastore access.
 * Secrets are never returned — only set/missing + safe access results.
 */
export async function GET() {
  const checkedAt = new Date().toISOString()
  const firebaseKeys = FIREBASE_KEY_NAMES.map(envFlag)
  const keysLocated = hasFirebaseWebConfigKeys()
  const apiKeyLocated = Boolean(getFirebaseApiKey())

  let projectId: string | null = null
  try {
    projectId = getFirebaseProjectId()
  } catch {
    projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
      process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
      process.env.GCLOUD_PROJECT?.trim() ||
      null
  }

  const access: {
    located: boolean
    via: 'firebase-admin' | 'none'
    error?: string
    elapsedMs?: number
    users?: number
    blogPosts?: number
    bookingSlots?: number
  } = { located: false, via: 'none' }

  let adminInit: { ok: boolean; error?: string } = { ok: false }

  if (!keysLocated || !apiKeyLocated) {
    access.error =
      'Firebase keys not located in App Hosting environment. Without the API key (and full NEXT_PUBLIC_FIREBASE_* set) this app cannot access the datastore.'
  } else {
    try {
      const db = getAdminDb()
      adminInit = { ok: true }

      const started = Date.now()
      const [usersSnap, blogsSnap, slotsSnap] = await withTimeout(
        Promise.all([
          db.collection(USERS_COLLECTION).limit(5).get(),
          db.collection(BLOG_POSTS_COLLECTION).limit(5).get(),
          db.collection(BOOKING_SLOTS_COLLECTION).limit(5).get(),
        ]),
        12_000,
        'firestoreAccess'
      )

      access.located = true
      access.via = 'firebase-admin'
      access.elapsedMs = Date.now() - started
      access.users = usersSnap.size
      access.blogPosts = blogsSnap.size
      access.bookingSlots = slotsSnap.size
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      adminInit = { ok: false, error: message }
      access.error = message
    }
  }

  // Optional REST probe: same API key the web SDK uses (proves key is accepted).
  let restProbe: {
    attempted: boolean
    ok: boolean
    status?: number
    error?: string
  } = { attempted: false, ok: false }

  const apiKey = getFirebaseApiKey()
  if (apiKey && projectId) {
    restProbe.attempted = true
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
        projectId
      )}/databases/(default)/documents/${encodeURIComponent(
        USERS_COLLECTION
      )}?pageSize=1&key=${encodeURIComponent(apiKey)}`
      const res = await withTimeout(
        fetch(url, { headers: { Accept: 'application/json' } }),
        10_000,
        'firestoreRestProbe'
      )
      restProbe.status = res.status
      restProbe.ok = res.ok || res.status === 403
      // 403 can still mean “key reached Firestore” (rules/API), not “key missing”.
      if (!restProbe.ok) {
        const body = await res.text().catch(() => '')
        restProbe.error = `HTTP ${res.status}${body ? `: ${body.slice(0, 180)}` : ''}`
      }
    } catch (error) {
      restProbe.error =
        error instanceof Error ? error.message : String(error)
    }
  }

  return NextResponse.json({
    ok: access.located,
    checkedAt,
    summary: {
      /** Keys found in runtime env — required before any datastore open. */
      firebaseKeysLocated: keysLocated,
      firebaseApiKeyLocated: apiKeyLocated,
      /** Live read succeeded — we have located access to the store. */
      datastoreAccessLocated: access.located,
      accessVia: access.via,
      projectId,
      note: keysLocated
        ? 'Firebase keys located in environment. Datastore access uses those keys to identify the project.'
        : 'Firebase keys NOT located. Without NEXT_PUBLIC_FIREBASE_* (especially the API key) you cannot access the datastore from App Hosting.',
      rule: 'No Firebase key in Environment → no datastore access.',
    },
    env: {
      projectId,
      firebaseKeys,
      appHostingHints: [
        'FIREBASE_CONFIG',
        'FIREBASE_WEBAPP_CONFIG',
        'GOOGLE_CLOUD_PROJECT',
        'GCLOUD_PROJECT',
        'K_SERVICE',
      ].map(envFlag),
    },
    adminInit,
    access,
    restProbe,
  })
}
