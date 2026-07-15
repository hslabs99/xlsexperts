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
 * On Firebase App Hosting / Cloud Run, `initializeApp()` with no args is the
 * supported path (ADC + project are injected). The browser Firebase JS SDK
 * does not belong in API routes — it hangs under Cloud Run.
 */
export function getAdminApp(): App {
  const existing = getApps()[0]
  if (existing) return existing

  // App Hosting / Cloud Run / Cloud Functions
  if (
    process.env.FIREBASE_CONFIG ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.K_SERVICE
  ) {
    return initializeApp()
  }

  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    process.env.GCLOUD_PROJECT?.trim()
  if (!projectId) {
    throw new Error(
      'Firebase Admin: set NEXT_PUBLIC_FIREBASE_PROJECT_ID or run on App Hosting'
    )
  }

  try {
    return initializeApp({
      credential: applicationDefault(),
      projectId,
    })
  } catch {
    // Last resort for local experiments without ADC
    return initializeApp({ projectId })
  }
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp())
}
