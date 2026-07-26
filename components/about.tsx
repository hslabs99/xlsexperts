'use client'

import Image from 'next/image'
import { MapPin, Network, Users, Zap } from 'lucide-react'
import { useMarketCopy } from '@/components/market-provider'

const team = [
  {
    name: 'Mike Colwill',
    role: 'Project Manager / XLS Data Guru',
    bio: 'With over 20 years experience developing data solutions across a wide variety of business sectors, Mike acts as Project Manager on all projects to ensure every delivery meets our standards.',
    image: '/images/team-mike.png',
  },
  {
    name: 'Wilder',
    role: 'Senior Solution Architect',
    bio: "With a Bachelor's in Engineering, a Master's in Computer Engineering, and an MBA, plus over 10 years of hands-on experience, Wilder brings deep architectural thinking to every project.",
    image: '/images/team-wilder.png',
  },
  {
    name: 'Jason',
    role: 'Advanced Formulas & Reporting',
    bio: 'Jason is our go-to specialist for advanced nested formulas and great looking charts and reports. If the logic is complex, Jason will untangle it.',
    image: '/images/team-jason.png',
  },
  {
    name: 'Kay',
    role: 'Data Analysis & Business Intelligence',
    bio: 'With strong skills in manual and programmatic data analysis, Kay oversees all work related to BI tasks including Power Pivot and Tableau-driven reporting.',
    image: '/images/team-kay.png',
  },
  {
    name: 'Parker',
    role: 'Power BI / VBA / SQL',
    bio: 'Parker is an experienced VBA developer and data analyst with excellent SQL and database skills, bringing rigour and precision to every data pipeline project.',
    image: '/images/team-parker.png',
  },
  {
    name: 'Sitti',
    role: 'XLS Allrounder',
    bio: 'Sitti is well-skilled in all aspects of Excel and Google Sheets and steps in wherever the team needs her — reliable, thorough, and always delivering clean work.',
    image: '/images/team-sitti.png',
  },
]

export function About() {
  const copy = useMarketCopy()
  const pillars = [
    {
      icon: MapPin,
      title: copy.about.pillarBasedTitle,
      body: copy.about.pillarBasedBody,
    },
    {
      icon: Users,
      title: 'SMEs to enterprise',
      body: copy.about.pillarSmeBody,
    },
    {
      icon: Zap,
      title: 'Broad technology stack',
      body: 'Excel, VBA, Google Sheets, Office Scripts, Apps Script, React, .NET, A.I., Zapier, and N8n — we choose the right tool for your problem, not the other way around.',
    },
  ]

  return (
    <section id="about" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">

        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1a6b3c' }}>
            Who we are
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            About Us
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500">
            {copy.about.intro}
          </p>
        </div>

        {/* Three pillars */}
        <div className="mt-14 grid gap-px sm:grid-cols-3" style={{ backgroundColor: '#c5e0d0' }}>
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div key={pillar.title} className="flex flex-col gap-3 bg-white p-8">
                <div
                  className="flex h-10 w-10 items-center justify-center"
                  style={{ backgroundColor: '#e8f5ee' }}
                >
                  <Icon className="h-5 w-5" style={{ color: '#1a6b3c' }} aria-hidden="true" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">{pillar.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{pillar.body}</p>
              </div>
            )
          })}
        </div>

        {/* Team grid */}
        <div className="mt-16">
          <h3 className="mb-8 text-center text-sm font-bold uppercase tracking-widest text-gray-700">
            The team
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex gap-4 border border-gray-100 bg-gray-50 p-5"
              >
                {/* Avatar */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="64px"
                    className="object-cover object-top"
                    loading="lazy"
                  />
                </div>
                {/* Info */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-gray-900">{member.name}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1a6b3c' }}>
                    {member.role}
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Freelancer pool callout */}
        <div
          className="mt-14 flex flex-col gap-5 p-8 sm:flex-row sm:items-start sm:gap-8"
          style={{ backgroundColor: '#e8f5ee' }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center"
            style={{ backgroundColor: '#1a6b3c' }}
          >
            <Network className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Elastic pool of specialist freelancers</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Beyond our core team, we maintain an elastic pool of trusted specialist freelancers — giving us the ability to scale up quickly and bring in exactly the right expertise for your project. Our extended network covers Excel, VBA, ASP.NET, Cursor, Java, Python, Power BI, SQL, React, .NET, and more. You get a small-team feel with enterprise-grade capability when you need it.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Excel', 'VBA', 'ASP.NET', 'Cursor', 'N8N', 'Java', 'Python', 'Power BI', 'SQL', 'React', '.NET', 'Google Sheets', 'A.I. / LLMs', 'Google Cloud', 'Amazon Web Services', 'Azure'].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border px-3 py-1 text-xs font-medium text-gray-700"
                  style={{ borderColor: '#c5e0d0', backgroundColor: 'white' }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Brands note */}
        <div className="mt-14 border-t border-gray-100 pt-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Our brands</span>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-6">
            <a
              href="https://www.excelexperts.co.nz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-700 underline-offset-2 hover:underline"
            >
              {copy.about.brandNzLabel}
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="https://www.excelexperts.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-700 underline-offset-2 hover:underline"
            >
              {copy.about.brandIntlLabel}
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
