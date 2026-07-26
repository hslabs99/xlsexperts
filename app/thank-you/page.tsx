import type { Metadata } from 'next'
import { marketPageMetadata } from '@/lib/seo'
import { Suspense } from 'react'
import { Navbar } from '@/components/navbar'
import { ThankYouView } from '@/components/thank-you-view'

export async function generateMetadata(): Promise<Metadata> {
  return marketPageMetadata({
    path: '/thank-you',
    title: 'Thank you',
    description:
      'Thank you for contacting XLS Experts. We will be in touch shortly about your Excel or spreadsheet project.',
    robots: { index: false, follow: false },
  })
}

export default function ThankYouPage() {
  return (
    <main>
      <Navbar />
      <Suspense
        fallback={
          <section className="bg-white py-24">
            <div className="mx-auto max-w-2xl px-6 text-center text-sm text-gray-500">
              Loading…
            </div>
          </section>
        }
      >
        <ThankYouView />
      </Suspense>
    </main>
  )
}
