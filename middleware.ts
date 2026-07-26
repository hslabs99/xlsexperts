import { NextResponse, type NextRequest } from 'next/server'
import {
  DEFAULT_MARKET,
  MARKET_COOKIE,
  MARKET_HEADER,
  isLocalHost,
  marketFromHost,
  parseMarketId,
  stripLocalMarketPrefix,
  type MarketId,
} from '@/lib/market'

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

export function middleware(request: NextRequest) {
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    ''
  const { pathname } = request.nextUrl
  const local = isLocalHost(host)

  // Local: /nz or /usa sets the market cookie, then redirects to the real path
  // so normal links (/services, etc.) keep working under the same market.
  if (local) {
    const stripped = stripLocalMarketPrefix(pathname)
    if (stripped) {
      const url = request.nextUrl.clone()
      url.pathname = stripped.pathname
      return applyMarketHeaders(NextResponse.redirect(url), stripped.market)
    }
  }

  let market: MarketId = DEFAULT_MARKET

  if (local) {
    // Persist the last /nz or /usa choice for the rest of the local session.
    const fromCookie = parseMarketId(request.cookies.get(MARKET_COOKIE)?.value)
    market = fromCookie ?? DEFAULT_MARKET
  } else {
    // Production: only recognizable domains flip the dictionary; else NZ.
    market = marketFromHost(host)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(MARKET_HEADER, market)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  return applyMarketHeaders(response, market)
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and Next internals.
     * Include robots.txt / sitemap.xml / llms.txt so market is resolved
     * from the arrival host for separate SEO properties.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|images/).*)',
  ],
}
