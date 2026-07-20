import fs from 'fs'
import path from 'path'

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const dirs = [
  'ai-workflow-automation',
  'business-process-automation',
  'enterprise-excel-applications',
  'excel-dashboard-development',
  'excel-financial-modelling',
  'excel-integrations',
  'excel-macro-automation',
  'excel-spreadsheet-development',
  'excel-sql-integration',
  'excel-vba-development',
  'google-sheets-development',
  'power-query-consulting',
  'spreadsheet-auditing',
  'web-applications',
]

const bySlug = new Map()
let order = 0

for (const d of dirs) {
  const href = '/' + d
  const s = fs.readFileSync(path.join('app', d, 'page.tsx'), 'utf8')
  let start = s.indexOf('const examples = [')
  let name = 'examples'
  if (start < 0) {
    start = s.indexOf('const legacyExamples = [')
    name = 'legacyExamples'
  }
  if (start < 0) continue
  let i = start + (name === 'examples' ? 17 : 23)
  let depth = 0
  let end = -1
  for (; i < s.length; i++) {
    if (s[i] === '[') depth++
    else if (s[i] === ']') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  const arrSrc = s.slice(start, end + 1)
  const arr = Function(
    '"use strict"; return (' + arrSrc.replace(/^const \w+ = /, '') + ')'
  )()
  for (const item of arr) {
    const tag = item.tag || item.platform || ''
    const title = item.title || item.scenario || ''
    const detail = item.detail || ''
    let slug = slugify(title)
    if (bySlug.has(slug)) {
      const existing = bySlug.get(slug)
      if (existing.detail === detail && existing.tag === tag) {
        if (!existing.serviceHrefs.includes(href)) {
          existing.serviceHrefs.push(href)
        }
        continue
      }
      slug = slugify(`${title}-${d}`)
    }
    bySlug.set(slug, {
      slug,
      tag,
      title,
      detail,
      serviceHrefs: [href],
      sortOrder: order++,
    })
  }
}

const items = [...bySlug.values()]
const out = `/**
 * Frozen archive of service-page example tiles (case-study style cards).
 * Source: static examples arrays formerly inline on each service landing page.
 * Used to seed Firestore \`servicePageTiles\` and as public fallback when CMS is empty.
 */

import type { ServicePageTileArchiveItem } from '@/lib/service-page-tiles-shared'

export const SERVICE_PAGE_TILES_ARCHIVE: readonly ServicePageTileArchiveItem[] = ${JSON.stringify(items, null, 2)} as const
`
fs.writeFileSync('lib/service-page-tiles-archive.ts', out)
console.log('Wrote', items.length, 'tiles')
