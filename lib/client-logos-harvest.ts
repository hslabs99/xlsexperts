/**
 * Fetch a client homepage, rank likely logo images, download and store
 * PNG thumbnails. Server only.
 */

import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import { getClientLogo, updateClientLogo } from '@/lib/client-logos-db'
import { uploadClientLogoAdmin } from '@/lib/client-logos-storage-admin'
import type {
  ClientLogoRecord,
  LogoCandidate,
  LogoCandidateSource,
} from '@/lib/client-logos'

const FETCH_TIMEOUT_MS = 20_000
const IMAGE_TIMEOUT_MS = 15_000
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const MAX_CANDIDATES = 5
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (XLSExpertsLogoHarvest/1.0; +https://www.xlsexperts.co.nz)'

type RankedHit = {
  sourceUrl: string
  source: LogoCandidateSource
  score: number
  index: number
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n)
      return Number.isFinite(code) ? String.fromCodePoint(code) : ''
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      const code = Number.parseInt(h, 16)
      return Number.isFinite(code) ? String.fromCodePoint(code) : ''
    })
}

function attrMap(tagAttrs: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re =
    /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(tagAttrs))) {
    const key = m[1].toLowerCase()
    const value = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '')
    out[key] = value
  }
  return out
}

function resolveUrl(base: string, href: string): string | null {
  const trimmed = decodeEntities(href).trim()
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('javascript:')) {
    return null
  }
  try {
    const url = new URL(trimmed, base)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    url.hash = ''
    return url.href
  } catch {
    return null
  }
}

function pickSrcsetUrl(srcset: string, base: string): string | null {
  const parts = srcset
    .split(',')
    .map((p) => p.trim().split(/\s+/)[0])
    .filter(Boolean)
  const last = parts[parts.length - 1]
  return last ? resolveUrl(base, last) : null
}

function metaContent(html: string, property: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    'i'
  )
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
    'i'
  )
  const m = html.match(re) || html.match(re2)
  return m?.[1] ? decodeEntities(m[1]) : ''
}

function pageTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (!m?.[1]) return ''
  return decodeEntities(m[1].replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim()
}

function guessDisplayName(html: string, host: string): string {
  const siteName = metaContent(html, 'og:site_name').trim()
  if (siteName) return siteName.slice(0, 120)
  const title = pageTitle(html)
  if (title) {
    const cut = title.split(/\s[|\-–—]\s/)[0]?.trim()
    if (cut) return cut.slice(0, 120)
  }
  return host
}

function jsonLdLogoUrls(html: string, base: string): string[] {
  const urls: string[] = []
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    try {
      walkJsonLd(JSON.parse(m[1]), urls)
    } catch {
      // ignore broken JSON-LD
    }
  }
  return urls
    .map((href) => resolveUrl(base, href))
    .filter((href): href is string => Boolean(href))
}

function walkJsonLd(node: unknown, urls: string[]): void {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const item of node) walkJsonLd(item, urls)
    return
  }
  const obj = node as Record<string, unknown>
  if (typeof obj.logo === 'string') urls.push(obj.logo)
  else if (obj.logo && typeof obj.logo === 'object') {
    const logo = obj.logo as Record<string, unknown>
    if (typeof logo.url === 'string') urls.push(logo.url)
    if (typeof logo.contentUrl === 'string') urls.push(logo.contentUrl)
  }
  for (const value of Object.values(obj)) walkJsonLd(value, urls)
}

function scoreBlob(text: string): { score: number; source: LogoCandidateSource } {
  const t = text.toLowerCase()
  let score = 0
  if (/\blogo\b/.test(t) || t.includes('logo')) score += 50
  if (/\b(navbar|header|masthead|nav-brand|site-brand|branding)\b/.test(t)) {
    score += 20
  }
  if (/\b(footer|partner|sponsor|social|share)\b/.test(t)) score -= 25
  if (/\b(reversed|invert|white-logo|logo-white)\b/.test(t)) score -= 15
  if (t.includes('favicon')) score -= 20
  if (t.includes('apple-touch')) score -= 8

  let source: LogoCandidateSource = 'other'
  if (t.includes('logo')) source = 'img-logo'
  return { score, source }
}

