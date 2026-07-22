import {
  SolutionHero,
} from '@/components/solutions/solution-hero'
import { SolutionIntro } from '@/components/solutions/solution-intro'
import { ProblemSigns } from '@/components/solutions/problem-signs'
import { SolutionCapabilities } from '@/components/solutions/solution-capabilities'
import { UseCaseGrid } from '@/components/solutions/use-case-grid'
import { TechnologyStrip } from '@/components/solutions/technology-strip'
import { ProcessSteps } from '@/components/solutions/process-steps'
import { RelatedCaseStudies } from '@/components/solutions/related-case-studies'
import { RelatedSolutions } from '@/components/solutions/related-solutions'
import { SolutionFAQ, solutionFaqJsonLd } from '@/components/solutions/solution-faq'
import { SolutionCTA } from '@/components/solutions/solution-cta'
import { solutionsBreadcrumbJsonLd } from '@/components/solutions/breadcrumbs'
import { Contact } from '@/components/contact'
import { Navbar } from '@/components/navbar'
import {
  SITE_ORIGIN,
  contactHrefForSolution,
  getPublishedCaseStudies,
  getRelatedSolutions,
  type SolutionPage,
} from '@/lib/solutions'

type SolutionPageViewProps = {
  solution: SolutionPage
}

export function SolutionPageView({ solution }: SolutionPageViewProps) {
  const related = getRelatedSolutions(solution)
  const caseStudies = getPublishedCaseStudies(solution)
  const contactHref = contactHrefForSolution(solution.slug)

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: solution.title,
    description: solution.metaDescription,
    provider: {
      '@type': 'ProfessionalService',
      name: 'XLS Experts',
      url: SITE_ORIGIN,
      areaServed: { '@type': 'Country', name: 'New Zealand' },
    },
    url: `${SITE_ORIGIN}${solution.href}`,
    areaServed: { '@type': 'Country', name: 'New Zealand' },
    serviceType: solution.title,
  }

  const breadcrumbSchema = solutionsBreadcrumbJsonLd([
    { name: solution.title, href: solution.href },
  ])

  const faqSchema =
    solution.faqs.length > 0 ? solutionFaqJsonLd(solution.faqs) : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Navbar />
      <main className="pt-16">
        <SolutionHero
          eyebrow={solution.shortTitle}
          heading={solution.heroHeading}
          introduction={solution.heroIntroduction}
          primaryCta={{ label: 'Discuss your project', href: contactHref }}
          secondaryCta={{
            label: 'Explore related solutions',
            href: '#related-solutions',
          }}
        />
        <SolutionIntro
          heading={solution.introHeading}
          body={solution.introBody}
        />
        <ProblemSigns
          heading={solution.problemsHeading}
          problems={solution.problems}
        />
        <SolutionCapabilities
          heading={solution.capabilitiesHeading}
          capabilities={solution.capabilities}
        />
        <UseCaseGrid
          heading={solution.useCasesHeading}
          useCases={solution.useCases}
        />
        <TechnologyStrip
          heading={solution.technologyHeading}
          notes={solution.technologyNotes}
          technologies={solution.technologies}
        />
        {solution.approachHeading && solution.approachBody && (
          <section className="bg-white py-12">
            <div className="mx-auto max-w-3xl px-6">
              <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">
                {solution.approachHeading}
              </h2>
              <div className="space-y-4">
                {solution.approachBody.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="text-base leading-relaxed text-gray-600"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}
        <ProcessSteps
          heading={solution.processHeading}
          steps={solution.processSteps}
        />
        <RelatedCaseStudies studies={caseStudies} />
        <div id="related-solutions">
          <RelatedSolutions
            solutions={related}
            linkLabels={solution.relatedLinkLabels}
          />
        </div>
        <SolutionFAQ faqs={solution.faqs} />
        <SolutionCTA
          heading={solution.ctaHeading}
          body={solution.ctaBody}
          href={contactHref}
        />
        <Contact />
      </main>
    </>
  )
}
