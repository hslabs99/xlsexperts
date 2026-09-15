/**
 * PUBLISHED domain → region bindings — imported by proxy (no Firestore).
 * Edit in Admin → Settings → Domains, then click Publish to regenerate this file.
 *
 * Generated at 2026-09-13T12:16:41.458Z
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedDomainRegionsFile } from '@/lib/domain-regions'

const published = {
  "version": 1,
  "publishedAt": "2026-09-13T12:16:41.458Z",
  "regions": {
    "nz": {
      "hosts": [
        "xlsexperts.co.nz"
      ],
      "origin": "https://www.xlsexperts.co.nz"
    },
    "intl": {
      "hosts": [
        "xlsexperts.com"
      ],
      "origin": "https://www.xlsexperts.com"
    },
    "uk": {
      "hosts": [
        "xlsexperts.co.uk"
      ],
      "origin": "https://www.xlsexperts.co.uk"
    }
  }
} as PublishedDomainRegionsFile

export const PUBLISHED_DOMAIN_REGIONS = published

export default published
