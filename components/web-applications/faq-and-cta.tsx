import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { webAppFaqs, webAppRelatedLinks } from '@/lib/web-applications-page'
import { SectionHeading, SectionShell } from './shared'

export function WebApplicationFAQ() {
  return (
    <SectionShell id="faqs" alt>
      <div className="mx-auto max-w-3xl">
        <SectionHeading center>Frequently asked questions</SectionHeading>
        <p className="mb-10 text-center text-base leading-relaxed text-gray-600">
          Concise answers to the commercial and technical questions New Zealand businesses commonly
          ask about custom web application development.
        </p>
        <div className="space-y-4">
          {webAppFaqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-gray-200 bg-white p-6 open:shadow-sm"
            >
              <summary className="font-display cursor-pointer list-none font-bold text-gray-900 marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c] [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  <span>{faq.question}</span>
                  <span
                    className="mt-0.5 shrink-0 text-[#1a6b3c] transition group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}

export function RelatedLinksSection() {
  return (
    <SectionShell>
      <SectionHeading center>Related services and solutions</SectionHeading>
      <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
        {webAppRelatedLinks.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-5 py-4 text-sm font-medium text-gray-800 transition-colors hover:border-[#1a6b3c]/40 hover:bg-[#e8f5ee]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
            >
              {link.label}
              <ArrowRight className="h-4 w-4 shrink-0 text-[#1a6b3c]" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

export function WebApplicationCTA() {
  return (
    <section
      id="consultation"
      className="scroll-mt-28 py-16 sm:py-20"
      style={{ backgroundColor: '#1a6b3c' }}
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display mb-4 text-3xl font-bold text-white">
          What could your idea become?
        </h2>
        <p className="mb-6 text-base leading-relaxed text-white/85">
          A web application may begin as a new software concept, an operational bottleneck, a
          customer-service opportunity, or a spreadsheet that can no longer support the way the
          business has grown.
        </p>
        <p className="mb-8 text-base leading-relaxed text-white/85">
          We can help determine the most practical next step—whether that is improving the existing
          spreadsheet, creating a hybrid system, developing a focused web application, or planning a
          broader SaaS platform.
        </p>
        <p className="mb-8 text-sm leading-relaxed text-white/70">
          Bring your idea, screenshots, an existing spreadsheet, process notes, example forms,
          current frustrations, and desired users and outcomes.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Discuss Your Application
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Tell Us About Your Current Process
          </a>
        </div>
      </div>
    </section>
  )
}
