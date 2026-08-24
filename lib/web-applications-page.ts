export type WebAppNavItem = {
  id: string
  label: string
}

export type WebAppFaq = {
  question: string
  answer: string
}

export type WebAppBenefit = {
  title: string
  body: string
}

export type WebAppOpportunityCategory = {
  id: string
  title: string
  items: string[]
}

export type WebAppType = {
  id: string
  title: string
  intro: string
  examples: string[]
  note?: string
}

export type WebAppPathway = {
  number: string
  title: string
  when: string
  body: string
}

export type WebAppCaseStudy = {
  id: string
  title: string
  category: string
  tags: string
  situation: string
  problem: string
  approach: string
  users: string
  value: string
  excelRole: string
  illustrative?: boolean
}

export type WebAppProcessStep = {
  number: string
  title: string
  items: string[]
  note?: string
}

export type WebAppTechGroup = {
  title: string
  items: string[]
}

export const webAppNavItems: WebAppNavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'why-web-applications', label: 'Why Web Applications' },
  { id: 'what-we-build', label: 'What We Build' },
  { id: 'excel-to-web', label: 'Excel to Web' },
  { id: 'examples', label: 'Examples' },
  { id: 'technology', label: 'Technology' },
  { id: 'development-process', label: 'Development Process' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'consultation', label: 'Consultation' },
]

export const webAppCapabilities = [
  'Business-process-led development',
  'Modern cloud architecture',
  'Multi-user by design',
  'New Zealand-based',
  'Excel integration where useful',
  'From prototype to production',
] as const

export const webAppBenefits: WebAppBenefit[] = [
  {
    title: 'Work from anywhere',
    body: 'Users can securely access the application wherever they have an internet connection and appropriate authorisation.',
  },
  {
    title: 'Use almost any device',
    body: 'Desktop, laptop, tablet or mobile browser—without requiring a separate native app for every role.',
  },
  {
    title: 'True multi-user operation',
    body: 'Multiple users can work in the application at the same time without passing files around or overwriting one another’s changes.',
  },
  {
    title: 'One live source of truth',
    body: 'Everyone works with the same current information rather than competing versions of a workbook.',
  },
  {
    title: 'Roles and permissions',
    body: 'Different users see and edit only what is relevant to them—staff, managers, contractors, customers or partners.',
  },
  {
    title: 'Auditability',
    body: 'Important actions, changes and approvals can be recorded so processes remain reviewable.',
  },
  {
    title: 'Centralised deployment',
    body: 'Updates can be released centrally instead of installing software on each device.',
  },
  {
    title: 'Scalable cloud infrastructure',
    body: 'The underlying platform can expand as usage, data volumes and user numbers grow.',
  },
  {
    title: 'Integration',
    body: 'Applications can connect with spreadsheets, accounting systems, APIs, databases, email services and other business tools.',
  },
  {
    title: 'Better customer and partner access',
    body: 'External parties can interact securely without gaining access to internal files and networks.',
  },
]

