import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/contact'
import { ServicePageExamples } from '@/components/service-page-examples'
import { getServicePageTiles } from '@/lib/service-page-tiles'
import { CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Web Applications New Zealand | XLS Experts',
  description:
    'Custom web application development for New Zealand businesses. Java, cloud databases and Google Cloud ecosystems to extend Excel functionality or migrate spreadsheet apps into full multi-user web applications.',
  alternates: { canonical: 'https://www.xlsexperts.co.nz/web-applications' },
  openGraph: {
    title: 'Web Applications New Zealand | XLS Experts',
    description:
      'Custom web apps that extend Excel or replace spreadsheet applications — Java, cloud databases and Google Cloud for NZ businesses.',
    url: 'https://www.xlsexperts.co.nz/web-applications',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
}

const problems = [
  'An Excel application that works for one power user but cannot support concurrent multi-user access',
  'Field or mobile staff who need the same data as the office team without opening a desktop workbook',
  'Spreadsheet logic that has outgrown Excel and needs a proper application layer with roles and audit trails',
  'Business processes trapped in a single workbook with no way to expose them securely to customers or partners',
  'Need to keep Excel for reporting while moving day-to-day operations into a browser-based system',
  'IT wanting cloud hosting, managed databases and modern deployment — not macros emailed around as attachments',
]

const steps = [
  {
    number: '01',
    title: 'Architecture and scope',
    points: [
      'Map current Excel or spreadsheet processes and who needs access',
      'Decide: extend Excel, hybrid (web + Excel), or full migration off Excel',
      'Choose stack — Java/.NET, cloud database, Google Cloud or similar — to match your IT environment',
    ],
    deliverable: 'Architecture recommendation, user roles and delivery milestones.',
  },
  {
    number: '02',
    title: 'Build and integrate',
    points: [
      'Working web app with authentication, roles and core workflows',
      'Cloud database design and APIs for reliable multi-user data',
      'Optional Excel or Google Sheets connection for reporting and power users',
    ],
    deliverable: null,
  },
  {
    number: '03',
    title: 'Deploy and handover',
    points: [
      'Hosting setup (e.g. Google Cloud or your preferred cloud)',
      'User training for office and field teams',
      'Documentation, support path and enhancement roadmap',
    ],
    deliverable: null,
  },
]

const faqs = [
  {
    q: 'How is this different from Enterprise Excel Applications?',
    a: 'Enterprise Excel Applications keep Excel as the primary application — governed workbooks, VBA and optional SQL hybrids. Web Applications are browser-based systems built with web technologies (Java, cloud databases, Google Cloud and similar) that either extend Excel or replace spreadsheet apps for multi-user, any-device use.',
  },
  {
    q: 'Can you extend our existing Excel tools rather than replace them?',
    a: 'Yes. A common pattern is a web front-end for capture and operations, with Excel remaining connected for analytics, budgeting or offline reporting. We design the split so each tool does what it does best.',
  },
  {
    q: 'What technologies do you use?',
    a: 'Depending on the project we use Java, .NET, React and other modern web stacks, with cloud databases and platforms such as Google Cloud. We match the stack to your IT standards, security requirements and existing systems.',
  },
  {
    q: 'When should we migrate off Excel entirely?',
    a: 'When you need concurrent multi-user editing, mobile or customer-facing access, strong role-based security, or data volumes and workflows that Excel cannot reliably support. We help you decide based on users, risk and cost — not a one-size-fits-all rebuild.',
  },
  {
    q: 'Do you host the applications?',
    a: 'We can deploy to your cloud account (for example Google Cloud) or work with your IT team on hosting you already use. Ongoing support and enhancement retainers are available after go-live.',
  },
]

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Web Applications',
  description:
    'Custom web application development for New Zealand businesses — Java, cloud databases and Google Cloud to extend Excel or migrate spreadsheet applications into full web apps.',
  provider: {
    '@type': 'ProfessionalService',
    name: 'XLS Experts',
    url: 'https://www.xlsexperts.co.nz',
    areaServed: { '@type': 'Country', name: 'New Zealand' },
  },
  url: 'https://www.xlsexperts.co.nz/web-applications',
  areaServed: { '@type': 'Country', name: 'New Zealand' },
  serviceType: 'Web Application Development',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default async function WebApplicationsPage() {
  const exampleTiles = await getServicePageTiles('/web-applications')
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />

      <main className="pt-16">
        <section
          className="relative overflow-hidden py-24"
          style={{
            background:
              'linear-gradient(135deg, #0d3d22 0%, #1a6b3c 60%, #1f7d46 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/25 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
              Web Applications
            </span>
            <h1 className="font-display mb-6 text-balance text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Web apps that extend Excel — or take you beyond it.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80">
              We build dynamic web applications using technologies like Java and
              cloud databases — including the Google Cloud ecosystem — to extend
              Excel functionality or migrate users from spreadsheet applications
              into full multi-user web apps. Browser-based, any device, with the
              option to keep Excel connected for reporting.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
            >
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              When a spreadsheet is no longer enough
            </h2>
            <p className="mb-12 text-center text-gray-500">
              Signs it is time for a proper web application.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {problems.map((p) => (
                <div
                  key={p}
                  className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6b3c]" />
                  <p className="text-sm leading-relaxed text-gray-700">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ServicePageExamples
          heading="Web application examples"
          subheading="Hybrid and full web solutions delivered for New Zealand organisations."
          tiles={exampleTiles}
        />

        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display mb-3 text-center text-3xl font-bold text-gray-900">
              How we work
            </h2>
            <p className="mb-12 text-center text-gray-500">
              From spreadsheet pain point to production web application.
            </p>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-7 shadow-sm"
                >
                  <div
                    className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: '#1a6b3c' }}
                  >
                    {step.number}
                  </div>
                  <h3 className="font-display mb-4 text-lg font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <ul className="space-y-2">
                    {step.points.map((p) => (
                      <li key={p} className="flex gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6b3c]" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  {step.deliverable ? (
                    <p className="mt-4 rounded-lg bg-[#e8f5ee] px-3 py-2 text-xs font-medium text-[#1a6b3c]">
                      Deliverable: {step.deliverable}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display mb-4 text-2xl font-bold text-gray-900">
              Web applications across New Zealand
            </h2>
            <p className="leading-relaxed text-gray-600">
              We design and build web applications for businesses throughout New
              Zealand — Auckland, Wellington, Christchurch and beyond. Projects
              are typically delivered remotely with regular demos. Whether you
              need to extend Excel with a browser front-end or migrate fully to
              a cloud-hosted application, we keep the path practical and
              aligned with how your team already works.
            </p>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display mb-12 text-center text-3xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-gray-200 p-6">
                  <h3 className="font-display mb-2 font-bold text-gray-900">
                    {faq.q}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="py-16 text-center"
          style={{ backgroundColor: '#1a6b3c' }}
        >
          <div className="mx-auto max-w-xl px-6">
            <h2 className="font-display mb-4 text-3xl font-bold text-white">
              Ready to discuss a web application?
            </h2>
            <p className="mb-8 text-white/80">
              Tell us whether you need to extend Excel or migrate away from it —
              we will recommend a practical path.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50"
            >
              Book a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <Contact />
      </main>
    </>
  )
}
