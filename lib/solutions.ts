/**
 * Solutions section — single source of truth for index cards and individual pages.
 */

import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Building2,
  CalendarRange,
  ClipboardCheck,
  Factory,
  FileSpreadsheet,
  GitBranch,
  LayoutDashboard,
  Calculator,
  Users,
  Wrench,
} from 'lucide-react'
import { manufacturingCostingSolution } from './solutions-manufacturing'
import { quotingEstimatingSolution } from './solutions-quoting'

/** @deprecated Use getSiteOrigin() / market copy site.origin — NZ only. */
export const SITE_ORIGIN = 'https://www.xlsexperts.co.nz'
export const ALL_SOLUTIONS_HREF = '/solutions'

export type SolutionSlug =
  | 'dashboards-business-intelligence'
  | 'resource-planning-scheduling'
  | 'project-costing-financial-modelling'
  | 'property-development-applications'
  | 'quoting-estimating-systems'
  | 'manufacturing-costing-estimating-quoting'
  | 'survey-inspection-field-apps'
  | 'client-staff-portals'
  | 'asset-maintenance-operations-solutions'
  | 'workflow-automation-systems-integration'

export type SolutionIconKey =
  | 'spreadsheet'
  | 'dashboard'
  | 'scheduling'
  | 'financial'
  | 'property'
  | 'quoting'
  | 'manufacturing'
  | 'field'
  | 'portal'
  | 'maintenance'
  | 'workflow'

export type SolutionCaseStudyRef = {
  slug: string
  title: string
  client: string
  sector: string
  summary: string
  /** When false, omitted from public pages (placeholder for future content). */
  published: boolean
}

export type SolutionFaq = { question: string; answer: string }

export type SolutionDeepCard = {
  title: string
  description?: string
  items?: string[]
}

export type SolutionDeepLayer = {
  title: string
  description: string
}

export type SolutionRelatedExtra = {
  href: string
  title: string
  label: string
}

export type SolutionRelatedReading = {
  href: string
  title: string
  description: string
}

/** Long-form content blocks for in-depth solution pages. */
export type SolutionDeepSection = {
  id: string
  heading: string
  intro?: string
  body?: string[]
  items?: string[]
  cards?: SolutionDeepCard[]
  layers?: SolutionDeepLayer[]
  /** Highlighted statement rendered after body copy. */
  callout?: string
  /** Card grid columns. Defaults to 2. */
  cardColumns?: 2 | 3
  /** Override the default alternating background. */
  tone?: 'white' | 'muted'
}

export type SolutionFeatureGrid = {
  heading: string
  intro?: string
  features: string[]
}

export type SolutionWhyUs = {
  heading: string
  body: string[]
}

export type SolutionLeadMagnet = {
  id: string
  heading: string
  body: string
  ctaLabel: string
  emailHint: string
}

export type SolutionPage = {
  slug: SolutionSlug
  href: string
  title: string
  shortTitle: string
  navLabel: string
  summary: string
  exampleUses: string[]
  icon: SolutionIconKey
  metaTitle: string
  metaDescription: string
  heroHeading: string
  heroIntroduction: string
  /** Optional line under the H1, used on long-form pillar pages. */
  heroSubheading?: string
  /** Extra hero paragraphs after the indexed intro, before the CTAs. */
  heroAfterIntroduction?: string[]
  introHeading: string
  introBody: string[]
  introItems?: string[]
  problemsHeading: string
  problems: string[]
  capabilitiesHeading: string
  capabilities: string[]
  useCasesHeading: string
  useCases: { title: string; description: string }[]
  technologyHeading: string
  technologyNotes: string[]
  /** Left-align technology notes when they are longer prose. */
  technologyAlign?: 'center' | 'left'
  technologies: string[]
  approachHeading?: string
  approachBody?: string[]
  processHeading: string
  processSteps: { title: string; description: string }[]
  faqs: SolutionFaq[]
  relatedSlugs: SolutionSlug[]
  relatedLinkLabels: Record<string, string>
  caseStudies: SolutionCaseStudyRef[]
  ctaHeading: string
  ctaBody: string
  contactOptionLabel: string
  primaryCtaLabel?: string
  secondaryCtaLabel?: string
  ctaButtonLabel?: string
  /** Prefer deepSections over the standard problem/capability/use-case blocks. */
  preferDeepLayout?: boolean
  /** When true, example applications are rendered as deep sections instead. */
  skipUseCaseGrid?: boolean
  /** When true, the 5-step process lives in deepSections instead. */
  skipProcessSteps?: boolean
  deepSections?: SolutionDeepSection[]
  featureGrid?: SolutionFeatureGrid
  whyUs?: SolutionWhyUs
  relatedExtras?: SolutionRelatedExtra[]
  relatedReading?: SolutionRelatedReading[]
  /** Extra sections on the standard (non-deep) layout. */
  afterIntroSections?: SolutionDeepSection[]
  afterCapabilitiesSections?: SolutionDeepSection[]
  afterUseCasesSections?: SolutionDeepSection[]
  leadMagnet?: SolutionLeadMagnet
}

export const solutionIcons: Record<SolutionIconKey, LucideIcon> = {
  spreadsheet: FileSpreadsheet,
  dashboard: LayoutDashboard,
  scheduling: CalendarRange,
  financial: BarChart3,
  property: Building2,
  quoting: Calculator,
  manufacturing: Factory,
  field: ClipboardCheck,
  portal: Users,
  maintenance: Wrench,
  workflow: GitBranch,
}

const processStepsDefault = [
  {
    title: 'Understand the current process',
    description:
      'We map how work actually happens today — who uses the system, where data comes from, and what slows the team down.',
  },
  {
    title: 'Identify the right level of modernisation',
    description:
      'Not every process needs a full rebuild. We recommend the simplest approach that solves the business problem reliably.',
  },
  {
    title: 'Build and test the solution',
    description:
      'We deliver working software early, refine it with real users, and validate edge cases before go-live.',
  },
  {
    title: 'Support implementation and ongoing improvement',
    description:
      'Training, documentation and a clear path for enhancements so the system keeps matching how you work.',
  },
] as const

