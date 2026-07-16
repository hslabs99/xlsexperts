import type { LucideIcon } from 'lucide-react'
import {
  BarChart2,
  Bot,
  Code2,
  Database,
  FileCheck2,
  FileSpreadsheet,
  Globe,
  AppWindow,
  LayoutDashboard,
  Link2,
  RefreshCw,
  Sheet,
  Shuffle,
  Workflow,
} from 'lucide-react'
import type { ServiceIconKey } from '@/lib/service-pages'

export const serviceIcons: Record<ServiceIconKey, LucideIcon> = {
  spreadsheet: FileSpreadsheet,
  dashboard: LayoutDashboard,
  vba: Code2,
  macro: Shuffle,
  integrations: Link2,
  sql: Database,
  enterprise: Globe,
  web: AppWindow,
  financial: BarChart2,
  process: Workflow,
  ai: Bot,
  sheets: Sheet,
  powerQuery: RefreshCw,
  audit: FileCheck2,
  migration: Code2,
}