export const webAppOpportunityCategories: WebAppOpportunityCategory[] = [
  {
    id: 'operations-workflow',
    title: 'Operations and workflow',
    items: [
      'Job management',
      'Work-order management',
      'Approval workflows',
      'Task allocation',
      'Scheduling',
      'Operational dashboards',
      'Internal request systems',
      'Compliance workflows',
    ],
  },
  {
    id: 'sales-customer',
    title: 'Sales and customer management',
    items: [
      'Lightweight CRM systems',
      'Lead management',
      'Quotation tools',
      'Product configurators',
      'Customer onboarding',
      'Customer portals',
      'Sales pipeline tools',
      'Follow-up systems',
    ],
  },
  {
    id: 'ordering-inventory',
    title: 'Ordering and inventory',
    items: [
      'Product ordering applications',
      'Stock control',
      'Warehouse requests',
      'Purchasing workflows',
      'Supplier portals',
      'Materials drawdown',
      'Allocation systems',
      'Product range planning',
    ],
  },
  {
    id: 'field-mobile',
    title: 'Field and mobile work',
    items: [
      'Site inspections',
      'Insurance surveys',
      'Asset inspections',
      'Field reporting',
      'Mobile data capture',
      'GPS tracking',
      'Photographic records',
      'Signatures and completion evidence',
    ],
  },
  {
    id: 'property-construction',
    title: 'Property and construction',
    items: [
      'Property development applications',
      'Renovation management',
      'Construction progress tracking',
      'Budgets and variations',
      'Contractor coordination',
      'Defects and completion lists',
      'Property portfolio systems',
      'Site-material management',
    ],
  },
  {
    id: 'data-reporting',
    title: 'Data, reporting and analytics',
    items: [
      'Management dashboards',
      'Data collection portals',
      'GPS analytics',
      'Exception reporting',
      'Operational performance systems',
      'Secure reporting portals',
      'Data validation',
      'Consolidated reporting',
    ],
  },
  {
    id: 'customer-consumer',
    title: 'Customer and consumer applications',
    items: [
      'Booking platforms',
      'Self-service portals',
      'Application and registration forms',
      'Customer dashboards',
      'Membership systems',
      'Service request applications',
      'Consumer information tools',
      'Online assessment tools',
    ],
  },
  {
    id: 'saas-commercial',
    title: 'SaaS and commercial products',
    items: [
      'Subscription software',
      'Multi-tenant platforms',
      'Industry-specific applications',
      'Commercial calculators',
      'Workflow products',
      'Reporting products',
      'Client portals sold as a service',
      'New software concepts',
    ],
  },
]

export const webAppTypes: WebAppType[] = [
  {
    id: 'business-web-applications',
    title: 'Business web applications',
    intro:
      'Internal operational applications used by staff, management, contractors and business partners. These systems formalise how work moves through the organisation—capturing data once, applying business rules consistently and giving the right people visibility at the right time.',
    examples: [
      'Micro CRM systems',
      'Ordering systems',
      'Job management',
      'Resource planning',
      'Field-service systems',
      'Project tracking',
      'Internal dashboards',
    ],
  },
  {
    id: 'customer-consumer-web-applications',
    title: 'Customer and consumer web applications',
    intro:
      'Externally facing applications used by customers, members, policyholders, suppliers, tenants, contractors or the public. They provide secure, branded access without exposing internal files, networks or uncontrolled spreadsheets.',
    examples: [
      'Customer portals',
      'Booking systems',
      'Application processes',
      'Self-service systems',
      'Ordering portals',
      'Assessment tools',
      'Information and decision-support applications',
    ],
  },
  {
    id: 'saas-platforms',
    title: 'SaaS platforms and commercial software products',
    intro:
      'Software intended to be sold or licensed to multiple customers. We can help with product discovery, prototypes, authentication, account structures, subscriptions or usage models where required, multi-tenant architecture, scalable databases, administration tools, reporting and staged product development.',
    examples: [
      'Multi-tenant platforms',
      'Industry-specific products',
      'Commercial calculators',
      'Workflow products',
      'Reporting products',
      'Client portals sold as a service',
    ],
    note: 'These areas often overlap. An internal business application may later become a SaaS product once the workflow is proven.',
  },
]

export const webAppPathways: WebAppPathway[] = [
  {
    number: '01',
    title: 'Improve the spreadsheet',
    when: 'Appropriate when the workbook still fits the user group, volumes and collaboration model.',
    body: 'Strengthen structure, validation, performance and documentation so the existing tool remains reliable.',
  },
  {
    number: '02',
    title: 'Build a governed Excel application',
    when: 'Appropriate when Excel remains the right interface but needs engineering discipline.',
    body: 'Controlled inputs, protected logic, testing, documentation, version management and supportable code.',
  },
  {
    number: '03',
    title: 'Create a hybrid Excel and web solution',
    when: 'Appropriate when operations need a browser interface while analysis stays in Excel.',
    body: 'A shared database or API layer supports web capture and workflows, with Excel retained for modelling and reporting.',
  },
  {
    number: '04',
    title: 'Build a full web application',
    when: 'Appropriate when multi-user access, mobile use, permissions, customers or scale require a browser-first system.',
    body: 'The operational system of work lives in the web application, with Excel optional for specialist analysis.',
  },
]

