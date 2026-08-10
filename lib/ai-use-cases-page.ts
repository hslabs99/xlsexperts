/** Content for the A.I. Use Cases landing page (`/use-cases`). */

export const USE_CASES_HREF = '/use-cases'

export const useCasesPageMeta = {
  title: 'A.I. Use Cases for Excel, VBA and Power Query | XLS Experts',
  description:
    'Five practical A.I. use cases for Excel, VBA and Power Query — commentary, classification, document extraction, anomaly review and natural-language assistants — without replacing your existing workbooks.',
  ogTitle: 'A.I. Use Cases for Excel, VBA and Power Query | XLS Experts',
  ogDescription:
    'How A.I. adds value at specific points in Excel workflows: interpretation, classification, extraction, exception review and conversational assistants via a secure cloud API.',
} as const

export type UseCaseNavItem = {
  id: string
  number: string
  shortTitle: string
}

export const useCaseNav: readonly UseCaseNavItem[] = [
  {
    id: 'commentary',
    number: '01',
    shortTitle: 'Commentary and interpretation',
  },
  {
    id: 'classification',
    number: '02',
    shortTitle: 'Classification and coding',
  },
  {
    id: 'extraction',
    number: '03',
    shortTitle: 'Document extraction',
  },
  {
    id: 'data-quality',
    number: '04',
    shortTitle: 'Data quality and exceptions',
  },
  {
    id: 'assistant',
    number: '05',
    shortTitle: 'Natural-language assistant',
  },
] as const

export const useCasesRelatedLinks = [
  {
    label: 'A.I. Workflow and Business Process Automation',
    href: '/ai-workflow-and-business-process-automation',
  },
  {
    label: 'Excel VBA/Macro Development',
    href: '/excel-vba-macro-development',
  },
  {
    label: 'Power Query Consulting',
    href: '/power-query-consulting',
  },
  {
    label: 'Excel Integrations (SQL, API, etc.)',
    href: '/excel-integrations',
  },
  {
    label: 'Excel in Enterprise Operational Applications',
    href: '/enterprise',
  },
] as const
