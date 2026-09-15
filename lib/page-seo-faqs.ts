/**
 * On-page FAQs for service and solution landings.
 * Seeded from the live pages so CMS → Pages CMS starts with real copy
 * per NZ / International / UK.
 */

import { DEFAULT_MARKET, type MarketId } from '@/lib/market'
import { powerAppsFaqs } from '@/lib/power-apps-page'
import { solutionPages } from '@/lib/solutions'
import { webAppFaqs } from '@/lib/web-applications-page'

export type PageSeoFaq = {
  q: string
  a: string
}

function qa(q: string, a: string): PageSeoFaq {
  return { q, a }
}

function fromQuestionAnswer(
  items: readonly { question: string; answer: string }[]
): PageSeoFaq[] {
  return items.map((item) => qa(item.question, item.answer))
}

const SERVICE_FAQ_DEFAULTS: Record<string, PageSeoFaq[]> = {
  '/ai-workflow-and-business-process-automation': [
    qa(
      'What tools do you use for A.I. workflow and business process automation?',
      'We use Excel VBA, Power Automate, Power Query and A.I. platforms such as OpenAI and Azure A.I. depending on what the process requires. We choose the right tool for each job rather than applying a single technology to every problem.'
    ),
    qa(
      'Do you always replace the existing spreadsheet?',
      'No. Spreadsheet and process modernisation often succeeds by improving the workbook, adding validation and automation, or connecting it to better data sources. Replacement is recommended when Excel is being asked to do something it cannot do reliably — such as multi-user transactional work or acting as a system of record.'
    ),
    qa(
      'Can a system begin in Excel and move to the cloud later?',
      'Yes. We often design an intermediate solution that solves the immediate problem in Excel or Microsoft 365, then plan a later migration once requirements and usage patterns are clearer.'
    ),
    qa(
      'How do you know which processes are worth automating?',
      'We use a simple framework: frequency multiplied by time cost multiplied by error risk. High-frequency, time-consuming processes with significant error consequences — including document reading and data classification — are the best candidates. We walk through your operations in discovery and identify the highest-value opportunities.'
    ),
    qa(
      'How do you decide which technology to use?',
      'We start with the business process, then weigh user count, collaboration needs, data volume, integration requirements, IT constraints and total cost of ownership — not a preferred technology stack. Excel remains appropriate when used properly; we do not assume every spreadsheet should be replaced.'
    ),
    qa(
      'Will A.I. replace the Excel-based processes we already have?',
      'No — our approach is to integrate A.I. as an input or decision layer that feeds your existing Excel and business processes. The workflows, formulas and reporting structures you already rely on remain in place. A.I. handles unstructured data preparation and classification that currently requires human reading and transcription.'
    ),
    qa(
      'Do we need to change our existing systems to automate a process?',
      'Usually not. Most of our automation work sits alongside existing systems rather than replacing them — connecting them, processing their outputs and feeding results back in. We work with whatever systems you already have.'
    ),
    qa(
      'How do you handle exceptions, accuracy and data privacy?',
      'Exception handling and human review are built into every automation we deliver. For A.I. extraction, accuracy is monitored over time and exceptions are flagged for review. We use API-based processing rather than consumer A.I. tools, and can work with Azure-hosted models for clients with strict data residency requirements.'
    ),
  ],
  '/excel-dashboard-development': [
    qa(
      'How long does an Excel dashboard take to build?',
      'A straightforward single-page dashboard typically takes three to seven days. A multi-page interactive dashboard with automated data refresh and complex calculations is typically two to four weeks.'
    ),
    qa(
      'Can you connect the dashboard directly to our data source?',
      'Yes. We regularly connect Excel dashboards to SQL databases, accounting systems, CSV exports, SharePoint lists and other sources using Power Query or VBA. This eliminates manual data entry and keeps the dashboard current.'
    ),
    qa(
      'Will the dashboard work in our version of Excel?',
      'We build to match your environment. Slicer and interactive features require Excel 2013 or later. We confirm compatibility before starting and test on your specific version.'
    ),
    qa(
      'How is an Excel dashboard different from Power BI?',
      'Excel dashboards are self-contained files your team already knows how to work with. They require no additional licences, can be emailed or shared as a file, and are often faster to build and maintain. Power BI is better suited to very large datasets, real-time data feeds or organisation-wide deployment.'
    ),
    qa(
      'Can you refresh and maintain our existing dashboards?',
      'Yes. Dashboard maintenance and quarterly refresh services are available. We can also modernise existing dashboards that have become outdated or hard to maintain.'
    ),
  ],
  '/excel-financial-modelling': [
    qa(
      'What does a best practice financial model look like?',
      'A best practice financial model has clearly separated inputs, calculations and outputs. Assumptions are in one place and clearly labelled. Formulas are consistent across rows. There are no hard-coded numbers in calculation cells. The model can be understood and updated by someone who did not build it.'
    ),
    qa(
      'Can you build a three-statement model for our business?',
      'Yes. Three-statement models — linked P&L, balance sheet and cash flow — are a core part of our financial modelling work. We build them to professional standards suitable for board reporting, lender due diligence and investor review.'
    ),
    qa(
      'How long does a financial model take to build?',
      'A straightforward budget or forecast model typically takes one to two weeks. A full three-statement model with scenario analysis and investment-ready formatting is typically two to four weeks depending on complexity.'
    ),
    qa(
      'Can you review and fix a financial model we already have?',
      'Yes. Model reviews and audits are a common engagement. We assess the model for structural issues, formula errors, circular references and missing logic, and either fix what is there or recommend a rebuild.'
    ),
    qa(
      'Do you build models for fundraising and due diligence?',
      'Yes. We have built models used in fundraising rounds, acquisitions, due diligence processes and banking relationships. We understand what investors and lenders look for and build models that hold up to scrutiny.'
    ),
  ],
  '/excel-integrations': [
    qa(
      'Which databases can Excel connect to?',
      'Excel can connect to SQL Server, MySQL, PostgreSQL, Oracle, SQLite, Azure SQL, Amazon RDS, Google BigQuery and others via Power Query, ODBC, OLE DB or ADO. We advise on the right connection method for your specific database and environment — including on-premise networks where firewall and driver setup matter.'
    ),
    qa(
      'Can Excel connect directly to our SQL Server database?',
      'Yes. VBA uses ADO (ActiveX Data Objects) to open a direct connection to SQL Server, MySQL, PostgreSQL, Oracle, and other databases. Excel can read, write, update, and delete records with full transactional control. Power Query provides an additional no-code layer for read-only queries where that is sufficient.'
    ),
    qa(
      'Is it secure to connect Excel directly to a database?',
      'Yes, when configured correctly. We use connection strings with least-privilege database accounts, recommend read-only access for reporting connections, and can configure Windows Authentication rather than stored passwords. We document the security approach for your IT team.'
    ),
    qa(
      'Can Excel write data back to a SQL database?',
      'Yes. Using VBA with ADO connections, Excel can insert, update or delete records. This is useful for data entry tools where validated data needs to flow back into a central system, and for multi-user applications where Excel is the front-end and the database is the source of truth.'
    ),
    qa(
      'Will a live database connection slow Excel down?',
      'A well-designed connection uses parameterised queries that return only the data needed — this is generally faster than loading a full CSV export. We optimise queries for performance and test on your data volumes before delivery.'
    ),
    qa(
      'Simpro says we cannot access their API. What are our options?',
      'Simpro and similar field service platforms often have limited or gated API access for their standard tiers. The practical alternative is a structured export-process-upload workflow: data is downloaded as CSV or Excel from Simpro, processed and transformed using VBA, then re-uploaded in the format Simpro accepts. We build these workflows to run reliably and include validation at every step to catch errors before they reach the system.'
    ),
    qa(
      'Can multiple people use the same Excel file at the same time?',
      'Standard shared workbooks are unreliable for concurrent editing. The correct architecture for multi-user Excel applications is to store all data in a SQL database and use Excel purely as the front-end. VBA handles all reads and writes to the database, which supports concurrent access properly. The result looks and feels like Excel to users but behaves like a proper application.'
    ),
    qa(
      'How do you handle authentication for REST APIs?',
      'VBA supports API key authentication, Basic authentication, OAuth 2.0 token-based flows, and custom header authentication via WinHTTP. For OAuth, we build a token refresh flow so credentials do not need to be re-entered. Power Query supports a similar range through its built-in web connector. We match the authentication method to what the API requires.'
    ),
    qa(
      'Can Excel pull live data from Shopify or WooCommerce?',
      'Yes. Both platforms have well-documented REST APIs. We build VBA or Power Query connections that authenticate, paginate through results, and load order, product, inventory, or customer data directly into Excel. Refresh can be triggered manually or on a schedule using Task Scheduler.'
    ),
    qa(
      'What happens when the third-party software updates and breaks the integration?',
      "API-based integrations are dependent on the API version and the provider's change management. We build integrations against stable API versions where available, include version pinning, and document all dependencies. For export-based workflows, changes to the export format are the most common break point — we design these to surface format mismatches clearly rather than silently processing incorrect data."
    ),
    qa(
      'Do you work with cloud databases as well as on-premises SQL Server?',
      'Yes. We connect Excel to cloud-hosted databases including Azure SQL Database, Amazon RDS, Supabase, PlanetScale, and others via standard ADO connection strings. The connection configuration differs slightly for cloud vs on-premises, and firewall and IP whitelisting requirements need to be managed — but the Excel and VBA layer is identical.'
    ),
  ],
  '/excel-spreadsheet-development': [
    qa(
      'How long does a custom spreadsheet take to build?',
      'Most projects take one to three weeks depending on complexity. A simple tracker might be two or three days. A full reporting pack with multiple data sources and automated outputs is typically two to four weeks.'
    ),
    qa(
      'Can you improve an existing spreadsheet rather than build from scratch?',
      'Yes. We regularly take over existing spreadsheets, restructure them for stability and performance, and add missing functionality. We will always advise whether a rebuild or enhancement is the better investment.'
    ),
    qa(
      'Will the spreadsheet work on our version of Excel?',
      'We build to match your environment. If you are on Excel 2016, Microsoft 365 or a mixed environment, we test and confirm compatibility before delivery.'
    ),
    qa(
      'Do you work with businesses outside Auckland?',
      'Yes. We work with businesses across New Zealand including Wellington, Christchurch, Hamilton and Tauranga. Most spreadsheet development is delivered remotely with video calls for discovery and review.'
    ),
    qa(
      'What happens if we need changes after delivery?',
      'We provide a short support period after every project. For ongoing changes and enhancements, we offer a support retainer or quote individual change requests.'
    ),
  ],
  '/excel-vba-macro-development': [
    qa(
      'Are Excel macros and VBA the same thing?',
      'Yes in practice. A macro is a sequence of automated actions in Excel; VBA (Visual Basic for Applications) is the programming language those macros are written in. Whether you call it a macro or a VBA project, we build the right level of automation — from a simple one-click process to a full application with validation, logging and documentation.'
    ),
    qa(
      'What can Excel VBA / macros actually automate?',
      'Almost any task you perform manually in Excel — data imports and exports, report formatting, emailing, file management, form processing, PDF creation, consolidating multiple files, and integration with Word and Outlook.'
    ),
    qa(
      'Is VBA still worth investing in, or should we use Python instead?',
      'VBA is the right choice when the solution lives in Excel and your team works in Excel. It requires no additional software, runs inside the file, and your team can operate it without technical knowledge. Python is better suited to server-side automation, large data volumes or integration with systems outside Office.'
    ),
    qa(
      'Are macros safe to use in a business environment?',
      'Yes, when written correctly. We write signed macros and configure trust settings properly so they run without disruptive security warnings. We follow security best practices and never use macros to access data outside the intended scope.'
    ),
    qa(
      'Can you take over or improve macros someone else wrote?',
      'Yes. Code reviews and takeovers are a regular part of our work. We assess the existing code, document what it does, fix bugs and either refactor what is there or rebuild cleanly depending on what makes more sense.'
    ),
    qa(
      'How long does a typical project take?',
      'Simple automation macros can be delivered in a day or two. A fuller VBA application — with a user interface, validation, error handling and documentation — typically takes two to four weeks.'
    ),
  ],
  '/google-sheets-development': [
    qa(
      'What can Google Apps Script automate in Sheets?',
      'Apps Script can automate almost any task in Google Sheets — sending emails, creating calendar events, updating other Sheets, calling external APIs, processing form submissions, generating PDFs and pushing data to other Google Workspace apps.'
    ),
    qa(
      'Is Google Sheets suitable for business-critical data?',
      'Google Sheets is suitable for many business processes, particularly those that require real-time collaboration and access from any device. For high-volume data, complex calculations or data that needs strict version control, we will advise on whether Sheets is the right tool or whether a different approach is more appropriate.'
    ),
    qa(
      'Can you connect Google Sheets to external systems?',
      'Yes. Apps Script can call external APIs, and Sheets supports connections to Google BigQuery, databases via Looker Studio and a range of third-party integrations. We advise on the best connection approach for your specific data source.'
    ),
    qa(
      'Can you migrate our Excel spreadsheets to Google Sheets?',
      'Yes. We handle Excel to Google Sheets migrations, including rewriting VBA macros as Apps Script, adapting formulas that behave differently and restructuring data models to take advantage of real-time collaboration.'
    ),
    qa(
      'Do you work with Google Workspace businesses outside Auckland?',
      'Yes. Google Sheets development is fully remote by nature. We work with Google Workspace businesses throughout New Zealand and can deliver solutions to any region.'
    ),
  ],
  '/power-query-consulting': [
    qa(
      'What is Power Query and what can it do?',
      'Power Query is a data transformation tool built into Excel and Power BI. It connects to data sources, applies cleaning and transformation steps, and loads structured data ready for analysis. It replaces manual data preparation with a repeatable, one-click refresh process.'
    ),
    qa(
      'What data sources can Power Query connect to?',
      'Power Query connects to Excel files, CSV files, SQL Server, Oracle, MySQL, PostgreSQL, SharePoint, OneDrive, web pages, APIs, Azure services, Salesforce and many more. If you have a data source, we can usually connect to it.'
    ),
    qa(
      'Can Power Query replace VBA for data import tasks?',
      'For many data import and transformation tasks, yes. Power Query is often faster to build and easier to maintain than VBA for ETL-style work. We will advise on the right approach based on your specific requirements — sometimes a combination of Power Query and VBA is optimal.'
    ),
    qa(
      'Does Power Query work in our version of Excel?',
      'Power Query is built into Excel 2016 and later, and all Microsoft 365 versions. For Excel 2010 and 2013 it can be installed as a free add-in. We confirm compatibility before starting any engagement.'
    ),
    qa(
      'How much does Power Query consulting cost in New Zealand?',
      'A straightforward data connection and transformation project typically starts from $1,000 NZD. More complex multi-source pipelines with automated refresh and documentation are typically $2,000 to $6,000 NZD. We provide a fixed quote after reviewing your data sources.'
    ),
  ],
  '/spreadsheet-auditing': [
    qa(
      'When should a spreadsheet be professionally audited?',
      'A spreadsheet should be audited when it supports significant financial decisions, is used in regulatory submissions, has been inherited from someone who has left, or has grown in complexity beyond what the original author intended. If numbers from a spreadsheet are used to make material decisions, it is worth getting independent assurance.'
    ),
    qa(
      'What does a spreadsheet audit actually involve?',
      'Our audits review formula consistency (are all rows using the same logic?), calculation integrity (does the model do what it says it does?), structural quality (inputs, calculations and outputs properly separated?), error checking (broken references, circular references, hard-coded overrides) and documentation adequacy.'
    ),
    qa(
      'How long does a spreadsheet audit take?',
      'A straightforward workbook audit typically takes two to four days. A complex multi-sheet model or a formal audit with a written report suitable for external use typically takes five to ten business days.'
    ),
    qa(
      'Can you audit a spreadsheet confidentially?',
      'Yes. All audit engagements are conducted under a non-disclosure agreement. We handle your data securely and return or delete files at the conclusion of the engagement.'
    ),
    qa(
      'Do you fix issues found during the audit?',
      'The audit itself produces a report of findings. We offer a separate remediation engagement to fix identified issues — this can be quoted after the audit is complete and the scope of fixes is clear.'
    ),
  ],
  '/vba-to-office-scripts-migration': [
    qa(
      'Should we migrate all our VBA to Office Scripts?',
      'Not necessarily. VBA remains the right choice for desktop-only automations, complex UI-driven tools, workbooks that do not need to run in the cloud, and scenarios requiring full Excel object model access. We assess each automation individually and recommend migration only where it adds genuine value.'
    ),
    qa(
      'Can Office Scripts replace VBA userforms?',
      'No. Office Scripts have no UI capability. If your VBA relies on userforms or dialogs, the replacement is either an Office Add-in task pane (a web-based interface), a Power Apps canvas app, or a redesigned workflow that eliminates the need for user input at runtime.'
    ),
    qa(
      'Can you work with our existing Microsoft 365 environment?',
      'Yes. We regularly migrate spreadsheet automation into Office Scripts and Power Automate within your existing Microsoft 365 tenancy, SharePoint sites, security policies and licensing — including organisational script sharing where IT enables it.'
    ),
    qa(
      'Can we keep Excel interfaces while moving shared work into SharePoint?',
      'Yes. A common modernisation path is to keep familiar Excel workbooks for analysis while moving shared lists, approvals, documents and scheduled automation into SharePoint and Power Automate with Office Scripts.'
    ),
    qa(
      'Do all Microsoft 365 licences include Office Scripts?',
      'No. Office Scripts are included in Microsoft 365 Business Standard, Business Premium, E3, and E5. They are not available in Microsoft 365 Business Basic or Microsoft 365 Apps for Business. Running scripts via Power Automate also requires a qualifying Power Automate licence.'
    ),
    qa(
      'How does Office Scripts perform with large Excel files?',
      'Performance depends on how the script is written. Reading and writing large ranges in bulk (using getValues/setValues on whole ranges rather than cell-by-cell loops) is significantly faster. Scripts that iterate row-by-row on thousands of records will time out. We design scripts with the batch API pattern from the outset.'
    ),
    qa(
      'Can Office Scripts trigger automatically on a schedule?',
      'Yes, but only via Power Automate. A scheduled flow in Power Automate calls the "Run script" action against a specific workbook in SharePoint or OneDrive. The script itself cannot self-schedule — it always needs a flow trigger.'
    ),
    qa(
      'We use SharePoint on-premises, not SharePoint Online. Does this work?',
      'No. Office Scripts require Microsoft 365 cloud services and Excel for the web. They do not function against SharePoint Server (on-premises). If your organisation has not migrated to SharePoint Online, VBA or alternative automation approaches remain the path forward.'
    ),
  ],
  '/power-apps-dataverse-development': fromQuestionAnswer(powerAppsFaqs),
  '/web-applications': fromQuestionAnswer(webAppFaqs),
}

