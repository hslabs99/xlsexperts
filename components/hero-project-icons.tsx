import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Calculator,
  CalendarRange,
  ClipboardCheck,
  LineChart,
  ListChecks,
  MapPin,
  ShoppingCart,
  Users,
  Zap,
} from 'lucide-react'
import type { HeroProjectIconKey } from '@/lib/hero-trust'

export const heroProjectIcons: Record<HeroProjectIconKey, LucideIcon> = {
  lineChart: LineChart,
  calculator: Calculator,
  calendarRange: CalendarRange,
  clipboardCheck: ClipboardCheck,
  listChecks: ListChecks,
  zap: Zap,
  barChart3: BarChart3,
  users: Users,
  mapPin: MapPin,
  shoppingCart: ShoppingCart,
}
