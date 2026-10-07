import { NextResponse, type NextRequest } from 'next/server'
import {
  DEFAULT_MARKET,
  MARKET_COOKIE,
  MARKET_HEADER,
  isIntlProductionHost,
  isLocalHost,
  isNzProductionHost,
  isUkProductionHost,
  marketFromHost,
  parseMarketId,
  stripLocalMarketPrefix,
  type MarketId,
} from '@/lib/market'
import { shouldConsultRouting, shouldRewriteMissing } from '@/lib/blog-routing'
import { APEX_TO_WWW } from '@/lib/regions'
import { hostnameOnly } from '@/lib/domain-regions'

function applyMarketHeaders(
  response: NextResponse,
  market: MarketId
): NextResponse {
  response.headers.set(MARKET_HEADER, market)
  response.cookies.set(MARKET_COOKIE, market, {
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}

function apexWwwRedirect(request: NextRequest): NextResponse | null {
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    ''
  if (isLocalHost(host)) return null
  const hostname = hostnameOnly(host)
  const wwwHost = APEX_TO_WWW[hostname]
  if (!wwwHost) return null
  const url = request.nextUrl.clone()
  url.host = wwwHost
  url.protocol = 'https:'
  return NextResponse.redirect(url, 301)
}

function goneResponse(): NextResponse {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<title>Page removed | XLS Experts</title>
</head>
<body>
<main>
<h1>This page has been removed</h1>
<p><a href="/blog">Browse the blog</a></p>
</main>
</body>
</html>`
  return new NextResponse(html, {
    status: 410,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'private, no-store',
    },
  })
}

export async function proxy(request: NextRequest) {
  const apexRedirect = apexWwwRedirect(request)
  if (apexRedirect) return apexRedirect

  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    ''
  const { pathname } = request.nextUrl
  const local = isLocalHost(host)
  const stripped = local ? stripLocalMarketPrefix(pathname) : null
  const logicalPath = stripped?.pathname ?? pathname

  let market: MarketId = DEFAULT_MARKET
  if (local) {
    market =
      stripped?.market ??
      parseMarketId(request.cookies.get(MARKET_COOKIE)?.value) ??
      DEFAULT_MARKET
  } else {
    market = marketFromHost(host)
  }

  const production =
    !local &&
    (isNzProductionHost(host) ||
      isUkProductionHost(host) ||
      isIntlProductionHost(host))

  let markMissing = false

  if (shouldConsultRouting(logicalPath)) {
    try {
      const { resolveIncomingPath } = await import('@/lib/blog-incoming')
      const decision = await resolveIncomingPath({
        path: logicalPath,
        market,
        local,
        production,
        requestOrigin: request.nextUrl.origin,
      })
      if (decision.type === 'redirect') {
        return NextResponse.redirect(decision.url, 301)
      }
      if (decision.type === 'gone') return goneResponse()
      markMissing = decision.missing
      if (markMissing && shouldRewriteMissing(logicalPath)) {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set(MARKET_HEADER, market)
        requestHeaders.set('x-xls-path', logicalPath)
        requestHeaders.set('x-xls-missing', '1')
        const url = request.nextUrl.clone()
        url.pathname = '/site-missing'
        const response = NextResponse.rewrite(url, {
          request: { headers: requestHeaders },
        })
        response.headers.set('Cache-Control', 'private, no-store')
        response.headers.set('Vary', 'Cookie, Host')
        return applyMarketHeaders(response, market)
      }
    } catch (error) {
      console.error('Blog routing skipped', error)
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(MARKET_HEADER, market)
  requestHeaders.set('x-xls-path', logicalPath)
  if (markMissing) requestHeaders.set('x-xls-missing', '1')

  if (local && stripped) {
    const url = request.nextUrl.clone()
    url.pathname = stripped.pathname
    const response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    })
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Vary', 'Cookie, Host')
    return applyMarketHeaders(response, market)
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Vary', 'Cookie, Host')
  return applyMarketHeaders(response, market)
}

export const config = {
  matcher: [
    /*
     * Match all paths except API routes, static assets, and Next internals.
     * API routes must not pass through proxy: in next dev that was returning
     * the HTML 404 page for /api/admin/login.
     * Include robots.txt / sitemap.xml / llms.txt so market is resolved
     * from the arrival host for separate SEO properties.
     */
    '/((?!api(?:/|$)|_next/static|_next/image|favicon.ico|favicon-32x32.png|icon.svg|icon-32.png|icon-48.png|icon-192.png|apple-icon.png|images/).*)',
  ],
}
