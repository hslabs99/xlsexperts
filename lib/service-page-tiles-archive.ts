/**
 * Frozen archive of service-page example tiles (case-study style cards).
 * Source: static examples arrays formerly inline on each service landing page.
 * Used to seed Firestore `servicePageTiles` and as public fallback when CMS is empty.
 */

import type { ServicePageTileArchiveItem } from '@/lib/service-page-tiles-shared'

export const SERVICE_PAGE_TILES_ARCHIVE: readonly ServicePageTileArchiveItem[] = [
  {
    "slug": "invoice-data-extraction",
    "tag": "Finance",
    "title": "Invoice Data Extraction",
    "detail": "AI extracts supplier name, amount, GST, date and line items from PDF invoices and populates an Excel register automatically — replacing manual keying for 95% of invoices.",
    "serviceHrefs": [
      "/ai-workflow-and-business-process-automation"
    ],
    "sortOrder": 0
  },
  {
    "slug": "customer-feedback-classifier",
    "tag": "Operations",
    "title": "Customer Feedback Classifier",
    "detail": "AI classifies incoming customer feedback by sentiment, category and urgency, populates a structured Excel tracker and flags high-priority items for immediate review.",
    "serviceHrefs": [
      "/ai-workflow-and-business-process-automation"
    ],
    "sortOrder": 1
  },
  {
    "slug": "cv-screening-assistant",
    "tag": "HR",
    "title": "CV Screening Assistant",
    "detail": "AI reads submitted CVs, extracts experience, qualifications and skills against a structured criteria set, and populates a ranked comparison sheet in Excel for recruiter review.",
    "serviceHrefs": [
      "/ai-workflow-and-business-process-automation"
    ],
    "sortOrder": 2
  },
  {
    "slug": "contract-review-summary-tool",
    "tag": "Legal",
    "title": "Contract Review Summary Tool",
    "detail": "AI reads contract documents, extracts key clauses, dates, obligations and risk flags, and produces a structured Excel summary for legal team review.",
    "serviceHrefs": [
      "/ai-workflow-and-business-process-automation"
    ],
    "sortOrder": 3
  },
  {
    "slug": "month-end-close-automation",
    "tag": "Finance",
    "title": "Month-End Close Automation",
    "detail": "Automated data pull from three systems, consolidation, reconciliation and report generation — a two-day process reduced to four hours with human review only at key decision points.",
    "serviceHrefs": [
      "/ai-workflow-and-business-process-automation"
    ],
    "sortOrder": 4
  },
  {
    "slug": "onboarding-document-workflow",
    "tag": "HR",
    "title": "Onboarding Document Workflow",
    "detail": "New starter form triggers automated document generation, email sending, system provisioning requests and calendar invites — previously a 45-minute manual process per hire.",
    "serviceHrefs": [
      "/ai-workflow-and-business-process-automation"
    ],
    "sortOrder": 5
  },
  {
    "slug": "proposal-generation-system",
    "tag": "Sales",
    "title": "Proposal Generation System",
    "detail": "Sales team selects products and configuration from a structured Excel form; automation generates a formatted Word proposal and PDF, emails it to the client and logs to the CRM.",
    "serviceHrefs": [
      "/ai-workflow-and-business-process-automation"
    ],
    "sortOrder": 6
  },
  {
    "slug": "supplier-invoice-processing",
    "tag": "Operations",
    "title": "Supplier Invoice Processing",
    "detail": "VBA and Power Automate work together to extract invoice data, match against purchase orders, flag exceptions and route for approval — eliminating manual keying for 80% of invoices.",
    "serviceHrefs": [
      "/ai-workflow-and-business-process-automation"
    ],
    "sortOrder": 7
  },
  {
    "slug": "resource-planning-application",
    "tag": "Energy · VBA · SharePoint",
    "title": "Resource Planning Application",
    "detail": "Enterprise application for Contact Energy deployed via SharePoint — manages resource allocation, availability and capacity planning across multiple teams with role-based access and VBA-driven data logic.",
    "serviceHrefs": [],
    "sortOrder": 8
  },
  {
    "slug": "fund-manager-reporting-suite",
    "tag": "Finance · VBA · SQL",
    "title": "Fund Manager Reporting Suite",
    "detail": "AMP Financial Services: extensible reporting and workflow automation for fund management operations, integrating with EDI systems and database-backed data management.",
    "serviceHrefs": [],
    "sortOrder": 9
  },
  {
    "slug": "claims-analysis-platform",
    "tag": "Insurance · SQL · VBA",
    "title": "Claims Analysis Platform",
    "detail": "NZI Insurance: web app front-end (.NET + SQL) feeds data into an Excel-based management analytics layer — combining familiar Excel interfaces with enterprise data infrastructure.",
    "serviceHrefs": [],
    "sortOrder": 10
  },
  {
    "slug": "simpro-integration-tool",
    "tag": "Operations · VBA · EDI",
    "title": "SIMPRO Integration Tool",
    "detail": "Excel add-on for SIMPRO that extends the platform's capabilities for scheduling, pricing and asset management — deployed across a national maintenance business.",
    "serviceHrefs": [],
    "sortOrder": 11
  },
  {
    "slug": "ceo-monthly-dashboard",
    "tag": "Executive",
    "title": "CEO Monthly Dashboard",
    "detail": "Single-page executive view with revenue, margin, headcount and NPS metrics — updated automatically from source data with slicers for period and business unit.",
    "serviceHrefs": [
      "/excel-dashboard-development"
    ],
    "sortOrder": 12
  },
  {
    "slug": "p-l-and-cash-flow-dashboard",
    "tag": "Finance",
    "title": "P&L and Cash Flow Dashboard",
    "detail": "Interactive P&L with actuals versus budget, rolling cash flow forecast and variance commentary inputs — designed for CFO board presentation.",
    "serviceHrefs": [
      "/excel-dashboard-development"
    ],
    "sortOrder": 13
  },
  {
    "slug": "production-and-quality-dashboard",
    "tag": "Operations",
    "title": "Production and Quality Dashboard",
    "detail": "Real-time view of production throughput, defect rates and downtime by line — automatically updated from the daily export from the production system.",
    "serviceHrefs": [
      "/excel-dashboard-development"
    ],
    "sortOrder": 14
  },
  {
    "slug": "sales-performance-dashboard",
    "tag": "Sales",
    "title": "Sales Performance Dashboard",
    "detail": "Territory, rep and product breakdown with pipeline coverage, win rates and monthly trend — refreshed weekly from CRM export.",
    "serviceHrefs": [
      "/excel-dashboard-development"
    ],
    "sortOrder": 15
  },
  {
    "slug": "series-a-investment-model",
    "tag": "Fundraising",
    "title": "Series A Investment Model",
    "detail": "Three-statement model with revenue build-up, headcount plan, cash runway and investor return scenarios — used to successfully raise growth capital.",
    "serviceHrefs": [
      "/excel-financial-modelling"
    ],
    "sortOrder": 16
  },
  {
    "slug": "business-acquisition-model",
    "tag": "Acquisition",
    "title": "Business Acquisition Model",
    "detail": "Standalone target model, synergy analysis, deal structure scenarios and accretion/dilution analysis for a NZ trade buyer.",
    "serviceHrefs": [
      "/excel-financial-modelling"
    ],
    "sortOrder": 17
  },
  {
    "slug": "development-feasibility-model",
    "tag": "Property",
    "title": "Development Feasibility Model",
    "detail": "Full development feasibility including land, construction, finance costs and sales revenue with sensitivity analysis on key assumptions.",
    "serviceHrefs": [
      "/excel-financial-modelling"
    ],
    "sortOrder": 18
  },
  {
    "slug": "five-year-business-plan",
    "tag": "Operations",
    "title": "Five-Year Business Plan",
    "detail": "Integrated P&L, balance sheet and cash flow forecast with department-level cost build, headcount plan and three scenarios for board approval.",
    "serviceHrefs": [
      "/excel-financial-modelling"
    ],
    "sortOrder": 19
  },
  {
    "slug": "job-costing-and-cost-code-reclassification",
    "tag": "Simpro",
    "title": "Job costing and cost code reclassification",
    "detail": "Simpro is powerful for field service management but inflexible for cost reporting restructuring. We build Excel tools that download Simpro job data, allow finance teams to reclassify cost codes and margins at scale, and re-upload corrected records — a task that would take weeks of Simpro support tickets.",
    "serviceHrefs": [
      "/excel-integrations"
    ],
    "sortOrder": 20
  },
  {
    "slug": "budgeting-forecasting-and-variance-reporting",
    "tag": "Xero / MYOB",
    "title": "Budgeting, forecasting and variance reporting",
    "detail": "Xero and MYOB handle transactional accounting well but offer limited modelling capability. We connect Excel directly to the Xero or MYOB API, pull actuals in real time, and build forecast models and variance reports that live-update without any manual export.",
    "serviceHrefs": [
      "/excel-integrations"
    ],
    "sortOrder": 21
  },
  {
    "slug": "e-commerce-analytics-and-inventory-management",
    "tag": "Shopify / WooCommerce",
    "title": "E-commerce analytics and inventory management",
    "detail": "We pull order history, product performance, and inventory data from e-commerce APIs into Excel for analysis, margin calculation, and demand forecasting. Scheduled refreshes keep reports current without anyone touching a keyboard.",
    "serviceHrefs": [
      "/excel-integrations"
    ],
    "sortOrder": 22
  },
  {
    "slug": "multi-user-front-end-applications",
    "tag": "SQL Server / PostgreSQL",
    "title": "Multi-user front-end applications",
    "detail": "When a business outgrows a shared workbook but is not ready for a full custom application, a database-backed Excel front-end is often the pragmatic solution. One to five concurrent users, full record history, and proper data integrity — built and running in weeks.",
    "serviceHrefs": [
      "/excel-integrations"
    ],
    "sortOrder": 23
  },
  {
    "slug": "weekly-kpi-report-formatter",
    "tag": "Reporting",
    "title": "Weekly KPI Report Formatter",
    "detail": "A single button formats incoming data, applies conditional formatting, generates charts and saves a timestamped PDF — replacing 45 minutes of weekly manual work.",
    "serviceHrefs": [
      "/excel-vba-macro-development"
    ],
    "sortOrder": 24
  },
  {
    "slug": "multi-file-data-consolidator",
    "tag": "Data Processing",
    "title": "Multi-File Data Consolidator",
    "detail": "Macro opens all files in a folder, extracts specific data ranges, consolidates into a master sheet and applies cleaning rules automatically.",
    "serviceHrefs": [
      "/excel-vba-macro-development"
    ],
    "sortOrder": 25
  },
  {
    "slug": "invoice-batch-processor",
    "tag": "Finance",
    "title": "Invoice Batch Processor",
    "detail": "Reads invoice data from a structured input sheet, generates individual formatted invoice files, saves them to client folders and logs each one in a register.",
    "serviceHrefs": [
      "/excel-vba-macro-development"
    ],
    "sortOrder": 26
  },
  {
    "slug": "meeting-pack-generator",
    "tag": "Administration",
    "title": "Meeting Pack Generator",
    "detail": "Macro pulls agenda items, attendee data and action statuses from input sheets and assembles a formatted Word document ready for distribution.",
    "serviceHrefs": [
      "/excel-vba-macro-development"
    ],
    "sortOrder": 27
  },
  {
    "slug": "monthly-management-reporting-pack",
    "tag": "Finance",
    "title": "Monthly Management Reporting Pack",
    "detail": "Consolidates data from four systems into a structured, formatted report — updated in minutes, not hours.",
    "serviceHrefs": [
      "/excel-spreadsheet-development"
    ],
    "sortOrder": 28
  },
  {
    "slug": "job-costing-tracker",
    "tag": "Operations",
    "title": "Job Costing Tracker",
    "detail": "Tracks materials, labour and margins per job with automated summaries and variance flags.",
    "serviceHrefs": [
      "/excel-spreadsheet-development"
    ],
    "sortOrder": 29
  },
  {
    "slug": "headcount-and-budget-model",
    "tag": "HR",
    "title": "Headcount and Budget Model",
    "detail": "Linked salary, FTE and cost-centre model with scenario planning and board-ready outputs.",
    "serviceHrefs": [
      "/excel-spreadsheet-development"
    ],
    "sortOrder": 30
  },
  {
    "slug": "pipeline-and-forecast-tool",
    "tag": "Sales",
    "title": "Pipeline and Forecast Tool",
    "detail": "Weighted pipeline view with rolling 12-month forecast and territory breakdown.",
    "serviceHrefs": [
      "/excel-spreadsheet-development"
    ],
    "sortOrder": 31
  },
  {
    "slug": "live-gl-reporting-in-excel",
    "tag": "Finance",
    "title": "Live GL Reporting in Excel",
    "detail": "Excel connects directly to the general ledger database via Power Query — finance team refreshes reports in one click without IT involvement.",
    "serviceHrefs": [
      "/excel-integrations"
    ],
    "sortOrder": 32
  },
  {
    "slug": "production-dashboard-from-erp-database",
    "tag": "Operations",
    "title": "Production Dashboard from ERP Database",
    "detail": "VBA queries the ERP SQL database, pulls current production data and updates a formatted Excel dashboard that refreshes every morning automatically.",
    "serviceHrefs": [
      "/excel-integrations"
    ],
    "sortOrder": 33
  },
  {
    "slug": "claims-analysis-tool",
    "tag": "Insurance",
    "title": "Claims Analysis Tool",
    "detail": "Excel connected to the claims database via ADO — analysts can run custom queries from dropdown filters in Excel without writing SQL.",
    "serviceHrefs": [
      "/excel-integrations"
    ],
    "sortOrder": 34
  },
  {
    "slug": "stock-and-sales-reporting",
    "tag": "Retail",
    "title": "Stock and Sales Reporting",
    "detail": "Power Query connects to the retail management SQL database, joins stock and sales tables and loads a pivot-ready dataset — replaces daily manual CSV extraction.",
    "serviceHrefs": [
      "/excel-integrations"
    ],
    "sortOrder": 35
  },
  {
    "slug": "automated-month-end-reporting",
    "tag": "Finance",
    "title": "Automated Month-End Reporting",
    "detail": "VBA pulls data from multiple source files, applies transformations and produces a formatted management pack — a two-hour process reduced to under five minutes.",
    "serviceHrefs": [
      "/excel-vba-macro-development"
    ],
    "sortOrder": 36
  },
  {
    "slug": "purchase-order-generator",
    "tag": "Operations",
    "title": "Purchase Order Generator",
    "detail": "Staff complete a structured input form; VBA validates entries, generates a formatted PDF purchase order and saves it to the correct folder automatically.",
    "serviceHrefs": [
      "/excel-vba-macro-development"
    ],
    "sortOrder": 37
  },
  {
    "slug": "payroll-reconciliation-tool",
    "tag": "HR",
    "title": "Payroll Reconciliation Tool",
    "detail": "VBA imports payroll exports, reconciles against budget, flags variances and produces a sign-off report for finance review.",
    "serviceHrefs": [
      "/excel-vba-macro-development"
    ],
    "sortOrder": 38
  },
  {
    "slug": "route-and-load-optimisation",
    "tag": "Logistics",
    "title": "Route and Load Optimisation",
    "detail": "VBA processes delivery data, assigns loads to vehicles by capacity and region, and outputs a daily run sheet with driving order.",
    "serviceHrefs": [
      "/excel-vba-macro-development"
    ],
    "sortOrder": 39
  },
  {
    "slug": "automated-project-tracker",
    "tag": "Operations",
    "title": "Automated Project Tracker",
    "detail": "Google Sheet with Apps Script automation updates project statuses, sends email reminders for overdue actions and generates a weekly summary report — all without manual intervention.",
    "serviceHrefs": [
      "/google-sheets-development"
    ],
    "sortOrder": 40
  },
  {
    "slug": "leave-and-attendance-system",
    "tag": "HR",
    "title": "Leave and Attendance System",
    "detail": "Staff submit leave requests via Google Form; Sheet processes requests, updates a shared calendar and notifies managers automatically via Gmail.",
    "serviceHrefs": [
      "/google-sheets-development"
    ],
    "sortOrder": 41
  },
  {
    "slug": "crm-lite-for-a-growing-nz-business",
    "tag": "Sales",
    "title": "CRM Lite for a Growing NZ Business",
    "detail": "Custom Google Sheet CRM with pipeline stages, follow-up reminders, deal value tracking and exportable reporting — built for a team that did not need (or want) Salesforce.",
    "serviceHrefs": [
      "/google-sheets-development"
    ],
    "sortOrder": 42
  },
  {
    "slug": "multi-entity-consolidation-tool",
    "tag": "Finance",
    "title": "Multi-Entity Consolidation Tool",
    "detail": "Pulls data from subsidiary Sheets via ImportRange, consolidates into a group view and formats a monthly reporting pack automatically.",
    "serviceHrefs": [
      "/google-sheets-development"
    ],
    "sortOrder": 43
  },
  {
    "slug": "erp-export-automation",
    "tag": "Finance",
    "title": "ERP Export Automation",
    "detail": "Power Query connects to monthly ERP exports, applies 14 transformation steps and loads a clean, structured table — replacing 3 hours of manual preparation.",
    "serviceHrefs": [
      "/power-query-consulting"
    ],
    "sortOrder": 44
  },
  {
    "slug": "multi-store-sales-consolidation",
    "tag": "Retail",
    "title": "Multi-Store Sales Consolidation",
    "detail": "Queries from six store systems, applies consistent naming and category mapping, and loads consolidated data into a pivot-ready model — refreshes with one click.",
    "serviceHrefs": [
      "/power-query-consulting"
    ],
    "sortOrder": 45
  },
  {
    "slug": "payroll-system-data-cleaner",
    "tag": "HR",
    "title": "Payroll System Data Cleaner",
    "detail": "Power Query standardises payroll exports with inconsistent formatting, merges cost centre data and produces a reconciliation-ready table for finance.",
    "serviceHrefs": [
      "/power-query-consulting"
    ],
    "sortOrder": 46
  },
  {
    "slug": "supplier-data-feed-processor",
    "tag": "Operations",
    "title": "Supplier Data Feed Processor",
    "detail": "Connects to supplier CSV feeds, applies pricing rules and availability flags, and loads into a procurement dashboard that updates daily.",
    "serviceHrefs": [
      "/power-query-consulting"
    ],
    "sortOrder": 47
  },
  {
    "slug": "investment-model-audit",
    "tag": "Finance",
    "title": "Investment Model Audit",
    "detail": "Pre-investment review of a target company's three-statement financial model identified three formula errors and two structural issues that materially affected the valuation output.",
    "serviceHrefs": [
      "/spreadsheet-auditing"
    ],
    "sortOrder": 48
  },
  {
    "slug": "regulatory-submission-spreadsheet-review",
    "tag": "Regulatory",
    "title": "Regulatory Submission Spreadsheet Review",
    "detail": "Independent review of calculation spreadsheets used in a regulatory submission — confirmed methodology, identified two input cells with incorrect references and provided a written sign-off report.",
    "serviceHrefs": [
      "/spreadsheet-auditing"
    ],
    "sortOrder": 49
  },
  {
    "slug": "pricing-tool-audit",
    "tag": "Operations",
    "title": "Pricing Tool Audit",
    "detail": "Audit of a pricing spreadsheet used by a sales team revealed that margin calculations were using an outdated cost basis in two product categories — immediately corrected before a major contract renewal.",
    "serviceHrefs": [
      "/spreadsheet-auditing"
    ],
    "sortOrder": 50
  },
  {
    "slug": "departed-staff-spreadsheet-review",
    "tag": "IT Handover",
    "title": "Departed Staff Spreadsheet Review",
    "detail": "Structured review of three critical workbooks inherited after a key staff member left — documented what each does, identified risks and produced a maintenance guide for the team.",
    "serviceHrefs": [
      "/spreadsheet-auditing"
    ],
    "sortOrder": 51
  },
  {
    "slug": "valet-parking-hybrid-app",
    "tag": "Hospitality · Web + SQL · Excel",
    "title": "Valet Parking Hybrid App",
    "detail": "Pullman Hotel Auckland: mobile web apps for parking attendants connected to a cloud SQL database, with Excel remaining the admin analytics console — the same data, two interfaces.",
    "serviceHrefs": [
      "/web-applications"
    ],
    "sortOrder": 52
  },
  {
    "slug": "claims-analysis-platform-web-applications",
    "tag": "Insurance · .NET · SQL · Excel",
    "title": "Claims Analysis Platform",
    "detail": "NZI: a web application for collecting claims data into MS SQL, feeding management dashboards while Excel remains available for deeper analyst work on the same dataset.",
    "serviceHrefs": [
      "/web-applications"
    ],
    "sortOrder": 53
  },
  {
    "slug": "range-planning-multi-user-system",
    "tag": "Retail · Cloud DB · Spreadsheets",
    "title": "Range Planning Multi-User System",
    "detail": "Fashion retail: buyers kept familiar spreadsheet workflows while a shared cloud database replaced fragile linked workbooks — enabling concurrent planning and POS integration.",
    "serviceHrefs": [
      "/web-applications"
    ],
    "sortOrder": 54
  },
  {
    "slug": "field-to-office-workflow-app",
    "tag": "Operations · Browser App · Cloud",
    "title": "Field-to-Office Workflow App",
    "detail": "Browser-based capture for in-field teams with role-based access, cloud storage and optional Excel exports for finance and management reporting.",
    "serviceHrefs": [
      "/web-applications"
    ],
    "sortOrder": 55
  }
] as const
