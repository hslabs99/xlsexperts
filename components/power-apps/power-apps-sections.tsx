import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  broaderCapabilities,
  dataverseExamples,
  dynamicsExamples,
  microsoftSystems,
  powerAppsCanDo,
  powerAppsCoverage,
  powerAppsFaqs,
  powerAppsRelatedLinks,
  processSteps,
  solutionMayAlsoInvolve,
  useCases,
  whoThisIsFor,
} from '@/lib/power-apps-page'
import {
  Body,
  BulletGrid,
  Highlight,
  Intro,
  MidCta,
  SectionHeading,
  SectionShell,
} from '@/components/web-applications/shared'

export function PositioningSection() {
  return (
    <SectionShell>
      <SectionHeading>The missing application layer on top of Microsoft</SectionHeading>
      <Intro>
        Many organisations already have substantial business data, processes and security inside
        Microsoft products. Dynamics 365 may be the CRM or ERP. Dataverse may already hold customer,
        product and operational records. Microsoft 365, SharePoint, Excel, Power BI, Teams, Outlook
        and Power Automate are often part of daily work.
      </Intro>
      <Body>
        The interfaces and workflows available out of the box do not always match the operational
        needs of individual departments, field staff, sales teams or management. XLS Experts creates
        custom-purpose applications that sit on top of, alongside or between those existing systems.
      </Body>
      <Body>
        Those applications can use the client’s existing Microsoft data and authentication
        environment while providing an interface and workflow designed specifically for the task.
        The objective is often to simplify a complex enterprise system for a particular operational
        job — not to give every user the entire Dynamics or Microsoft 365 interface.
      </Body>
      <ul className="mt-8 flex flex-wrap gap-2">
        {microsoftSystems.map((item) => (
          <li
            key={item}
            className="rounded-full bg-[#e8f5ee] px-3 py-1.5 text-xs font-medium text-[#1a6b3c]"
          >
            {item}
          </li>
        ))}
      </ul>
      <Highlight>
        Understanding the process, modelling the data and designing the workflow matter more than
        knowing how to place controls on a Power App.
      </Highlight>
      <Body>
        Our value is not that we can drag controls onto a canvas. It is understanding the business
        process, designing the workflow, modelling the data, integrating existing systems,
        automating repetitive actions, and creating a clean application for the people who actually
        do the work. Power Apps, Dataverse and Power Automate are the implementation platform.
      </Body>
    </SectionShell>
  )
}

export function WhatIsPowerAppsSection() {
  return (
    <SectionShell id="power-apps" alt>
      <SectionHeading>What is Microsoft Power Apps?</SectionHeading>
      <Intro>
        Microsoft Power Apps is Microsoft’s application development platform for creating custom
        business applications that can connect to Dataverse, Microsoft 365, Dynamics 365 and other
        business data sources.
      </Intro>
      <Body>
        In practical terms, Power Apps lets a business create custom desktop, tablet and mobile
        applications connected to the information it already holds. The result should feel like a
        tool built for one job — not a smaller copy of a large enterprise system.
      </Body>
      <Body>Depending on the requirement, an application can:</Body>
      <BulletGrid items={[...powerAppsCanDo]} />
      <h3 className="font-display mt-12 mb-4 text-xl font-bold text-gray-900">
        A simpler interface for a specific task
      </h3>
      <Body>
        A salesperson may not need access to the entire Dynamics interface. They may simply need an
        application showing their customers, current stock availability, stock currently carried in
        their vehicle, recent customer activity, and a simple screen to record a sale or initiate an
        order.
      </Body>
      <Body>
        That dedicated workflow can be much faster and easier than asking the user to navigate a
        large enterprise application. The same pattern applies to warehouse lookup, field
        inspections, internal approvals and operational data capture.
      </Body>
      <MidCta
        title="Have a Microsoft workflow that doesn't quite fit?"
        body="If employees are still relying on spreadsheets, manual processes or duplicate data entry beside Dynamics or Microsoft 365, a purpose-built application may be able to connect the pieces."
        primary={{ label: 'Discuss Your Power Apps Requirement', href: '#consultation' }}
        secondary={{ label: 'See example use cases', href: '#use-cases' }}
      />
    </SectionShell>
  )
}

