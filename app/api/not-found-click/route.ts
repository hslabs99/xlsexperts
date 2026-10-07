import { NextResponse } from 'next/server'
import { markNotFoundClick } from '@/lib/blog-routing-db'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; slug?: string }
    const id = body.id?.trim() ?? ''
    const slug = body.slug?.trim() ?? ''
    if (!id || !slug) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    await markNotFoundClick(id, slug)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
