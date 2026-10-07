/**
 * Industries section — code catalog for page bodies, nav, and Pages CMS defaults.
 * H1, hero intro, meta, keywords and FAQs are overlaid per market in Pages CMS,
 * the same way services and solutions work. Longer sections stay in this file.
 */

import type { MarketId } from '@/lib/market'
import { servicePages } from '@/lib/service-pages'
import { solutionPages } from '@/lib/solutions'

export const ALL_INDUSTRIES_HREF = '/industries'

export type IndustryIconKey =
  | 'agriculture'
  | 'finance'
  | 'insurance'
  | 'engineering'
  | 'energy'
  | 'construction'
  | 'manufacturing'
  | 'fmcg'
  | 'marine'
  | 'timber'
  | 'field'
  | 'hospitality'
  | 'facilities'

export type IndustryFaq = { q: string; a: string }

export type IndustrySeo = {
  h1: string
  seoTitle: string
  metaDescription: string
  keywords: string[]
  introLead: string
}

type MarketText = { nz?: string; uk?: string; intl?: string }
type MarketList = { nz: string[]; uk?: string[]; intl?: string[] }

export type IndustryPage = {
  slug: string
  href: string
  name: string
  navLabel: string
  order: number
  icon: IndustryIconKey
  caseStudySectors: string[]
  relatedServices: string[]
  relatedSolutions: string[]
  intro: string
  challenges: string[]
  solutions: { title: string; href: string }[]
  ai: { heading: string; intro: string; bullets: string[] }
  tools: MarketList
  compliance?: MarketText
  faqs: IndustryFaq[]
  ctaHeading: string
  seo: Record<MarketId, IndustrySeo>
  /** Extra reading shown only on the listed markets. */
  extraLinks?: { href: string; label: string; markets: MarketId[] }[]
}

export type IndustryCmsFields = {
  h1: string
  heroIntro: string
  metaTitle: string
  metaDescription: string
  keywords: string
  faqs: IndustryFaq[]
}

const PROOF: Record<MarketId, string> = {
  nz: 'Trusted by New Zealand organisations from national insurers to specialist manufacturers.',
  uk: 'Delivered remotely for UK and international teams, with overlap into UK business hours.',
  intl: 'Delivered remotely for US and international teams, with overlap into US business hours.',
}

const INDEX_INTRO =
  "We've built Excel, VBA, custom application and AI-assisted solutions for businesses in almost every sector. These pages show the problems we solve most often in each industry and the systems we build to fix them. Don't see your industry? The challenges are usually more similar than different. Talk to us."

const INDEX_META =
  'Excel automation, VBA, custom apps and AI workflows for finance, engineering, construction, manufacturing, hospitality and more. See how we help.'

const US_SPELLING: Array<[RegExp, string]> = [
  [/\banalysing\b/gi, 'analyzing'],
  [/\banalysed\b/gi, 'analyzed'],
  [/\banalyse\b/gi, 'analyze'],
  [/\borganisations\b/gi, 'organizations'],
  [/\borganisation\b/gi, 'organization'],
  [/\bmodelling\b/gi, 'modeling'],
  [/\blabour\b/gi, 'labor'],
  [/\boptimised\b/gi, 'optimized'],
  [/\boptimise\b/gi, 'optimize'],
  [/\boptimisation\b/gi, 'optimization'],
  [/\bspecialised\b/gi, 'specialized'],
  [/\bsummarised\b/gi, 'summarized'],
  [/\bsummarise\b/gi, 'summarize'],
  [/\bstandardise\b/gi, 'standardize'],
  [/\bformalise\b/gi, 'formalize'],
  [/\bcategorise\b/gi, 'categorize'],
  [/\bjudgement\b/gi, 'judgment'],
  [/\bhectares\b/gi, 'acres'],
  [/\bhectare\b/gi, 'acre'],
]

/** US spelling for shared body copy on .com. Explicit regional fields are left as written. */
export function americanize(text: string): string {
  return US_SPELLING.reduce(
    (out, [pattern, replacement]) =>
      out.replace(pattern, (match) =>
        match[0] === match[0].toUpperCase()
          ? replacement[0].toUpperCase() + replacement.slice(1)
          : replacement,
      ),
    text,
  )
}

export function presentIndustryText(text: string, market: MarketId): string {
  return market === 'intl' ? americanize(text) : text
}

function pickText(value: MarketText | undefined, market: MarketId): string {
  if (!value) return ''
  if (market === 'uk') return value.uk ?? value.nz ?? ''
  if (market === 'intl') return value.intl ?? value.nz ?? ''
  return value.nz ?? ''
}

function pickList(value: MarketList, market: MarketId): string[] {
  if (market === 'uk') return value.uk ?? value.nz
  if (market === 'intl') return value.intl ?? value.nz
  return value.nz
}

function regionTitles(stem: string): Record<MarketId, string> {
  return {
    intl: `${stem} US`,
    uk: `${stem} UK`,
    nz: `${stem} NZ`,
  }
}

function seoSet(input: {
  introLead: string
  metaDescription: string | Record<MarketId, string>
  titles: Record<MarketId, string>
  h1: Record<MarketId, string> | string
  keywords: Record<MarketId, string[]>
}): Record<MarketId, IndustrySeo> {
  const h1For = (market: MarketId) =>
    typeof input.h1 === 'string' ? input.h1 : input.h1[market]
  const metaFor = (market: MarketId) =>
    typeof input.metaDescription === 'string'
      ? input.metaDescription
      : input.metaDescription[market]
  return {
    nz: pack('nz'),
    uk: pack('uk'),
    intl: pack('intl'),
  }

  function pack(market: MarketId): IndustrySeo {
    return {
      h1: h1For(market),
      seoTitle: input.titles[market],
      metaDescription: metaFor(market),
      keywords: input.keywords[market],
      introLead: input.introLead,
    }
  }
}

function industry(page: Omit<IndustryPage, 'href'> & { slug: string }): IndustryPage {
  return { ...page, href: `${ALL_INDUSTRIES_HREF}/${page.slug}` }
}