export const solutionPages: readonly SolutionPage[] = [
  {
    slug: 'dashboards-business-intelligence',
    href: '/solutions/dashboards-business-intelligence',
    title: 'Dashboards & Business Intelligence',
    shortTitle: 'Dashboards & BI',
    navLabel: 'Dashboards & Business Intelligence',
    summary:
      'Turn disconnected business data into clear dashboards, reporting systems and decision-making tools.',
    exampleUses: [
      'Executive dashboards',
      'KPI and operational reporting',
      'Financial and sales reporting',
      'Power BI and live data integration',
    ],
    icon: 'dashboard',
    metaTitle: 'Dashboards & Business Intelligence NZ',
    metaDescription:
      'Practical dashboards and BI for New Zealand businesses — KPI reporting, Power BI, Excel dashboards and live data consolidation that management can trust.',
    heroHeading: 'Business information you can trust — not just charts',
    heroIntroduction:
      'XLS Experts turns operational, financial and sales data into clear reporting systems that help teams understand performance and make decisions. The objective is useful, trusted information — not decorative visuals.',
    introHeading: 'Reporting that supports real decisions',
    introBody: [
      'Many organisations already have data — in spreadsheets, accounting systems, CRMs and operational tools. The problem is getting consistent numbers in front of the people who need them, without days of manual preparation.',
      'We design dashboards and reporting packs around the questions management actually asks, with clear definitions, reliable refresh and a level of automation that matches your environment.',
    ],
    problemsHeading: 'Common reporting problems we solve',
    problems: [
      'Reports take days to prepare each month',
      'Different teams use different numbers for the same KPI',
      'Management lacks visibility of operational performance',
      'Reporting depends on manual spreadsheet updates',
      'Information is spread across several systems',
      'Dashboards look impressive but are commercially unhelpful',
    ],
    capabilitiesHeading: 'What a reporting system can include',
    capabilities: [
      'Management and executive dashboards',
      'KPI and operational reporting',
      'Financial and sales / pipeline reporting',
      'Power BI solutions',
      'Excel dashboards and automated report packs',
      'Web-based dashboards',
      'Live database reporting',
      'Data consolidation across systems',
    ],
    useCasesHeading: 'Example applications',
    useCases: [
      {
        title: 'Executive performance pack',
        description:
          'A concise monthly or weekly view of the measures leadership reviews — with agreed definitions and automated refresh where practical.',
      },
      {
        title: 'Operational KPI dashboard',
        description:
          'Live or near-live visibility for managers who need to act during the week, not after month-end.',
      },
      {
        title: 'Financial and sales reporting',
        description:
          'Structured views of margin, pipeline, branch or product performance drawn from accounting, CRM or operational sources.',
      },
      {
        title: 'Cross-system consolidation',
        description:
          'Bring together exports and live feeds so one reporting layer replaces conflicting spreadsheets.',
      },
    ],
    technologyHeading: 'Possible technology and architecture',
    technologyNotes: [
      'We select Excel, Power BI, web dashboards or a combination based on who needs access, how often data must refresh, and what systems already hold the truth.',
      'Charts are secondary. Definitions, source control and refresh reliability come first.',
    ],
    technologies: [
      'Microsoft Excel',
      'Power BI',
      'Power Query',
      'SQL Server / PostgreSQL',
      'APIs',
      'Microsoft 365',
      'Next.js dashboards',
    ],
    processHeading: 'How we deliver reporting systems',
    processSteps: [...processStepsDefault],
    faqs: [
      {
        question: 'Can dashboards update automatically?',
        answer:
          'Often yes. Where source systems allow, we set up scheduled refreshes or live connections. Where data still arrives as files, we can automate imports and validate them before numbers appear on the dashboard.',
      },
      {
        question: 'Do we need Power BI, or is Excel enough?',
        answer:
          'Excel remains excellent for many teams. Power BI or a web dashboard is better when you need broader distribution, stronger row-level security, or interactive exploration by many users. We recommend based on audience and governance needs.',
      },
      {
        question: 'How do you stop different teams using different numbers?',
        answer:
          'We agree metric definitions, identify a system of record where possible, and design the reporting layer so everyone draws from the same prepared dataset.',
      },
      {
        question: 'Can you integrate with our accounting or CRM software?',
        answer:
          'Yes. We regularly connect to accounting, CRM and operational platforms via APIs, database access or structured exports.',
      },
      {
        question: 'Will you rebuild our entire data warehouse?',
        answer:
          'Only if the business case requires it. Many useful dashboards start with a focused reporting model for the decisions that matter most.',
      },
    ],
    relatedSlugs: [
      'project-costing-financial-modelling',
      'resource-planning-scheduling',
      'workflow-automation-systems-integration',
    ],
    relatedLinkLabels: {
      'project-costing-financial-modelling':
        'Pair reporting with financial models',
      'resource-planning-scheduling':
        'See capacity and utilisation clearly',
      'workflow-automation-systems-integration':
        'Keep source data flowing without copy-paste',
    },
    caseStudies: [
      {
        slug: 'sales-reporting-wac',
        title: 'Sales Data Analysis & Performance Reporting',
        client: 'WAC NZ',
        sector: 'Retail / Distribution',
        summary:
          'Power Query, VBA and pivots replaced hours of manual consolidation with automated sales outlet reporting.',
        published: true,
      },
      {
        slug: 'claims-analysis-nzi',
        title: 'Claims Analysis Enterprise App',
        client: 'NZI',
        sector: 'Insurance',
        summary:
          'Browser data collection feeding Excel via SQL — pivot summaries and trend charts for analysts who already work in Excel.',
        published: true,
      },
      {
        slug: 'fleet-journey-bus-transport',
        title: 'Fleet Journey Reporting & Analysis',
        client: 'Bus Transport NZ',
        sector: 'Transport & Logistics',
        summary:
          'Automated ingestion of operational feeds with pivot-based fleet performance and exception reporting.',
        published: true,
      },
    ],
    ctaHeading: 'Discuss your reporting needs',
    ctaBody:
      'Tell us which decisions are hard to make today, where the numbers live, and who needs to see them. We will recommend a practical dashboard approach.',
    contactOptionLabel: 'Dashboards & Business Intelligence',
  },
  {
    slug: 'resource-planning-scheduling',
    href: '/solutions/resource-planning-scheduling',
    title: 'Resource Planning Tools & Scheduling Systems',
    shortTitle: 'Resource planning',
    navLabel: 'Resource Planning Tools & Scheduling Systems',
    summary:
      'Plan staff, equipment, workloads and delivery timelines through purpose-built scheduling and forecasting systems.',
    exampleUses: [
      'Capacity planning',
      'Staff scheduling',
      'Resource forecasting',
      'Project and production scheduling',
    ],
    icon: 'scheduling',
    metaTitle: 'Resource Planning Tools & Scheduling Systems NZ',
    metaDescription:
      'Custom resource planning and scheduling systems for New Zealand teams — staff scheduling, capacity planning, utilisation and production allocation.',
    heroHeading: 'Plan people, equipment and time with a clear system',
    heroIntroduction:
      'XLS Experts helps organisations allocate staff, equipment, workloads and delivery timelines more effectively through purpose-built planning and scheduling systems — from structured Excel planners through to multi-user applications.',
    introHeading: 'From guesswork to a shared resource picture',
    introBody: [
      'Consulting firms, construction teams, professional services, manufacturing and operational businesses often schedule work across multiple tools and personal spreadsheets. That leads to double-booking, underused capacity and last-minute conflict.',
      'We build planning systems that show availability, demand and commitments in one place — matched to how your teams actually assign work.',
    ],
    problemsHeading: 'Scheduling problems we see regularly',
    problems: [
      'Double-booked staff or equipment',
      'Underutilised resources with no clear view of why',
      'No reliable picture of future capacity',
      'Project managers maintaining separate plans',
      'Planning based on guesswork rather than availability data',
      'Frequent last-minute scheduling conflicts',
    ],
    capabilitiesHeading: 'What a resource planning system can include',
    capabilities: [
      'Staff scheduling and workforce planning',
      'Project resourcing and job allocation',
      'Capacity planning and utilisation reporting',
      'Production and equipment scheduling',
      'Demand forecasting',
      'Planned versus actual tracking',
      'Leave and availability integration',
    ],
    useCasesHeading: 'Example applications',
    useCases: [
      {
        title: 'Professional services utilisation',
        description:
          'Allocate consultants and specialists across projects with visibility of booked versus available capacity.',
      },
      {
        title: 'Construction and site crew planning',
        description:
          'Coordinate crews, plant and subcontractors against programme dates and site constraints.',
      },
      {
        title: 'Manufacturing and production scheduling',
        description:
          'Balance jobs, machines and labour so delivery commitments stay realistic.',
      },
      {
        title: 'Operational roster and equipment boards',
        description:
          'Day-to-day allocation boards with clear ownership, conflicts highlighted before they become crises.',
      },
    ],
    technologyHeading: 'Possible technology and architecture',
    technologyNotes: [
      'Simple team planners may stay in Excel or Microsoft 365. Multi-site, multi-user scheduling usually needs a shared database and controlled web interface.',
      'Integrations with leave, job management or CRM systems keep the plan from drifting out of date.',
    ],
    technologies: [
      'Microsoft Excel',
      'Microsoft 365',
      'SharePoint',
      'SQL databases',
      'Custom web apps',
      'APIs',
      'Power BI (utilisation reporting)',
    ],
    processHeading: 'How we approach planning systems',
    processSteps: [...processStepsDefault],
    faqs: [
      {
        question: 'Can several staff use the system at the same time?',
        answer:
          'Yes for multi-user designs. If you currently share an Excel file, we will assess whether co-authoring is enough or whether a database-backed application is safer.',
      },
      {
        question: 'Can you integrate leave and availability?',
        answer:
          'Where the data exists — in HR, Microsoft 365 calendars or another system — we can factor availability into the plan so bookings respect real constraints.',
      },
      {
        question: 'Will this replace our project management tool?',
        answer:
          'Not necessarily. Many clients keep their PM or job system and use the planning layer for capacity and allocation, with integration where it adds value.',
      },
      {
        question: 'Do you build for manufacturing as well as services?',
        answer:
          'Yes. We work across consulting, construction, professional services, manufacturing and operational teams — the logic differs, but the need for a shared capacity view is the same.',
      },
      {
        question: 'Can utilisation report into a dashboard?',
        answer:
          'Yes. Planned versus actual and utilisation views often feed management dashboards once the planning data is structured.',
      },
    ],
    relatedSlugs: [
      'asset-maintenance-operations-solutions',
      'dashboards-business-intelligence',
      'client-staff-portals',
      'workflow-automation-systems-integration',
    ],
    relatedLinkLabels: {
      'asset-maintenance-operations-solutions':
        'Asset maintenance operations and ERP extensions',
      'dashboards-business-intelligence':
        'Report utilisation and capacity to management',
      'client-staff-portals':
        'Let staff view assignments and updates online',
      'workflow-automation-systems-integration':
        'Sync jobs and bookings across systems',
    },
    caseStudies: [
      {
        slug: 'maintenance-scheduling-ocs',
        title: 'Maintenance Scheduling & Optimisation Tool',
        client: '1M / OCS Group',
        sector: 'Facilities Management',
        summary:
          'Excel add-on with SIMPRO integration for exception reporting and schedule optimisation across asset classes.',
        published: true,
      },
      {
        slug: 'range-planning-max-fashion',
        title: 'Range Planning & Open To Buy Automation',
        client: 'Max Fashion',
        sector: 'Fashion Retail',
        summary:
          'Collaborative range planning with a shared SQL backend and live sales/stock feeds.',
        published: true,
      },
    ],
    ctaHeading: 'Discuss your planning challenge',
    ctaBody:
      'Tell us who you schedule, what conflicts keep appearing, and what a good week of allocation would look like. We will suggest a practical planning approach.',
    contactOptionLabel: 'Resource Planning Tools & Scheduling Systems',
  },
  {
    slug: 'project-costing-financial-modelling',
    href: '/solutions/project-costing-financial-modelling',
    title: 'Project Costing Tools & Financial Modelling',
    shortTitle: 'Financial modelling',
    navLabel: 'Project Costing Tools & Financial Modelling',
    summary:
      'Build robust financial models and planning systems for complex projects, investments and commercial decisions.',
    exampleUses: [
      'Property development modelling',
      'Cash-flow forecasting',
      'Scenario analysis',
      'Budgeting and investment evaluation',
    ],
    icon: 'financial',
    metaTitle: 'Project Costing Tools & Financial Modelling NZ',
    metaDescription:
      'Structured project costing and financial modelling for New Zealand businesses — feasibility, cash-flow, scenarios and investment evaluation systems.',
    heroHeading: 'Financial models that also work as operational systems',
    heroIntroduction:
      'XLS Experts builds structured financial models and commercial planning systems for projects where timing, costs, financing and scenarios need to be understood clearly — and often updated as the project evolves.',
    introHeading: 'More than a static spreadsheet for the board pack',
    introBody: [
      'Many financial models are also operational systems. They need month-by-month timelines, dependency logic, staged costs, financing drawdowns, occupancy or revenue assumptions, version control and scenario comparison.',
      'We do not position this as generic accounting support. We build models and planning tools that help commercial teams evaluate options and manage project economics with confidence.',
    ],
    problemsHeading: 'Where project economics become hard to manage',
    problems: [
      'Feasibility assumptions are buried in undocumented cells',
      'Scenario comparison requires duplicating entire workbooks',
      'Cash-flow timing is hard to reconcile with financing',
      'Only one modeller understands the structure',
      'Planned versus actual reporting is manual and late',
      'Board and lender packs take too long to refresh',
    ],
    capabilitiesHeading: 'What we can build',
    capabilities: [
      'Project costing and feasibility models',
      'Property development modelling',
      'Cash-flow forecasting',
      'Scenario and sensitivity analysis',
      'Loan and interest modelling',
      'Investment evaluation and budgeting',
      'Pricing and margin analysis',
      'Monthly project timelines with dependency logic',
      'Planned versus actual reporting and management dashboards',
    ],
    useCasesHeading: 'Example applications',
    useCases: [
      {
        title: 'Property development feasibility',
        description:
          'Land, construction, financing, sales or lease-up assumptions structured for clear scenario comparison.',
      },
      {
        title: 'Project cash-flow and drawdown planning',
        description:
          'Month-by-month views that connect costs, revenue timing and funding requirements.',
      },
      {
        title: 'Investment and margin evaluation',
        description:
          'Structured models for pricing, contribution and return metrics that stand up to commercial scrutiny.',
      },
      {
        title: 'Live project tracking layer',
        description:
          'Connect the model to actuals and dashboards so management sees drift early — not only at month-end.',
      },
    ],
    technologyHeading: 'Possible technology and architecture',
    technologyNotes: [
      'Excel remains the primary environment for many financial models because it is auditable and familiar to finance stakeholders.',
      'Where multiple users, permissions or live actuals matter, we add database storage, controlled inputs and dashboard outputs.',
    ],
    technologies: [
      'Microsoft Excel',
      'VBA',
      'Power Query',
      'SQL databases',
      'Power BI',
      'Microsoft 365',
    ],
    processHeading: 'How we deliver modelling systems',
    processSteps: [...processStepsDefault],
    faqs: [
      {
        question: 'Can you improve an existing model rather than rebuild it?',
        answer:
          'Yes. We regularly audit and strengthen existing models — clarifying structure, reducing risk, documenting assumptions and adding scenario controls — when the commercial logic is sound.',
      },
      {
        question: 'Do you provide accounting or bookkeeping services?',
        answer:
          'No. We build commercial models and planning systems. Day-to-day accounting remains with your finance team or accountant.',
      },
      {
        question: 'Can models support lender or board packs?',
        answer:
          'Yes. We design outputs that are clear, version-controlled and suitable for external review, alongside working models for the project team.',
      },
      {
        question: 'How do you handle version control?',
        answer:
          'Through disciplined workbook structure, clear assumption sheets, naming conventions and, where needed, shared storage or a database-backed scenario library.',
      },
      {
        question: 'Can scenarios feed a dashboard?',
        answer:
          'Yes. Once scenarios are structured, summary metrics can drive management dashboards for faster comparison.',
      },
    ],
    relatedSlugs: [
      'manufacturing-costing-estimating-quoting',
      'property-development-applications',
      'dashboards-business-intelligence',
    ],
    relatedLinkLabels: {
      'manufacturing-costing-estimating-quoting':
        'Manufacturing costing, estimating and quoting systems',
      'property-development-applications':
        'See our property development platform for full lifecycle projects',
      'dashboards-business-intelligence':
        'Present model outputs as management dashboards',
    },
    caseStudies: [
      {
        slug: 'financial-modelling-amp',
        title: 'Financial Modelling & Reporting Suite',
        client: 'AMP Financial Services',
        sector: 'Financial Services',
        summary:
          'Extensible Excel modelling with VBA, EDI and SQL connectivity for analysts and executive stakeholders.',
        published: true,
      },
      {
        slug: 'price-modelling-ukwsl',
        title: 'Price Increase Modelling & ERP Integration',
        client: 'UKWSL',
        sector: 'Waste Management',
        summary:
          'Oracle-connected pricing scenarios in Excel with dashboard outputs ready for ERP upload — cycle time cut from days to hours.',
        published: true,
      },
    ],
    ctaHeading: 'Discuss your modelling project',
    ctaBody:
      'Share the decision you need to support, the timeline of the project, and how assumptions change today. We will propose a model structure that is clear and maintainable.',
    contactOptionLabel: 'Project Costing Tools & Financial Modelling',
  },
  {
    slug: 'property-development-applications',
    href: '/solutions/property-development-applications',
    title: 'Property Development Applications',
    shortTitle: 'Property development',
    navLabel: 'Property Development Applications',
    summary:
      'Property development financial models, Excel automation and cloud applications spanning feasibility, financing, construction, sales and portfolio reporting — built around how developers actually work.',
    exampleUses: [
      'Excel feasibility and cash-flow models',
      'Development automation in Excel',
      'Scenario comparison',
      'Cloud escalation when collaboration demands it',
    ],
    icon: 'property',
    metaTitle:
      'Property Development Software & Financial Modelling NZ | XLS Experts',
    metaDescription:
      'Property development Excel models, automation and cloud applications for New Zealand developers — feasibility, cash-flow modelling, scenario analysis and lifecycle project control.',
    heroHeading: 'Property Development Applications',
    heroIntroduction:
      'Excel financial models, automations and cloud-based property development applications designed around the complete lifecycle of a development project—from initial concept through to construction, sales and financial completion.',
    introHeading: 'Excel where it works — cloud when you need to escalate',
    introBody: [
      'XLS Experts has worked with numerous property developers over many years, building highly effective Excel-based financial models, project planning tools and development feasibility systems. Many of those models remain totally functional as the primary commercial engine for a development — and that is often the right place to stay.',
      'If you already have Excel sheets you trust, we can develop, extend and automate them: clearer structure, stronger cash-flow logic, scenario controls, drawdown modelling and reporting packs your team already knows how to use.',
      'As requirements grow — multi-user collaboration, governance, portfolio visibility or AI-assisted project support — we also offer a modern cloud-based Property Development Platform as an alternate or escalation pathway. It demonstrates the depth of our property development knowledge, without forcing Excel users off a tool that still serves them well.',
      'Neither path is off-the-shelf. Each implementation is configured around the client’s own development methodology, funding structures and reporting requirements.',
    ],
    problemsHeading: 'Where development control usually breaks down',
    problems: [
      'Feasibility lives in one workbook while the programme lives in another',
      'Cash-flow timing and funding drawdowns are hard to keep aligned',
      'Consent or construction delays are not reflected in finance and sales forecasts',
      'Scenario comparison means duplicating models and hoping versions stay consistent',
      'Investors, lenders and the project team see different numbers',
      'Assumptions are undocumented and only one person can defend the model',
    ],
    capabilitiesHeading: 'What we can build',
    capabilities: [
      'Excel property development financial models and cash-flow forecasting',
      'Excel automation for reporting, drawdowns and scenario packs',
      'Timeline-connected modelling across the development lifecycle',
      'Funding, loan drawdown and interest capitalisation modelling',
      'Scenario and sensitivity comparison',
      'Budget tracking and variation management',
      'Sales, settlement and rental-hold scenario tracking',
      'Cloud Property Development Platform when collaboration requires it',
      'Reporting dashboards for boards, lenders and project teams',
      'AI property development assistant grounded in the project',
    ],
    useCasesHeading: 'Who this is for',
    useCases: [
      {
        title: 'Property developers and development managers',
        description:
          'Strengthen or extend existing Excel feasibility models — or escalate to a connected environment as the project moves from concept to completion.',
      },
      {
        title: 'Project directors and commercial managers',
        description:
          'See how programme changes affect cash flow, funding gaps, margins and reporting obligations.',
      },
      {
        title: 'Investors, trusts and joint ventures',
        description:
          'Compare retain-versus-sell, staging and funding structures with clear equity and IRR outcomes.',
      },
      {
        title: 'Councils and organisations delivering mixed-use projects',
        description:
          'Coordinate approvals, infrastructure, construction and financial completion with shared visibility.',
      },
    ],
    technologyHeading: 'Technology approach',
    technologyNotes: [
      'Many developments are best served by a disciplined Excel model with automation — auditable, familiar and totally functional for the commercial team.',
      'Our cloud Property Development Platform is an alternate or escalation pathway when multi-user collaboration, stronger governance or portfolio-level visibility become the constraint — not a requirement to leave Excel behind.',
      'Either path is configured to your methodology: stages, cost codes, funding rules, GST treatment and reporting packs.',
    ],
    technologies: [
      'Microsoft Excel',
      'VBA / Excel automation',
      'Financial modelling',
      'Cloud web application',
      'Timeline workbench',
      'AI assistant',
      'Reporting dashboards',
      'Role-based security',
    ],
    preferDeepLayout: true,
    deepSections: [
      {
        id: 'understanding-property-development',
        heading: 'Understanding property development',
        intro:
          'Successful developments require hundreds of interrelated decisions across time. A change in consent timing, construction cost or sales velocity does not stay in one place — it ripples through funding, cash flow, risk and reporting.',
        body: [
          'Our property development applications — whether advanced Excel models or a connected cloud platform — are designed around the complete lifecycle of a property development, residential and mixed-use, so commercial decisions are made with the full programme in view, not a static profit figure.',
          'Every stage affects multiple later stages. That is why we treat concept, approvals, financing, construction, sales and completion as one connected commercial system rather than separate tools.',
        ],
        items: [
          'Initial Concept',
          'Site Identification',
          'Land Acquisition',
          'Due Diligence',
          'Feasibility Studies',
          'Planning',
          'Resource Consent',
          'Engineering',
          'Design',
          'Council Approvals',
          'Financing',
          'Site Preparation',
          'Procurement',
          'Construction',
          'Sales and Marketing',
          'Settlements',
          'Rental and Holding Scenarios',
          'Project Completion',
          'Portfolio Reporting',
        ],
      },
      {
        id: 'timeline-workbench',
        heading: 'Timeline workbench',
        intro:
          'One of the core strengths of our property development applications is a timeline-based development workbench — in advanced Excel models or in the cloud platform. Every material component of a project exists on an interconnected timeline — not as isolated dates in a Gantt chart that finance never sees.',
        body: [
          'When a milestone moves, downstream activities, funding requirements and reporting should move with it. The workbench is built so programme change is immediately visible in commercial terms.',
        ],
        items: [
          'Acquisition dates',
          'Approvals and consent milestones',
          'Finance drawdowns',
          'Construction phases',
          'Consultant milestones',
          'Infrastructure delivery',
          'Inspections',
          'Practical completion',
          'Code compliance',
          'Settlements',
          'Occupancy',
        ],
        cards: [
          {
            title: 'Connected programme and funding',
            description:
              'Changing one milestone automatically affects downstream activities, funding requirements and management reporting — so the development team is not reconciling three different plans by hand.',
          },
          {
            title: 'Built for commercial control',
            description:
              'The timeline is not decoration. It is the spine of cash-flow forecasting, drawdown modelling and scenario comparison across the life of the project.',
          },
        ],
      },
      {
        id: 'financial-modelling',
        heading: 'Property development financial modelling',
        intro:
          'Financial modelling goes well beyond a static feasibility spreadsheet. Whether we extend your Excel model or configure a connected application, the emphasis is on understanding cash flow over time — not only a profit calculation at the end of a workbook.',
        body: [
          'Development feasibility software that ignores timing understates risk. Interest capitalisation, GST treatment, staged sales and funding gaps only make sense when costs and revenue sit on a real programme.',
          'We model the commercial structure developers actually manage: land, consultants, construction, infrastructure, borrowing, contingencies, sales or rental income, margins, equity and IRR — with the ability to refresh as assumptions change.',
        ],
        items: [
          'Land acquisition costs',
          'Professional fees',
          'Construction costs',
          'Infrastructure',
          'Borrowing and interest capitalisation',
          'Contingencies',
          'Sales revenue',
          'Rental income',
          'GST / VAT considerations',
          'Developer margins',
          'Cash-flow forecasting',
          'Funding requirements',
          'Loan drawdown modelling',
          'Scenario comparisons',
          'Sensitivity analysis',
          'Profitability optimisation',
          'Project IRR',
          'Equity requirements',
          'Funding gaps',
        ],
      },
      {
        id: 'scenario-modelling',
        heading: 'Development scenario modelling',
        intro:
          'Developers constantly ask “what happens if…”. Our Excel models and cloud applications are built for rapid scenario comparison so commercial decisions are grounded in alternatives, not a single base case that becomes outdated the week after it is printed.',
        body: [
          'Interest rates move. Construction costs rise. Consents slip. Staging changes. Product mix shifts. The sales programme accelerates or stalls. You retain stock rather than sell. Each of those questions deserves a structured answer — not another duplicated workbook.',
        ],
        cards: [
          {
            title: 'Typical scenario questions',
            items: [
              'What if interest rates increase?',
              'What if construction costs rise?',
              'What if consents are delayed?',
              'What if the project stages differently?',
              'What if more townhouses are built?',
              'What if the sales programme changes?',
              'What if we retain rather than sell?',
            ],
          },
          {
            title: 'Commercial decision support',
            description:
              'Compare scenarios side by side for cash flow, funding gaps, equity requirement, margin and IRR — so boards, lenders and development managers can debate options with shared numbers.',
          },
        ],
      },
      {
        id: 'ai-property-development-assistant',
        heading: 'AI property development assistant',
        intro:
          'On the cloud pathway, the application includes a built-in AI assistant designed as a knowledgeable project assistant — not a generic chatbot. Unlike consumer AI tools, it is prompted in multiple layers so answers relate to property development, your region, your workflows and the live project.',
        body: [
          'Because the assistant already understands the development context, it can explain financial impacts, challenge assumptions and help with documentation in language that fits the project — rather than offering generic software advice.',
        ],
        layers: [
          {
            title: 'Property development expertise',
            description:
              'Foundational prompting around development lifecycle, feasibility logic, funding behaviour and commercial risk.',
          },
          {
            title: 'Country and regional practice',
            description:
              'Regulations, terminology and development practices relevant to the jurisdiction — including New Zealand planning and delivery realities where applicable.',
          },
          {
            title: 'Company-specific workflows',
            description:
              'Your methodology, cost structures, approval paths and reporting conventions so guidance matches how your organisation actually works.',
          },
          {
            title: 'Project-specific information',
            description:
              'The live assumptions, programme, funding and commercial position of the development under discussion.',
          },
        ],
        cards: [
          {
            title: 'What the assistant can help with',
            items: [
              'Explain financial impacts of programme or cost changes',
              'Review assumptions and flag weak spots',
              'Identify missing considerations',
              'Answer project questions in context',
              'Generate and refine reports',
              'Assist with documentation',
              'Provide planning guidance',
              'Summarise project status',
              'Help evaluate alternative approaches',
            ],
          },
        ],
      },
    ],
    featureGrid: {
      heading: 'Capabilities across Excel and cloud',
      intro:
        'Whether we extend your Excel models or configure a cloud application, the commercial toolkit covers property development financial modelling and day-to-day project control.',
      features: [
        'Excel feasibility models',
        'Excel automation',
        'Timeline workbench',
        'Financial modelling',
        'Cash-flow forecasting',
        'Scenario comparison',
        'Budget tracking',
        'Variation management',
        'Consultant management',
        'Document management',
        'Milestone tracking',
        'Risk register',
        'Sales tracking',
        'Funding management',
        'Reporting dashboards',
        'Resource planning',
        'Task workflows',
        'Approval tracking',
        'Cloud collaboration',
        'AI assistant',
        'Excel integration',
        'Role-based security',
        'Audit trails',
      ],
    },
    whyUs: {
      heading: 'Why XLS Experts',
      body: [
        'We are not software vendors attempting to learn property development after the product was designed. We learned property development first — through years of consulting on Excel feasibility models, cash-flow systems and project economics. Over that time we have built several highly effective Excel models that remain totally functional for the teams that use them.',
        'Our cloud Property Development Platform grew out of that work as an alternate or escalation pathway — useful when collaboration and governance demand it, and as proof of how deeply we understand the domain. We do not alienate Excel users who wish to stay in Excel; we develop and extend what already works.',
        'Either path is designed around practical commercial realities: funding timing, consent risk, construction variation, sales velocity and the reporting needs of investors and lenders.',
      ],
    },
    processHeading: 'How we deliver property development applications',
    processSteps: [
      {
        title: 'Understand your methodology and current models',
        description:
          'We map how you run developments today — including existing Excel workbooks — stages, cost structures, funding rules, reporting packs and the decisions that matter most.',
      },
      {
        title: 'Choose Excel extension or cloud escalation',
        description:
          'We recommend whether to strengthen your Excel models and automation, move selected parts into Microsoft 365, or configure a cloud platform — based on users, collaboration and risk, not a preferred product.',
      },
      {
        title: 'Build, migrate logic and validate with real projects',
        description:
          'We preserve commercial logic that is sound, then test cash flow, drawdowns and scenarios against live or recent developments.',
      },
      {
        title: 'Train the team and support ongoing use',
        description:
          'Development managers, commercial staff and stakeholders get practical training, with a clear path for enhancements as portfolios grow.',
      },
    ],
    faqs: [
      {
        question: 'Do we have to leave Excel?',
        answer:
          'No. Many clients stay in Excel. We develop and extend existing feasibility models and automations where that is the right commercial fit. Our cloud Property Development Platform is an alternate or escalation pathway when multi-user collaboration, stronger governance or portfolio visibility becomes the constraint.',
      },
      {
        question: 'Is this off-the-shelf property development software?',
        answer:
          'No. Whether Excel or cloud, each implementation is shaped around your methodology, funding structures and reporting requirements rather than a one-size product.',
      },
      {
        question:
          'Can you improve our existing Excel feasibility models?',
        answer:
          'Yes. That is often the starting point. We strengthen structure, cash-flow timing, scenario controls, documentation and automation while keeping the model familiar to your team — and only escalate to cloud when there is a clear reason.',
      },
      {
        question: 'Does it handle New Zealand GST and funding structures?',
        answer:
          'Yes. Implementations are configured for local commercial treatment, including GST considerations, drawdown behaviour and the reporting expectations of New Zealand lenders and investors.',
      },
      {
        question: 'How is the AI assistant different from ChatGPT?',
        answer:
          'On the cloud pathway, the assistant is layered with property development expertise, regional practice, your company workflows and project-specific data. That makes it a project assistant grounded in the development — not a generic chatbot answering from the open internet alone.',
      },
      {
        question: 'Who typically uses these applications?',
        answer:
          'Property developers, development managers, project directors, commercial managers, investors, trusts and organisations delivering residential or mixed-use projects.',
      },
    ],
    relatedSlugs: [
      'project-costing-financial-modelling',
      'dashboards-business-intelligence',
      'resource-planning-scheduling',
    ],
    relatedLinkLabels: {
      'project-costing-financial-modelling':
        'Broader project costing and financial modelling systems',
      'dashboards-business-intelligence':
        'Executive and lender reporting dashboards',
      'resource-planning-scheduling':
        'Resource planning tools and scheduling systems',
    },
    caseStudies: [
      {
        slug: 'financial-modelling-amp',
        title: 'Financial Modelling & Reporting Suite',
        client: 'AMP Financial Services',
        sector: 'Financial Services',
        summary:
          'Extensible modelling and reporting foundations that informed how we approach complex commercial systems for development stakeholders.',
        published: true,
      },
    ],
    ctaHeading: 'Discuss your development modelling or project challenges',
    ctaBody:
      'Tell us how you run feasibility, funding and programme control today — in Excel or elsewhere — and where the gaps appear under pressure. We will recommend whether to extend your models, add automation, or escalate to a cloud application for your next residential or mixed-use project.',
    contactOptionLabel: 'Property Development Applications',
  },
  quotingEstimatingSolution,
  manufacturingCostingSolution,
  {
    slug: 'survey-inspection-field-apps',
    href: '/solutions/survey-inspection-field-apps',
    title: 'Survey, Inspection & Field Apps',
    shortTitle: 'Field apps',
    navLabel: 'Survey, Inspection & Field Apps',
    summary:
      'Collect structured information through mobile-friendly applications designed for teams working outside the office.',
    exampleUses: [
      'Site inspections',
      'Safety and compliance audits',
      'Asset assessments',
      'Mobile forms and field reporting',
    ],
    icon: 'field',
    metaTitle: 'Survey, Inspection & Field Apps NZ',
    metaDescription:
      'Mobile-friendly survey, inspection and field apps for New Zealand teams — structured capture, photos, signatures and reports that feed the wider business.',
    heroHeading: 'How field data moves back into the business',
    heroIntroduction:
      'XLS Experts builds mobile-friendly systems that allow staff to capture reliable information in the field and make it available quickly to the wider business — replacing paper forms and disconnected photo folders.',
    introHeading: 'Structured capture where the work happens',
    introBody: [
      'Paper forms, photos stored separately from records, and re-keying at the office create delays and incomplete submissions. Field apps fix the process at the point of capture.',
      'Where offline operation is required, we design for it explicitly. We do not claim offline capability unless the implementation includes it.',
    ],
    problemsHeading: 'Field process problems we solve',
    problems: [
      'Paper forms that are incomplete or hard to read',
      'Photos stored separately from the inspection record',
      'Field information re-entered at the office',
      'Incomplete submissions and missing mandatory checks',
      'Inconsistent inspection standards between staff',
      'Long delays before reports are available',
    ],
    capabilitiesHeading: 'What a field application can include',
    capabilities: [
      'Site surveys and inspections',
      'Compliance audits and safety assessments',
      'Asset inspections and property condition reports',
      'Quality assurance and field service forms',
      'Photo capture and signatures',
      'GPS or location capture where appropriate',
      'Offline-friendly workflows where practical and specified',
      'Automated report generation',
    ],
    useCasesHeading: 'Example applications',
    useCases: [
      {
        title: 'Site inspection with photo evidence',
        description:
          'Mandatory checklist items, photos attached to each finding, and a structured record ready for review.',
      },
      {
        title: 'Safety and compliance audits',
        description:
          'Consistent standards across sites with clear pass/fail logic and follow-up actions.',
      },
      {
        title: 'Asset and condition assessments',
        description:
          'Repeatable scoring and notes that feed maintenance planning or client reporting.',
      },
      {
        title: 'Automated field report packs',
        description:
          'Generate a formatted report from the submitted data so office staff are not rebuilding documents manually.',
      },
    ],
    technologyHeading: 'Possible technology and architecture',
    technologyNotes: [
      'Most field apps are mobile-friendly web applications with a secure backend. Excel or dashboards may still be used for analysis and management reporting.',
      'Offline behaviour, photo storage and device constraints are scoped carefully against how and where teams work.',
    ],
    technologies: [
      'Mobile-friendly web apps',
      'React / Next.js',
      'Cloud databases',
      'APIs',
      'Microsoft 365 / SharePoint',
      'PDF report generation',
      'Azure / AWS / Google Cloud',
    ],
    processHeading: 'How we deliver field systems',
    processSteps: [...processStepsDefault],
    faqs: [
      {
        question: 'Can a field application generate a report?',
        answer:
          'Yes. Many projects include automated PDF or Word-style report generation from the submitted inspection data and photos.',
      },
      {
        question: 'Do you support offline use?',
        answer:
          'We can design offline-friendly workflows when the project requires it. Offline behaviour needs explicit scoping for forms, photos and sync — we only include it when it is part of the solution.',
      },
      {
        question: 'Can photos stay attached to the record?',
        answer:
          'Yes. Linking photos to the specific inspection item is usually a core requirement so evidence is not separated from the finding.',
      },
      {
        question: 'Will office staff still need to re-enter data?',
        answer:
          'The goal is to remove re-entry. Validated field submissions should feed the office workflow, CRM, SharePoint library or database directly.',
      },
      {
        question: 'Can results appear on a dashboard?',
        answer:
          'Yes. Once submissions are structured, management can see volumes, exceptions and trends without waiting for manual consolidation.',
      },
    ],
    relatedSlugs: [
      'client-staff-portals',
      'workflow-automation-systems-integration',
      'dashboards-business-intelligence',
    ],
    relatedLinkLabels: {
      'client-staff-portals':
        'Share inspection outcomes with clients securely',
      'workflow-automation-systems-integration':
        'Trigger follow-ups and notifications automatically',
      'dashboards-business-intelligence':
        'Monitor inspection trends and exceptions',
    },
    caseStudies: [
      {
        slug: 'valet-parking-pullman',
        title: 'Valet Parking Hybrid App',
        client: 'Pullman Hotel Auckland',
        sector: 'Hospitality',
        summary:
          'Mobile web app for on-site bay management connected to a live SQL database and Excel admin console.',
        published: true,
      },
      {
        slug: 'gps-job-reporting-cel',
        title: 'GPS & Job Management Reporting',
        client: 'Central Express (CEL)',
        sector: 'Transport & Logistics',
        summary:
          'Integrated GPS and job feeds with gap-filling logic for reliable operational reporting.',
        published: true,
      },
    ],
    ctaHeading: 'Discuss your field process',
    ctaBody:
      'Tell us what staff capture on site today, what gets lost between the field and the office, and what a finished report should look like.',
    contactOptionLabel: 'Survey, Inspection & Field Apps',
  },
  {
    slug: 'client-staff-portals',
    href: '/solutions/client-staff-portals',
    title: 'Client, Staff & Supplier Portals',
    shortTitle: 'Portals',
    navLabel: 'Client, Staff & Supplier Portals',
    summary:
      'Provide clients, staff, suppliers or contractors with secure access to information, documents and workflows.',
    exampleUses: [
      'Customer self-service',
      'Staff portals',
      'Document sharing',
      'Approvals and online forms',
    ],
    icon: 'portal',
    metaTitle: 'Client, Staff & Supplier Portals NZ',
    metaDescription:
      'Secure client, staff and supplier portals for New Zealand businesses — document access, status updates, forms and approvals without email chaos.',
    heroHeading: 'Secure access that simplifies a real process',
    heroIntroduction:
      'XLS Experts creates secure online spaces where clients, staff, contractors or suppliers can access information and complete tasks — without relying on email chains and shared spreadsheets.',
    introHeading: 'A portal should remove friction, not add another login',
    introBody: [
      'Customers repeatedly asking for status updates, documents exchanged by email, and approvals that are hard to track are signs the process needs a controlled shared space.',
      'We design portals around a specific workflow — status, documents, forms or approvals — so people get what they need quickly with role-based access.',
    ],
    problemsHeading: 'Problems portals are built to solve',
    problems: [
      'Customers repeatedly request status updates',
      'Documents are exchanged by email with version confusion',
      'Staff cannot easily find current information',
      'Approvals are difficult to track',
      'External parties need controlled access to selected information only',
    ],
    capabilitiesHeading: 'What a portal can include',
    capabilities: [
      'Client dashboards and account information',
      'Staff self-service',
      'Supplier and contractor portals',
      'Secure document access and file uploads',
      'Project updates and job or order status',
      'Online forms and approvals',
      'Role-based access and notifications',
    ],
    useCasesHeading: 'Example applications',
    useCases: [
      {
        title: 'Customer self-service',
        description:
          'Clients check status, download documents and submit requests without calling the office.',
      },
      {
        title: 'Staff information hub',
        description:
          'Internal pages for current procedures, job data and forms that stay up to date.',
      },
      {
        title: 'Supplier or contractor access',
        description:
          'Controlled views of jobs, documents and submissions relevant to external parties.',
      },
      {
        title: 'Approval and form workflows',
        description:
          'Structured requests with clear owners, history and notifications instead of inbox chasing.',
      },
    ],
    technologyHeading: 'Possible technology and architecture',
    technologyNotes: [
      'Portals are typically secure web applications integrated with your existing data sources. Microsoft 365 and SharePoint can cover simpler internal cases; custom apps suit client-facing and multi-party workflows.',
      'Authentication, permissions and auditability are designed around who should see what.',
    ],
    technologies: [
      'Next.js / React',
      'Secure cloud hosting',
      'SQL / PostgreSQL / Supabase',
      'Microsoft 365 / SharePoint',
      'APIs',
      'Email notifications',
    ],
    processHeading: 'How we deliver portals',
    processSteps: [...processStepsDefault],
    faqs: [
      {
        question: 'Can different roles see different information?',
        answer:
          'Yes. Role-based access is central to portal design so clients, staff and suppliers only see what they should.',
      },
      {
        question: 'Do you build on Microsoft 365 or a custom app?',
        answer:
          'Both are options. SharePoint and Microsoft 365 suit many internal portals. Custom web apps are often better for branded client experiences and complex permissions.',
      },
      {
        question: 'Can the portal connect to our existing systems?',
        answer:
          'Yes. Status, documents and forms are most useful when they reflect live data from job, CRM or document systems.',
      },
      {
        question: 'Will this replace email completely?',
        answer:
          'Not usually. Email remains useful for notifications, while the portal becomes the place where the current information and actions live.',
      },
      {
        question: 'Do you support the portal after launch?',
        answer:
          'Yes. We can provide ongoing support, enhancements and monitoring as usage grows.',
      },
    ],
    relatedSlugs: [
      'workflow-automation-systems-integration',
      'survey-inspection-field-apps',
      'dashboards-business-intelligence',
    ],
    relatedLinkLabels: {
      'workflow-automation-systems-integration':
        'Automate the processes behind the portal',
      'survey-inspection-field-apps':
        'Feed field submissions into client views',
      'dashboards-business-intelligence':
        'Surface portal activity as management metrics',
    },
    caseStudies: [
      {
        slug: 'valet-parking-pullman',
        title: 'Valet Parking Hybrid App',
        client: 'Pullman Hotel Auckland',
        sector: 'Hospitality',
        summary:
          'Staff-facing mobile experience with a shared database and admin console — a practical pattern for operational portals.',
        published: true,
      },
      {
        slug: 'ecommerce-admin-drinkware',
        title: 'E-commerce Product & Admin Extension',
        client: 'Drinkware.co.nz',
        sector: 'E-commerce',
        summary:
          'Admin workflows connected to a live SQL e-commerce platform for product, pricing and category management.',
        published: true,
      },
    ],
    ctaHeading: 'Discuss a portal for your process',
    ctaBody:
      'Tell us who needs access, what they ask for repeatedly, and what should happen inside the portal. We will keep the design focused on that process.',
    contactOptionLabel: 'Client, Staff & Supplier Portals',
  },
  {
    slug: 'asset-maintenance-operations-solutions',
    href: '/solutions/asset-maintenance-operations-solutions',
    title: 'Asset Maintenance Operations Solutions',
    shortTitle: 'Asset maintenance',
    navLabel: 'Asset Maintenance Operations Solutions',
    summary:
      'Custom applications, planning tools and ERP extensions for organisations managing physical assets, maintenance operations and field service delivery — not financial asset management.',
    exampleUses: [
      'Maintenance scheduling',
      'ERP bolt-on applications',
      'Operational dashboards',
      'Simpro and ERP integration',
    ],
    icon: 'maintenance',
    metaTitle:
      'Asset Maintenance Operations & Field Service Software NZ | XLS Experts',
    metaDescription:
      'Asset maintenance operations solutions for New Zealand facilities, HVAC, industrial and field service organisations — ERP extensions, maintenance scheduling, reporting and operational dashboards for physical assets.',
    heroHeading: 'Asset Maintenance Operations Solutions',
    heroIntroduction:
      'Custom applications, planning tools and ERP extensions for organisations managing physical assets, maintenance operations and field service delivery.',
    introHeading: 'Extend the systems you already run — do not rip them out',
    introBody: [
      'Many organisations already operate sophisticated ERP and maintenance systems such as Simpro, SAP, JD Edwards, TechnologyOne, Pronto, SQL-based operational platforms and industry-specific maintenance software. Those systems usually manage core operational information well.',
      'They often become restrictive when the business needs specialised workflows, planning tools, reporting, pricing models or customer-specific functionality that the vendor platform does not provide.',
      'Rather than replacing these systems, XLS Experts develops complementary applications that extend them. The objective is to improve operational efficiency while allowing organisations to continue using the systems they already depend on.',
      'This page is about physical assets — HVAC, building services, plant, infrastructure, fleets, facilities and industrial equipment — not financial asset management.',
    ],
    problemsHeading: 'Where maintenance operations get stuck',
    problems: [
      'ERP or Simpro holds the data, but planning and analysis still happen in fragile spreadsheets',
      'Scheduling and technician allocation do not match how work is actually delivered',
      'Preventative programmes and reactive work compete without a clear view of capacity',
      'Contract profitability is hard to see until it is too late',
      'Custom ERP changes are expensive, slow and difficult to maintain',
      'Operational reporting for customers and managers takes too long to prepare',
    ],
    capabilitiesHeading: 'What we build',
    capabilities: [
      'Maintenance scheduling applications',
      'Technician planning tools',
      'Asset analysis and operational dashboards',
      'Preventative maintenance planning',
      'Contract profitability reporting',
      'Service pricing calculators',
      'Inspection reporting',
      'ERP import/export automation',
    ],
    useCasesHeading: 'Who this is for',
    useCases: [
      {
        title: 'Facilities management and building services',
        description:
          'HVAC, electrical, fire protection and building maintenance companies that need scheduling, site management and customer reporting beyond the ERP baseline.',
      },
      {
        title: 'Industrial and manufacturing maintenance',
        description:
          'Plant, pumps, compressors and production equipment where history, forecasting and labour planning must stay connected to the job system.',
      },
      {
        title: 'Infrastructure, utilities and councils',
        description:
          'Civil and utility assets with compliance inspections, planned programmes and portfolio-level operational reporting.',
      },
      {
        title: 'Field service and asset owners',
        description:
          'Organisations that allocate technicians, manage contracts and need flexible bolt-on tools without rewriting the core platform.',
      },
    ],
    technologyHeading: 'We integrate with your existing operational environment',
    technologyNotes: [
      'We work with the systems you already run. The list below is illustrative — the approach is to extend your environment rather than force a replacement.',
    ],
    technologies: [
      'Simpro',
      'SAP',
      'JD Edwards',
      'TechnologyOne',
      'Pronto',
      'SQL Server / PostgreSQL',
      'Microsoft Excel',
      'Microsoft 365',
      'REST APIs',
      'CSV import / export',
    ],
    preferDeepLayout: true,
    deepSections: [
      {
        id: 'understanding-maintenance-operations',
        heading: 'Understanding maintenance operations',
        intro:
          'Successful maintenance businesses need accurate information, flexible planning and efficient operational workflows. Physical asset maintenance is not a single process — it is a connected set of operational disciplines.',
        body: [
          'Organisations responsible for HVAC equipment, building services, plant and machinery, industrial equipment, infrastructure, utilities, civil assets, vehicles and fleets, facilities, manufacturing equipment, pumps, compressors and electrical assets live in the detail of service delivery every day.',
          'Software only helps when it respects how preventative and reactive work, contracts, technicians and sites actually interact.',
        ],
        items: [
          'Physical asset registers',
          'Preventative maintenance',
          'Reactive maintenance',
          'Service scheduling',
          'Technician allocation',
          'Site management',
          'Customer contracts',
          'Planned maintenance programmes',
          'Compliance inspections',
          'Equipment history',
          'Maintenance forecasting',
          'Labour planning',
          'Resource utilisation',
          'Operational reporting',
          'Contract profitability',
        ],
      },
      {
        id: 'extending-existing-erp-systems',
        heading: 'Extending existing ERP and maintenance systems',
        intro:
          'One of our core strengths is building intelligent bolt-on applications around systems organisations have already invested in heavily.',
        body: [
          'The limitation is often not the ERP or maintenance software itself, but the difficulty of adding custom functionality. Platforms designed for broad markets make custom development expensive, slow and difficult to maintain.',
          'Rather than modifying the ERP itself, we develop complementary tools that import operational data, validate it, support advanced analysis, scheduling, pricing, customer-specific reporting, dashboards, document generation and workflow automation — then prepare information for upload back into the ERP where appropriate.',
          'That approach delivers flexibility without disrupting the operational systems teams already depend on.',
        ],
        cards: [
          {
            title: 'Typical ERP extension work',
            items: [
              'Importing operational data',
              'Validating and cleansing data',
              'Advanced analysis and business intelligence',
              'Scheduling and planning tools',
              'Pricing engines',
              'Customer-specific reporting',
              'Operational dashboards',
              'Document generation',
              'Workflow automation',
              'Preparing upload files back into the ERP',
            ],
          },
          {
            title: 'Why bolt-on beats core customisation',
            description:
              'You keep vendor upgrades, core workflows and existing licences intact, while gaining specialised capability that would be costly or impractical to build inside the ERP.',
          },
        ],
      },
      {
        id: 'working-with-operational-data',
        heading: 'Working with operational data',
        intro:
          'A common requirement is exporting operational data from ERP systems into specialist tools, then returning curated results where they belong.',
        body: [
          'Teams need room to analyse, plan, report, schedule, price, forecast, cleanse and validate information without waiting on vendor roadmaps. Processed information can then be uploaded back into operational systems where appropriate.',
          'This avoids expensive ERP customisation while giving the business far greater flexibility — and keeps Excel or cloud workbenches connected to the system of record rather than drifting into uncontrolled copies.',
        ],
        items: [
          'Analysis',
          'Planning',
          'Reporting',
          'Scheduling',
          'Pricing',
          'Forecasting',
          'Data cleansing',
          'Validation',
          'Business intelligence',
        ],
      },
      {
        id: 'project-experience',
        heading: 'Project experience in maintenance operations',
        intro:
          'We have practical experience supporting maintenance organisations — including systems that support HVAC maintenance operations.',
        body: [
          'That work has covered maintenance scheduling, pricing models, operational reporting, customer and site management, portfolio reporting, operational planning and integrated data processing with existing job-management platforms.',
          'We do not discuss confidential client detail here. The point is industry understanding: how field teams, planners and commercial managers actually run physical asset maintenance day to day.',
        ],
      },
    ],
    featureGrid: {
      heading: 'What we build for maintenance operations',
      intro:
        'Examples of applications and workbenches we deliver for facilities management, field service and physical asset maintenance.',
      features: [
        'Maintenance scheduling applications',
        'Technician planning tools',
        'Asset analysis dashboards',
        'Preventative maintenance planning',
        'Contract profitability reporting',
        'Service pricing calculators',
        'Inspection reporting',
        'Equipment lifecycle analysis',
        'Replacement forecasting',
        'Customer reporting portals',
        'Mobile field applications',
        'Operational dashboards',
        'Bulk data preparation',
        'ERP import/export automation',
        'Workflow automation',
        'Document generation',
        'Excel-based operational workbenches',
        'Cloud-based management applications',
      ],
    },
    whyUs: {
      heading: 'Why XLS Experts',
      body: [
        'We understand maintenance businesses before writing software. Scheduling, service delivery, customer contracts, asset information and reporting requirements come first — technology second.',
        'Our applications are designed around operational workflows rather than forcing organisations to change how they work, or to abandon ERP and maintenance platforms that already hold their core data.',
      ],
    },
    processHeading: 'How we approach maintenance operations projects',
    processSteps: [
      {
        title: 'Understand the operational environment',
        description:
          'We map assets, contracts, scheduling, technicians, sites and the ERP or job system already in place — including where spreadsheets fill the gaps.',
      },
      {
        title: 'Design the bolt-on, not a rip-and-replace',
        description:
          'We identify what should stay in the ERP, what belongs in a specialist tool, and how data should flow both ways without breaking day-to-day operations.',
      },
      {
        title: 'Build, validate and integrate',
        description:
          'Applications are tested with real operational data — scheduling rules, pricing, reporting and import/export paths included.',
      },
      {
        title: 'Handover and ongoing improvement',
        description:
          'Training, documentation and a clear path for enhancements as contracts, asset portfolios and reporting needs change.',
      },
    ],
    faqs: [
      {
        question: 'Is this financial asset management software?',
        answer:
          'No. This solution area is about physical assets and maintenance operations — equipment, facilities, plant, infrastructure and field service delivery — not investment or financial asset portfolios.',
      },
      {
        question: 'Do you replace Simpro or our ERP?',
        answer:
          'Usually not. We typically extend systems such as Simpro, SAP, JD Edwards, TechnologyOne or Pronto with bolt-on applications, reporting and import/export automation so you keep the platform you already run.',
      },
      {
        question: 'Can you work with Excel and our ERP together?',
        answer:
          'Yes. Many projects use Excel or cloud workbenches for planning, pricing and analysis, with structured export and upload paths back into the operational system.',
      },
      {
        question: 'Who typically needs this?',
        answer:
          'Facilities management companies, HVAC and electrical contractors, industrial maintenance providers, manufacturers, infrastructure and utility organisations, property managers, councils, asset owners and field service businesses.',
      },
    ],
    relatedSlugs: [
      'resource-planning-scheduling',
      'workflow-automation-systems-integration',
      'dashboards-business-intelligence',
      'survey-inspection-field-apps',
    ],
    relatedLinkLabels: {
      'resource-planning-scheduling':
        'Resource planning tools and scheduling systems',
      'workflow-automation-systems-integration':
        'Deeper ERP integration and workflow automation',
      'dashboards-business-intelligence':
        'Operational and management dashboards',
      'survey-inspection-field-apps':
        'Field inspection and compliance capture',
    },
    caseStudies: [
      {
        slug: 'maintenance-scheduling-ocs',
        title: 'Maintenance Scheduling & Optimisation Tool',
        client: '1M / OCS Group',
        sector: 'Facilities Management',
        summary:
          'Excel add-on interfacing with SIMPRO for scheduling optimisation and exception reporting across asset classes — without changing the core platform.',
        published: true,
      },
      {
        slug: 'gps-job-reporting-cel',
        title: 'GPS & Job Management Reporting',
        client: 'CEL',
        sector: 'Field Services',
        summary:
          'Operational reporting that connects field activity and job information for clearer delivery visibility.',
        published: true,
      },
    ],
    ctaHeading: 'Discuss your maintenance operations systems',
    ctaBody:
      'Tell us which ERP or job system you run today, and where better reporting, planning, automation or bolt-on applications could improve efficiency — without replacing the investment you already have.',
    contactOptionLabel: 'Asset Maintenance Operations Solutions',
  },
  {
    slug: 'workflow-automation-systems-integration',
    href: '/solutions/workflow-automation-systems-integration',
    title: 'Workflow Automation & Systems Integration',
    shortTitle: 'Workflow & integration',
    navLabel: 'Workflow Automation & Systems Integration',
    summary:
      'Connect systems, remove repetitive manual work and create reliable information flows across the business.',
    exampleUses: [
      'CRM and accounting integration',
      'Microsoft 365 automation',
      'API development',
      'Email, document and approval workflows',
    ],
    icon: 'workflow',
    metaTitle: 'Workflow Automation & Systems Integration NZ',
    metaDescription:
      'Practical workflow automation and systems integration for New Zealand businesses — APIs, Microsoft 365, CRM and accounting connections, approvals and document flows.',
    heroHeading: 'Reliable information flow without unnecessary manual work',
    heroIntroduction:
      'XLS Experts connects business systems and automates repetitive tasks so information moves reliably — reducing re-entry, inconsistent data and inbox-driven processes.',
    introHeading: 'Automation that serves the process',
    introBody: [
      'When the same data is entered into several systems, or email is used as a workflow engine, growth creates more administration rather than more capacity.',
      'We focus on reliable business process automation and systems integration. AI may be used where it genuinely helps, but the foundation is clear process design and dependable connections between systems.',
    ],
    problemsHeading: 'Integration and automation warning signs',
    problems: [
      'The same data is entered into several systems',
      'Important tasks depend on staff remembering them',
      'Information becomes inconsistent between platforms',
      'Reports require manual exports every week',
      'Email is being used as a workflow system',
      'Business growth creates more administration rather than more capacity',
    ],
    capabilitiesHeading: 'What we can build',
    capabilities: [
      'API integration between business systems',
      'Accounting and CRM integration',
      'Microsoft 365 and SharePoint automation',
      'Google Workspace integration',
      'Email automation and document generation',
      'Approval workflows',
      'Database synchronisation and scheduled processing',
      'Alerts, notifications and data validation',
      'Import and export automation',
    ],
    useCasesHeading: 'Example applications',
    useCases: [
      {
        title: 'CRM and accounting hand-off',
        description:
          'Move customer and invoice data between systems without re-typing, with validation at each step.',
      },
      {
        title: 'Microsoft 365 document and approval flows',
        description:
          'Route documents, collect approvals and file outputs in SharePoint with a clear audit trail.',
      },
      {
        title: 'Scheduled imports and reconciliation',
        description:
          'Pull files or API data on a schedule, validate them, and flag exceptions before they reach reporting.',
      },
      {
        title: 'Notification and exception alerts',
        description:
          'Tell the right person when something needs attention — instead of hoping someone notices.',
      },
    ],
    technologyHeading: 'Possible technology and architecture',
    technologyNotes: [
      'We choose integrations based on the systems you already run — APIs, Microsoft 365 connectors, database sync or carefully designed file exchanges.',
      'Reliability, error handling and monitoring matter as much as the happy path.',
    ],
    technologies: [
      'APIs',
      'Microsoft 365',
      'Power Automate',
      'SharePoint',
      'Google Workspace',
      'SQL databases',
      'Azure / AWS / Google Cloud',
      'Custom middleware',
    ],
    processHeading: 'How we approach automation projects',
    processSteps: [...processStepsDefault],
    faqs: [
      {
        question: 'Can you integrate with our accounting or CRM software?',
        answer:
          'In most cases yes, via official APIs, approved connectors or structured imports/exports. We confirm capability during discovery for your specific platforms.',
      },
      {
        question: 'Is this the same as an AI automation agency?',
        answer:
          'No. We design practical business systems and integrations. AI can be included where it adds clear value, but most gains come from reliable process automation and clean data flow.',
      },
      {
        question: 'What happens when an integration fails?',
        answer:
          'We design for clear error handling — retries where safe, exception queues, and alerts so failures are visible rather than silent.',
      },
      {
        question: 'Can automation start from our existing spreadsheets?',
        answer:
          'Yes. Many projects begin by automating exports, imports and hand-offs around Excel or Microsoft 365 before deeper system changes.',
      },
      {
        question: 'Do you support integrations after launch?',
        answer:
          'Yes. APIs and platforms change over time. We can provide monitoring guidance and ongoing maintenance.',
      },
    ],
    relatedSlugs: [
      'asset-maintenance-operations-solutions',
      'client-staff-portals',
      'dashboards-business-intelligence',
    ],
    relatedLinkLabels: {
      'asset-maintenance-operations-solutions':
        'Physical asset maintenance operations and Simpro/ERP extensions',
      'client-staff-portals':
        'Expose automated workflows through a portal',
      'dashboards-business-intelligence':
        'Report on data that now flows reliably',
    },
    caseStudies: [
      {
        slug: 'price-modelling-ukwsl',
        title: 'Price Increase Modelling & ERP Integration',
        client: 'UKWSL',
        sector: 'Waste Management',
        summary:
          'Excel connected to Oracle ERP for pricing scenarios with outputs formatted for direct upload back into the ERP.',
        published: true,
      },
      {
        slug: 'ecommerce-admin-drinkware',
        title: 'E-commerce Product & Admin Extension',
        client: 'Drinkware.co.nz',
        sector: 'E-commerce',
        summary:
          'Excel admin extension synchronised with a live SQL e-commerce platform for product and pricing administration.',
        published: true,
      },
      {
        slug: 'maintenance-scheduling-ocs',
        title: 'Maintenance Scheduling & Optimisation Tool',
        client: '1M / OCS Group',
        sector: 'Facilities Management',
        summary:
          'Excel add-on interfacing with SIMPRO via CSV/EDI for scheduling optimisation without changing the core platform.',
        published: true,
      },
    ],
    ctaHeading: 'Discuss your integration or automation need',
    ctaBody:
      'Describe the systems involved, the manual steps between them, and what “done” looks like. We will recommend a practical automation path.',
    contactOptionLabel: 'Workflow Automation & Systems Integration',
  },
] satisfies readonly SolutionPage[]

export const solutionPageHrefs: readonly string[] = solutionPages.map(
  (p) => p.href,
)

export const solutionSlugs: readonly SolutionSlug[] = solutionPages.map(
  (p) => p.slug,
)

export function getSolutionBySlug(slug: string): SolutionPage | undefined {
  return solutionPages.find((p) => p.slug === slug)
}

export function getRelatedSolutions(page: SolutionPage): SolutionPage[] {
  return page.relatedSlugs
    .map((slug) => getSolutionBySlug(slug))
    .filter((p): p is SolutionPage => Boolean(p))
}

export function getPublishedCaseStudies(
  page: SolutionPage,
): SolutionCaseStudyRef[] {
  return page.caseStudies.filter((c) => c.published)
}

export function contactHrefForSolution(slug: SolutionSlug): string {
  return `${ALL_SOLUTIONS_HREF}/${slug}?solution=${slug}#contact`
}

export function solutionContactLabels(): string[] {
  return solutionPages.map((p) => p.contactOptionLabel)
}

export function contactLabelForSolutionSlug(
  slug: string | null | undefined,
): string | undefined {
  if (!slug) return undefined
  return getSolutionBySlug(slug)?.contactOptionLabel
}
