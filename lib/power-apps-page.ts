export const POWER_APPS_HREF = '/power-apps-dataverse-development'

export type PowerAppsNavItem = {
  id: string
  label: string
}

export type PowerAppsFaq = {
  question: string
  answer: string
}

export const powerAppsNavItems: PowerAppsNavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'power-apps', label: 'Power Apps' },
  { id: 'dataverse', label: 'Dataverse' },
  { id: 'dynamics', label: 'Dynamics 365' },
  { id: 'use-cases', label: 'Use cases' },
  { id: 'approach', label: 'How we work' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'consultation', label: 'Consultation' },
]

export const powerAppsCapabilities = [
  'Designed around the actual workflow',
  'Uses your existing Microsoft data',
  'Power Apps, Dataverse and Power Automate',
  'Dynamics 365 where it already sits',
  'Custom web apps when Power Apps is not the right layer',
  'Excel, VBA and SQL still in the mix when they should be',
] as const

export const microsoftSystems = [
  'Microsoft Dynamics 365',
  'Microsoft Dataverse',
  'Microsoft 365',
  'SharePoint',
  'Excel',
  'Power BI',
  'Teams',
  'Outlook',
  'Power Automate',
] as const

export const powerAppsCanDo = [
  'Read information from existing Microsoft and connected systems',
  'Create and maintain additional operational data',
  'Guide employees through a defined workflow',
  'Trigger Power Automate processes',
  'Work with Dataverse tables and relationships',
  'Work with Dynamics 365 data through supported Microsoft methods',
  'Restrict screens and actions based on the logged-in user',
  'Give field or sales staff only the information they actually need',
] as const

export const dataverseExamples = [
  'Accessing existing customer records',
  'Querying products and price information',
  'Querying warehouse inventory',
  'Accessing contacts and accounts',
  'Referencing existing sales information',
  'Creating operational records for a specific process',
  'Maintaining supporting data that does not naturally belong in the core Dynamics implementation',
] as const

export const whoThisIsFor = [
  'Organisations already using Microsoft Dynamics 365',
  'Teams already working in Microsoft 365',
  'Businesses with a Dataverse environment',
  'Operations that still run on important Excel workbooks',
  'Manual workflows sitting between two or more systems',
  'Departments keeping separate spreadsheets because Dynamics does not provide the workflow they need',
  'Field or sales staff who need mobile access to a narrow set of information',
  'Businesses that want to extend their Microsoft investment rather than replace core systems',
  'Companies only beginning to investigate Power Apps and Dataverse',
] as const

export const broaderCapabilities = [
  'Microsoft Power Platform',
  'Dataverse',
  'Power Automate',
  'Microsoft Dynamics 365 integration',
  'Microsoft Graph and supported APIs',
  'Excel, VBA and Power Query',
  'SQL and cloud databases',
  'Custom web applications and APIs',
  'Document generation, PDF processing and email',
  'Power BI, Teams and other business platforms',
] as const

export const solutionMayAlsoInvolve = [
  'Dataverse',
  'Dynamics 365',
  'Power Automate',
  'Excel',
  'An external API',
  'Document generation or PDF processing',
  'Power BI',
  'Email and Teams',
  'Another business platform',
] as const

export const processSteps = [
  {
    number: '01',
    title: 'Business process discovery',
    body: 'We walk through what employees are trying to achieve, what information they need, where it currently lives, what is done manually, and where duplicate entry or bottlenecks occur.',
  },
  {
    number: '02',
    title: 'Solution architecture',
    body: 'We decide what should remain in existing systems, what data the new application requires, which Microsoft mechanisms to use, and whether Power Apps is the right interface — or only one part of the solution.',
  },
  {
    number: '03',
    title: 'Application design',
    body: 'Screens and steps are designed around the specific user and task, not around every field the enterprise system happens to contain.',
  },
  {
    number: '04',
    title: 'Development and integration',
    body: 'We build the application, Dataverse components where needed, Power Automate workflows and supported integrations with Dynamics, Microsoft 365 or other systems.',
  },
  {
    number: '05',
    title: 'Testing and deployment',
    body: 'The application is tested with real users and real-world workflows before it is put into day-to-day use.',
  },
  {
    number: '06',
    title: 'Ongoing development',
    body: 'Once people are using the application, further improvements usually become obvious. We can extend it as new opportunities appear.',
  },
] as const

