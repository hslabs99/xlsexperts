import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

/** Internal target for unknown URLs so the smart 404 is a real HTTP 404. */
export default function SiteMissing() {
  notFound()
}
