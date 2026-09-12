'use client'

import { usePathname } from 'next/navigation'
import { SiteFooter } from '@/components/site-footer'

export function PublicSiteFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <SiteFooter />
}