export const dynamicsExamples = [
  {
    title: 'Sales order capture',
    body: 'A salesperson visits a customer and opens a tablet or phone application. The application can identify the salesperson, display their customers, search the product catalogue, check available inventory, show vehicle stock, capture quantities and delivery information, then create a sales notification or initiate the appropriate sales-order process in Dynamics using supported Microsoft methods.',
  },
  {
    title: 'Warehouse stock lookup',
    body: 'Give warehouse or counter staff a simplified product and stock search rather than requiring them to navigate multiple Dynamics screens. Filter by SKU, product description, warehouse, location and availability.',
  },
  {
    title: 'Customer visit app',
    body: 'Provide field staff with customer details, contacts, previous activity, outstanding tasks, relevant products, notes, photographs and follow-up actions. Information captured during the visit can then become available to the wider business.',
  },
  {
    title: 'Approval workflows',
    body: 'Create custom approval interfaces for purchasing, discounts, pricing exceptions, expenses, project variations, stock adjustments and internal requests. Combine Power Apps with Power Automate, Teams, Outlook or Microsoft approvals where that is the practical path.',
  },
  {
    title: 'Field service and operational data capture',
    body: 'Applications designed for staff working away from a desk: inspections, site visits, maintenance records, job completion, photographs, asset information, safety checks, measurements, signatures and status updates.',
  },
] as const

export const useCases = [
  {
    title: 'Mobile sales application',
    body: 'Customer lookup, product availability, stock on hand, vehicle inventory and simplified order capture.',
  },
  {
    title: 'Field inspection app',
    body: 'Staff capture inspection results, photos, comments, asset information and follow-up actions from a phone or tablet.',
  },
  {
    title: 'Inventory and stock application',
    body: 'Combine existing ERP inventory information with additional operational stock records that the core system does not hold.',
  },
  {
    title: 'Operations dashboard',
    body: 'Give managers a simplified operational view built from information already held across Microsoft systems.',
  },
  {
    title: 'Job and service management',
    body: 'Create jobs, assign staff, record work completed and update operational systems.',
  },
  {
    title: 'Internal approval application',
    body: 'Replace email chains and spreadsheets with structured request and approval workflows.',
  },
  {
    title: 'Customer or account management',
    body: 'Give a particular department a simplified interface to selected Dynamics customer and contact information.',
  },
  {
    title: 'Data collection and validation',
    body: 'Replace uncontrolled spreadsheets with structured forms, business rules and centrally managed records.',
  },
  {
    title: 'Excel workflow integration',
    body: 'Where Excel remains an important part of a process, connect spreadsheet-based calculations or reporting with a broader Power Platform workflow where that is technically appropriate.',
  },
] as const

