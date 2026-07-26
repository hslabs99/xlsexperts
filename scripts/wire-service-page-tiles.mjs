import fs from 'fs'
import path from 'path'

const HEADINGS = {
  'ai-workflow-and-business-process-automation': {
    heading: 'Automation examples',
    subheading:
      'AI workflow and business process automation projects for New Zealand organisations.',
  },
  'excel-dashboard-development': {
    heading: 'Dashboard examples',
    subheading:
      'Real dashboards built for New Zealand businesses and leadership teams.',
  },
  'excel-financial-modelling': {
    heading: 'Financial modelling projects we have delivered',
    subheading:
      'A selection of models built for New Zealand businesses and investors.',
  },
  'excel-spreadsheet-development': {
    heading: 'What we build for NZ businesses',
    subheading:
      'Real examples of spreadsheet development projects delivered across New Zealand.',
  },
  'excel-vba-macro-development': {
    heading: 'VBA and macro projects we have delivered in NZ',
    subheading:
      'A sample of real automation work across New Zealand industries.',
  },
  'google-sheets-development': {
    heading: 'Google Sheets projects we have built',
    subheading: 'Custom solutions for New Zealand businesses on Google Workspace.',
  },
  'power-query-consulting': {
    heading: 'Power Query projects we have delivered',
    subheading:
      'Data pipeline and transformation work for New Zealand organisations.',
  },
  'spreadsheet-auditing': {
    heading: 'Spreadsheet audit case studies',
    subheading:
      'Issues found — and prevented — through independent spreadsheet review.',
  },
  'web-applications': {
    heading: 'Web application examples',
    subheading:
      'Hybrid and full web solutions delivered for New Zealand organisations.',
  },
}

for (const d of Object.keys(HEADINGS)) {
  const file = path.join('app', d, 'page.tsx')
  let s = fs.readFileSync(file, 'utf8')

  const start = s.indexOf('const examples = [')
  if (start < 0) {
    console.log('skip (no examples):', d)
    continue
  }
  let i = start + 17
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
  let cutEnd = end + 1
  while (s[cutEnd] === '\r' || s[cutEnd] === '\n') cutEnd++
  s = s.slice(0, start) + s.slice(cutEnd)

  if (!s.includes("from '@/lib/service-page-tiles'")) {
    s = s.replace(
      "import { Contact } from '@/components/contact'",
      "import { Contact } from '@/components/contact'\nimport { ServicePageExamples } from '@/components/service-page-examples'\nimport { getServicePageTiles } from '@/lib/service-page-tiles'"
    )
  }

  if (!s.includes('const exampleTiles = await getServicePageTiles')) {
    s = s.replace(
      /export default function (\w+)\(\) \{/,
      `export default async function $1() {\n  const exampleTiles = await getServicePageTiles('/${d}')`
    )
  }

  const sectionRe =
    /        <section className="bg-gray-50 py-20">\s*<div className="mx-auto max-w-5xl px-6">[\s\S]*?\{examples\.map\([\s\S]*?<\/section>/

  const { heading, subheading } = HEADINGS[d]
  const replacement = `        <ServicePageExamples
          heading=${JSON.stringify(heading)}
          subheading=${JSON.stringify(subheading)}
          tiles={exampleTiles}
        />`

  if (!sectionRe.test(s)) {
    console.log('WARN: section pattern miss:', d)
  } else {
    s = s.replace(sectionRe, replacement)
  }

  fs.writeFileSync(file, s)
  console.log('updated', d)
}