const SOLUTION_FAQ_DEFAULTS: Record<string, PageSeoFaq[]> = Object.fromEntries(
  solutionPages.map((page) => [page.href, fromQuestionAnswer(page.faqs)])
)

/** NZ source FAQs for every Pages CMS catalog path. */
export const PAGE_FAQ_DEFAULTS: Record<string, PageSeoFaq[]> = {
  ...SERVICE_FAQ_DEFAULTS,
  ...SOLUTION_FAQ_DEFAULTS,
}

export function cloneFaqs(faqs: readonly PageSeoFaq[]): PageSeoFaq[] {
  return faqs.map((faq) => ({ q: faq.q, a: faq.a }))
}

export function parseFaqs(value: unknown): PageSeoFaq[] {
  if (!Array.isArray(value)) return []
  const next: PageSeoFaq[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const q =
      typeof rec.q === 'string'
        ? rec.q
        : typeof rec.question === 'string'
          ? rec.question
          : ''
    const a =
      typeof rec.a === 'string'
        ? rec.a
        : typeof rec.answer === 'string'
          ? rec.answer
          : ''
    if (!q.trim() && !a.trim()) continue
    next.push({ q: q.trim(), a: a.trim() })
  }
  return next
}

function tidyFaqText(value: string): string {
  return value
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\?/g, '?')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .replace(/\s+—\s+/g, ' — ')
    .trim()
}