export function DataverseSection() {
  return (
    <SectionShell id="dataverse">
      <SectionHeading>Extend your existing Dataverse environment</SectionHeading>
      <Intro>
        Microsoft Dataverse is Microsoft’s cloud-based business data platform, used by Power
        Platform and Dynamics 365 to securely store and relate business information.
      </Intro>
      <Body>
        Where a client already uses Dynamics or Dataverse, we can often build additional
        applications around that environment rather than creating an entirely disconnected database.
        The application still authenticates as part of the Microsoft tenancy, and it can work with
        records the business already maintains.
      </Body>
      <Body>That can include:</Body>
      <BulletGrid items={[...dataverseExamples]} />
      <h3 className="font-display mt-12 mb-4 text-xl font-bold text-gray-900">
        Additional tables for application-specific work
      </h3>
      <Body>
        Additional Dataverse tables can be created for application-specific requirements when that
        is appropriate. The core Dynamics implementation does not have to absorb every operational
        detail that a particular team needs.
      </Body>
      <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-7 sm:p-8">
        <h3 className="font-display mb-3 text-xl font-bold text-gray-900">
          Example: sales representative vehicle inventory
        </h3>
        <p className="mb-4 text-base leading-relaxed text-gray-600">
          A business may already maintain warehouse inventory in Dynamics. We could create an
          additional operational table to record the inventory carried in individual sales
          representatives’ vehicles. The application could then combine central warehouse inventory,
          rep-specific vehicle inventory, customer information and product information into one
          simple mobile workflow.
        </p>
        <p className="text-sm leading-relaxed text-gray-500">
          Integrations use the supported Microsoft mechanisms — Dataverse, APIs and Dynamics
          business processes — rather than writing directly to underlying database tables. Where
          Dynamics provides application-specific logic for creating a sales order or adjusting
          stock, the application should follow that path.
        </p>
      </div>
    </SectionShell>
  )
}

