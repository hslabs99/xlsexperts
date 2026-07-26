import Link from 'next/link'
import {
  webAppBenefits,
  webAppOpportunityCategories,
  webAppTypes,
} from '@/lib/web-applications-page'
import {
  Body,
  BulletGrid,
  Highlight,
  Intro,
  MidCta,
  SectionHeading,
  SectionShell,
} from './shared'

export function AccessibleSoftwareSection() {
  return (
    <SectionShell id="why-web-applications">
      <SectionHeading>Custom software is no longer only for large enterprises</SectionHeading>
      <Intro>
        Historically, custom software development was often slow, expensive and difficult to
        prototype. It was frequently restricted to large organisations with substantial budgets and
        internal IT teams. That picture has changed.
      </Intro>
      <Body>
        Modern frameworks, reusable cloud services and AI-assisted development have made custom web
        applications more accessible to ordinary businesses. Ideas can be prototyped quickly,
        working software can be demonstrated early, and managed cloud infrastructure can replace the
        need to build every component from scratch.
      </Body>
      <Body>
        At XLS Experts, AI-assisted development—using Cursor as our development environment—helps
        experienced developers work faster, prototype more effectively and devote more time to
        business logic, user experience and testing. It does not replace software engineering. It
        supports it.
      </Body>
      <Body>
        The practical result is that custom software can now be viable for projects that would once
        have been cost-prohibitive. A business does not need to commission a massive platform in its
        first phase. A focused first version—sometimes described as a minimum viable
        application—can prove the process, then expand as requirements mature.
      </Body>
      <Body>
        Visitors arrive with different starting points: an entirely new application idea, a proposed
        SaaS product, a customer-service concept, a mobile or field requirement, an operational
        bottleneck, a spreadsheet-based system that has reached its limit, or a mix of spreadsheets,
        email, shared drives, paper forms and disconnected software. Custom web application
        development NZ engagements often begin by clarifying which of these pathways is actually in
        front of the business—and which parts of the process should stay in Excel for modelling and
        analysis.
      </Body>
      <BulletGrid
        items={[
          'Rapid prototyping of ideas',
          'Early working demonstrations',
          'Iteration with stakeholders during development',
          'Managed cloud infrastructure',
          'Modular architecture',
          'Progressive releases',
          'Focused first versions that can grow',
        ]}
      />
    </SectionShell>
  )
}

export function WhatIsWebApplication() {
  return (
    <SectionShell alt>
      <SectionHeading>What is a web application?</SectionHeading>
      <Intro>
        A web application is software accessed through a browser rather than being installed as a
        traditional desktop program. Users sign in, work with live data and complete business
        workflows from devices that have an internet connection and the right permissions.
      </Intro>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {[
          {
            title: 'Website',
            body: 'Primarily publishes information—pages, content and marketing. Interaction is limited compared with an operational system.',
          },
          {
            title: 'Web application',
            body: 'Supports interactive work: authentication, data capture, business rules, workflows, reporting and integrations.',
          },
          {
            title: 'Desktop spreadsheet or database',
            body: 'Powerful for analysis and modelling, but weaker for concurrent multi-user operations, customer access and centralised deployment.',
          },
          {
            title: 'Mobile app / SaaS platform',
            body: 'A responsive web application can often work across desktop, tablet and mobile without separate native apps. Native apps are still appropriate in some cases. A SaaS platform is software sold or licensed to multiple customers—often built as a web application.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-display mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{item.body}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

export function WebApplicationBenefits() {
  return (
    <SectionShell>
      <SectionHeading center>The core benefits of web applications</SectionHeading>
      <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-relaxed text-gray-600">
        Browser-based, cloud-hosted applications excel where Excel is weakest: concurrent multi-user
        work, any-device access and a single live source of operational data. Excel remains excellent
        for analysis, modelling, flexible reporting, scenario work, financial calculations and
        specialist power users. Each platform has an appropriate role.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        {webAppBenefits.map((benefit) => (
          <div
            key={benefit.title}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm"
          >
            <h3 className="font-display mb-2 text-lg font-bold text-[#1a6b3c]">{benefit.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{benefit.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-gray-500">
        Related:{' '}
        <Link href="/enterprise" className="font-medium text-[#1a6b3c] hover:underline">
          Enterprise Excel applications
        </Link>
        {' · '}
        <Link
          href="/solutions/dashboards-business-intelligence"
          className="font-medium text-[#1a6b3c] hover:underline"
        >
          Dashboards &amp; Business Intelligence
        </Link>
      </p>
    </SectionShell>
  )
}

export function ApplicationOpportunityGrid() {
  return (
    <SectionShell id="what-we-build" alt>
      <SectionHeading center>What could your business turn into a web application?</SectionHeading>
      <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-relaxed text-gray-600">
        Custom web application development for New Zealand businesses often starts with a familiar
        operational pattern: a process that has outgrown email, paper, shared drives or disconnected
        spreadsheets—or a new idea that needs a secure multi-user home.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {webAppOpportunityCategories.map((category) => (
          <div
            key={category.id}
            id={category.id}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="font-display mb-4 text-lg font-bold text-gray-900">{category.title}</h3>
            <ul className="space-y-2">
              {category.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <MidCta
        title="Explore what is possible"
        body="If one of these patterns sounds familiar, we can help assess whether a focused web application, hybrid system or governed spreadsheet is the practical next step."
        primary={{ label: 'Discuss Your Application', href: '#consultation' }}
        secondary={{ label: 'See application examples', href: '#examples' }}
      />
    </SectionShell>
  )
}

export function ApplicationTypeCards() {
  return (
    <SectionShell>
      <SectionHeading center>Three broad types of applications</SectionHeading>
      <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-relaxed text-gray-600">
        For now, all web application services sit on this page. The structure below makes it easy to
        expand into dedicated pages later for business apps, customer-facing apps and SaaS products.
      </p>
      <div className="space-y-8">
        {webAppTypes.map((type) => (
          <article
            key={type.id}
            id={type.id}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-7 sm:p-8"
          >
            <h3 className="font-display mb-3 text-2xl font-bold text-gray-900">{type.title}</h3>
            <p className="mb-5 text-base leading-relaxed text-gray-600">{type.intro}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {type.examples.map((example) => (
                <li key={example} className="flex gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]" />
                  {example}
                </li>
              ))}
            </ul>
            {type.note && (
              <p className="mt-5 text-sm leading-relaxed text-gray-500">{type.note}</p>
            )}
          </article>
        ))}
      </div>
      <Highlight>
        Business understanding first. Technology second. Architecture chosen for the problem—not
        the other way around.
      </Highlight>
    </SectionShell>
  )
}
