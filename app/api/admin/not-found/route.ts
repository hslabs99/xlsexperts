import { NextResponse } from 'next/server'
import { fetchBlogPostRecordBySlug } from '@/lib/blog-db'
import { effectivePrimaryRegion } from '@/lib/blog-routing'
import {
  deleteRedirect,
  fetchRecentNotFoundLogs,
  getRedirectRows,
  saveRedirect,
} from '@/lib/blog-routing-db'
import { absoluteOnOrigin, originForMarket } from '@/lib/regions'
import { normalizePathname } from '@/lib/regions'

export const runtime = 'nodejs'

type Group = {
  host: string
  path: string
  humanHits: number
  botHits: number
  lastSeen: number
  referrers: { referrer: string; count: number }[]
  clicked: { slug: string; count: number }[]
  matchedSlugs: string[]
  topScore: number
}

function groupLogs(
  rows: Awaited<ReturnType<typeof fetchRecentNotFoundLogs>>
): Group[] {
  const map = new Map<string, Group & {
    referrerCounts: Map<string, number>
    clickCounts: Map<string, number>
  }>()
  for (const row of rows) {
    const key = `${row.host} ${row.path}`
    let group = map.get(key)
    if (!group) {
      group = {
        host: row.host,
        path: row.path,
        humanHits: 0,
        botHits: 0,
        lastSeen: 0,
        referrers: [],
        clicked: [],
        matchedSlugs: row.matchedSlugs,
        topScore: row.topScore,
        referrerCounts: new Map(),
        clickCounts: new Map(),
      }
      map.set(key, group)
    }
    if (row.isBot) group.botHits += 1
    else group.humanHits += 1
    if (row.at >= group.lastSeen) {
      group.lastSeen = row.at
      group.matchedSlugs = row.matchedSlugs
      group.topScore = row.topScore
    }
    if (row.referrer) {
      group.referrerCounts.set(
        row.referrer,
        (group.referrerCounts.get(row.referrer) ?? 0) + 1
      )
    }
    if (row.clickedSuggestion) {
      group.clickCounts.set(
        row.clickedSuggestion,
        (group.clickCounts.get(row.clickedSuggestion) ?? 0) + 1
      )
    }
  }
  return [...map.values()]
    .map((group) => ({
      host: group.host,
      path: group.path,
      humanHits: group.humanHits,
      botHits: group.botHits,
      lastSeen: group.lastSeen,
      matchedSlugs: group.matchedSlugs,
      topScore: group.topScore,
      referrers: [...group.referrerCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([referrer, count]) => ({ referrer, count })),
      clicked: [...group.clickCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([slug, count]) => ({ slug, count })),
    }))
    .sort((a, b) => b.lastSeen - a.lastSeen)
}

export async function GET() {
  try {
    const [logs, redirects] = await Promise.all([
      fetchRecentNotFoundLogs(),
      getRedirectRows(),
    ])
    return NextResponse.json({
      ok: true,
      groups: groupLogs(logs),
      redirects,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load 404s',
        groups: [],
        redirects: [],
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fromPath?: string
      toUrl?: string
      slug?: string
      source?: 'manual' | 'promoted'
    }
    const fromPath = normalizePathname(body.fromPath ?? '')
    let toUrl = body.toUrl?.trim() ?? ''
    if (!toUrl && body.slug) {
      const record = await fetchBlogPostRecordBySlug(body.slug)
      if (!record) {
        return NextResponse.json(
          { ok: false, error: 'That article does not exist.' },
          { status: 400 }
        )
      }
      const market = effectivePrimaryRegion(record) ?? 'nz'
      toUrl = absoluteOnOrigin(originForMarket(market), `/blog/${record.slug}`)
    }
    const saved = await saveRedirect({
      fromPath,
      toUrl,
      source: body.source === 'manual' ? 'manual' : 'promoted',
    })
    return NextResponse.json({ ok: true, redirect: saved })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to save redirect',
      },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const fromPath = new URL(request.url).searchParams.get('fromPath') ?? ''
    await deleteRedirect(fromPath)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to delete redirect',
      },
      { status: 400 }
    )
  }
}
