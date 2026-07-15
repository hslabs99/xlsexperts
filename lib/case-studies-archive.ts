/**
 * Frozen archive of site case studies (scraped from the former hard-coded homepage).
 * Source for seeding Firestore `caseStudies` — not used for live reads once seeded.
 */

import type { CaseStudy } from '@/lib/types'

export type CaseStudyArchiveItem = CaseStudy & {
  /** Original local public image path (e.g. /images/cs-facilities.png) */
  localImage: string
}

export const CASE_STUDIES_ARCHIVE: CaseStudyArchiveItem[] = [
  {
    slug: 'maintenance-scheduling-ocs',
    client: '1M / OCS Group',
    sector: 'Facilities Management',
    title: 'Maintenance Scheduling & Optimisation Tool',
    image: '/images/cs-facilities.png',
    localImage: '/images/cs-facilities.png',
    problem:
      'Operations staff needed to schedule and optimise asset maintenance across clients and asset classes without leaving their existing SIMPRO platform.',
    solution:
      'Built an Excel add-on interfacing with SIMPRO via CSV/EDI uploads, enabling exception reporting, schedule optimisation across asset classes, and automation routines that run outside the core platform.',
    outcome:
      'Extended platform functionality delivered at a fraction of custom software cost, with zero changes required to the core business system.',
    tags: ['Excel', 'VBA', 'EDI', 'SIMPRO Integration'],
  },
  {
    slug: 'valet-parking-pullman',
    client: 'Pullman Hotel Auckland',
    sector: 'Hospitality',
    title: 'Valet Parking Hybrid App',
    image: '/images/cs-hospitality.png',
    localImage: '/images/cs-hospitality.png',
    problem:
      'Valet staff needed a compact mobile app for bay management while admin needed a powerful parking console — both connected to the same live data.',
    solution:
      'Enhanced an existing Excel tool as the admin dashboard, connected to a cloud MS SQL database. Built a companion mobile web app for parking staff sharing the same database with real-time inbound and outbound bay control.',
    outcome:
      'A hybrid Excel + .NET solution delivering both a mobile-first field experience and an analytics-rich admin console — without building two separate systems.',
    tags: ['Excel', 'VBA', 'SQL DB', 'Mobile Web App', '.NET'],
  },
  {
    slug: 'claims-analysis-nzi',
    client: 'NZI',
    sector: 'Insurance',
    title: 'Claims Analysis Enterprise App',
    image: '/images/cs-insurance.png',
    localImage: '/images/cs-insurance.png',
    problem:
      'NZI required an enterprise app for collecting, collating, and reporting on claims analysis data that could be further analysed in-house using familiar tools.',
    solution:
      "Built a web app for data collection via a browser interface, feeding into Excel via SQL DB connectivity. VBA automation processed and presented the data as pivot summaries and trend charts, leveraging Excel's familiar interface for the analysis team.",
    outcome:
      'A full-stack enterprise solution built around Excel — giving analysts powerful reporting without retraining staff on new software.',
    tags: ['Excel', 'VBA', 'SQL DB', 'Web App', 'Charting'],
  },
  {
    slug: 'financial-modelling-amp',
    client: 'AMP Financial Services',
    sector: 'Financial Services',
    title: 'Financial Modelling & Reporting Suite',
    image: '/images/cs-finance.png',
    localImage: '/images/cs-finance.png',
    problem:
      'AMP required extensible financial modelling tools that could connect to internal data systems and present complex data in a clear, auditable format.',
    solution:
      'In-depth discovery followed by enhanced Excel modelling workbooks with VBA automation, EDI and SQL DB connectivity, and structured reporting outputs designed for both internal analysts and executive stakeholders.',
    outcome:
      'Delivered a modelling suite that replaced manual processes, reduced reporting time significantly, and integrated cleanly with existing AMP data infrastructure.',
    tags: ['Excel', 'VBA', 'EDI', 'SQL DB', 'Financial Modelling'],
  },
  {
    slug: 'enterprise-data-contact-energy',
    client: 'Contact Energy',
    sector: 'Energy',
    title: 'Enterprise Data Analysis Platform',
    image: '/images/cs-energy.png',
    localImage: '/images/cs-energy.png',
    problem:
      'Contact Energy relied on complex workflows outside their main software platforms, requiring enterprise-grade tools built on familiar interfaces their team already used.',
    solution:
      "Developed applications using VBA, Pivots, and SharePoint integration to analyse and report on operational data, enabling staff to run sophisticated analysis within Excel while integrating directly into Contact's existing infrastructure.",
    outcome:
      'Enterprise capability delivered within familiar tooling — enabling the team to perform complex analysis without specialist software or retraining.',
    tags: ['Excel', 'VBA', 'Pivots', 'SharePoint', 'Analytics'],
  },
  {
    slug: 'sales-reporting-wac',
    client: 'WAC NZ',
    sector: 'Retail / Distribution',
    title: 'Sales Data Analysis & Performance Reporting',
    image: '/images/cs-retail.png',
    localImage: '/images/cs-retail.png',
    problem:
      'WAC NZ needed a Power Query based solution to improve sales performance visibility across their retail management software and give better insight across sales outlets.',
    solution:
      'Power Query used to import and shape data from various files. VBA and Pivots built automated reporting across sales outlets, with data presented in clear dashboards for management review.',
    outcome:
      'Management gained real-time visibility across all sales outlets with automated reporting replacing hours of manual data consolidation each week.',
    tags: ['Excel', 'Power Query', 'VBA', 'Pivots', 'Dashboards'],
  },
  {
    slug: 'fleet-journey-bus-transport',
    client: 'Bus Transport NZ',
    sector: 'Transport & Logistics',
    title: 'Fleet Journey Reporting & Analysis',
    image: '/images/cs-transport.png',
    localImage: '/images/cs-transport.png',
    problem:
      'Bus Transport NZ required journey analysis tools to process operational data feeds and report on fleet performance across their network.',
    solution:
      'VBA import tools were created to pull and process data from operational feeds. Pivot-based reporting provided detailed fleet journey analysis, exception identification, and performance summaries for management.',
    outcome:
      'Automated data ingestion and reporting replaced a largely manual process, giving operations staff immediate access to accurate fleet performance data.',
    tags: ['Excel', 'VBA', 'Pivots', 'Data Import', 'Reporting'],
  },
  {
    slug: 'quoting-cutting-stock-kings',
    client: 'Kings Engineering',
    sector: 'Engineering & Construction',
    title: 'Project Quoting & Cutting Stock Tool',
    image: '/images/cs-engineering.png',
    localImage: '/images/cs-engineering.png',
    problem:
      'Kings Engineering needed a fast, accurate quoting tool for complex fabrication projects involving a Cutting Stock Problem — balancing material use against job requirements.',
    solution:
      'Excel used to create a time-saving quoting tool that lists components in an easy-to-follow quotation format, calculates optimal cutting and includes a Cutting Stock problem solver to minimise material waste.',
    outcome:
      'Quoting time reduced significantly, material waste minimised, and the business protected from underquoting on complex fabrication jobs.',
    tags: ['Excel', 'VBA', 'Optimisation', 'Quoting'],
  },
  {
    slug: 'price-modelling-ukwsl',
    client: 'UKWSL',
    sector: 'Waste Management',
    title: 'Price Increase Modelling & ERP Integration',
    image: '/images/cs-waste.png',
    localImage: '/images/cs-waste.png',
    problem:
      'UKWSL needed to model pricing scenarios using data from their Oracle ERP system and produce dashboard outputs ready for final processing — without developing a custom utility inside the ERP.',
    solution:
      'Excel connected directly to Oracle DB to pull and process pricing data. VBA automated the creation of pricing scenarios in a management dashboard, with outputs formatted for direct upload back into the ERP system.',
    outcome:
      'Pricing modelling cycle reduced from days to hours, with a clean handoff process between Excel analysis and ERP finalisation.',
    tags: ['Excel', 'VBA', 'Oracle DB', 'SQL DB', 'ERP Integration'],
  },
  {
    slug: 'ecommerce-admin-drinkware',
    client: 'Drinkware.co.nz',
    sector: 'E-commerce',
    title: 'E-commerce Product & Admin Extension',
    image: '/images/cs-ecommerce.png',
    localImage: '/images/cs-ecommerce.png',
    problem:
      'Drinkware operated a custom ASP.NET / MS SQL e-commerce platform and needed complex product categorisation, pricing formulas, and site admin management handled more efficiently than their existing system allowed.',
    solution:
      'Built an Excel-based admin extension connected to the SQL database, enabling product management, complex formula-based pricing, category administration, and automated contact detail processing — all from within Excel.',
    outcome:
      'Store administration time cut substantially, with complex pricing logic centralised in Excel and synchronised directly to the live e-commerce platform.',
    tags: ['Excel', 'VBA', 'SQL DB', 'ASP.NET', 'E-commerce'],
  },
  {
    slug: 'gps-job-reporting-cel',
    client: 'Central Express (CEL)',
    sector: 'Transport & Logistics',
    title: 'GPS & Job Management Reporting',
    image: '/images/cs-trucking.png',
    localImage: '/images/cs-trucking.png',
    problem:
      'Central Express face a seasonal spike in statistical requirements from their GPS harvesting and transport data, with GPS outages creating gaps in the location picture that made reporting unreliable.',
    solution:
      'Integrated GPS and job management data feeds and applied advanced matching pattern logic to identify probable vehicle locations during GPS outages, completing the data picture and enabling accurate performance reporting.',
    outcome:
      'Reliable fleet reporting achieved across peak seasons — GPS gap-filling logic eliminated data blind spots and gave management a complete, accurate operational picture.',
    tags: ['Excel', 'VBA', 'GPS Data', 'Pivots', 'Analytics'],
  },
  {
    slug: 'range-planning-max-fashion',
    client: 'Max Fashion',
    sector: 'Fashion Retail',
    title: 'Range Planning & Open To Buy Automation',
    image: '/images/cs-fashion.png',
    localImage: '/images/cs-fashion.png',
    problem:
      'Max Fashion relied on a complex model of many linked workbooks sharing data, making it difficult for travelling buyers to collaborate and for management to get accurate Open To Buy reporting.',
    solution:
      'Implemented a SQL database backend for Range Planning data and connected plans directly to the POS / Retail Management software for live sales and stock data. Carried out extensive formula analysis and optimisation on the Open To Buy plan to ensure accurate management reporting and budgeting.',
    outcome:
      'Travelling buyers could work in their familiar spreadsheets while sharing live data with each other and management — and Open To Buy reporting accuracy was significantly improved.',
    tags: ['Excel', 'VBA', 'SQL DB', 'POS Integration', 'Financial Modelling'],
  },
]
