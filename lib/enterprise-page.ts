export type EnterpriseFaq = {
  question: string
  answer: string
}

export type EnterpriseUseCase = {
  title: string
  body: string
}

export type EnterpriseCaseStudy = {
  category: string
  tags: string
  title: string
  client: string
  body: string
  href?: string
}

export type EnterpriseStep = {
  number: string
  title: string
  body: string
}

export type EnterpriseQuality = {
  label: string
  detail: string
}

export const enterpriseFraming =
  'We bring deep practical experience and a proven understanding of the challenges and solutions in this area.'

export const enterpriseHeroStatement =
  'Turn spreadsheets into governed Excel applications your teams can rely on.'

export const enterpriseUseCases: EnterpriseUseCase[] = [
  {
    title: 'Pricing and quoting applications',
    body: 'Controlled pricing tools used across multiple teams, with governed assumptions, validation, approval rules and consistent outputs.',
  },
  {
    title: 'Forecasting and financial modelling',
    body: 'Scenario-based models with structured assumptions, audit-friendly logic, cash flow analysis and controlled reporting.',
  },
  {
    title: 'Project controls',
    body: 'Applications for budgets, schedules, costs, milestones, resources, progress tracking, governance and management reporting.',
  },
  {
    title: 'Operational planning',
    body: 'Tools supporting capacity planning, workload allocation, resource planning, maintenance programmes or business-unit scheduling.',
  },
  {
    title: 'Reporting automation',
    body: 'Applications that collect, consolidate, transform and analyse information from multiple files or systems.',
  },
  {
    title: 'Data preparation and transformation',
    body: 'Tools that clean, map, validate and prepare data before it is imported into SAP, JD Edwards, Simpro, SQL databases or other enterprise systems.',
  },
  {
    title: 'Enterprise system extensions',
    body: 'Focused applications that provide functionality outside the core ERP where direct customisation is too slow, expensive or restrictive.',
  },
  {
    title: 'Specialist calculation tools',
    body: 'Applications supporting complex financial, engineering, pricing, compliance or operational calculations.',
  },
  {
    title: 'Workflow applications',
    body: 'Controlled business processes involving review, approvals, exceptions, document generation and data hand-offs.',
  },
  {
    title: 'Knowledge and information tools',
    body: 'Applications that organise, distribute or analyse operational information within Microsoft 365 or SharePoint environments.',
  },
  {
    title: 'Data analysis platforms',
    body: 'Excel-based applications that allow users to analyse governed datasets while retaining familiar tools and existing internal skills.',
  },
]

export const enterpriseQualities: EnterpriseQuality[] = [
  {
    label: 'Stable',
    detail: 'Clear architecture, controlled inputs, reliable processing and fewer points of failure.',
  },
  {
    label: 'Fast',
    detail:
      'Efficient data handling, array-based processing where appropriate, optimised workbook design and reduced manual effort.',
  },
  {
    label: 'Maintainable',
    detail: 'Readable code, clear naming, modular components, documentation and a defined handover approach.',
  },
  {
    label: 'Extensible',
    detail:
      'Architecture that allows new modules, reports, integrations or business rules to be added without destabilising the application.',
  },
  {
    label: 'Functional',
    detail:
      'Validation, error handling, exception management, user feedback, logging and practical workflow design.',
  },
  {
    label: 'Governed',
    detail: 'Controlled releases, defined ownership, testing and deployment discipline.',
  },
  {
    label: 'Supportable',
    detail:
      'Applications designed so future developers and internal teams can understand and maintain them.',
  },
  {
    label: 'Integrated',
    detail: 'Built to exchange information with existing enterprise platforms and data sources.',
  },
]

export const enterpriseDeliverySteps: EnterpriseStep[] = [
  {
    number: '01',
    title: 'Discovery and operational understanding',
    body: 'Understand users, workflows, business decisions, data sources, current pain points, risks, dependencies and ownership.',
  },
  {
    number: '02',
    title: 'Scope and solution architecture',
    body: 'Define features, assumptions, integrations, responsibilities, delivery stages, testing expectations and the recommended architecture. Deliverables may include an architecture review, scope, build plan and milestone-based delivery structure.',
  },
  {
    number: '03',
    title: 'Prototype and early working release',
    body: 'Deliver a functional version early so users can validate workflows, assumptions and interface design.',
  },
  {
    number: '04',
    title: 'Iterative development',
    body: 'Build through frequent releases, incorporating user feedback while maintaining control of scope and priorities.',
  },
  {
    number: '05',
    title: 'Testing and User Acceptance',
    body: 'Validate calculations, workflows, edge cases, data volumes and agreed business requirements. Support structured UAT and issue resolution.',
  },
  {
    number: '06',
    title: 'Deployment, handover and support',
    body: 'Release the solution in a controlled manner and provide documentation, training, technical handover and an agreed support pathway.',
  },
]