export const webAppCaseStudies: WebAppCaseStudy[] = [
  {
    id: 'materials-drawdown',
    title: 'Building site materials drawdown application',
    category: 'Construction / materials',
    tags: 'Web · Cloud · Mobile',
    situation:
      'Construction and site teams often need a controlled way to request, allocate and track materials across projects.',
    problem:
      'Email, paper and spreadsheet lists struggle when multiple sites, approvers and live stock positions are involved.',
    approach:
      'A browser-based application can support site selection, material requests, quantity tracking, approval workflows, live status and project-level reporting. Capabilities listed here are illustrative of the type of system; exact features are scoped per project.',
    users: 'Site staff, store or warehouse teams, project managers and approvers.',
    value: 'One shared record of requests and issues, accessible from site devices without circulating workbook copies.',
    excelRole: 'Excel can remain available for cost analysis, forecasting or specialist reporting against exported or connected data.',
    illustrative: true,
  },
  {
    id: 'property-renovation',
    title: 'Property renovation application',
    category: 'Property',
    tags: 'Web · Workflow · Documents',
    situation:
      'Renovation programmes involve budgets, contractors, tasks, photos, variations and progress reporting across many parties.',
    problem:
      'When coordination lives in email threads and disconnected spreadsheets, status, cost and responsibility become hard to trust.',
    approach:
      'A shared web application can coordinate project budgets, contractors, tasks, progress, photos, variations, documents, timelines and cost reporting. Feature lists are indicative pending discovery.',
    users: 'Property managers, contractors, project coordinators and finance reviewers.',
    value: 'A single operational view of renovation work instead of fragmented communications.',
    excelRole: 'Detailed financial modelling or ad hoc analysis can still be performed in Excel where that is the better tool.',
    illustrative: true,
  },
  {
    id: 'property-development',
    title: 'Property development application',
    category: 'Property development',
    tags: 'Web · Finance · Workflow',
    situation:
      'Development planning and delivery combine project stages, approvals, property data, assumptions, costs, timelines and reporting.',
    problem:
      'Complex developments outgrow informal workbooks when multiple stakeholders need concurrent access and controlled workflows.',
    approach:
      'A web application can coordinate users, project data and workflow while specialist financial modelling may remain in Excel. Typical areas include stages, approvals, property data, development assumptions, costs, timelines, finance inputs, reporting and scenario comparison.',
    users: 'Developers, project controllers, finance teams and advisors.',
    value: 'Operational coordination and governed data capture, without forcing every calculation into the browser.',
    excelRole: 'Specialist modelling and scenario work often remain in Excel against structured exports or connected datasets.',
    illustrative: true,
  },
  {
    id: 'gps-analytics',
    title: 'GPS tracking and analytics application',
    category: 'Operations / analytics',
    tags: 'Web · Mapping · Data',
    situation:
      'Organisations collecting location, route and event data need more than raw GPS feeds—they need usable operational insight.',
    problem:
      'Tracking data is difficult to interpret when it sits in disconnected files without shared dashboards, history or alerts.',
    approach:
      'Applications in this category may combine live or imported tracking data, routes, events, location history, user or asset records, dashboards, alerts and reporting. Exact capabilities depend on data sources and operational requirements.',
    users: 'Operations managers, dispatch teams and analysts.',
    value: 'Shared visibility of movement and events, with central records rather than manual spreadsheet collation.',
    excelRole: 'Analysts may still export or connect to Excel for deeper investigation of patterns and exceptions.',
    illustrative: true,
  },
  {
    id: 'insurance-survey',
    title: 'Insurance survey and leakage identification application',
    category: 'Insurance / field',
    tags: 'Mobile Web · Survey · Images',
    situation:
      'Surveyors and field assessors need structured ways to capture observations, images and risk indicators on site.',
    problem:
      'Paper forms and emailed photos delay review and make consistent classification difficult.',
    approach:
      'A mobile-friendly browser application can support structured surveys, property or claim records, photographs, classifications, location information, risk indicators, central reporting and analyst review. Details are illustrative of the application type.',
    users: 'Field surveyors, claims analysts and review teams.',
    value: 'Faster, more consistent capture with a central record for follow-up.',
    excelRole: 'Analysts can use Excel for deeper review of exported or connected survey datasets where required.',
    illustrative: true,
  },
  {
    id: 'valet-parking',
    title: 'Valet parking hybrid application',
    category: 'Hospitality',
    tags: 'Mobile Web · SQL · Excel',
    situation:
      'A hotel valet operation needed live bay and vehicle management for attendants on the ground, with administrative oversight in the office.',
    problem:
      'A single desktop workbook could not support concurrent mobile use by attendants while also serving administration and analytics.',
    approach:
      'Mobile web interfaces for parking attendants connected to a central database, with Excel retained as an administrative and analytics interface on the same live data.',
    users: 'Parking attendants and administrative staff.',
    value: 'Field operations and office oversight share one operational dataset instead of competing files.',
    excelRole: 'Excel remained the familiar admin and analytics layer against the shared database.',
  },
  {
    id: 'claims-analysis',
    title: 'Claims analysis platform',
    category: 'Insurance',
    tags: '.NET · SQL · Excel',
    situation:
      'NZI required an enterprise approach to collecting and analysing claims information for management review.',
    problem:
      'Claims analysis needed structured collection, a durable data store and familiar tools for deeper investigation.',
    approach:
      'A web application collected claims data into a central SQL database, with management reporting and Excel available for further analyst work on the same dataset.',
    users: 'Claims staff, management and analysts.',
    value: 'Structured capture and shared reporting, without forcing every analytical task into a custom screen.',
    excelRole: 'Excel remained available for deeper analysis using familiar interfaces and internal skills.',
  },
  {
    id: 'range-planning',
    title: 'Retail range-planning system',
    category: 'Retail',
    tags: 'Cloud DB · Spreadsheets · Integration',
    situation:
      'Fashion retail buyers needed concurrent planning workflows while retaining familiar spreadsheet ways of working.',
    problem:
      'Fragile linked workbooks could not reliably support multi-user planning or broader system integration.',
    approach:
      'A multi-user system supported familiar spreadsheet workflows on a shared database, reducing reliance on linked workbooks and enabling broader system integration such as live sales and stock inputs where available.',
    users: 'Buyers, planners and merchandising teams.',
    value: 'Concurrent planning against shared data, with less risk of broken links and version conflict.',
    excelRole: 'Spreadsheet workflows remained part of the user experience, backed by a shared database rather than file copies.',
  },
  {
    id: 'field-to-office',
    title: 'Field-to-office workflow application',
    category: 'Operations',
    tags: 'Browser App · Cloud · Roles',
    situation:
      'Field teams needed to capture operational information that office teams could act on without waiting for emailed files or end-of-day workbook merges.',
    problem:
      'Desktop-only spreadsheets left field staff disconnected from the live process and created version and delay risk for the office.',
    approach:
      'A browser application for field capture with role-based access and cloud storage, plus optional Excel exports for finance and management reporting.',
    users: 'Field staff, supervisors and office administrators.',
    value: 'Faster hand-off from site to office against a shared central record.',
    excelRole: 'Excel remained available for exports, finance review and management analysis where useful.',
  },
]

