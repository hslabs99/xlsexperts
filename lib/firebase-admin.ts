import 'server-only'

import {
  applicationDefault,
  getApps,
  initializeApp,
  type App,
} from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

/**
 * Server Firestore via Firebase Admin SDK.
 *
 * The App Hosting Environment must include the Firebase web config
 * (`NEXT_PUBLIC_FIREBASE_*`). Those keys locate which project/database to open.
 * Without them this process cannot access the datastore.
 *
 * Credential on App Hosting / Cloud Run comes from the platform (ADC). The web
 * API key still must be present in env — that is how this app targets Firebase.
 */
export function getFirebaseProjectId(): string {
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    process.env.GCLOUD_PROJECT?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim()

  if (!projectId) {
    throw new Error(
      'Firebase keys missing: set NEXT_PUBLIC_FIREBASE_PROJECT_ID (and the other NEXT_PUBLIC_FIREBASE_* keys) in App Hosting Environment. Without them the datastore cannot be located.'
    )
  }
  return projectId
}

export function getFirebaseApiKey(): string | null {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim()
  return key || null
}

/** True when the full web Firebase config block is present in process env. */
export function hasFirebaseWebConfigKeys(): boolean {
  return [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ].every((name) => Boolean(process.env[name]?.trim()))
}

function requireFirebaseKeys(): void {
  if (!hasFirebaseWebConfigKeys() || !getFirebaseApiKey()) {
    throw new Error(
      'Firebase keys not found in environment. Add all NEXT_PUBLIC_FIREBASE_* values in App Hosting → Environment. Without the key you cannot access the datastore.'
    )
  }
}

export function getAdminApp(): App {
  const existing = getApps()[0]
  if (existing) return existing

  requireFirebaseKeys()
  const projectId = getFirebaseProjectId()
  const storageBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || undefined

  // App Hosting / Cloud Run: platform ADC + project from your Firebase keys.
  if (
    process.env.FIREBASE_CONFIG ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.K_SERVICE
  ) {
    return initializeApp({ projectId, storageBucket })
  }

  try {
    return initializeApp({
      credential: applicationDefault(),
      projectId,
      storageBucket,
    })
  } catch {
    return initializeApp({ projectId, storageBucket })
  }
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp())
}
