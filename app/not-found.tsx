import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { Navbar } from '@/components/navbar'
import { NotFoundSuggestions } from '@/components/not-found-suggestions'
import {
  contextFromHeaderBag,
  loadNotFoundRecovery,
} from '@/lib/blog-incoming'
import { isSearchBot } from '@/lib/blog-routing'
import { recordNotFoundHit } from '@/lib/blog-routing-db'
import { getMarketCopy } from '@/lib/market-server'
import { marketHasPublicTelephone } from '@/lib/regions'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function NotFound() {
  const h = await headers()
  if (h.get('x-xls-missing') !== '1') {
    return (
      <>
        <Navbar />
        <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-6 py-24">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1a6b3c]">
            404
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            This page does not exist
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            The address may be out of date. Try the homepage, or browse services,
            solutions and industries.
          </p>
        </main>
      </>
    )
  }

  const path = h.get('x-xls-path') || '/'
  const host = (h.get('x-forwarded-host') || h.get('host') || '')
    .split(',')[0]
    ?.trim()
    .split(':')[0]
  const referrer = h.get('referer') || ''
  const userAgent = h.get('user-agent') || ''
  const ctx = contextFromHeaderBag(h, path)

  let recovery = {
    keywords: '',
    matches: [] as Awaited<ReturnType<typeof loadNotFoundRecovery>>['matches'],
    service: null as Awaited<ReturnType<typeof loadNotFoundRecovery>>['service'],
    top: [] as Awaited<ReturnType<typeof loadNotFoundRecovery>>['top'],
    serviceCategories: [] as Awaited<
      ReturnType<typeof loadNotFoundRecovery>
    >['serviceCategories'],
  }
  try {
    recovery = await loadNotFoundRecovery(ctx)
  } catch (error) {
    console.error('404 recovery failed', error)
  }

  let logId: string | null = null
  if (path !== '/') {
    try {
      logId = await recordNotFoundHit({
        host: host || '',
        path,
        referrer,
        userAgent,
        isBot: isSearchBot(userAgent),
        matchedSlugs: recovery.matches.map((item) => item.post.slug),
        topScore: recovery.matches[0]?.score ?? 0,
      })
    } catch (error) {
      console.error('404 log failed', error)
    }
  }

  let showPhone = false
  let phoneTel = ''
  let phoneDisplay = ''
  try {
    const copy = await getMarketCopy()
    showPhone = Boolean(
      marketHasPublicTelephone(ctx.market) && copy.contact.phoneTel
    )
    phoneTel = copy.contact.phoneTel
    phoneDisplay = copy.contact.phoneDisplay
  } catch {
    showPhone = false
  }
  const hasMatches = recovery.matches.length > 0
  const articles = hasMatches
    ? recovery.matches.map((item) => ({
        href: item.href,
        title: item.post.title,
        excerpt: item.post.excerpt,
        slug: item.post.slug,
      }))
    : recovery.top.map((item) => ({
        href: item.href,
        title: item.post.title,
        excerpt: item.post.excerpt,
        slug: item.post.slug,
      }))

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[60vh] max-w-3xl px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-[#1a6b3c]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
          {hasMatches
            ? "That page has moved. Here's what we think you were after."
            : "That page isn't here. Here are places to start."}
        </h1>

        {hasMatches ? (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-gray-900">Looking for this?</h2>
            <NotFoundSuggestions logId={logId} items={articles} />
          </section>
        ) : articles.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-gray-900">Recent articles</h2>
            <NotFoundSuggestions logId={logId} items={articles} />
          </section>
        ) : null}

        {recovery.service ? (
          <section className="mt-8 rounded-lg border border-gray-200 bg-[#e8f5ee] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1a6b3c]">
              Related service
            </p>
            <h2 className="mt-2 text-xl font-bold text-gray-900">
              <Link href={recovery.service.href} className="hover:underline">
                {recovery.service.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {recovery.service.blurb}
            </p>
          </section>
        ) : (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-gray-900">Services</h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-[#1a6b3c]">
              {recovery.serviceCategories.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="underline-offset-2 hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <form action="/blog" method="get" className="mt-8">
          <label htmlFor="not-found-search" className="text-sm font-semibold text-gray-900">
            Search the blog
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="not-found-search"
              name="q"
              defaultValue={recovery.keywords}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: '#1a6b3c' }}
            >
              Search
            </button>
          </div>
        </form>

        <section className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-900">Talk to an Excel expert</h2>
          <p className="mt-2 text-sm text-gray-600">
            If you were looking for a service or an old article, send an enquiry and we will point you to the right page.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-[#1a6b3c]">
            <Link href="/#contact" className="underline-offset-2 hover:underline">
              Contact form
            </Link>
            {showPhone ? (
              <a
                href={`tel:${phoneTel}`}
                className="underline-offset-2 hover:underline"
              >
                {phoneDisplay}
              </a>
            ) : null}
          </div>
        </section>
      </main>
    </>
  )
}