function addHit(
  hits: RankedHit[],
  seen: Set<string>,
  sourceUrl: string | null,
  source: LogoCandidateSource,
  score: number
): void {
  if (!sourceUrl) return
  const key = sourceUrl.split('?')[0].toLowerCase()
  if (seen.has(key)) return
  seen.add(key)
  hits.push({ sourceUrl, source, score, index: hits.length })
}

export function rankLogoCandidates(html: string, pageUrl: string): RankedHit[] {
  const hits: RankedHit[] = []
  const seen = new Set<string>()
  const htmlLen = html.length || 1

  const imgRe = /<img\b([^>]*)>/gi
  let imgMatch: RegExpExecArray | null
  while ((imgMatch = imgRe.exec(html))) {
    const attrs = attrMap(imgMatch[1] || '')
    const src =
      pickSrcsetUrl(attrs.srcset || '', pageUrl) ||
      resolveUrl(pageUrl, attrs.src || attrs['data-src'] || '')
    if (!src) continue
    const blob = [attrs.class, attrs.id, attrs.alt, src].join(' ')
    const ranked = scoreBlob(blob)
    if (ranked.score < 20) continue
    const earlyBonus = imgMatch.index < htmlLen * 0.35 ? 8 : 0
    addHit(hits, seen, src, ranked.source, ranked.score + earlyBonus)
  }

  for (const href of jsonLdLogoUrls(html, pageUrl)) {
    addHit(hits, seen, href, 'json-ld', 55)
  }

  const og = resolveUrl(pageUrl, metaContent(html, 'og:image'))
  addHit(hits, seen, og, 'og-image', 18)
  const ogLogo = resolveUrl(pageUrl, metaContent(html, 'og:logo'))
  addHit(hits, seen, ogLogo, 'og-image', 40)

  const linkRe = /<link\b([^>]*)>/gi
  let linkMatch: RegExpExecArray | null
  while ((linkMatch = linkRe.exec(html))) {
    const attrs = attrMap(linkMatch[1] || '')
    const rel = (attrs.rel || '').toLowerCase()
    const href = resolveUrl(pageUrl, attrs.href || '')
    if (!href) continue
    if (rel.includes('apple-touch-icon')) {
      const size = parseInt(String(attrs.sizes || '0').split('x')[0], 10) || 0
      addHit(hits, seen, href, 'apple-touch', 8 + Math.min(size / 20, 10))
    } else if (rel.includes('icon')) {
      const size = parseInt(String(attrs.sizes || '0').split('x')[0], 10) || 0
      addHit(hits, seen, href, 'favicon', 4 + Math.min(size / 24, 8))
    }
  }

  hits.sort((a, b) => b.score - a.score || a.index - b.index)
  return hits.filter((h) => h.score > 0).slice(0, 12)
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms: number
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchHomepage(url: string): Promise<{
  ok: boolean
  status: number
  html: string
  finalUrl: string
  error?: string
}> {
  try {
    const res = await fetchWithTimeout(
      url,
      {
        redirect: 'follow',
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-NZ,en;q=0.9',
        },
      },
      FETCH_TIMEOUT_MS
    )
    const html = await res.text()
    const finalUrl = res.url || url
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        html,
        finalUrl,
        error: `HTTP ${res.status} fetching ${url}`,
      }
    }
    return { ok: true, status: res.status, html, finalUrl }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === 'AbortError'
          ? `Timed out fetching ${url}`
          : err.message
        : 'Fetch failed'
    return { ok: false, status: 0, html: '', finalUrl: url, error: message }
  }
}

async function downloadImage(
  imageUrl: string,
  referer: string
): Promise<{ buffer: Buffer; contentType: string } | { error: string }> {
  try {
    const res = await fetchWithTimeout(
      imageUrl,
      {
        redirect: 'follow',
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8',
          Referer: referer,
        },
      },
      IMAGE_TIMEOUT_MS
    )
    if (!res.ok) return { error: `HTTP ${res.status}` }
    const contentType = (res.headers.get('content-type') || '')
      .split(';')[0]
      .trim()
      .toLowerCase()
    if (contentType.includes('text/html')) {
      return { error: 'URL returned HTML, not an image' }
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    if (!buffer.byteLength) return { error: 'Empty image' }
    if (buffer.byteLength > MAX_IMAGE_BYTES) return { error: 'Image larger than 2 MB' }
    return { buffer, contentType: contentType || 'application/octet-stream' }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === 'AbortError'
          ? 'Timed out'
          : err.message
        : 'Download failed'
    return { error: message }
  }
}