export const webAppWhyPoints: WebAppBenefit[] = [
  {
    title: 'We understand operational systems',
    body: 'We analyse how work actually moves through a business, including exceptions, dependencies, approvals and reporting requirements.',
  },
  {
    title: 'We understand spreadsheets',
    body: 'If the application begins in Excel, we can interpret and preserve the business knowledge embedded in formulas, macros, models and reporting structures.',
  },
  {
    title: 'We understand data',
    body: 'We have extensive experience with data structures, validation, reporting, dashboards and analysis.',
  },
  {
    title: 'We prototype rapidly',
    body: 'Modern development allows stakeholders to see and test the application early—reducing ambiguity before full delivery.',
  },
  {
    title: 'We communicate with business users',
    body: 'We work directly with owners, managers, finance teams, operational staff and subject-matter experts—not only IT departments.',
  },
  {
    title: 'We can build progressively',
    body: 'A focused first release can be extended as requirements mature, rather than forcing a single large build.',
  },
  {
    title: 'We remain practical',
    body: 'We do not recommend a web application when a governed spreadsheet or smaller automation would solve the problem more economically.',
  },
]

export const webAppTechGroups: WebAppTechGroup[] = [
  {
    title: 'Application frameworks',
    items: ['Next.js', 'React', 'TypeScript', 'JavaScript', 'Node.js'],
  },
  {
    title: 'Cloud and data',
    items: [
      'Google Cloud',
      'Firebase',
      'Firestore',
      'Supabase',
      'PostgreSQL',
      'Serverless and cloud functions',
    ],
  },
  {
    title: 'Platform services',
    items: [
      'API integrations',
      'Authentication services',
      'Secure file storage',
      'Email and notification services',
      'Mapping and geolocation services',
    ],
  },
  {
    title: 'Business connectivity',
    items: [
      'Excel integration',
      'Google Workspace or Microsoft 365 integration where required',
      'Microsoft .NET and SQL environments where appropriate',
    ],
  },
]