export const enterpriseCaseStudies: EnterpriseCaseStudy[] = [
  {
    category: 'Financial services',
    tags: 'VBA · EDI · Excel',
    title: 'Financial Reporting Automation',
    client: 'AMP Financial Services',
    body: 'AMP required enhancements and ongoing maintainability for an existing fund management and reporting solution. The engagement involved in-depth discovery, understanding an interconnected reporting environment and extending workflow automation within a multi-system landscape—with controlled change and a focus on long-term maintainability.',
  },
  {
    category: 'Asset maintenance operations',
    tags: 'Excel · VBA · EDI · Simpro',
    title: 'Maintenance Scheduling and Optimisation',
    client: 'Maintenance Scheduling and Optimisation Tool',
    body: 'Excel was used as a governed extension to Simpro, allowing operational and data-analysis teams to schedule maintenance programmes, analyse data and develop pricing scenarios. Data was exchanged through structured CSV processes, creating a practical extension to the core maintenance platform—delivering operational agility without costly core-platform customisation.',
    href: '/solutions/asset-maintenance-operations-solutions',
  },
  {
    category: 'Insurance',
    tags: 'SQL · VBA · .NET · Financial analysis',
    title: 'Claims Analysis Reporting Tool',
    client: 'NZI Insurance',
    body: 'NZI required an enterprise application for collecting and analysing claims information. A web application and SQL database were used to collect structured data, with management analysis and further Excel-based investigation available to staff—retaining Excel as a familiar analytical environment within a hybrid architecture.',
  },
  {
    category: 'Energy',
    tags: 'VBA · PivotTables · SharePoint · Excel',
    title: 'Enterprise Operational Applications',
    client: 'Contact Energy',
    body: 'Contact Energy required agile tools that could provide operational functionality outside its primary enterprise platforms. XLS Experts developed applications supporting resource planning and knowledge-sharing workflows, using SharePoint for deployment and integration within the organisation’s environment.',
    href: '/solutions/resource-planning-scheduling',
  },
]

export const enterpriseFaqs: EnterpriseFaq[] = [
  {
    question: 'Can Excel genuinely be used for enterprise applications?',
    answer:
      'Yes. Excel can be highly effective when the use case is appropriate and the application is engineered, tested, documented and governed. The issue is rarely whether Excel is used—it is whether a business-critical process is treated as an informal workbook or as a governed operational application.',
  },
  {
    question: 'Do you only develop entirely new applications?',
    answer:
      'No. XLS Experts can review, stabilise, document, extend or modernise existing business-critical applications. Many enterprise engagements begin with an application that already exists and needs stronger structure, maintainability or controlled enhancement.',
  },
  {
    question: 'Can you work with our existing VBA code?',
    answer:
      'Yes. Existing applications can be reviewed for structure, performance, risk, maintainability and enhancement requirements before recommending a remediation or development path.',
  },
  {
    question: 'Can your applications integrate with SAP, JD Edwards or other enterprise systems?',
    answer:
      'Integration depends on the interfaces available. Solutions may use structured file exchange, databases, APIs or other approved methods. We do not assume a direct connection where file-based or mediated exchange is the practical and governed approach.',
  },
  {
    question: 'Do you work with enterprise IT teams?',
    answer:
      'Yes. Enterprise projects commonly involve collaboration with IT, security, database, Microsoft 365 and operational stakeholders. We aim to work within approved environments and respect existing governance.',
  },
  {
    question: 'Do you provide technical and user documentation?',
    answer:
      'Yes. Documentation is scaled according to the application’s complexity, risk and internal requirements. It is treated as part of making the application governable and supportable—not as an afterthought.',
  },
  {
    question: 'Do you support User Acceptance Testing?',
    answer:
      'Yes. We can help define test scenarios, provide UAT releases, record issues and resolve findings before controlled deployment.',
  },
  {
    question: 'Can an Excel application use a central database?',
    answer:
      'Yes. Excel can act as a familiar user interface or analysis layer while data is stored in SQL Server, PostgreSQL or another approved database.',
  },
  {
    question: 'Can an Excel application later be migrated to the cloud?',
    answer:
      'Yes. Applications can be designed with future migration in mind, including separation of business rules, structured data and modular architecture.',
  },
  {
    question: 'How do you prevent one developer from becoming a single point of failure?',
    answer:
      'Through readable modular code, documentation, structured architecture, configuration management and technical handover—so future developers or internal teams can understand and maintain the application.',
  },
  {
    question: 'Can you work within our security and governance requirements?',
    answer:
      'We can align the solution and delivery process with the requirements provided by the organisation, subject to access and technical constraints.',
  },
  {
    question: 'Do you support applications after launch?',
    answer:
      'Yes. Ongoing support, enhancement and documentation arrangements can be agreed according to the application’s importance and expected evolution.',
  },
  {
    question: 'How do you decide whether Excel is the right technology?',
    answer:
      'We consider users, workflow, data, collaboration, security, integrations, performance, supportability and total cost of ownership before recommending an architecture. Where Excel is not enough, we may recommend SQL-backed, web, hybrid or Microsoft 365-based approaches.',
  },
]

export const enterpriseRelatedLinks = [
  { label: 'A.I. Workflow and Business Process Automation', href: '/ai-workflow-and-business-process-automation' },
  { label: 'A.I. Use Cases for Excel, VBA and Power Query', href: '/use-cases' },
  { label: 'Excel VBA/Macro Development', href: '/excel-vba-macro-development' },
  { label: 'Excel Integrations (SQL, API, etc.)', href: '/excel-integrations' },
  { label: 'VBA to Office Scripts Migration', href: '/vba-to-office-scripts-migration' },
  { label: 'Web Applications', href: '/web-applications' },
  { label: 'Spreadsheet Auditing', href: '/spreadsheet-auditing' },
  { label: 'Asset Maintenance Operations Solutions', href: '/solutions/asset-maintenance-operations-solutions' },
  { label: 'Dashboards & Business Intelligence', href: '/solutions/dashboards-business-intelligence' },
  { label: 'Resource Planning Tools & Scheduling Systems', href: '/solutions/resource-planning-scheduling' },
  { label: 'Project Costing Tools & Financial Modelling', href: '/solutions/project-costing-financial-modelling' },
] as const