export const industryPages: readonly IndustryPage[] = [
  industry({
    slug: 'finance-accounting',
    name: 'Finance & Accounting',
    navLabel: 'Finance & Accounting',
    order: 1,
    icon: 'finance',
    caseStudySectors: ['Financial Services'],
    relatedServices: [
      'excel-financial-modelling',
      'excel-dashboard-development',
      'excel-integrations',
      'spreadsheet-auditing',
      'power-query-consulting',
    ],
    relatedSolutions: [
      'dashboards-business-intelligence',
      'project-costing-financial-modelling',
    ],
    intro:
      'Most finance and accounting teams already have their ledger and payroll systems. The friction is everything around them: exports pasted into workbooks, reconciliations checked by eye, management packs rebuilt every month, and models only one person understands.\n\nWe build governed Excel models, VBA-driven workflows and lightweight custom applications that connect to your accounting system, automate the repeatable steps and keep the logic transparent and auditable. Where it adds value, we add AI-assisted checks that flag anomalies before they reach the report.',
    challenges: [
      'Month-end close takes days – manual exports, copy-paste and rework every cycle.',
      'Reconciliations depend on visual checking and tribal knowledge.',
      'Management reports and board packs are rebuilt by hand each month.',
      'Fragile, undocumented models with broken links and hard-coded numbers.',
      'Budget and forecast versions scattered across emailed workbooks.',
    ],
    solutions: [
      {
        title: 'Automated month-end reporting packs',
        href: '/excel-dashboard-development',
      },
      {
        title: 'Bank, ledger and intercompany reconciliation tools',
        href: '/excel-vba-macro-development',
      },
      {
        title: 'Budgeting, forecasting and scenario models',
        href: '/excel-financial-modelling',
      },
      {
        title: 'Live connections to your accounting system and databases',
        href: '/excel-integrations',
      },
      {
        title: 'Model reviews and spreadsheet risk audits',
        href: '/spreadsheet-auditing',
      },
    ],
    ai: {
      heading: 'Where AI fits in finance',
      intro: 'AI works best here as a second set of eyes, not a black box.',
      bullets: [
        'Flag unusual transactions and variances before sign-off',
        'Draft variance commentary for management reports for a human to review',
        'Extract invoice and statement data from PDFs into structured tables',
      ],
    },
    tools: {
      intl: ['QuickBooks', 'NetSuite', 'Sage Intacct', 'Bill.com', 'SQL Server', 'Power BI'],
      uk: ['Xero', 'Sage', 'QuickBooks', 'Dext', 'SQL Server', 'Power BI'],
      nz: ['Xero', 'MYOB', 'Dext', 'SQL Server', 'Power BI'],
    },
    compliance: {
      intl: 'Built with audit trails and review steps that support SOX-style internal controls.',
      uk: 'Supports Making Tax Digital-ready workflows alongside your accounting software.',
      nz: 'Built around GST periods and IRD reporting cycles.',
    },
    faqs: [
      {
        q: 'Can you automate our month-end reporting without replacing our accounting system?',
        a: 'Yes. We connect Excel to your existing system, automate the data pull and build the report pack around it, so your ledger stays the source of truth.',
      },
      {
        q: 'Do you fix existing financial models or only build new ones?',
        a: 'Both. Many projects start with a review of an existing model, then targeted fixes to structure, formulas and controls.',
      },
      {
        q: 'How do you keep models auditable?',
        a: 'Clear input, calculation and output separation, documented logic, version control and check totals so reviewers can trace every number.',
      },
      {
        q: 'Is AI safe to use with financial data?',
        a: 'We use AI for review and extraction tasks with human sign-off, and agree data-handling rules with you before anything is processed.',
      },
    ],
    ctaHeading: 'Shorten your close and trust your numbers',
    seo: seoSet({
      introLead:
        'Finance teams live in Excel. We make that time count: fewer manual steps, fewer errors, faster close.',
      metaDescription:
        'Automate month-end, reconciliations and management reporting. Custom Excel models, VBA workflows and AI-assisted checks for finance and accounting teams.',
      titles: regionTitles('Excel Automation for Finance & Accounting'),
      h1: {
        nz: 'Excel automation & financial modelling for finance and accounting teams',
        uk: 'Excel automation & financial modelling for finance and accounting teams',
        intl: 'Excel automation & financial modeling for finance and accounting teams',
      },
      keywords: {
        intl: [
          'excel automation for accountants',
          'financial modeling consultant',
          'month end close automation excel',
          'excel consultant for finance teams',
        ],
        uk: [
          'excel automation for accountants uk',
          'financial modelling consultant uk',
          'month end automation excel',
        ],
        nz: [
          'excel consultant for accountants nz',
          'financial modelling nz',
          'month end reporting automation nz',
        ],
      },
    }),
  }),
  industry({
    slug: 'insurance',
    name: 'Insurance',
    navLabel: 'Insurance',
    order: 2,
    icon: 'insurance',
    caseStudySectors: ['Insurance'],
    relatedServices: [
      'enterprise',
      'power-query-consulting',
      'excel-dashboard-development',
      'web-applications',
    ],
    relatedSolutions: [
      'dashboards-business-intelligence',
      'workflow-automation-systems-integration',
    ],
    intro:
      'Claims extracts, bordereaux, loss runs and pricing workbooks all need cleaning, joining and analysing before anyone can act on them. When that work is manual, analysts spend their time preparing data instead of interpreting it.\n\nWe build enterprise-grade Excel applications and custom tools that automate data preparation, standardise claims and portfolio analysis, and give underwriters, claims managers and actuaries consistent, explainable outputs.',
    challenges: [
      'Claims and policy extracts arrive in inconsistent formats',
      'Bordereaux and partner data need manual cleansing every cycle',
      'Loss ratio and portfolio reports take days to compile',
      'Pricing and rating workbooks are complex and hard to govern',
      'Analysis logic lives in individual analysts\' files',
    ],
    solutions: [
      { title: 'Claims analysis applications', href: '/enterprise' },
      {
        title: 'Automated bordereaux and data cleansing pipelines',
        href: '/power-query-consulting',
      },
      {
        title: 'Portfolio and loss-ratio dashboards',
        href: '/solutions/dashboards-business-intelligence',
      },
      {
        title: 'Governed rating and pricing workbooks',
        href: '/excel-spreadsheet-development',
      },
      {
        title: 'Workflow automation between claims systems and reporting',
        href: '/solutions/workflow-automation-systems-integration',
      },
    ],
    ai: {
      heading: 'Where AI fits in insurance',
      intro: 'AI speeds up the reading and sorting so experts can focus on judgement.',
      bullets: [
        'Classify claim notes and free-text descriptions into consistent categories',
        'Extract key fields from emailed documents and PDFs',
        'Highlight outlier claims for human review',
      ],
    },
    tools: {
      intl: ['Guidewire exports', 'Duck Creek exports', 'SQL Server', 'Snowflake', 'Power BI'],
      uk: ["Lloyd's bordereaux formats", 'SQL Server', 'Power BI', 'Azure'],
      nz: ['Core policy system exports', 'SQL Server', 'Power BI', 'Azure'],
    },
    faqs: [
      {
        q: 'Can you work with extracts from our core insurance system?',
        a: 'Yes. We build repeatable import and cleansing steps around the extracts you already get, so no core-system changes are needed.',
      },
      {
        q: 'Will the tool handle large claims datasets?',
        a: 'We design for volume using Power Query, SQL or a web application where Excel alone would struggle.',
      },
      {
        q: 'Can actuaries and analysts still see the logic?',
        a: 'Yes. Calculations stay transparent and documented, which matters for review and governance.',
      },
      {
        q: 'Do you sign NDAs and follow data-handling policies?',
        a: 'Yes, as standard.',
      },
    ],
    ctaHeading: 'Turn claims data into decisions faster',
    seo: seoSet({
      introLead:
        'Insurance runs on data, and most of it still passes through spreadsheets on its way to a decision.',
      metaDescription:
        'Custom Excel and enterprise apps for claims analysis, portfolio reporting and pricing. Automate data prep and give underwriters and analysts faster answers.',
      titles: regionTitles('Excel & Data Automation for Insurance'),
      h1: 'Claims, portfolio and pricing analysis tools for insurers and brokers',
      keywords: {
        intl: [
          'insurance claims analysis tool',
          'excel for insurance analytics',
          'insurance reporting automation',
          'underwriting spreadsheet consultant',
        ],
        uk: [
          'insurance claims analysis excel uk',
          'insurance reporting automation uk',
        ],
        nz: ['insurance claims analysis nz', 'insurance data reporting nz'],
      },
    }),
  }),
  industry({
    slug: 'energy-utilities',
    name: 'Energy & Utilities',
    navLabel: 'Energy & Utilities',
    order: 3,
    icon: 'energy',
    caseStudySectors: ['Energy', 'Utilities', 'Infrastructure'],
    relatedServices: [
      'excel-dashboard-development',
      'excel-integrations',
      'power-query-consulting',
      'excel-spreadsheet-development',
      'web-applications',
    ],
    relatedSolutions: [
      'asset-maintenance-operations-solutions',
      'dashboards-business-intelligence',
      'survey-inspection-field-apps',
    ],
    intro:
      'Outage logs, meter extracts, network asset registers and regulatory packs are exported, cleaned and rebuilt every cycle. The operational systems hold the records. The exception lists, performance views and management packs still happen in spreadsheets.\n\nWe connect those extracts, automate the repeatable reporting and build governed workbooks for asset performance, outage and incident analysis, and the packs your managers and regulators expect. Your team keeps the operational judgement. The preparation stops being a manual job.',
    challenges: [
      'Outage, incident and network reports are compiled from several exports',
      'Asset registers and maintenance history are hard to analyse across sites',
      'Meter, interval and consumption data needs heavy cleaning before it is useful',
      'Regulatory and management packs are rebuilt by hand each period',
      'Field inspection results sit apart from the asset record',
    ],
    solutions: [
      {
        title: 'Asset and network performance dashboards',
        href: '/solutions/dashboards-business-intelligence',
      },
      {
        title: 'Maintenance and asset operations systems',
        href: '/solutions/asset-maintenance-operations-solutions',
      },
      {
        title: 'Field inspection and condition capture',
        href: '/solutions/survey-inspection-field-apps',
      },
      {
        title: 'Connections to GIS, EAM and operational databases',
        href: '/excel-integrations',
      },
      {
        title: 'Repeatable preparation of system exports',
        href: '/power-query-consulting',
      },
    ],
    ai: {
      heading: 'Where AI fits in energy and utilities',
      intro:
        'AI helps sort the volume of notes and documents. Operational rules and sign-off stay with your team.',
      bullets: [
        'Classify outage and fault notes into consistent categories',
        'Extract asset and inspection fields from PDFs and emailed reports',
        'Draft exception commentary for management packs for a human to review',
      ],
    },
    tools: {
      intl: ['SAP PM exports', 'Maximo exports', 'SCADA exports', 'GIS / ArcGIS exports', 'SQL Server', 'Power BI'],
      uk: ['SAP PM exports', 'Maximo exports', 'GIS exports', 'SQL Server', 'SharePoint', 'Power BI'],
      nz: ['SAP PM exports', 'Maximo exports', 'GIS exports', 'SQL Server', 'SharePoint', 'Power BI'],
    },
    compliance: {
      nz: 'We automate the reporting around your asset and network data. Operational and regulatory sign-off stays with your team.',
      uk: 'We automate the reporting around your asset and network data. Operational and regulatory sign-off stays with your team.',
      intl: 'We automate the reporting around your asset and network data. Operational and regulatory sign-off stays with your team.',
    },
    faqs: [
      {
        q: 'Can you work from exports of our asset or network system?',
        a: 'Yes. We build repeatable import and cleansing steps around the extracts you already get, so the core system stays the source of record.',
      },
      {
        q: 'Will this replace our EAM or GIS?',
        a: 'No. We report and analyse alongside those systems, using their exports or a live connection where one is available.',
      },
      {
        q: 'Can you handle large meter or interval datasets?',
        a: 'Yes. We use Power Query, SQL or an application where Excel alone would struggle with the volume.',
      },
      {
        q: 'Can field teams capture inspections?',
        a: 'Yes. We can extend the reporting model with tablet or web-based inspection capture that feeds the same asset view.',
      },
    ],
    ctaHeading: 'Turn network and asset data into reports your team will trust',
    seo: seoSet({
      introLead:
        'Energy and utility teams run on asset, network and operational data that still lands in spreadsheets before anyone can act on it.',
      metaDescription:
        'Excel and data automation for energy and utility teams: asset performance, outage reporting, meter data and connections to operational systems.',
      titles: regionTitles('Excel & Data Automation for Energy & Utilities'),
      h1: 'Asset, network and operational reporting for energy and utility teams',
      keywords: {
        intl: [
          'excel automation for utilities',
          'energy company excel consultant',
          'utility reporting automation',
          'asset data analysis tool',
        ],
        uk: ['utilities data automation uk', 'energy company excel consultant uk'],
        nz: ['utilities reporting automation nz', 'energy excel consultant nz'],
      },
    }),
  }),
  industry({
    slug: 'engineering',
    name: 'Engineering',
    navLabel: 'Engineering',
    order: 4,
    icon: 'engineering',
    caseStudySectors: ['Engineering'],
    relatedServices: [
      'excel-vba-macro-development',
      'excel-spreadsheet-development',
      'power-query-consulting',
      'web-applications',
      'power-apps-dataverse-development',
      'ai-workflow-and-business-process-automation',
    ],
    relatedSolutions: [
      'project-costing-financial-modelling',
      'survey-inspection-field-apps',
    ],
    intro:
      'Equipment specifications, ratings, sizes, materials and field data often sit in spreadsheets and legacy tools, and checking whether a component fits an application can mean hours of manual lookups and calculations.\n\nWe turn that engineering knowledge into rule-based Excel tools and custom applications. Load your technical data, apply the selection and validation logic, and get a clear, documented result that shows whether a component suits the application, with the reasoning visible to the engineer who signs it off.',
    challenges: [
      'Equipment selection and compatibility checks are manual and slow',
      'Technical datasheets and ratings live in disconnected spreadsheets',
      'Engineering calculations depend on one expert\'s workbook',
      'Selection rules live in one person\'s head and are hard to hand over',
      'Project estimates and reporting are rebuilt for every job',
    ],
    solutions: [
      {
        title:
          'Rule-based selection and compatibility tools (size, rating, material, application fit)',
        href: '/excel-vba-macro-development',
      },
      {
        title: 'Engineering calculation workbooks with validation and audit trail',
        href: '/excel-spreadsheet-development',
      },
      {
        title: 'A shared component and specification library',
        href: '/power-query-consulting',
      },
      {
        title: 'Project costing and estimating models',
        href: '/solutions/project-costing-financial-modelling',
      },
      {
        title: 'Field data capture and inspection apps',
        href: '/solutions/survey-inspection-field-apps',
      },
    ],
    ai: {
      heading: 'Where AI fits in engineering',
      intro:
        'AI helps engineers find and compare information; the rules and sign-off stay deterministic and human.',
      bullets: [
        'Extract specifications from manufacturer datasheets into a structured component library',
        'Suggest candidate components for an engineer to validate against the rules',
        'Summarise inspection notes and defect reports across assets',
      ],
    },
    tools: {
      intl: ['SAP PM exports', 'Maximo exports', 'GIS / ArcGIS exports', 'SQL Server', 'SharePoint', 'Power BI'],
      uk: ['SAP PM exports', 'Maximo exports', 'GIS exports', 'SQL Server', 'SharePoint', 'Power BI'],
      nz: ['SAP PM exports', 'Maximo exports', 'GIS exports', 'SQL Server', 'SharePoint', 'Power BI'],
    },
    compliance: {
      nz: 'We build tools that apply your engineering standards and document the logic used. Final engineering judgement and sign-off stay with your qualified engineers.',
      uk: 'We build tools that apply your engineering standards and document the logic used. Final engineering judgement and sign-off stay with your qualified engineers.',
      intl: 'We build tools that apply your engineering standards and document the logic used. Final engineering judgment and sign-off stay with your qualified engineers.',
    },
    faqs: [
      {
        q: 'Can you turn our existing selection spreadsheet into a proper tool?',
        a: 'Yes. That\'s a common starting point. We take your current logic, formalise the rules, add validation and make it usable by the wider team.',
      },
      {
        q: 'Can it handle thousands of components and specifications?',
        a: 'Yes. We structure the data as a proper component library and use Power Query, SQL or an app where volume demands it.',
      },
      {
        q: 'Will engineers be able to see why a result was given?',
        a: 'Yes. Every result shows the rules and inputs that produced it.',
      },
      {
        q: 'Can field teams use it?',
        a: 'We can extend it to tablet or web-based field apps.',
      },
    ],
    ctaHeading: 'Have an engineering spreadsheet that\'s outgrown itself? Send it to us',
    seo: seoSet({
      introLead:
        'Engineering teams hold huge amounts of technical data. The value is in applying the right rules to it, consistently and quickly.',
      metaDescription:
        'Custom Excel and VBA tools for engineering teams: equipment sizing and selection, calculation workbooks, validation and a visible audit trail.',
      titles: regionTitles('Excel & Data Automation for Engineering'),
      h1: 'Engineering data, equipment selection and calculation tools – automated',
      keywords: {
        intl: [
          'engineering calculation spreadsheet developer',
          'equipment sizing tool excel',
          'engineering excel consultant',
          'component selection spreadsheet',
        ],
        uk: ['engineering excel consultant uk', 'equipment sizing tool excel uk'],
        nz: ['engineering excel consultant nz', 'equipment sizing spreadsheet nz'],
      },
    }),
  }),
  industry({
    slug: 'construction-property',
    name: 'Construction & Property',
    navLabel: 'Construction & Property',
    order: 5,
    icon: 'construction',
    caseStudySectors: ['Construction', 'Property', 'Property Development'],
    relatedServices: [
      'excel-spreadsheet-development',
      'excel-vba-macro-development',
      'excel-financial-modelling',
      'web-applications',
    ],
    relatedSolutions: [
      'quoting-estimating-systems',
      'project-costing-financial-modelling',
      'property-development-applications',
      'resource-planning-scheduling',
    ],
    intro:
      'Estimators juggle rates, quantities, variations and supplier prices across workbooks that grow with every job. Off-the-shelf estimating software rarely fits how a specialist contractor actually prices work, so Excel stays at the centre.\n\nWe build estimating, quoting and job-costing tools around your pricing logic, from renovation costing apps to development feasibility models, so quotes are faster and consistent and actual costs track against budget as the job runs.',
    challenges: [
      'Quotes take too long and vary by estimator',
      'Rates and supplier prices go stale across many workbooks',
      'Variations and change orders aren\'t tracked against budget',
      'Job cost reporting lags behind what\'s happening on site',
      'Development feasibility models are fragile and hard to scenario-test',
    ],
    solutions: [
      {
        title: 'Quoting and estimating systems',
        href: '/solutions/quoting-estimating-systems',
      },
      {
        title: 'Job costing and project cost control',
        href: '/solutions/project-costing-financial-modelling',
      },
      {
        title: 'Property development feasibility and appraisal models',
        href: '/solutions/property-development-applications',
      },
      {
        title: 'Site inspection and survey apps',
        href: '/solutions/survey-inspection-field-apps',
      },
      {
        title: 'Resource and crew scheduling',
        href: '/solutions/resource-planning-scheduling',
      },
    ],
    ai: {
      heading: 'Where AI fits in construction',
      intro: 'AI is useful at the messy edges of estimating.',
      bullets: [
        'Extract quantities and line items from supplier quotes and PDFs',
        'Compare tendered prices against historical rates',
        'Summarise site reports and variation notes',
      ],
    },
    tools: {
      intl: ['Procore', 'QuickBooks', 'Sage 300 CRE', 'Buildertrend exports', 'SharePoint'],
      uk: ['Sage', 'Xero', 'COINS exports', 'Procore', 'SharePoint'],
      nz: ['Xero', 'MYOB', 'Simpro', 'Buildxact exports', 'SharePoint'],
    },
    compliance: {
      uk: 'Supports CIS deduction tracking in subcontractor cost reports.',
    },
    faqs: [
      {
        q: 'Why not just buy estimating software?',
        a: 'Packaged tools suit standard work. If your pricing logic is specialised, a custom tool fits it better and costs less to change.',
      },
      {
        q: 'Can the estimator\'s existing workbook be the starting point?',
        a: 'Yes. We keep what works and rebuild the rest.',
      },
      {
        q: 'Can it produce a branded quote document?',
        a: 'Yes. Quotes can be generated to PDF or Word from the estimate.',
      },
      {
        q: 'Can actual costs feed back in?',
        a: 'Yes, from your accounting or job management system.',
      },
    ],
    ctaHeading: 'Quote faster and protect your margin',
    seo: seoSet({
      introLead: 'Margins in construction are won or lost in the estimate and the cost report.',
      metaDescription:
        'Custom Excel estimating, quoting and job-costing tools for builders, contractors and developers. Faster quotes, tighter margins, live project cost tracking.',
      titles: regionTitles('Excel Estimating & Costing for Construction'),
      h1: 'Estimating, job costing and project control tools for construction and property',
      keywords: {
        intl: [
          'construction estimating spreadsheet',
          'excel job costing for contractors',
          'construction cost estimating excel consultant',
          'property development feasibility model',
        ],
        uk: [
          'construction estimating excel uk',
          'job costing spreadsheet contractors uk',
          'development appraisal model excel',
        ],
        nz: [
          'construction estimating excel nz',
          'job costing builders nz',
          'property development feasibility nz',
        ],
      },
    }),
  }),
  industry({
    slug: 'manufacturing',
    name: 'Manufacturing',
    navLabel: 'Manufacturing',
    order: 6,
    icon: 'manufacturing',
    caseStudySectors: ['Manufacturing'],
    relatedServices: [
      'excel-dashboard-development',
      'excel-integrations',
      'excel-spreadsheet-development',
      'power-query-consulting',
    ],
    relatedSolutions: [
      'manufacturing-costing-estimating-quoting',
      'dashboards-business-intelligence',
      'resource-planning-scheduling',
    ],
    intro:
      'Product costing, bills of materials, production schedules and sales reporting often run across a patchwork of ERP exports and spreadsheets. When input costs move, it can take days to see the effect on margin.\n\nWe build costing models, BOM and quoting tools, production planning workbooks and KPI dashboards that pull from your ERP, recalculate instantly and show operations, sales and finance the same version of the truth.',
    challenges: [
      'Product costs don\'t update when material or labour rates change',
      'BOMs and routings are maintained in multiple places',
      'Production and OEE reporting is manual',
      'Yield, scrap and downtime are visible only after the shift',
      'ERP reports don\'t answer day-to-day operational questions',
    ],
    solutions: [
      {
        title: 'Manufacturing costing, estimating and quoting',
        href: '/solutions/manufacturing-costing-estimating-quoting',
      },
      {
        title: 'Production KPI and OEE dashboards',
        href: '/solutions/dashboards-business-intelligence',
      },
      {
        title: 'Production and capacity planning',
        href: '/solutions/resource-planning-scheduling',
      },
      { title: 'ERP-to-Excel integrations', href: '/excel-integrations' },
      {
        title: 'Cost and variance dashboards for operations and finance',
        href: '/excel-dashboard-development',
      },
    ],
    ai: {
      heading: 'Where AI fits in manufacturing',
      intro: 'Use AI to cut the reading and re-keying around production data.',
      bullets: [
        'Extract supplier price changes from emails and PDFs into the cost model',
        'Flag unusual yield, scrap or downtime patterns',
        'Draft weekly operations summaries from dashboard data',
      ],
    },
    tools: {
      intl: ['NetSuite', 'SAP Business One', 'Epicor', 'Microsoft Dynamics', 'QuickBooks', 'SQL Server'],
      uk: ['Sage 200', 'SAP Business One', 'Microsoft Dynamics', 'Xero', 'SQL Server'],
      nz: ['MYOB Advanced', 'Xero', 'SAP Business One', 'Microsoft Dynamics', 'Unleashed', 'SQL Server'],
    },
    faqs: [
      {
        q: 'Can you build a costing model that updates from our ERP?',
        a: 'Yes. We pull current material, labour and overhead rates automatically so costs and margins stay current.',
      },
      {
        q: 'We have a production dashboard already. Can you improve it?',
        a: 'Yes. We often rebuild existing dashboards for speed, accuracy and automatic refresh.',
      },
      {
        q: 'Can it handle multi-level BOMs?',
        a: 'Yes, including sub-assemblies and alternative routings.',
      },
      {
        q: 'Do we need Power BI?',
        a: 'No. Excel dashboards work well; we recommend Power BI only where it clearly adds value.',
      },
    ],
    ctaHeading: 'See your true product margin today',
    extraLinks: [
      {
        href: '/blog/excel-solutions-manufacturing-operations-new-zealand',
        label: 'Excel solutions for manufacturing and operations',
        markets: ['nz'],
      },
    ],
    seo: seoSet({
      introLead:
        'From raw material to finished goods, manufacturers need costs and production numbers they can trust and update quickly.',
      metaDescription:
        'Product costing, BOM, production planning and KPI dashboards in Excel and custom apps. Built for manufacturers who need current product margins.',
      titles: regionTitles('Excel Automation for Manufacturing'),
      h1: 'Costing, production and KPI tools for manufacturers',
      keywords: {
        intl: [
          'manufacturing cost model excel',
          'production dashboard excel',
          'bill of materials costing tool',
          'production kpi dashboard',
        ],
        uk: [
          'manufacturing costing excel uk',
          'production kpi dashboard uk',
          'bill of materials costing excel',
        ],
        nz: [
          'manufacturing costing nz',
          'production dashboard excel nz',
          'production planning excel nz',
        ],
      },
    }),
  }),
  industry({
    slug: 'fmcg',
    name: 'FMCG',
    navLabel: 'FMCG',
    order: 7,
    icon: 'fmcg',
    caseStudySectors: ['FMCG'],
    relatedServices: [
      'excel-dashboard-development',
      'excel-integrations',
      'excel-financial-modelling',
      'power-query-consulting',
    ],
    relatedSolutions: [
      'dashboards-business-intelligence',
      'project-costing-financial-modelling',
    ],
    intro:
      'Trade spend, promotional uplift, distributor sell-in and retail sell-out often sit in separate workbooks. When a price, discount or promotion changes, sales and finance rarely see the same margin on the same day.\n\nWe build sales, promotion and margin models, category and customer reporting, and connections to ERP and distributor files so commercial and finance teams share one version of the numbers.',
    challenges: [
      'Promotional and trade spend is hard to evaluate after the event',
      'Sell-in, sell-out and stock sit in different files',
      'Price, discount and rebate changes are slow to reach the margin view',
      'Customer and category reports are rebuilt for every meeting',
      'Forecast versions are emailed around the commercial team',
    ],
    solutions: [
      {
        title: 'Sales, promotion and margin analysis',
        href: '/excel-dashboard-development',
      },
      {
        title: 'Commercial and category KPI dashboards',
        href: '/solutions/dashboards-business-intelligence',
      },
      {
        title: 'Connections to ERP and distributor data',
        href: '/excel-integrations',
      },
      {
        title: 'Price, volume and promo scenario models',
        href: '/excel-financial-modelling',
      },
      {
        title: 'Repeatable preparation of retailer and distributor files',
        href: '/power-query-consulting',
      },
    ],
    ai: {
      heading: 'Where AI fits in consumer goods',
      intro: 'Use AI on the documents and commentary around the commercial numbers.',
      bullets: [
        'Extract promotion terms and rebate conditions from emails and PDFs',
        'Flag unusual uplift, spend or margin movements for review',
        'Draft weekly sales commentary from the dashboard for a human to edit',
      ],
    },
    tools: {
      intl: ['NetSuite', 'SAP', 'Microsoft Dynamics', 'QuickBooks', 'Retailer exports', 'Power BI'],
      uk: ['SAP', 'Microsoft Dynamics', 'Sage', 'Xero', 'Retailer exports', 'Power BI'],
      nz: ['Unleashed', 'Xero', 'SAP Business One', 'Microsoft Dynamics', 'Retailer exports', 'Power BI'],
    },
    faqs: [
      {
        q: 'Can you measure whether a promotion actually paid back?',
        a: 'Yes. We bring sell-in, sell-out, price and trade spend into one model so margin before and after the promotion is visible.',
      },
      {
        q: 'Do you replace our ERP or distributor portal?',
        a: 'No. We take the exports or connections you already have and build the commercial view around them.',
      },
      {
        q: 'Can sales and finance use the same numbers?',
        a: 'Yes. That is the point of the model: one set of inputs, one margin, and reports each team can read.',
      },
      {
        q: 'Can it handle several customers, banners and pack sizes?',
        a: 'Yes. Customer, product and pack hierarchy are part of the structure, so a price change rolls through to the right margin.',
      },
    ],
    ctaHeading: 'See promotion margin before the meeting, not after it',
    seo: seoSet({
      introLead:
        'Consumer goods businesses need margin, promotion and sales numbers that sales and finance can both trust.',
      metaDescription:
        'Excel sales, promotion and margin tools for consumer goods brands. Trade spend, sell-in and sell-out connected to your ERP and distributor data.',
      titles: {
        intl: 'Excel Automation for CPG Sales & Margin US',
        uk: 'Excel Automation for FMCG Sales & Margin UK',
        nz: 'Excel Automation for FMCG Sales & Margin NZ',
      },
      h1: {
        intl: 'Sales, promotion and margin tools for CPG brands',
        uk: 'Sales, promotion and margin tools for FMCG brands',
        nz: 'Sales, promotion and margin tools for FMCG brands',
      },
      keywords: {
        intl: [
          'cpg sales and operations reporting',
          'trade spend analysis excel',
          'cpg margin reporting',
          'promotion profitability spreadsheet',
        ],
        uk: [
          'fmcg reporting automation uk',
          'trade spend analysis excel uk',
          'fmcg margin reporting uk',
        ],
        nz: [
          'fmcg reporting nz',
          'trade spend analysis nz',
          'fmcg sales reporting excel nz',
        ],
      },
    }),
  }),
  industry({
    slug: 'marine-boat-building',
    name: 'Marine & Boat Building',
    navLabel: 'Marine & Boat Building',
    order: 8,
    icon: 'marine',
    caseStudySectors: ['Marine'],
    relatedServices: [
      'excel-spreadsheet-development',
      'excel-vba-macro-development',
      'web-applications',
    ],
    relatedSolutions: [
      'manufacturing-costing-estimating-quoting',
      'quoting-estimating-systems',
      'project-costing-financial-modelling',
    ],
    intro:
      'Boat builders price complex packages with hundreds of option combinations, fluctuating component costs and significant labour content. Generic quoting software rarely handles that configurability, so pricing ends up in large, fragile spreadsheets.\n\nWe\'ve built package costing applications for custom boat builders that configure models and options, calculate true cost and margin, and generate customer-ready quotes. Build tracking then measures actual hours and materials against the quote.',
    challenges: [
      'Option and package combinations make pricing error-prone',
      'Component and engine costs change frequently',
      'Labour hours per build are estimated, not measured',
      'Dealer and direct pricing need different margins',
      'Quote documents are assembled by hand',
    ],
    solutions: [
      {
        title: 'Package and option costing applications',
        href: '/solutions/manufacturing-costing-estimating-quoting',
      },
      {
        title: 'Configurable quoting with customer-ready output',
        href: '/solutions/quoting-estimating-systems',
      },
      {
        title: 'Build cost tracking (quote vs actual)',
        href: '/solutions/project-costing-financial-modelling',
      },
      {
        title: 'Production slot and resource planning',
        href: '/solutions/resource-planning-scheduling',
      },
      {
        title: 'Dealer and customer portals',
        href: '/solutions/client-staff-portals',
      },
    ],
    ai: {
      heading: 'Where AI fits in boat building',
      intro: 'Practical, low-risk uses.',
      bullets: [
        'Update component pricing from supplier price lists',
        'Generate first-draft specification sheets from the configured build',
        'Spot builds trending over budget early',
      ],
    },
    tools: {
      intl: ['QuickBooks', 'NetSuite', 'SharePoint', 'SQL Server'],
      uk: ['Xero', 'Sage', 'SharePoint', 'SQL Server'],
      nz: ['Xero', 'MYOB', 'SharePoint', 'SQL Server'],
    },
    faqs: [
      {
        q: 'Can it handle hundreds of option combinations?',
        a: 'Yes. Options are rule-driven, so invalid combinations are blocked and prices recalculate instantly.',
      },
      {
        q: 'Can dealers use it?',
        a: 'Yes, via a controlled workbook or a web portal with dealer pricing.',
      },
      {
        q: 'Can we compare quoted and actual cost per hull?',
        a: 'Yes. Build tracking reports margin by model and build.',
      },
      {
        q: 'Does it produce a branded quote?',
        a: 'Yes, as PDF or Word.',
      },
    ],
    ctaHeading: 'Price every build with confidence',
    seo: seoSet({
      introLead:
        'Every boat is a combination of hull, engine, options and labour, and every combination needs a reliable price.',
      metaDescription:
        'Custom costing and quoting applications for boat builders and marine manufacturers. Price options and packages accurately and track every build.',
      titles: regionTitles('Boat Building Costing & Quoting Software'),
      h1: 'Package costing, quoting and build tracking for boat builders',
      keywords: {
        intl: [
          'boat builder quoting software',
          'boat package costing tool',
          'marine manufacturing costing excel',
        ],
        uk: ['boat builder costing software uk', 'marine quoting tool uk'],
        nz: ['boat builder costing software nz', 'marine manufacturing quoting nz'],
      },
    }),
  }),
  industry({
    slug: 'timber-forestry',
    name: 'Timber Processing & Forestry',
    navLabel: 'Timber & Forestry',
    order: 9,
    icon: 'timber',
    caseStudySectors: ['Timber', 'Forestry'],
    relatedServices: [
      'excel-dashboard-development',
      'excel-integrations',
      'excel-spreadsheet-development',
      'power-apps-dataverse-development',
    ],
    relatedSolutions: [
      'manufacturing-costing-estimating-quoting',
      'dashboards-business-intelligence',
      'resource-planning-scheduling',
    ],
    intro:
      'Processors need to know what each log input is really worth once it\'s cut, dried, graded and sold, and that depends on recovery rates, product mix and constantly changing prices.\n\nWe build recovery and yield models, log-to-product costing, production and stock reporting and dispatch tools that bring together mill, sales and finance data so managers can see margin by input, shift and product.',
    challenges: [
      'Recovery and yield are measured inconsistently',
      'Costing by log grade and product mix is hard to calculate',
      'Stock and kiln/drying status is tracked manually',
      'Production reporting relies on end-of-shift spreadsheets',
      'Pricing changes aren\'t reflected in margin quickly',
    ],
    solutions: [
      {
        title: 'Recovery, yield and grade-mix analysis',
        href: '/excel-dashboard-development',
      },
      {
        title: 'Log-to-product costing models',
        href: '/solutions/manufacturing-costing-estimating-quoting',
      },
      {
        title: 'Production and stock dashboards',
        href: '/solutions/dashboards-business-intelligence',
      },
      {
        title: 'Shift, kiln and resource scheduling',
        href: '/solutions/resource-planning-scheduling',
      },
      {
        title: 'Integration with mill and accounting systems',
        href: '/excel-integrations',
      },
    ],
    ai: {
      heading: 'Where AI fits in timber processing',
      intro: 'Mostly about speeding up reporting.',
      bullets: [
        'Read docket and dispatch documents into structured data',
        'Flag shifts with abnormal recovery or downtime',
        'Draft weekly production commentary for managers',
      ],
    },
    tools: {
      intl: ['QuickBooks', 'NetSuite', 'SQL Server', 'Mill system exports'],
      uk: ['Sage', 'Xero', 'SQL Server', 'Mill system exports'],
      nz: ['Xero', 'MYOB', 'SQL Server', 'Mill system exports'],
    },
    faqs: [
      {
        q: 'Can you work with our mill system\'s exports?',
        a: 'Yes. We build repeatable imports from CSV or database exports.',
      },
      {
        q: 'Can we see margin by log input?',
        a: 'Yes. That\'s usually the core of the model.',
      },
      {
        q: 'Will supervisors be able to use it on shift?',
        a: 'Yes, with simple data-entry forms or a tablet app.',
      },
      {
        q: 'Can it replace our end-of-shift spreadsheets?',
        a: 'Yes, with one consistent capture and reporting tool.',
      },
    ],
    ctaHeading: 'Know your margin by log, shift and product',
    seo: seoSet({
      introLead: 'In timber, small changes in recovery and grade mix make a big difference to profit.',
      metaDescription:
        'Custom Excel and app solutions for sawmills, timber processors and forestry: recovery, yield analysis, log costing, production and stock reporting.',
      titles: {
        intl: 'Excel Tools for Sawmills & Timber Processing US',
        uk: 'Excel Tools for Timber Processing UK',
        nz: 'Excel Tools for Timber Processing & Forestry NZ',
      },
      h1: 'Yield, costing and production tools for timber processors and forestry operations',
      keywords: {
        intl: [
          'sawmill yield spreadsheet',
          'lumber costing tool',
          'sawmill production reporting',
        ],
        uk: ['timber processing costing excel', 'sawmill reporting uk'],
        nz: [
          'sawmill software nz',
          'timber processing costing nz',
          'forestry reporting excel nz',
        ],
      },
    }),
  }),
  industry({
    slug: 'landscaping-field-services',
    name: 'Landscaping & Field Services',
    navLabel: 'Landscaping & Field Services',
    order: 10,
    icon: 'field',
    caseStudySectors: ['Landscaping', 'Field Services', 'Cemetery', 'Grounds'],
    relatedServices: [
      'google-sheets-development',
      'power-apps-dataverse-development',
      'excel-spreadsheet-development',
      'web-applications',
    ],
    relatedSolutions: [
      'quoting-estimating-systems',
      'resource-planning-scheduling',
      'survey-inspection-field-apps',
    ],
    intro:
      'Landscapers and field service teams price work from measurements, materials and labour, then juggle crews, equipment and recurring maintenance schedules. Generic job apps often miss how you actually quote and plan.\n\nWe build quoting tools, crew and maintenance schedulers, mobile job capture and job-costing reports so office and field work from the same data.',
    challenges: [
      'Quotes are built from scratch for each site',
      'Recurring maintenance rounds are scheduled manually',
      'Crew time and materials aren\'t captured accurately in the field',
      'Job profitability is only known after the fact',
      'Equipment and vehicle allocation clashes',
    ],
    solutions: [
      {
        title: 'Measurement-based quoting tools',
        href: '/solutions/quoting-estimating-systems',
      },
      {
        title: 'Crew and maintenance round scheduling',
        href: '/solutions/resource-planning-scheduling',
      },
      {
        title: 'Mobile job and site capture apps',
        href: '/solutions/survey-inspection-field-apps',
      },
      {
        title: 'Job costing and profitability dashboards',
        href: '/solutions/dashboards-business-intelligence',
      },
      {
        title: 'Customer and staff portals',
        href: '/solutions/client-staff-portals',
      },
    ],
    ai: {
      heading: 'Where AI fits in field services',
      intro: 'Practical time savers.',
      bullets: [
        'Turn site photos and notes into structured job records',
        'Draft quote descriptions from measured scope',
        'Highlight jobs running over estimated hours',
      ],
    },
    tools: {
      intl: ['QuickBooks', 'Jobber exports', 'Google Sheets', 'SharePoint'],
      uk: ['Xero', 'Sage', 'Google Sheets', 'SharePoint'],
      nz: ['Xero', 'MYOB', 'Google Sheets', 'SharePoint'],
    },
    faqs: [
      {
        q: 'Can crews use it on a phone?',
        a: 'Yes. We build simple mobile capture forms or field apps.',
      },
      {
        q: 'Can it schedule recurring maintenance?',
        a: 'Yes, including rounds, frequencies and crew allocation.',
      },
      {
        q: 'Can we quote from measurements?',
        a: 'Yes. Enter areas and quantities and the tool prices materials and labour.',
      },
      {
        q: 'Do we need to replace our accounting system?',
        a: 'No. We integrate with it.',
      },
    ],
    ctaHeading: 'Spend less time quoting and more time on the tools',
    seo: seoSet({
      introLead:
        'Field businesses make money when quotes are accurate and crews are in the right place.',
      metaDescription:
        'Custom quoting, scheduling and job-costing tools for landscapers, grounds maintenance and field service teams. Quote faster, schedule smarter, track every job.',
      titles: regionTitles('Quoting & Scheduling Tools for Landscaping & Field Services'),
      h1: 'Quoting, crew scheduling and job tracking for landscaping and field service businesses',
      keywords: {
        intl: [
          'landscaping estimating spreadsheet',
          'landscape quoting tool',
          'field service scheduling excel',
          'grounds maintenance job costing',
        ],
        uk: ['landscaping quoting tool uk', 'grounds maintenance scheduling uk'],
        nz: ['landscaping quoting nz', 'grounds maintenance scheduling nz'],
      },
    }),
  }),
  industry({
    slug: 'hospitality',
    name: 'Hospitality & Tourism',
    navLabel: 'Hospitality & Tourism',
    order: 11,
    icon: 'hospitality',
    caseStudySectors: ['Hospitality'],
    relatedServices: [
      'web-applications',
      'power-apps-dataverse-development',
      'excel-dashboard-development',
      'excel-integrations',
    ],
    relatedSolutions: [
      'resource-planning-scheduling',
      'dashboards-business-intelligence',
      'client-staff-portals',
    ],
    intro:
      'Hotels and hospitality groups manage guest services, staff rosters, revenue, food and labour costs across systems that rarely talk to each other. Operational gaps get filled with paper forms and manual spreadsheets.\n\nWe build practical hybrid apps and automated reporting, from a valet parking application for an international hotel to rostering and cost dashboards, that close those gaps without replacing your PMS or POS.',
    challenges: [
      'Guest-service processes run on paper or ad-hoc spreadsheets',
      'Rostering and labour cost control are manual',
      'Revenue, F&B and labour reports are compiled by hand',
      'PMS and POS data don\'t combine easily',
      'Multi-site reporting is inconsistent',
    ],
    solutions: [
      {
        title: 'Operational hybrid apps (for example valet and service requests)',
        href: '/web-applications',
      },
      {
        title: 'Rostering and labour planning',
        href: '/solutions/resource-planning-scheduling',
      },
      {
        title: 'Revenue, F&B and labour dashboards',
        href: '/solutions/dashboards-business-intelligence',
      },
      { title: 'PMS and POS data integrations', href: '/excel-integrations' },
      {
        title: 'Staff portals and checklists',
        href: '/solutions/client-staff-portals',
      },
    ],
    ai: {
      heading: 'Where AI fits in hospitality',
      intro: 'Small, high-frequency wins.',
      bullets: [
        'Summarise guest feedback and reviews by theme',
        'Forecast staffing needs from occupancy and bookings',
        'Read supplier invoices into cost reports',
      ],
    },
    tools: {
      intl: ['Oracle OPERA exports', 'Toast exports', 'QuickBooks', 'Power BI'],
      uk: ['Oracle OPERA exports', 'Lightspeed exports', 'Xero', 'Power BI'],
      nz: ['Oracle OPERA exports', 'Lightspeed exports', 'Xero', 'Power BI'],
    },
    faqs: [
      {
        q: 'Do we need to replace our PMS or POS?',
        a: 'No. We work alongside them using their exports or APIs.',
      },
      {
        q: 'Can staff use it on phones or tablets?',
        a: 'Yes. Our hybrid apps are built for front-line use.',
      },
      {
        q: 'Can you consolidate multiple properties?',
        a: 'Yes, into one consistent reporting model.',
      },
      {
        q: 'How long does a typical app take?',
        a: 'Focused operational apps often take weeks, not months.',
      },
    ],
    ctaHeading: 'Replace the paper and spreadsheets behind your operations',
    seo: seoSet({
      introLead:
        'Hospitality runs on fast operational decisions, and too many still depend on paper and spreadsheets.',
      metaDescription:
        'Custom apps and Excel automation for hotels and hospitality: guest-service apps, rostering, revenue and cost reporting, and operational dashboards.',
      titles: regionTitles('Excel & App Solutions for Hotels & Hospitality'),
      h1: 'Operational apps, reporting and automation for hotels and hospitality groups',
      keywords: {
        intl: [
          'hotel operations app',
          'hospitality reporting automation',
          'hotel labor cost dashboard',
        ],
        uk: ['hotel operations app uk', 'hospitality reporting automation uk'],
        nz: ['hospitality reporting nz', 'hotel operations app nz'],
      },
    }),
  }),
  industry({
    slug: 'facilities-management',
    name: 'Facilities Management & Maintenance',
    navLabel: 'Facilities Management',
    order: 12,
    icon: 'facilities',
    caseStudySectors: ['Facilities Management'],
    relatedServices: [
      'excel-vba-macro-development',
      'excel-dashboard-development',
      'power-apps-dataverse-development',
      'web-applications',
    ],
    relatedSolutions: [
      'resource-planning-scheduling',
      'asset-maintenance-operations-solutions',
      'dashboards-business-intelligence',
      'survey-inspection-field-apps',
    ],
    intro:
      'Facilities teams manage planned maintenance, reactive work, contract KPIs and staff across many sites. CAFM systems hold the records, but scheduling optimisation and client reporting often fall back to spreadsheets.\n\nWe\'ve built maintenance scheduling and optimisation tools for FM contractors that balance workload, travel and SLAs, along with contract KPI reporting and asset dashboards.',
    challenges: [
      'Planned maintenance schedules are balanced by hand',
      'SLA and contract KPI reporting takes days each month',
      'Staff, travel and site allocation is inefficient',
      'Asset condition data is scattered',
      'Client reports differ for every contract',
    ],
    solutions: [
      {
        title: 'Maintenance scheduling and optimisation',
        href: '/solutions/resource-planning-scheduling',
      },
      {
        title: 'Asset maintenance and operations systems',
        href: '/solutions/asset-maintenance-operations-solutions',
      },
      {
        title: 'Contract KPI and SLA dashboards',
        href: '/solutions/dashboards-business-intelligence',
      },
      {
        title: 'Inspection and site audit apps',
        href: '/solutions/survey-inspection-field-apps',
      },
      {
        title: 'Client reporting portals',
        href: '/solutions/client-staff-portals',
      },
    ],
    ai: {
      heading: 'Where AI fits in facilities management',
      intro: 'Use AI to process the volume.',
      bullets: [
        'Categorise reactive job requests automatically',
        'Summarise inspection findings across sites',
        'Draft monthly contract performance commentary',
      ],
    },
    tools: {
      intl: ['CAFM/CMMS exports', 'Maximo', 'ServiceNow exports', 'SharePoint', 'Power BI'],
      uk: ['CAFM exports', 'Maximo', 'Concept Evolution exports', 'SharePoint', 'Power BI'],
      nz: ['CAFM exports', 'Maximo', 'SharePoint', 'Power BI'],
    },
    faqs: [
      {
        q: 'Can you optimise schedules across multiple sites?',
        a: 'Yes. We balance frequencies, technician capacity and travel to produce workable schedules.',
      },
      {
        q: 'Will it work with our CAFM system?',
        a: 'Yes, via exports or APIs. We extend rather than replace it.',
      },
      {
        q: 'Can each client get their own report format?',
        a: 'Yes. Templates are driven per contract.',
      },
      {
        q: 'Can technicians record work in the field?',
        a: 'Yes, via mobile capture.',
      },
    ],
    ctaHeading: 'Balance your maintenance schedule and report with less effort',
    seo: seoSet({
      introLead:
        'FM contracts are won on price and kept on performance, and both depend on good scheduling and reporting.',
      metaDescription:
        'Custom maintenance scheduling, optimisation and contract reporting for facilities contractors and in-house FM teams. Balance workload, travel and SLAs.',
      titles: regionTitles('Maintenance Scheduling & FM Reporting Tools'),
      h1: 'Maintenance scheduling, contract reporting and asset tools for facilities management',
      keywords: {
        intl: [
          'maintenance scheduling spreadsheet',
          'facilities management reporting tool',
          'preventive maintenance planner excel',
        ],
        uk: [
          'facilities management reporting uk',
          'planned maintenance scheduling tool uk',
        ],
        nz: ['maintenance scheduling nz', 'facilities management reporting nz'],
      },
    }),
  }),
  industry({
    slug: 'agriculture',
    name: 'Agriculture',
    navLabel: 'Agriculture',
    order: 0,
    icon: 'agriculture',
    caseStudySectors: ['Agriculture', 'Seed', 'Farming'],
    relatedServices: [
      'excel-spreadsheet-development',
      'excel-vba-macro-development',
      'excel-dashboard-development',
      'excel-integrations',
      'web-applications',
    ],
    relatedSolutions: [
      'resource-planning-scheduling',
      'dashboards-business-intelligence',
      'quoting-estimating-systems',
    ],
    intro:
      'Seed companies move product by batch, lot and location: what is in the warehouse, what a third-party logistics partner is holding, and what has already been allocated to a customer. When that picture lives in separate spreadsheets, distribution and sales spend the week reconciling stock instead of filling orders.\n\nWe build distribution tools that track batches, stock and 3PL holdings, including the seed distribution system we built for KWS Seeds. We also build the calculators that turn a seed rate per hectare into the quantity a customer needs, then carry that number into the quote and the sales order. For growers, we build planting schedules and resource plans so crews, machinery and inputs line up with the season.',
    challenges: [
      'Batch and lot stock is split across your warehouse and 3PL partners',
      'Available-to-sell quantities are out of date by the time sales uses them',
      'Seed rates per hectare are recalculated by hand for every customer and area',
      'Orders do not tie back to the batch that will actually ship',
      'Planting schedules and crew or machinery plans are rebuilt each season',
    ],
    solutions: [
      {
        title: 'Batch, stock and 3PL distribution tracking',
        href: '/excel-vba-macro-development',
      },
      {
        title: 'Seed quantity calculators from a rate per hectare',
        href: '/excel-spreadsheet-development',
      },
      {
        title: 'Sales allocation tied to stock that can actually ship',
        href: '/solutions/quoting-estimating-systems',
      },
      {
        title: 'Planting schedules and seasonal resource plans',
        href: '/solutions/resource-planning-scheduling',
      },
      {
        title: 'Connections to warehouse, 3PL and accounting data',
        href: '/excel-integrations',
      },
    ],
    ai: {
      heading: 'Where AI fits in agriculture',
      intro: 'Use AI on the paperwork around stock and the season. The quantities and the schedule stay calculated, not guessed.',
      bullets: [
        'Read delivery dockets and 3PL statements into batch stock',
        'Flag lots that will not cover the quantities already sold',
        'Draft a weekly distribution summary for the sales team to check',
      ],
    },
    tools: {
      intl: ['QuickBooks', 'NetSuite', '3PL exports', 'SharePoint', 'SQL Server'],
      uk: ['Xero', 'Sage', '3PL exports', 'SharePoint', 'SQL Server'],
      nz: ['Xero', 'MYOB', '3PL exports', 'SharePoint', 'SQL Server'],
    },
    faqs: [
      {
        q: 'Can you track seed by batch across our warehouse and a 3PL?',
        a: 'Yes. We bring your own stock and the stock a logistics partner is holding into one batch view, so sales can see what is free to promise.',
      },
      {
        q: 'Can it calculate seed quantities from a rate per hectare?',
        a: 'Yes. Enter the rate and the area and the tool calculates the quantity, then carries that into the quote or the sales order.',
      },
      {
        q: 'Will an order stay tied to the batch that ships?',
        a: 'Yes. Allocation follows the batch and the location, so you are not selling seed that is already committed or sitting with the 3PL.',
      },
      {
        q: 'Can it schedule planting and the people or machines that do the work?',
        a: 'Yes. We build seasonal plans that line up fields, crews, machinery and inputs, and show when the plan and the available resources clash.',
      },
    ],
    ctaHeading: 'Know which batch can fill the order before you promise it',
    seo: seoSet({
      introLead:
        'Seed and farming businesses need batch, stock and planting numbers they can trust before the season moves.',
      metaDescription: {
        nz: 'Excel tools for agriculture and seed businesses: batch and 3PL stock, quantities per hectare, sales allocation, and planting and resource schedules.',
        uk: 'Excel tools for agriculture and seed businesses: batch and 3PL stock, quantities per hectare, sales allocation, and planting and resource schedules.',
        intl: 'Excel tools for agriculture and seed businesses: batch and 3PL stock, quantities per acre, sales allocation, and planting and resource schedules.',
      },
      titles: regionTitles('Excel Tools for Seed Distribution & Agriculture'),
      h1: {
        nz: 'Batch, stock and per-hectare seed tools for agriculture and seed businesses',
        uk: 'Batch, stock and per-hectare seed tools for agriculture and seed businesses',
        intl: 'Batch, stock and per-acre seed tools for agriculture and seed businesses',
      },
      keywords: {
        intl: [
          'seed distribution spreadsheet',
          'batch stock tracking excel',
          'seed quantity per acre calculator',
          'farm planting schedule excel',
        ],
        uk: [
          'seed distribution software uk',
          'seed quantity per hectare excel',
          'farm resource scheduling uk',
        ],
        nz: [
          'seed distribution software nz',
          'seed quantity per hectare nz',
          'farm planting schedule excel nz',
        ],
      },
    }),
  }),
].sort((a, b) => a.navLabel.localeCompare(b.navLabel, 'en', { sensitivity: 'base' }))
  .map((page, index) => ({ ...page, order: index + 1 }))

