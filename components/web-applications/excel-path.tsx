import Link from 'next/link'
import { webAppPathways } from '@/lib/web-applications-page'
import { Body, Highlight, Intro, SectionHeading, SectionShell } from './shared'

export function SpreadsheetToWebSection() {
  return (
    <SectionShell id="excel-to-web" alt>
      <SectionHeading>When a spreadsheet reaches its limits</SectionHeading>
      <Intro>
        Many effective applications begin as spreadsheets. Spreadsheets allow a knowledgeable person
        to develop and prove formulas, calculations, processes, reports, data structures, workflows
        and business rules. That is a genuine strength—not a weakness.
      </Intro>
      <Body>
        The problem arises when the workbook must support many simultaneous users, field teams,
        customer access, mobile devices, secure permissions, high data volumes, audit trails,
        integrations, automated workflows or centralised live data. At that point, spreadsheet
        migration to a web application becomes one important pathway—not the only pathway, and not
        an automatic goal.
      </Body>
      <Body>
        XLS Experts can improve the existing spreadsheet, govern and stabilise it, connect it to a
        database, add a browser-based front end, retain Excel for reporting, or migrate the full
        operation into a web application. The right choice depends on users, risk, cost and how the
        process actually works.
      </Body>
      <div className="mt-10 space-y-4">
        {webAppPathways.map((step) => (
          <div
            key={step.number}
            className="flex gap-5 rounded-2xl border border-gray-200 bg-white p-6"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: '#1a6b3c' }}
            >
              {step.number}
            </span>
            <div>
              <h3 className="font-display mb-1 text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="mb-2 text-sm font-medium text-[#1a6b3c]">{step.when}</p>
              <p className="text-sm leading-relaxed text-gray-600">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-gray-500">
        Related:{' '}
        <Link href="/enterprise" className="font-medium text-[#1a6b3c] hover:underline">
          Governed Excel applications
        </Link>
        {' · '}
        <Link
          href="/excel-vba-macro-development"
          className="font-medium text-[#1a6b3c] hover:underline"
        >
          Excel VBA/Macro Development
        </Link>
        {' · '}
        <Link
          href="/ai-workflow-and-business-process-automation"
          className="font-medium text-[#1a6b3c] hover:underline"
        >
          Process automation
        </Link>
      </p>
    </SectionShell>
  )
}

export function HybridExcelWebSection() {
  return (
    <SectionShell>
      <SectionHeading>Hybrid web and Excel solutions</SectionHeading>
      <Intro>
        Hybrid architectures differentiate XLS Experts from generic application developers. We do
        not assume every calculation must leave Excel—or that every operational process must stay
        there.
      </Intro>
      <Highlight>Use each platform for what it does best.</Highlight>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#1a6b3c]/25 bg-[#e8f5ee] p-7">
          <h3 className="font-display mb-4 text-lg font-bold text-gray-900">
            The web application can handle
          </h3>
          <ul className="space-y-2.5">
            {[
              'Users and security',
              'Workflows',
              'Live operational data',
              'Mobile access',
              'Customer interaction',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm text-gray-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
          <h3 className="font-display mb-4 text-lg font-bold text-gray-900">Excel can handle</h3>
          <ul className="space-y-2.5">
            {[
              'Advanced analysis',
              'Modelling',
              'Scenario planning',
              'Ad hoc reporting',
              'Familiar finance workflows',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm text-gray-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Body>
        Typical hybrid patterns include field teams capturing data through a browser, customers
        submitting requests through a portal, operational staff managing workflows in the web
        application, and managers or analysts using Excel against the same governed data. Scheduled
        exports can feed existing reporting models; Excel templates can generate specialist
        documents; the web application controls access and the central database.
      </Body>
      <p className="text-sm text-gray-500">
        Related:{' '}
        <Link href="/excel-integrations" className="font-medium text-[#1a6b3c] hover:underline">
          Excel Integrations (SQL, API, etc.)
        </Link>
      </p>
    </SectionShell>
  )
}
