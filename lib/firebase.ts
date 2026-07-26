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

/**
 * Document id for site analytics / marketing tag snippets.
 * Shape: `{ markets: { nz: SiteTagsContent, intl: SiteTagsContent } }`.
 * Legacy flat docs (pre market-split) are treated as NZ and copied on read.
 */
export const SITE_TAGS_DOC_ID = 'analytics-tags'

/**
 * Document id for SEO crawl documents (robots, llms, sitemap extras, verification).
 * Shape: `{ markets: { nz: CrawlDocsContent, intl: CrawlDocsContent } }`.
 * Legacy flat docs are treated as NZ and copied on read.
 */
export const CRAWL_DOCS_DOC_ID = 'crawl-documents'

/** Firestore collection for admin panel user accounts */
export const USERS_COLLECTION = 'users'

/** Firestore collection for blog posts */
export const BLOG_POSTS_COLLECTION = 'blogPosts'

/**
 * Queue of Wix posts to harvest into draft blogPosts.
 * Doc id = slug. Synced from `lib/wix-blog-seed-urls.ts`.
 */
export const BLOG_SEED_TODO_COLLECTION = 'blog_seed_todo'

/** Firestore collection for case studies */
export const CASE_STUDIES_COLLECTION = 'caseStudies'

/**
 * Firestore collection for example / case-study tiles on service landing pages.
 * Not used on the homepage.
 */
export const SERVICE_PAGE_TILES_COLLECTION = 'servicePageTiles'

/**
 * Site Content doc: pre-rendered homepage case studies (usually 4 cards).
 * Homepage reads this single document instead of querying the collection.
 */
export const CASE_STUDIES_HOME_DOC_ID = 'case-studies-home'

/**
 * Site Content doc: draft NZ / International market copy.
 * Public site reads `data/market-copy.generated.ts` after Publish — not this doc.
 */
export const MARKET_COPY_DOC_ID = 'market-copy'

/**
 * Site Content doc: floating “Find out about” quick-nav labels + page links.
 */
export const FIND_OUT_ABOUT_DOC_ID = 'find-out-about'

/**
 * Site Content doc: live chat timeout, visitor copy, and admin quick replies.
 */
export const CHAT_SETTINGS_DOC_ID = 'chat-settings'

/** Firestore collection for live chat sessions (messages in `messages` subcollection) */
export const CHATS_COLLECTION = 'chats'