const INDEX_SEO: Record<MarketId, IndustrySeo> = {
  nz: {
    h1: 'Excel & Automation Solutions for NZ Industries',
    seoTitle: 'Excel Solutions by Industry NZ',
    metaDescription: INDEX_META,
    keywords: ['excel solutions by industry nz', 'excel automation by sector'],
    introLead: INDEX_INTRO,
  },
  uk: {
    h1: 'Excel & Automation Solutions by Industry',
    seoTitle: 'Excel Solutions by Industry UK',
    metaDescription: INDEX_META,
    keywords: ['excel solutions by industry uk', 'excel automation by sector'],
    introLead: INDEX_INTRO,
  },
  intl: {
    h1: 'Excel & Automation Solutions by Industry',
    seoTitle: 'Excel Solutions by Industry US',
    metaDescription: INDEX_META,
    keywords: ['excel solutions by industry', 'excel automation by sector'],
    introLead: INDEX_INTRO,
  },
}

export function getIndustryBySlug(slug: string): IndustryPage | undefined {
  return industryPages.find((page) => page.slug === slug)
}

export function industryHrefs(): string[] {
  return [ALL_INDUSTRIES_HREF, ...industryPages.map((page) => page.href)]
}

export function proofLineFor(market: MarketId): string {
  return PROOF[market]
}

