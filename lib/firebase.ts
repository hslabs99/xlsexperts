import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let firestoreInitialized = false

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp()
  }
  return initializeApp(firebaseConfig)
}

export function getDb(): Firestore {
  const app = getFirebaseApp()
  // Serverless (Cloud Run / App Hosting): prefer long-polling over WebChannel
  // so Firestore writes don't hang forever on stuck streaming connections.
  if (typeof window === 'undefined' && !firestoreInitialized) {
    try {
      initializeFirestore(app, {
        experimentalForceLongPolling: true,
      })
    } catch {
      // Already initialized in this isolate — fall through to getFirestore.
    }
    firestoreInitialized = true
  }
  return getFirestore(app)
}

export function getFirebaseStorage(): FirebaseStorage {
  const app = getFirebaseApp()
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim()
  // Explicit bucket avoids SDK defaulting to a non-existent *.appspot.com name.
  if (bucket) {
    const gs = bucket.startsWith('gs://') ? bucket : `gs://${bucket}`
    return getStorage(app, gs)
  }
  return getStorage(app)
}

/** Firestore collection for bookable appointment slots */
export const BOOKING_SLOTS_COLLECTION = 'Booking Slots'

/** Firestore collection for SendGrid enquiry email templates */
export const EMAIL_TEMPLATES_COLLECTION = 'Email Templates'

/** Firestore collection for website enquiries (standard + discovery) */
export const ENQUIRIES_COLLECTION = 'enquiries'

/** Firestore collection for editable site copy (confirmation page, etc.) */
export const SITE_CONTENT_COLLECTION = 'Site Content'

/** Document id for the standard-enquiry confirmation messages */
export const CONFIRMATION_CONTENT_DOC_ID = 'contact-confirmation'

/** Document id for site analytics / marketing tag snippets */
export const SITE_TAGS_DOC_ID = 'analytics-tags'

/** Firestore collection for admin panel user accounts */
export const USERS_COLLECTION = 'users'

/** Firestore collection for blog posts */
export const BLOG_POSTS_COLLECTION = 'blogPosts'

/** Firestore collection for case studies */
export const CASE_STUDIES_COLLECTION = 'caseStudies'

/**
 * Site Content doc: pre-rendered homepage case studies (usually 4 cards).
 * Homepage reads this single document instead of querying the collection.
 */
export const CASE_STUDIES_HOME_DOC_ID = 'case-studies-home'
