import fs from 'fs'
import path from 'path'

const dirs = [
  'ai-workflow-and-business-process-automation',
  'excel-dashboard-development',
  'excel-financial-modelling',
  'excel-spreadsheet-development',
  'excel-vba-macro-development',
  'google-sheets-development',
  'power-query-consulting',
  'spreadsheet-auditing',
  'web-applications',
]

for (const d of dirs) {
  const s = fs.readFileSync(path.join('app', d, 'page.tsx'), 'utf8')
  const idx = s.indexOf('{examples.map')
  const before = s.lastIndexOf('<h2', idx)
  const chunk = s.slice(before, idx)
  const h = chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)
  const p = chunk.match(/<p className="mb-12[^"]*"[^>]*>([\s\S]*?)<\/p>/)
  console.log(JSON.stringify({
    d,
    heading: (h?.[1] || '').replace(/\s+/g, ' ').trim(),
    subheading: (p?.[1] || '').replace(/\s+/g, ' ').trim(),
  }))
}