export function toolsFor(page: IndustryPage, market: MarketId): string[] {
  return pickList(page.tools, market)
}

export function complianceFor(page: IndustryPage, market: MarketId): string {
  return pickText(page.compliance, market)
}

export function industryForSector(sector: string): IndustryPage | undefined {
  const key = sector.trim().toLowerCase()
  if (!key) return undefined
  const matches = industryPages.filter((page) =>
    page.caseStudySectors.some((item) => item.toLowerCase() === key),
  )
  matches.sort(
    (a, b) => a.caseStudySectors.length - b.caseStudySectors.length || a.order - b.order,
  )
  return matches[0]
}

export function industriesLinkingTo(href: string): IndustryPage[] {
  const path = href.startsWith('/') ? href : `/${href}`
  const slug = path.replace(/^\//, '').replace(/\/$/, '')
  const solutionSlug = path.startsWith('/solutions/')
    ? path.slice('/solutions/'.length).replace(/\/$/, '')
    : ''
  return industryPages.filter((page) => {
    if (page.relatedServices.includes(slug)) return true
    if (solutionSlug && page.relatedSolutions.includes(solutionSlug)) return true
    return false
  })
}

export function labelForHref(href: string): string {
  if (href === '/enterprise') return 'Enterprise Excel applications'
  const service = servicePages.find((page) => page.href === href)
  if (service) return service.label
  const solution = solutionPages.find((page) => page.href === href)
  if (solution) return solution.navLabel
  return href
}

export function relatedLinksFor(page: IndustryPage): { href: string; label: string }[] {
  const serviceLinks = page.relatedServices.map((slug) => {
    const href = slug.startsWith('/') ? slug : `/${slug}`
    return { href, label: labelForHref(href) }
  })
  const solutionLinks = page.relatedSolutions.map((slug) => {
    const href = `/solutions/${slug}`
    return { href, label: labelForHref(href) }
  })
  const seen = new Set<string>()
  return [...serviceLinks, ...solutionLinks].filter((link) => {
    if (seen.has(link.href)) return false
    seen.add(link.href)
    return true
  })
}

export function industryFaqs(path: string): IndustryFaq[] {
  const normalized = path.startsWith('/') ? path.replace(/\/$/, '') || '/' : `/${path}`
  if (normalized === ALL_INDUSTRIES_HREF) return []
  const slug = normalized.slice(`${ALL_INDUSTRIES_HREF}/`.length)
  return getIndustryBySlug(slug)?.faqs ?? []
}

export function industrySeoPartial(
  path: string,
  market: MarketId,
): IndustryCmsFields | null {
  const normalized = path.startsWith('/') ? path.replace(/\/$/, '') || '/' : `/${path}`
  const seo =
    normalized === ALL_INDUSTRIES_HREF
      ? INDEX_SEO[market]
      : getIndustryBySlug(normalized.slice(`${ALL_INDUSTRIES_HREF}/`.length))?.seo[market]
  if (!seo) return null
  return {
    h1: seo.h1,
    heroIntro: seo.introLead,
    metaTitle: seo.seoTitle,
    metaDescription: seo.metaDescription,
    keywords: seo.keywords.join(', '),
    faqs: industryFaqs(normalized),
  }
}

export function sectorMatchesIndustry(page: IndustryPage, sector: string): boolean {
  const key = sector.trim().toLowerCase()
  return page.caseStudySectors.some((item) => item.toLowerCase() === key)
}