function rewriteFaqText(text: string, market: MarketId): string {
  if (market === 'nz') return text
  let out = text
  if (market === 'uk') {
    out = out.replace(/New Zealand GST/gi, 'UK VAT')
    out = out.replace(/\bGST\b/g, 'VAT')
    out = out.replace(/New Zealand lenders/gi, 'UK lenders')
    out = out.replace(/\bNew Zealand\b/gi, 'the United Kingdom')
    out = out.replace(/\bNZ businesses\b/g, 'UK businesses')
    out = out.replace(/\bNZD\b/g, 'GBP')
    out = out.replace(/\$1,000/g, '£1,000')
    out = out.replace(/\$2,000/g, '£2,000')
    out = out.replace(/\$6,000/g, '£6,000')
    out = out.replace(/\$10,000/g, '£10,000')
    out = out.replace(/\bNZ\b/g, 'UK')
    out = out.replace(
      /including Wellington, Christchurch, Hamilton and Tauranga/gi,
      'including major cities across the country'
    )
    out = out.replace(
      /Wellington, Christchurch, Hamilton, Tauranga/gi,
      'major UK cities'
    )
    out = out.replace(/\bAuckland-based\b/gi, 'UK-facing')
    out = out.replace(/\bAuckland\b/g, '')
  } else {
    out = out.replace(/New Zealand GST/gi, 'local tax')
    out = out.replace(/\bGST\b/g, 'local tax')
    out = out.replace(/New Zealand lenders/gi, 'local lenders')
    out = out.replace(/\bNew Zealand\b/gi, '')
    out = out.replace(/\bNZ businesses\b/g, 'businesses')
    out = out.replace(/\bNZD\b/g, 'USD')
    out = out.replace(/\bNZ\b/g, '')
    out = out.replace(
      /including Wellington, Christchurch, Hamilton and Tauranga/gi,
      ''
    )
    out = out.replace(/Wellington, Christchurch, Hamilton, Tauranga/gi, '')
    out = out.replace(/\bAuckland-based\b/gi, 'US-facing')
    out = out.replace(/\bAuckland\b/g, '')
  }
  return tidyFaqText(out)
}

