/**
 * Solutions section — single source of truth for index cards and individual pages.
 */

import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CalendarRange,
  ClipboardCheck,
  FileSpreadsheet,
  GitBranch,
  LayoutDashboard,
  Calculator,
  Users,
} from 'lucide-react'

export const SITE_ORIGIN = 'https://www.xlsexperts.co.nz'
export const ALL_SOLUTIONS_HREF = '/solutions'

export type SolutionSlug =
  | 'spreadsheet-process-modernisation'
  | 'dashboards-business-intelligence'
  | 'resource-planning-scheduling'
  | 'project-costing-financial-modelling'
  | 'quoting-estimating-systems'
  | 'survey-inspection-field-apps'
  | 'client-staff-portals'
  | 'workflow-automation-systems-integration'

export type SolutionIconKey =
  | 'spreadsheet'
  | 'dashboard'
  | 'scheduling'
  | 'financial'
  | 'quoting'
  | 'field'
  | 'portal'
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
  introHeading: string
  introBody: string[]
  problemsHeading: string
  problems: string[]
  capabilitiesHeading: string
  capabilities: string[]
  useCasesHeading: string
  useCases: { title: string; description: string }[]
  technologyHeading: string
  technologyNotes: string[]
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
}

export const solutionIcons: Record<SolutionIconKey, LucideIcon> = {
  spreadsheet: FileSpreadsheet,
  dashboard: LayoutDashboard,
  scheduling: CalendarRange,
  financial: BarChart3,
  quoting: Calculator,
  field: ClipboardCheck,
  portal: Users,
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
    slug: 'spreadsheet-process-modernisation',
    href: '/solutions/spreadsheet-process-modernisation',
    title: 'Spreadsheet & Process Modernisation',
    shortTitle: 'Spreadsheet modernisation',
    navLabel: 'Spreadsheet & Process Modernisation',
    summary:
      'Improve, automate or replace spreadsheet-based processes that have become difficult to manage, scale or control.',
    exampleUses: [
      'Excel and VBA modernisation',
      'Office Scripts and Microsoft 365 workflows',
      'Spreadsheet-to-cloud migration',
      'Database and API integration',
    ],
    icon: 'spreadsheet',
    metaTitle: 'Spreadsheet & Process Modernisation NZ',
    metaDescription:
      'Improve, automate or replace fragile spreadsheet processes. Excel modernisation, Office Scripts, Microsoft 365 and cloud migration for New Zealand businesses.',
    heroHeading: 'When a spreadsheet has outgrown its original purpose',
    heroIntroduction:
      'XLS Experts helps organisations improve, automate or replace spreadsheet processes that have become fragile, manual, difficult to control or unable to scale — without forcing a rebuild where Excel still works well.',
    introHeading: 'The right level of modernisation — not a one-size answer',
    introBody: [
      'Excel remains a highly effective business tool when used appropriately. Many processes only need clearer structure, validation and automation. Others need a database, a shared Microsoft 365 workflow, or a full web application.',
      'Our job is to determine the right pathway: improve the workbook, rebuild legacy VBA, introduce structured data, connect APIs, move into the cloud — or design a hybrid system where Excel stays part of the workflow.',
    ],
    problemsHeading: 'Business warning signs',
    problems: [
      'Only one person understands the spreadsheet',
      'Multiple uncontrolled versions exist across email and shared drives',
      'Staff repeatedly copy and paste data between files or systems',
      'Reporting takes too long or breaks when someone changes a formula',
      'Files are too large, slow or unstable',
      'Formulas and macros break regularly',
      'The spreadsheet is being used as a database',
      'Remote or multi-user access is difficult',
      'The process has clearly outgrown Excel',
    ],
    capabilitiesHeading: 'What XLS Experts can build',
    capabilities: [
      'Improve an existing spreadsheet with structure, validation and documentation',
      'Rebuild legacy VBA into maintainable automation',
      'Introduce structured data models and controlled inputs',
      'Office Scripts and Microsoft 365 workflow automation',
      'SharePoint and Teams-friendly collaboration patterns',
      'Connect Excel to APIs and external systems',
      'Move core data into a cloud database',
      'Build a web application around the process',
      'Design hybrid systems where Excel remains the analysis layer',
    ],
    useCasesHeading: 'Example applications',
    useCases: [
      {
        title: 'Stabilise a critical workbook',
        description:
          'Clean structure, named logic, protected inputs and clearer ownership so the file can be supported by more than one person.',
      },
      {
        title: 'Automate a repetitive Excel process',
        description:
          'Replace copy-paste routines with VBA, Office Scripts or Power Automate so reports and exports run consistently.',
      },
      {
        title: 'Migrate spreadsheet workflows into Microsoft 365',
        description:
          'Keep familiar Excel interfaces where useful while moving shared lists, approvals and documents into SharePoint.',
      },
      {
        title: 'Graduate to a cloud application',
        description:
          'When multi-user access, permissions and scale matter, we move the process onto a database-backed web app — often still with Excel reporting.',
      },
    ],
    technologyHeading: 'Excel, Microsoft 365 or a cloud application?',
    technologyNotes: [
      'Architecture depends on your existing environment, number of users, security needs, collaboration patterns, process complexity, budget and internal capability.',
      'We do not assume every spreadsheet should be replaced. We choose the simplest reliable option that fits how your team works.',
    ],
    technologies: [
      'Microsoft Excel',
      'VBA',
      'Office Scripts',
      'Microsoft 365',
      'SharePoint',
      'Power Automate',
      'APIs',
      'SQL Server / PostgreSQL',
      'Next.js / React',
    ],
    processHeading: 'How we approach modernisation',
    processSteps: [...processStepsDefault],
    faqs: [
      {
        question: 'Do you always replace the existing spreadsheet?',
        answer:
          'No. Many projects succeed by improving the workbook, adding validation and automation, or connecting it to better data sources. Replacement is recommended when Excel is being asked to do something it cannot do reliably — such as multi-user transactional work or acting as a system of record.',
      },
      {
        question: 'Can a system begin in Excel and move to the cloud later?',
        answer:
          'Yes. We often design an intermediate solution that solves the immediate problem in Excel or Microsoft 365, then plan a later migration once requirements and usage patterns are clearer.',
      },
      {
        question: 'Can you work with our existing Microsoft 365 environment?',
        answer:
          'Yes. We regularly build solutions that fit within your existing Microsoft 365 tenancy, SharePoint sites, security policies and licensing.',
      },
      {
        question: 'How do you decide which technology to use?',
        answer:
          'We start with the business process, then weigh user count, collaboration needs, data volume, integration requirements, IT constraints and total cost of ownership — not a preferred technology stack.',
      },
      {
        question: 'Do you support systems after launch?',
        answer:
          'Yes. We can provide documentation, training and ongoing enhancement support so the solution continues to match how your business operates.',
      },
    ],
    relatedSlugs: [
      'workflow-automation-systems-integration',
      'dashboards-business-intelligence',
      'client-staff-portals',
    ],
    relatedLinkLabels: {
      'workflow-automation-systems-integration':
        'Connect systems and automate hand-offs',
      'dashboards-business-intelligence':
        'Turn cleaned data into trusted reporting',
      'client-staff-portals':
        'Give teams secure access without shared files',
    },
    caseStudies: [
      {
        slug: 'range-planning-max-fashion',
        title: 'Range Planning & Open To Buy Automation',
        client: 'Max Fashion',
        sector: 'Fashion Retail',
        summary:
          'Moved linked workbook planning onto a SQL backend while keeping familiar spreadsheets for buyers — with live POS data and more accurate Open To Buy reporting.',
        published: true,
      },
      {
        slug: 'valet-parking-pullman',
        title: 'Valet Parking Hybrid App',
        client: 'Pullman Hotel Auckland',
        sector: 'Hospitality',
        summary:
          'Enhanced an Excel admin console and added a mobile web app on a shared SQL database — a practical hybrid rather than a full platform rewrite.',
        published: true,
      },
      {
        slug: 'enterprise-data-contact-energy',
        title: 'Enterprise Data Analysis Platform',
        client: 'Contact Energy',
        sector: 'Energy',
        summary:
          'VBA, pivots and SharePoint integration delivered enterprise analysis inside familiar Excel tooling.',
        published: true,
      },
    ],
    ctaHeading: 'Tell us about your current process',
    ctaBody:
      'Describe what the spreadsheet does today, what is breaking, who uses it, and what outcome you need. You do not need to know the technology — we will recommend the right level of modernisation.',
    contactOptionLabel: 'Spreadsheet & Process Modernisation',
  },
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
    title: 'Resource Planning & Scheduling',
    shortTitle: 'Resource planning',
    navLabel: 'Resource Planning & Scheduling',
    summary:
      'Plan staff, equipment, workloads and delivery timelines through purpose-built scheduling and forecasting systems.',
    exampleUses: [
      'Capacity planning',
      'Staff scheduling',
      'Resource forecasting',
      'Project and production scheduling',
    ],
    icon: 'scheduling',
    metaTitle: 'Resource Planning & Scheduling Systems NZ',
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
      'dashboards-business-intelligence',
      'client-staff-portals',
      'workflow-automation-systems-integration',
    ],
    relatedLinkLabels: {
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
    contactOptionLabel: 'Resource Planning & Scheduling',
  },
  {
    slug: 'project-costing-financial-modelling',
    href: '/solutions/project-costing-financial-modelling',
    title: 'Project Costing & Financial Modelling',
    shortTitle: 'Financial modelling',
    navLabel: 'Project Costing & Financial Modelling',
    summary:
      'Build robust financial models and planning systems for complex projects, investments and commercial decisions.',
    exampleUses: [
      'Property development modelling',
      'Cash-flow forecasting',
      'Scenario analysis',
      'Budgeting and investment evaluation',
    ],
    icon: 'financial',
    metaTitle: 'Project Costing & Financial Modelling NZ',
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
      'dashboards-business-intelligence',
      'spreadsheet-process-modernisation',
      'resource-planning-scheduling',
    ],
    relatedLinkLabels: {
      'dashboards-business-intelligence':
        'Present model outputs as management dashboards',
      'spreadsheet-process-modernisation':
        'Strengthen or migrate the underlying workbook',
      'resource-planning-scheduling':
        'Connect cost plans to delivery capacity',
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
    contactOptionLabel: 'Project Costing & Financial Modelling',
  },
  {
    slug: 'quoting-estimating-systems',
    href: '/solutions/quoting-estimating-systems',
    title: 'Quoting & Estimating Systems',
    shortTitle: 'Quoting systems',
    navLabel: 'Quoting & Estimating Systems',
    summary:
      'Replace manual quoting processes with structured estimating systems that improve speed, consistency and control.',
    exampleUses: [
      'Construction estimates',
      'Manufacturing quotations',
      'Service pricing',
      'Proposal and document generation',
    ],
    icon: 'quoting',
    metaTitle: 'Quoting & Estimating Systems NZ',
    metaDescription:
      'Structured quoting and estimating systems for New Zealand businesses — construction estimates, manufacturing quotations, margins and proposal generation.',
    heroHeading: 'Quotes that are fast, consistent and commercially controlled',
    heroIntroduction:
      'XLS Experts creates structured quoting and estimating systems that improve accuracy, speed and consistency — from advanced Excel estimators through to cloud quoting platforms with approvals and CRM links.',
    introHeading: 'Common quoting problems we solve',
    introBody: [
      'When quotes take too long, pricing differs between staff, or margins are applied inconsistently, the business loses both time and commercial control.',
      'Solutions may range from an advanced Excel estimator to a fully cloud-based quoting platform. We match the design to quote volume, complexity and how proposals are issued.',
    ],
    problemsHeading: 'Warning signs in the quoting process',
    problems: [
      'Quotes take too long to produce',
      'Pricing differs between staff for similar jobs',
      'Margins are not consistently applied',
      'Quote templates are manually edited and drift over time',
      'Calculations depend on one experienced estimator',
      'Errors are found after the quote is sent',
    ],
    capabilitiesHeading: 'What a quoting system can include',
    capabilities: [
      'Construction and trade estimating',
      'Manufacturing estimates and bill-of-material calculations',
      'Labour and material pricing libraries',
      'Margin and markup controls',
      'Optional items and variations',
      'Proposal and PDF quotation generation',
      'Approval workflows',
      'CRM integration',
      'Historical estimate analysis',
    ],
    useCasesHeading: 'Example applications',
    useCases: [
      {
        title: 'Construction and fabrication estimating',
        description:
          'Component lists, labour, materials and waste logic structured so estimators produce consistent quotations.',
      },
      {
        title: 'Service and trade pricing',
        description:
          'Rate cards, packages and optional extras with controlled margins and clear customer-facing output.',
      },
      {
        title: 'Manufacturing quotations',
        description:
          'Bill-of-material driven estimates with material and process costs that update when inputs change.',
      },
      {
        title: 'Proposal generation with approvals',
        description:
          'Generate branded PDFs and route higher-value quotes through an approval step before they leave the business.',
      },
    ],
    technologyHeading: 'Excel estimator or cloud quoting platform?',
    technologyNotes: [
      'Low-volume, specialist estimating often works well in Excel. Higher volume, multi-user quoting with CRM hand-off usually benefits from a cloud application.',
      'We can start with a structured estimator and evolve as quote volume grows.',
    ],
    technologies: [
      'Microsoft Excel',
      'VBA',
      'Microsoft 365',
      'Custom web apps',
      'APIs / CRM integration',
      'PDF generation',
      'SQL databases',
    ],
    processHeading: 'How we deliver quoting systems',
    processSteps: [...processStepsDefault],
    faqs: [
      {
        question: 'Can you start with Excel and move to a cloud platform later?',
        answer:
          'Yes. Many quoting projects begin as a structured Excel estimator. When concurrent users, CRM sync or customer portals become important, we migrate the logic into a cloud application.',
      },
      {
        question: 'Can margins be locked down?',
        answer:
          'Yes. We can enforce minimum margins, role-based overrides and approval rules so commercial policy is applied consistently.',
      },
      {
        question: 'Can quotes sync to our CRM?',
        answer:
          'Where your CRM supports it, we can create or update opportunities, attach quote documents and keep status aligned.',
      },
      {
        question: 'Do you handle construction and manufacturing estimating?',
        answer:
          'Yes. We have delivered quoting tools for fabrication, construction-related work and manufacturing bill-of-material scenarios, as well as service pricing.',
      },
      {
        question: 'Can historical quotes inform new estimates?',
        answer:
          'When past quotes are stored in a structured way, we can surface comparable jobs and pricing patterns to support estimators.',
      },
    ],
    relatedSlugs: [
      'workflow-automation-systems-integration',
      'client-staff-portals',
      'spreadsheet-process-modernisation',
    ],
    relatedLinkLabels: {
      'workflow-automation-systems-integration':
        'Automate quote approvals and CRM updates',
      'client-staff-portals':
        'Let clients review proposals online',
      'spreadsheet-process-modernisation':
        'Modernise an existing Excel estimator',
    },
    caseStudies: [
      {
        slug: 'quoting-cutting-stock-kings',
        title: 'Project Quoting & Cutting Stock Tool',
        client: 'Kings Engineering',
        sector: 'Engineering & Construction',
        summary:
          'Excel quoting tool with cutting-stock optimisation — faster quotes, less material waste and stronger protection against underquoting.',
        published: true,
      },
    ],
    ctaHeading: 'Tell us how you quote today',
    ctaBody:
      'Describe the quote types you produce, who prepares them, and where errors or delays occur. We will recommend the right level of estimating system.',
    contactOptionLabel: 'Quoting & Estimating Systems',
  },
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
    title: 'Client & Staff Portals',
    shortTitle: 'Portals',
    navLabel: 'Client & Staff Portals',
    summary:
      'Provide clients, staff, suppliers or contractors with secure access to information, documents and workflows.',
    exampleUses: [
      'Customer self-service',
      'Staff portals',
      'Document sharing',
      'Approvals and online forms',
    ],
    icon: 'portal',
    metaTitle: 'Client & Staff Portals NZ',
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
    contactOptionLabel: 'Client & Staff Portals',
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
      'spreadsheet-process-modernisation',
      'client-staff-portals',
      'dashboards-business-intelligence',
    ],
    relatedLinkLabels: {
      'spreadsheet-process-modernisation':
        'Modernise the spreadsheet processes you automate',
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