export const webAppAiCapabilities = [
  'Extracting information from documents',
  'Classifying incoming requests',
  'Summarising records',
  'Drafting reports',
  'Searching business information using natural language',
  'Identifying anomalies',
  'Interpreting uploaded images where appropriate',
  'Assisting customer support',
  'Processing email',
  'Generating structured content',
  'Supporting workflow decisions',
] as const

export const webAppSecurityTopics: WebAppBenefit[] = [
  {
    title: 'Authentication and access',
    body: 'Sign-in, user roles, permissions and user deactivation so only authorised people can see or change relevant data.',
  },
  {
    title: 'Secure hosting and environments',
    body: 'Secure cloud hosting, with separation of development and production environments where appropriate, and client-owned cloud environments where required.',
  },
  {
    title: 'Data protection',
    body: 'Database access controls, encrypted connections, backups, data validation and privacy considerations aligned to the sensitivity of the information.',
  },
  {
    title: 'Operational accountability',
    body: 'Audit records for important actions, secure integrations and clear access management as people join or leave the organisation.',
  },
]

export const webAppIntegrations = [
  'Excel',
  'Microsoft 365',
  'Google Workspace',
  'Xero',
  'MYOB',
  'Accounting platforms',
  'CRM systems',
  'Email services',
  'Payment services',
  'Mapping and GPS platforms',
  'Cloud storage',
  'Existing databases',
  'External APIs',
  'PDF and document generation',
  'Reporting platforms',
  'Identity providers',
] as const

export const webAppProcessSteps: WebAppProcessStep[] = [
  {
    number: '01',
    title: 'Discovery',
    items: [
      'The idea and business objectives',
      'Current processes and users',
      'Data, existing spreadsheets and systems',
      'Constraints, risks and success criteria',
    ],
  },
  {
    number: '02',
    title: 'Scope and architecture',
    items: [
      'Initial release and user roles',
      'Application workflows and data structure',
      'Integrations and hosting approach',
      'Security requirements and delivery stages',
    ],
  },
  {
    number: '03',
    title: 'Prototype and interface design',
    items: [
      'Navigation and key screens',
      'User experience and workflow',
      'Data capture approach',
      'Reporting approach',
    ],
    note: 'Enough of the application for stakeholders to understand how it will work in practice.',
  },
  {
    number: '04',
    title: 'Iterative development',
    items: [
      'Visible build stages',
      'Regular demonstrations',
      'Feedback incorporated with controlled scope',
      'Progressive hardening toward production',
    ],
  },
  {
    number: '05',
    title: 'Testing and deployment',
    items: [
      'Functional testing',
      'User testing',
      'Data validation and permissions',
      'Deployment and initial data migration where required',
    ],
  },
  {
    number: '06',
    title: 'Handover and ongoing development',
    items: [
      'Training and documentation',
      'Support arrangements',
      'Enhancements and monitoring',
      'Future roadmap',
    ],
  },
]

