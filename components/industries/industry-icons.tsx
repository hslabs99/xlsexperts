import {
  Anchor,
  Building2,
  Calculator,
  DraftingCompass,
  Factory,
  Hotel,
  Shield,
  ShoppingBag,
  TreePine,
  Trees,
  Wheat,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { IndustryIconKey } from '@/lib/industries'

export const industryIcons: Record<IndustryIconKey, LucideIcon> = {
  agriculture: Wheat,
  finance: Calculator,
  insurance: Shield,
  engineering: DraftingCompass,
  energy: Zap,
  construction: Building2,
  manufacturing: Factory,
  fmcg: ShoppingBag,
  marine: Anchor,
  timber: TreePine,
  field: Trees,
  hospitality: Hotel,
  facilities: Wrench,
}
