/**
 * Canonical ten pillars for costing and quoting systems.
 * The solutions page is the primary public version; the PDF guide expands
 * each pillar with questions to ask of an existing quoting process.
 */

export type QuotingPillar = {
  title: string
  description: string
  questions: string[]
}

export const QUOTING_PILLARS: readonly QuotingPillar[] = [
  {
    title: 'Capture and encode every line item accurately',
    description:
      'Take-offs, products, services, treatments, options, quantities and units encoded consistently, so the final cost or price is reliable and you can always explain how it was reached.',
    questions: [
      'Can two estimators encode the same job and arrive at the same line items?',
      'If a client queries a figure, can you show the quantity, unit and source without reconstructing the quote by hand?',
      'Are units, waste and optional items captured in the estimate, or added later as notes?',
    ],
  },
  {
    title: 'Support the way your business prices',
    description:
      'Cost-up-to-margin, pre-configured selling prices or a hybrid model — with multiple users able to work at once from shared project and price-list data.',
    questions: [
      'Does the current tool match how you actually set a selling price, or do people work around it?',
      'Can more than one person quote at once from the same rates and project data?',
      'When a price list changes, do live quotes pick up the new figures, or do old rates linger in copies of the workbook?',
    ],
  },
  {
    title: 'Apply rates, mark-ups and commercial rules consistently',
    description:
      'Rate bases, mark-ups, minimum charges and allowances maintained in one controlled place, while still letting you authorise and record exceptions.',
    questions: [
      'Where do labour rates, mark-ups and minimum charges actually live — one list, or several spreadsheets?',
      'Can an estimator apply a different margin, and if so is that exception recorded?',
      'Would a new staff member produce the same commercial result as your most experienced estimator?',
    ],
  },
  {
    title: 'Handle complexity, exceptions and manual overrides',
    description:
      'Represent non-standard work and one-off adjustments openly, without burying them in formulas or corrupting the standard data other quotes rely on.',
    questions: [
      'When a job is non-standard, does the override sit in plain view or disappear into a hidden formula?',
      'Can you adjust one quote without changing the rate library everyone else uses?',
      'Are one-off items distinguishable from standard catalogue items when you review a quote later?',
    ],
  },
  {
    title: 'Accommodate scenarios, variations, exclusions and margin adjustments',
    description:
      'Model alternatives, variations, exclusions and contingencies while keeping the link between the original quote and later commercial decisions intact.',
    questions: [
      'Can you present options or exclusions without duplicating the whole estimate?',
      'When a variation is approved, does it remain linked to the original quote?',
      'If margin is adjusted after issue, can you still see the first-issued position?',
    ],
  },
  {
    title: 'Check, flag and approve unusual results',
    description:
      'Catch missing information, anomalous quantities, mismatched units and thin margins before a quote is issued, with review and approval controls built in.',
    questions: [
      'What currently stops a thin-margin or incomplete quote from leaving the business?',
      'Are quantity, unit and margin checks automatic, or do they depend on someone noticing?',
      'Who can approve an exception, and is that approval recorded on the quote?',
    ],
  },
  {
    title: 'Present quotes the way each client expects',
    description:
      'Separate the internal calculation from the external document, so you can issue item, component, package, project or combined quotation formats to suit the customer.',
    questions: [
      'Do estimators edit the customer-facing document by hand after the numbers are done?',
      'Can you issue a packaged summary to one client and a line-by-line breakdown to another from the same estimate?',
      'Is branding, numbering and legal wording controlled, or copied from the last PDF someone liked?',
    ],
  },
  {
    title: 'Connect quoting to the rest of your business — and to others',
    description:
      'Exchange data with your internal systems and with customers, suppliers and subcontractors through files, databases, APIs and workflow hand-offs, including Xero and MYOB.',
    questions: [
      'After a quote is won, is the job re-keyed into accounting, CRM or job management?',
      'Can supplier or subcontractor prices feed the estimate without a copy-paste step?',
      'Would a connection to Xero, MYOB or your CRM remove a recurring manual hand-off?',
    ],
  },
  {
    title: 'Turn quoting and project data into insight',
    description:
      'Compare performance by job type, job size, estimator, salesperson, project manager, customer, category, margin, outcome and variations — so quoting becomes business intelligence, not just paperwork.',
    questions: [
      'Can you see which job types, customers or estimators produce the most reliable margins?',
      'Do you know how often quoted work turns into variations, and whether those were visible at estimate time?',
      'If last year’s quotes were stored in a structured way, could they inform the next similar job?',
    ],
  },
  {
    title: 'Use AI where it genuinely helps',
    description:
      'Apply AI to organise information, reduce manual processing, surface patterns and support decisions, with review controls matched to the commercial risk.',
    questions: [
      'Which quoting steps are slow because information is unstructured — take-offs, emails, drawings, supplier lists?',
      'If AI drafted a line or flagged an anomaly, who would still be required to approve it before issue?',
      'Would the commercial risk of an unreviewed suggestion be acceptable on a high-value quote?',
    ],
  },
] as const

export const TEN_PILLARS_GUIDE = {
  title: 'The Ten Pillars of Effective Costing & Quoting',
  filename: 'The-Ten-Pillars-of-Effective-Costing-and-Quoting.pdf',
  pagePath: '/solutions/quoting-estimating-systems',
  intro: [
    'A costing system is usually an accumulation of operational knowledge, pricing rules and workarounds built up over years. The work is to understand what you already have, keep what works, and fix the weaknesses that hold back accuracy, control or growth.',
    'These ten pillars describe what a high-performing costing and quoting system should do — in Excel or as a connected web application. Each pillar includes questions to ask of your own quoting process.',
    'This guide is a downloadable companion to the quoting and estimating systems page on the XLS Experts website, which is the primary public version of the same framework.',
  ],
} as const