export const powerAppsFaqs: PowerAppsFaq[] = [
  {
    question: 'What is Microsoft Power Apps?',
    answer:
      'Microsoft Power Apps is Microsoft’s application development platform for creating custom business applications that can connect to Dataverse, Microsoft 365, Dynamics 365 and other business data sources. Applications can run on desktop, tablet and mobile, and are typically designed around a specific operational task rather than exposing an entire enterprise system.',
  },
  {
    question: 'What is Microsoft Dataverse?',
    answer:
      'Microsoft Dataverse is Microsoft’s cloud-based business data platform, used by Power Platform and Dynamics 365 to securely store and relate business information. Where a client already uses Dynamics or Dataverse, additional applications can often be built around that environment rather than creating a disconnected database.',
  },
  {
    question: 'Can Power Apps connect to Dynamics 365?',
    answer:
      'Yes. Dynamics 365 applications use Microsoft’s broader Power Platform and Dataverse ecosystem, allowing appropriately designed Power Apps to work with Dynamics data and business processes using supported Microsoft integration methods. We do not write directly to underlying Dynamics database tables where Microsoft provides APIs, business logic or application-specific processes.',
  },
  {
    question: 'Can you build a custom app around our existing Dynamics system?',
    answer:
      'Yes. That is a common engagement. The usual objective is a narrower interface for a particular team — sales, warehouse, field service or approvals — that uses existing Dynamics information and feeds results back through supported processes, without replacing the core CRM or ERP.',
  },
  {
    question: 'Can Power Apps be used on phones and tablets?',
    answer:
      'Yes. Power Apps can be used to create custom desktop, tablet and mobile applications. Field and sales applications are often designed first for phone or tablet, with only the screens and data that staff need while they are away from a desk.',
  },
  {
    question: 'Can Power Apps replace an Excel-based workflow?',
    answer:
      'In many cases Power Apps can replace spreadsheet-based data collection and operational workflows, while Excel can remain available for calculations, analysis and reporting where it is still the appropriate tool. We do not assume every spreadsheet should be replaced.',
  },
  {
    question: 'Can a Power App access our existing customer and inventory data?',
    answer:
      'Often yes, where that information already sits in Dataverse, Dynamics 365 or another connected Microsoft source, and where licensing, permissions and the supported integration path allow it. Discovery confirms what can be read, what can be updated, and which Dynamics processes must be used rather than a simple record write.',
  },
  {
    question: 'Can we create additional Dataverse tables without changing our core Dynamics implementation?',
    answer:
      'Yes, when it is appropriate. Additional Dataverse tables can hold application-specific operational data — for example vehicle stock carried by sales representatives — while still relating to existing customer, product and warehouse records. The core Dynamics implementation does not have to be redesigned for every operational gap.',
  },
  {
    question: 'Can Power Apps integrate with systems outside Microsoft?',
    answer:
      'Yes, where suitable connectors, APIs or intermediate services exist. A Power App might be the user interface while the complete solution also involves an external API, a SQL database, document generation or another business platform. We solve the workflow rather than insisting every part of the solution use one technology.',
  },
  {
    question: 'Is Power Apps suitable for small and medium-sized businesses?',
    answer:
      'Yes, particularly where the organisation already uses Microsoft 365 or Dynamics and needs a focused application rather than another large software platform. Power Apps is not automatically the right layer for every requirement. If a fully custom web application or a governed Excel solution is a better fit, that is what we recommend.',
  },
]

export const powerAppsRelatedLinks = [
  {
    label: 'AI Workflow and Business Process Automation',
    href: '/ai-workflow-and-business-process-automation',
  },
  {
    label: 'Web Applications',
    href: '/web-applications',
  },
  {
    label: 'Excel VBA/Macro Development',
    href: '/excel-vba-macro-development',
  },
  {
    label: 'Excel Integrations (SQL, API, etc.)',
    href: '/excel-integrations',
  },
  {
    label: 'Power Query Consulting',
    href: '/power-query-consulting',
  },
  {
    label: 'Excel in Enterprise Operational Applications',
    href: '/enterprise',
  },
  {
    label: 'Workflow Automation & Systems Integration',
    href: '/solutions/workflow-automation-systems-integration',
  },
  {
    label: 'Survey, Inspection & Field Apps',
    href: '/solutions/survey-inspection-field-apps',
  },
] as const

export const powerAppsCoverage = {
  heading: 'Delivered against your existing Microsoft environment',
  body: 'If you already run Dynamics 365 or Microsoft 365 and staff are still using spreadsheets, manual processes or duplicate data entry between systems, a purpose-built application is often the missing layer. Most work is scoped and delivered remotely, with workshops, demonstrations and testing against your actual Microsoft tenancy.',
} as const
