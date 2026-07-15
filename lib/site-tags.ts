/**
 * Marketing / analytics tag configuration for the public site.
 * Stored in Firestore Site Content / analytics-tags.
 */

export interface SiteTagsContent {
  /** When false, nothing is injected on the public site. */
  enabled: boolean
  /** Google Tag Manager container id, e.g. GTM-XXXXXXX */
  googleTagManagerId: string
  /** Google Analytics 4 measurement id, e.g. G-XXXXXXXXXX */
  googleAnalyticsId: string
  /**
   * Free-form HTML/scripts for <head> (Meta Pixel, LinkedIn Insight, etc.).
   * Paste vendor snippets as provided — including <script> tags is fine.
   */
  headHtml: string
  /**
   * Free-form HTML for the start of <body> (e.g. GTM <noscript> iframe).
   */
  bodyHtml: string
}

export const DEFAULT_SITE_TAGS: SiteTagsContent = {
  enabled: false,
  googleTagManagerId: '',
  googleAnalyticsId: '',
  headHtml: '',
  bodyHtml: '',
}

export function normalizeSiteTags(raw: unknown): SiteTagsContent {
  const data =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    enabled: Boolean(data.enabled),
    googleTagManagerId: String(data.googleTagManagerId ?? '')
      .trim()
      .toUpperCase(),
    googleAnalyticsId: String(data.googleAnalyticsId ?? '')
      .trim()
      .toUpperCase(),
    headHtml: String(data.headHtml ?? ''),
    bodyHtml: String(data.bodyHtml ?? ''),
  }
}

/** Basic sanity checks for common Google id formats (empty is allowed). */
export function validateSiteTags(
  tags: SiteTagsContent
): string | null {
  const gtm = tags.googleTagManagerId.trim()
  if (gtm && !/^GTM-[A-Z0-9]+$/i.test(gtm)) {
    return 'Google Tag Manager ID should look like GTM-XXXXXXX.'
  }
  const ga = tags.googleAnalyticsId.trim()
  if (ga && !/^G-[A-Z0-9]+$/i.test(ga)) {
    return 'Google Analytics ID should look like G-XXXXXXXXXX.'
  }
  return null
}