function specializeFaq(faq: PageSeoFaq, market: MarketId): PageSeoFaq {
  if (market === 'nz') return { q: faq.q, a: faq.a }

  if (/outside Auckland/i.test(faq.q)) {
    if (market === 'uk') {
      return {
        q: /Google Workspace/i.test(faq.q)
          ? 'Do you work with Google Workspace businesses across the UK?'
          : 'Do you work with businesses across the UK?',
        a: rewriteFaqText(faq.a, 'uk'),
      }
    }
    return {
      q: /Google Workspace/i.test(faq.q)
        ? 'Do you work with Google Workspace businesses remotely?'
        : 'Do you work with clients remotely?',
      a: 'Yes. Most of this work is delivered remotely with video calls for discovery and review, wherever your team is based.',
    }
  }

  if (/cost in New Zealand/i.test(faq.q)) {
    return {
      q:
        market === 'uk'
          ? faq.q.replace(/in New Zealand/i, 'in the UK')
          : faq.q.replace(/ in New Zealand/i, ''),
      a: rewriteFaqText(faq.a, market),
    }
  }

  if (/New Zealand GST/i.test(faq.q)) {
    return {
      q:
        market === 'uk'
          ? 'Does it handle UK VAT and funding structures?'
          : 'Does it handle local tax and funding structures?',
      a: rewriteFaqText(faq.a, market),
    }
  }

  return {
    q: rewriteFaqText(faq.q, market),
    a: rewriteFaqText(faq.a, market),
  }
}

export function rewriteFaqsForMarket(
  faqs: readonly PageSeoFaq[],
  market: MarketId
): PageSeoFaq[] {
  return faqs.map((faq) => specializeFaq(faq, market))
}

export function faqsForMarket(
  path: string,
  market: MarketId = DEFAULT_MARKET
): PageSeoFaq[] {
  const source = PAGE_FAQ_DEFAULTS[path] ?? []
  return rewriteFaqsForMarket(source, market)
}

export function faqsPlainText(faqs: readonly PageSeoFaq[]): string {
  return faqs.map((faq) => `${faq.q}\n${faq.a}`).join('\n')
}

export function toSolutionFaqs(
  faqs: readonly PageSeoFaq[]
): { question: string; answer: string }[] {
  return faqs.map((faq) => ({ question: faq.q, answer: faq.a }))
}

export function faqPageJsonLd(faqs: readonly PageSeoFaq[]) {
  if (!faqs.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }
}
