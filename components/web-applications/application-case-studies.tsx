import { webAppCaseStudies } from '@/lib/web-applications-page'
import { MidCta, SectionHeading, SectionShell } from './shared'

export function ApplicationCaseStudies() {
  return (
    <SectionShell id="examples" alt>
      <SectionHeading center>Real application examples</SectionHeading>
      <p className="mx-auto mb-4 max-w-3xl text-center text-base leading-relaxed text-gray-600">
        The examples below illustrate the kinds of business web applications, customer-facing tools
        and hybrid Excel systems we design. Where project details are confidential or still being
        shaped, capabilities are described carefully as indicative rather than confirmed feature
        lists.
      </p>
      <p className="mx-auto mb-10 max-w-3xl text-center text-sm text-gray-500">
        Named public examples retain facts already published on the XLS Experts site.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        {webAppCaseStudies.map((study) => (
          <article
            key={study.id}
            id={study.id}
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#e8f5ee] px-3 py-1 text-xs font-semibold text-[#1a6b3c]">
                {study.category}
              </span>
              <span className="text-xs font-medium text-gray-400">{study.tags}</span>
              {study.illustrative && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                  Illustrative capabilities
                </span>
              )}
            </div>
            <h3 className="font-display mb-4 text-lg font-bold text-gray-900">{study.title}</h3>
            <dl className="space-y-3 text-sm leading-relaxed text-gray-600">
              <div>
                <dt className="font-semibold text-gray-900">Situation</dt>
                <dd>{study.situation}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Operational problem</dt>
                <dd>{study.problem}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Application approach</dt>
                <dd>{study.approach}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Typical users</dt>
                <dd>{study.users}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Value of a shared central system</dt>
                <dd>{study.value}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Excel’s role</dt>
                <dd>{study.excelRole}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <MidCta
        title="Have a similar application in mind? Discuss it with us."
        body="Bring your idea, screenshots, spreadsheet, process notes or current frustrations—we will help identify a practical next step."
        primary={{ label: 'Have a Similar Project?', href: '#consultation' }}
        secondary={{ label: 'Talk Through Your Current Process', href: '#consultation' }}
      />
    </SectionShell>
  )
}
