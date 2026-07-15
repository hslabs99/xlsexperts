import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
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

/**
 * GET /api/admin/firebase-debug
 * Safe diagnostics for App Hosting → Firebase (no secrets, no passwords).
 */
export async function GET() {
  const checkedAt = new Date().toISOString()

  const env = {
    nextPublic: [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
    ].map(envFlag),
    appHostingHints: [
      'FIREBASE_CONFIG',
      'FIREBASE_WEBAPP_CONFIG',
      'GOOGLE_CLOUD_PROJECT',
      'GCLOUD_PROJECT',
      'K_SERVICE',
    ].map(envFlag),
    projectId:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
      process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
      process.env.GCLOUD_PROJECT?.trim() ||
      null,
  }

  let adminInit: { ok: boolean; error?: string } = { ok: false }
  let firestore: {
    ok: boolean
    error?: string
    elapsedMs?: number
    users?: number
    blogPosts?: number
    bookingSlots?: number
  } = { ok: false }

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
      'firestorePing'
    )

    firestore = {
      ok: true,
      elapsedMs: Date.now() - started,
      users: usersSnap.size,
      blogPosts: blogsSnap.size,
      bookingSlots: slotsSnap.size,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!adminInit.ok) {
      adminInit = { ok: false, error: message }
    }
    firestore = { ok: false, error: message }
  }

  const nextPublicReady = env.nextPublic.every((e) => e.set)
  const cloudProjectReady = env.appHostingHints.some(
    (e) =>
      (e.name === 'GOOGLE_CLOUD_PROJECT' ||
        e.name === 'GCLOUD_PROJECT' ||
        e.name === 'K_SERVICE' ||
        e.name === 'FIREBASE_CONFIG') &&
      e.set
  )

  return NextResponse.json({
    ok: firestore.ok,
    checkedAt,
    summary: {
      firestoreReachable: firestore.ok,
      nextPublicFirebaseEnvComplete: nextPublicReady,
      appHostingCloudIdentityPresent: cloudProjectReady,
      note: nextPublicReady
        ? 'NEXT_PUBLIC_FIREBASE_* present (good for client SDK / builds).'
        : 'NEXT_PUBLIC_FIREBASE_* incomplete — client SDK and some local tools may fail.',
      adminNote:
        'Server routes should use firebase-admin (ADC on App Hosting). Browser Firestore SDK on Cloud Run hangs.',
    },
    env,
    adminInit,
    firestore,
  })
}
