import Link from 'next/link'
import { industryForSector } from '@/lib/industries'

export function IndustrySectorTag({
  sector,
  label,
  className = 'text-xs font-bold uppercase tracking-widest text-[#1a6b3c]',
}: {
  sector: string
  label?: string
  className?: string
}) {
  const industry = industryForSector(sector)
  const text = label ?? sector
  if (!industry) {
    return <p className={className}>{text}</p>
  }

  return (
    <Link
      href={industry.href}
      className={`${className} underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]`}
    >
      {text}
    </Link>
  )
}
