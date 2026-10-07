/**
 * PUBLISHED region word aliases — applied when serving UK and International copy.
 * Edit in Admin → CMS → Aliases, then click Publish to regenerate this file.
 *
 * Generated at 2026-10-02T00:09:20.941Z
 * Do not edit by hand; Publish overwrites it.
 */

import type { PublishedRegionAliasesFile } from '@/lib/region-aliases'

const published = {
  "version": 1,
  "publishedAt": "2026-10-02T00:09:20.941Z",
  "aliases": [
    {
      "id": "gst",
      "term": "GST",
      "match": "word",
      "uk": "VAT",
      "intl": "Sales Tax",
      "enabled": true
    },
    {
      "id": "xero",
      "term": "Xero",
      "match": "word",
      "uk": "QuickBooks",
      "intl": "QuickBooks",
      "enabled": true
    }
  ]
} as PublishedRegionAliasesFile

export const PUBLISHED_REGION_ALIASES = published

export default published