export function DynamicsSection() {
  return (
    <SectionShell id="dynamics" alt>
      <SectionHeading>Custom apps around Microsoft Dynamics 365</SectionHeading>
      <Intro>
        Organisations often have Dynamics 365 because it provides the core CRM, ERP or operational
        system. Individual teams may still need specialised workflows that the standard screens do
        not provide well. Custom Power Apps can give those teams a much narrower interface to
        Dynamics information.
      </Intro>
      <Body>
        Can Power Apps integrate with Dynamics 365? Yes. Dynamics 365 applications use Microsoft’s
        broader Power Platform and Dataverse ecosystem, allowing appropriately designed Power Apps
        to work with Dynamics data and business processes using supported Microsoft integration
        methods.
      </Body>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {dynamicsExamples.map((example) => (
          <article
            key={example.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-7"
          >
            <h3 className="font-display mb-3 text-lg font-bold text-gray-900">{example.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{example.body}</p>
          </article>
        ))}
      </div>
      <MidCta
        title="Talk to us about extending Dynamics"
        body="If a team only needs a focused slice of Dynamics — customers, stock, visits, approvals or field capture — we can assess whether a custom Power App is the practical next step."
        primary={{ label: 'Discuss Extending Dynamics', href: '#consultation' }}
      />
    </SectionShell>
  )
}

export function ProcessFirstSection() {
  return (
    <SectionShell>
      <SectionHeading>Built around your process — not the other way around</SectionHeading>
      <Intro>
        Traditional software often forces a business to modify its workflow to fit the software. Our
        approach is different. We first understand the work, then design the application around it.
      </Intro>
      <Body>Before anything is built, we want a clear picture of:</Body>
      <BulletGrid
        cols={2}
        items={[
          'What employees are trying to achieve',
          'What information they require',
          'Where that information currently exists',
          'What they currently do manually',
          'Where duplicate entry occurs',
          'What actions should be automated',
          'What information management needs afterwards',
        ]}
      />
      <Body>
        Applications can therefore be extremely specific. Instead of purchasing another large
        field-service platform, a company that already uses Microsoft Dynamics may only require a
        small application that handles one missing operational process and feeds the results back
        into its existing systems. That is a key benefit of custom development.
      </Body>
    </SectionShell>
  )
}

export function BroaderCapabilitySection() {
  return (
    <SectionShell alt>
      <SectionHeading>The complete workflow — not only Power Apps</SectionHeading>
      <Intro>
        XLS Experts is not restricted to Power Apps. Power Apps may be the user interface, one
        component of a wider solution, or not the best application layer once the requirement is
        understood. The recommendation follows the business requirement rather than forcing the
        client into a particular technology.
      </Intro>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-7">
          <h3 className="font-display mb-3 text-lg font-bold text-gray-900">
            Microsoft-native applications
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-gray-600">
            Power Apps, Dataverse, Power Automate, Dynamics 365, Microsoft 365 and related Microsoft
            services — used where they are the practical fit for users who already work in that
            environment.
          </p>
          <ul className="flex flex-wrap gap-2">
            {broaderCapabilities.slice(0, 5).map((item) => (
              <li
                key={item}
                className="rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-medium text-[#1a6b3c]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-7">
          <h3 className="font-display mb-3 text-lg font-bold text-gray-900">
            Broader custom application development
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-gray-600">
            Where the requirement extends beyond what Power Apps is best suited to, we can also
            create{' '}
            <Link href="/web-applications" className="font-medium text-[#1a6b3c] hover:underline">
              custom web applications
            </Link>{' '}
            and APIs that integrate with Microsoft systems — or keep{' '}
            <Link
              href="/excel-vba-macro-development"
              className="font-medium text-[#1a6b3c] hover:underline"
            >
              Excel and VBA
            </Link>{' '}
            in the process where that remains the right tool.
          </p>
          <ul className="flex flex-wrap gap-2">
            {broaderCapabilities.slice(5).map((item) => (
              <li
                key={item}
                className="rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-medium text-[#1a6b3c]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Body>
        Many real-world business workflows cross several technologies. A Power App might be the
        interface, but the complete solution may also involve:
      </Body>
      <BulletGrid cols={3} items={[...solutionMayAlsoInvolve]} />
      <p className="mt-6 text-base leading-relaxed text-gray-600">
        We also connect this work to{' '}
        <Link
          href="/ai-workflow-and-business-process-automation"
          className="font-medium text-[#1a6b3c] hover:underline"
        >
          business process automation
        </Link>
        ,{' '}
        <Link href="/excel-integrations" className="font-medium text-[#1a6b3c] hover:underline">
          Excel integrations
        </Link>{' '}
        and{' '}
        <Link href="/power-query-consulting" className="font-medium text-[#1a6b3c] hover:underline">
          Power Query
        </Link>{' '}
        where those are part of the same operational picture.
      </p>
    </SectionShell>
  )
}

export function UseCasesSection() {
  return (
    <SectionShell id="use-cases">
      <SectionHeading center>Example applications we build</SectionHeading>
      <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-relaxed text-gray-600">
        These are typical patterns, not a catalogue of products. Each application is designed around
        the client’s process, data and Microsoft environment.
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((item) => (
          <article
            key={item.title}
            className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50 p-6"
          >
            <h3 className="font-display mb-2 text-base font-bold text-gray-900">{item.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{item.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}

export function AudienceSection() {
  return (
    <SectionShell alt>
      <SectionHeading>Who this service is for</SectionHeading>
      <Intro>
        This work is particularly relevant to organisations that already have a Microsoft
        investment and a process that does not quite fit the standard screens. We also work with
        companies that are only beginning to investigate Power Apps and Dataverse.
      </Intro>
      <BulletGrid items={[...whoThisIsFor]} />
    </SectionShell>
  )
}

export function ApproachSection() {
  return (
    <SectionShell id="approach">
      <SectionHeading center>How we approach the work</SectionHeading>
      <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-relaxed text-gray-600">
        Practical and iterative rather than a rigid consulting methodology. Important details often
        appear once users can try a working version.
      </p>
      <ol className="space-y-5">
        {processSteps.map((step) => (
          <li
            key={step.number}
            className="flex gap-5 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-7"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: '#1a6b3c' }}
            >
              {step.number}
            </span>
            <div>
              <h3 className="font-display mb-2 text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  )
}

export function CoverageSection() {
  return (
    <SectionShell alt>
      <SectionHeading>{powerAppsCoverage.heading}</SectionHeading>
      <Intro>{powerAppsCoverage.body}</Intro>
    </SectionShell>
  )
}

export function PowerAppsFaqSection() {
  return (
    <SectionShell id="faqs">
      <div className="mx-auto max-w-3xl">
        <SectionHeading center>Frequently asked questions</SectionHeading>
        <p className="mb-10 text-center text-base leading-relaxed text-gray-600">
          Concise answers to the questions operations, IT and finance teams usually ask about Power
          Apps, Dataverse and Dynamics 365 custom apps.
        </p>
        <div className="space-y-4">
          {powerAppsFaqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-gray-200 bg-white p-6 open:shadow-sm"
            >
              <summary className="font-display cursor-pointer list-none font-bold text-gray-900 marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c] [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-bold">{faq.question}</h3>
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

export function PowerAppsRelatedLinks() {
  return (
    <SectionShell alt>
      <SectionHeading center>Related services and solutions</SectionHeading>
      <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
        {powerAppsRelatedLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-800 transition-colors hover:border-[#1a6b3c]/40 hover:bg-[#e8f5ee]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b3c]"
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

export function PowerAppsCta() {
  return (
    <section
      id="consultation"
      className="scroll-mt-28 py-16 sm:py-20"
      style={{ backgroundColor: '#1a6b3c' }}
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display mb-4 text-3xl font-bold text-white">
          Have a Microsoft workflow that doesn’t quite fit?
        </h2>
        <p className="mb-8 text-base leading-relaxed text-white/85">
          If your business already has Microsoft Dynamics, Dataverse or Microsoft 365 but employees
          are still relying on spreadsheets, manual processes or duplicate data entry, talk to us
          about whether a purpose-built application could connect the pieces.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Discuss Your Power Apps Requirement
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Talk to Us About Extending Dynamics
          </a>
        </div>
      </div>
    </section>
  )
}