async function normaliseLogoPng(
  raw: Buffer
): Promise<{ bytes: Buffer; width: number; height: number } | null> {
  try {
    const sharpMod = await import('sharp')
    const sharp = sharpMod.default
    let pipeline = sharp(raw, { density: 180, failOn: 'none' }).rotate()
    try {
      const trimmed = await pipeline.clone().trim({ threshold: 8 }).toBuffer()
      pipeline = sharp(trimmed)
    } catch {
      // Solid fills (or already tight crops) cannot trim — keep original.
    }
    const png = await pipeline
      .resize({
        width: 480,
        height: 160,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 8 })
      .toBuffer({ resolveWithObject: true })
    if (png.info.width < 16 || png.info.height < 16) return null
    return {
      bytes: png.data,
      width: png.info.width,
      height: png.info.height,
    }
  } catch {
    return null
  }
}

function homepageAttempts(url: string, host: string): string[] {
  const unique: string[] = []
  for (const candidate of [
    url,
    `https://www.${host}`,
    `https://${host}`,
  ]) {
    if (!unique.includes(candidate)) unique.push(candidate)
  }
  return unique
}

export async function harvestClientLogo(
  id: string
): Promise<ClientLogoRecord> {
  const row = await getClientLogo(id)
  if (!row) throw new Error('URL is not in the master list')

  let page: Awaited<ReturnType<typeof fetchHomepage>> | null = null
  for (const attempt of homepageAttempts(row.url, row.host)) {
    page = await fetchHomepage(attempt)
    if (page.ok) break
  }
  if (!page || !page.ok) {
    await updateClientLogo(id, {
      status: 'failed',
      lastError: page?.error || 'Could not fetch homepage',
      lastHttpStatus: page?.status ?? 0,
      lastHarvestedAt: FieldValue.serverTimestamp(),
      candidates: [],
      selectedCandidateIndex: 0,
    })
    const failed = await getClientLogo(id)
    if (!failed) throw new Error('Harvest failed and the row could not be reloaded')
    return failed
  }

  const ranked = rankLogoCandidates(page.html, page.finalUrl)
  const displayName = guessDisplayName(page.html, row.host)
  const candidates: LogoCandidate[] = []

  for (let i = 0; i < ranked.length; i += 1) {
    const hit = ranked[i]
    const downloaded = await downloadImage(hit.sourceUrl, page.finalUrl)
    if ('error' in downloaded) continue
    const normalised = await normaliseLogoPng(downloaded.buffer)
    if (!normalised) continue
    try {
      const storedUrl = await uploadClientLogoAdmin(
        row.host,
        normalised.bytes,
        `candidate-${candidates.length}.png`,
        'image/png'
      )
      candidates.push({
        source: hit.source,
        sourceUrl: hit.sourceUrl,
        score: hit.score,
        storedUrl,
        width: normalised.width,
        height: normalised.height,
      })
    } catch {
      continue
    }
    if (candidates.length >= MAX_CANDIDATES) break
  }

  if (!candidates.length) {
    await updateClientLogo(id, {
      displayName: row.displayName || displayName,
      status: 'failed',
      lastError: ranked.length
        ? 'Found logo URLs but none could be downloaded or processed'
        : 'No logo candidates found on the homepage',
      lastHttpStatus: page.status,
      lastHarvestedAt: FieldValue.serverTimestamp(),
      candidates: [],
      selectedCandidateIndex: 0,
    })
  } else {
    await updateClientLogo(id, {
      displayName: row.displayName || displayName,
      status: 'harvested',
      lastError: '',
      lastHttpStatus: page.status,
      lastHarvestedAt: FieldValue.serverTimestamp(),
      candidates,
      selectedCandidateIndex: 0,
    })
  }

  const updated = await getClientLogo(id)
  if (!updated) throw new Error('Harvest finished but the row could not be reloaded')
  return updated
}