export const webAppCostFactors = [
  'Number of workflows',
  'Number and complexity of user roles',
  'Data model',
  'Integrations',
  'User interface complexity',
  'Mobile and offline requirements',
  'Reports and dashboards',
  'Document generation',
  'Data migration',
  'Security requirements',
  'SaaS tenancy and billing',
  'Testing and deployment',
  'Ongoing support',
] as const

export const webAppStagedBuild = [
  'Proof of concept',
  'Working prototype',
  'Initial operational release',
  'Integrations',
  'Wider rollout',
  'Advanced reporting',
  'Customer-facing features',
  'SaaS commercialisation',
] as const

export const webAppFaqs: WebAppFaq[] = [
  {
    question: 'What is a web application?',
    answer:
      'A web application is software accessed through a browser rather than installed as a traditional desktop program. Users sign in, work with live data and complete workflows from devices that have an internet connection and the right permissions.',
  },
  {
    question: 'What is the difference between a website and a web application?',
    answer:
      'A website primarily publishes information. A web application supports interactive work—logging in, capturing data, applying business rules, managing workflows, generating outputs and integrating with other systems. Many modern sites include application features, but the purpose and complexity differ.',
  },
  {
    question: 'Can you turn an existing spreadsheet into a web application?',
    answer:
      'Often yes, where the spreadsheet already encodes a proven process. We assess the calculations, workflows, users and risks, then recommend improving the spreadsheet, governing it, building a hybrid solution, or migrating the operation into a full web application.',
  },
  {
    question: 'Can Excel remain connected to the web application?',
    answer:
      'Yes. A common pattern is a web application for multi-user operations, with Excel retained for analysis, modelling or specialist reporting against the same governed data.',
  },
  {
    question: 'When should we move beyond Excel?',
    answer:
      'When you need concurrent multi-user editing, field or customer access, strong role-based security, mobile-first workflows, higher data volumes, audit trails or integrations that workbooks struggle to support reliably. We help decide based on users, risk and cost—not a default rebuild.',
  },
  {
    question: 'Can several people use the application at the same time?',
    answer:
      'Yes. True multi-user operation is one of the main reasons organisations choose a web application. Multiple authorised users can work against one live dataset without emailing files or overwriting each other’s changes.',
  },
  {
    question: 'Will the application work on mobile phones and tablets?',
    answer:
      'Responsive web applications are designed to work across desktop, tablet and mobile browsers. Native mobile apps are sometimes still appropriate, but many operational needs can be met with a well-designed browser application.',
  },
  {
    question: 'Can you build a customer or supplier portal?',
    answer:
      'Yes. Customer and supplier portals are a common category of web application—providing secure external access to selected workflows without exposing internal networks or uncontrolled files.',
  },
  {
    question: 'Can you build a SaaS product?',
    answer:
      'Yes. We can help design and build software intended for multiple customers, including authentication, account structures, multi-tenant architecture, administration tools and staged product development. Scope and commercial model are agreed during discovery.',
  },
  {
    question: 'Can we begin with a prototype?',
    answer:
      'Yes. Early prototypes and working releases help validate workflows, interfaces and assumptions before wider investment. Many projects begin with a focused first version rather than a complete platform.',
  },
  {
    question: 'How long does web application development take?',
    answer:
      'Timelines depend on workflows, roles, integrations, data migration and the breadth of the first release. A focused operational application can be delivered in stages; a multi-tenant SaaS product typically takes longer. Discovery produces a realistic delivery plan.',
  },
  {
    question: 'How much does a custom web application cost?',
    answer:
      'Cost depends on scope: workflows, roles, data model, integrations, interface complexity, mobile or offline needs, reporting, security and ongoing support. A focused internal application differs substantially from a customer-facing SaaS platform. An initial consultation clarifies suitability and likely staging.',
  },
  {
    question: 'What technologies do you use?',
    answer:
      'Our modern stack commonly includes Next.js, React, TypeScript, Node.js and cloud platforms such as Google Cloud, Firebase, Firestore, Supabase and PostgreSQL. We previously developed applications using Microsoft .NET and SQL architectures and can support or integrate with Microsoft environments where appropriate. Cursor is our AI-assisted development environment—not a JavaScript framework. Architecture is selected for the application, users, security, scale and existing systems.',
  },
  {
    question: 'Where is the application hosted?',
    answer:
      'Hosting is selected to suit the project—commonly managed cloud platforms such as Google Cloud or equivalent environments. Exact hosting, ownership and operational arrangements are agreed as part of the project proposal.',
  },
  {
    question: 'Can it be hosted in our own Google Cloud or cloud environment?',
    answer:
      'Often yes, where that aligns with your IT and security requirements. Client-owned cloud environments can be used where appropriate and are discussed during architecture planning.',
  },
  {
    question: 'Can the application integrate with our existing systems?',
    answer:
      'Integration can be assessed where suitable APIs, permissions, licensing and data quality exist. Potential connections include Excel, Microsoft 365, Google Workspace, accounting platforms, CRM systems, email, payments, mapping services, databases and other external APIs.',
  },
  {
    question: 'Can you work with an application another developer started?',
    answer:
      'Often yes. We can review an existing codebase or partial build, assess maintainability and risk, and recommend remediation, completion or a controlled rebuild where that is more practical.',
  },
  {
    question: 'Can AI be included in the application?',
    answer:
      'Where it delivers practical value—such as document extraction, classification, summarisation, search assistance or drafting support. Important decisions may still require human review. We do not promise fully autonomous systems.',
  },
  {
    question: 'Who owns the application and source code?',
    answer:
      'Ownership, hosting, licensing and support arrangements are agreed as part of the project proposal. Commercial terms are set out clearly before development proceeds.',
  },
  {
    question: 'What ongoing support is available?',
    answer:
      'Support, enhancements, monitoring and documentation updates can be arranged according to the importance of the application and expected change. Details are agreed in the proposal rather than assumed as a fixed package.',
  },
  {
    question: 'Can the application work offline?',
    answer:
      'Offline capability is possible in some applications, but it adds architectural complexity and must be assessed early. Many field scenarios work well with a mobile-friendly online application; true offline sync is scoped only where needed.',
  },
  {
    question: 'How do you manage users and permissions?',
    answer:
      'Applications are designed with authentication, roles and permissions so users see and edit only what is relevant. Access management—including deactivating users—is part of operational governance.',
  },
  {
    question: 'Do we need a complete specification before starting?',
    answer:
      'No. A clear initial scope helps, but important business rules are often refined while users interact with working versions. We typically progress from discovery into prototype and iterative development rather than requiring a perfect specification first.',
  },
  {
    question: 'Can a business application later become a SaaS product?',
    answer:
      'Yes. Many commercial products begin as an internal operational application. Once the workflow is proven, multi-tenant accounts, billing and product packaging can be introduced in later stages.',
  },
  {
    question: 'Is a custom web application always better than off-the-shelf software?',
    answer:
      'No. Off-the-shelf software is often the right choice when it fits closely. Custom development makes sense when your process, integrations or competitive product requirements are not well served by standard packages—or when a focused custom system is simpler than forcing an unsuitable platform.',
  },
]

export const webAppRelatedLinks = [
  { label: 'Excel in Enterprise Operational Applications', href: '/enterprise' },
  { label: 'Excel VBA/Macro Development', href: '/excel-vba-macro-development' },
  { label: 'AI Workflow and Business Process Automation', href: '/ai-workflow-and-business-process-automation' },
  { label: 'Microsoft Power Apps & Dataverse', href: '/power-apps-dataverse-development' },
  { label: 'Excel Integrations (SQL, API, etc.)', href: '/excel-integrations' },
  { label: 'Dashboards & Business Intelligence', href: '/solutions/dashboards-business-intelligence' },
  { label: 'Property Development Applications', href: '/solutions/property-development-applications' },
  { label: 'All solutions', href: '/solutions' },
  { label: 'Contact', href: '/#contact' },
] as const
