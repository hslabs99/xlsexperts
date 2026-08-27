import { NextResponse } from 'next/server'
import {
  deleteClientLogos,
  importClientLogoUrls,
  listClientLogos,
  saveClientLogoCandidate,
} from '@/lib/client-logos-db'
import { harvestClientLogo } from '@/lib/client-logos-harvest'
import { withTimeout } from '@/lib/with-timeout'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET() {
  try {
    const items = await withTimeout(listClientLogos(), 12_000, 'listClientLogos')
    return NextResponse.json({ ok: true, items })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to load logo list',
        items: [],
      },
      { status: 500 }
    )
  }
}

type PostBody = {
  action?: string
  text?: string
  id?: string
  ids?: string[]
  candidateIndex?: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as PostBody
    const action = String(body.action || '').trim()

    if (action === 'import') {
      const text = String(body.text || '')
      if (!text.trim()) {
        return NextResponse.json(
          { ok: false, error: 'Paste company name and URL pairs (two columns)' },
          { status: 400 }
        )
      }
      const result = await withTimeout(
        importClientLogoUrls(text),
        20_000,
        'importClientLogoUrls'
      )
      const items = await listClientLogos()
      return NextResponse.json({ ok: true, ...result, items })
    }

    if (action === 'harvest') {
      const id = String(body.id || '').trim()
      if (!id) {
        return NextResponse.json(
          { ok: false, error: 'Select a URL to harvest' },
          { status: 400 }
        )
      }
      const item = await harvestClientLogo(id)
      return NextResponse.json({ ok: true, item })
    }

    if (action === 'save') {
      const id = String(body.id || '').trim()
      const candidateIndex =
        typeof body.candidateIndex === 'number' ? body.candidateIndex : 0
      if (!id) {
        return NextResponse.json(
          { ok: false, error: 'Select a URL to save' },
          { status: 400 }
        )
      }
      const item = await withTimeout(
        saveClientLogoCandidate(id, candidateIndex),
        8_000,
        'saveClientLogoCandidate'
      )
      return NextResponse.json({ ok: true, item })
    }

    if (action === 'delete') {
      const ids = Array.isArray(body.ids)
        ? body.ids.map((id) => String(id))
        : []
      if (!ids.length) {
        return NextResponse.json(
          { ok: false, error: 'Select at least one URL to remove' },
          { status: 400 }
        )
      }
      const deleted = await withTimeout(
        deleteClientLogos(ids),
        12_000,
        'deleteClientLogos'
      )
      const items = await listClientLogos()
      return NextResponse.json({ ok: true, deleted, items })
    }

    return NextResponse.json(
      { ok: false, error: 'Unknown action' },
      { status: 400 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Logo harvest request failed'
    console.error('[client-logos]', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
