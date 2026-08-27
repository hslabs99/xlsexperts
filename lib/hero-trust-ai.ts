import 'server-only'

import { requireOpenAIClient } from '@/lib/openai'
import { uploadSiteImageAdmin } from '@/lib/storage-admin'
import { slugifyHeroId } from '@/lib/hero-trust'

function openaiErrorText(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return error instanceof Error ? error.message : String(error)
  }
  const record = error as {
    message?: string
    error?: { message?: string; code?: string }
    code?: string
  }
  const nested = record.error?.message?.trim()
  if (nested) {
    const code = record.error?.code || record.code
    return code ? `${nested} (${code})` : nested
  }
  return error instanceof Error ? error.message : String(error)
}

type GeneratedImage = {
  buffer: Buffer
  mimeType: 'image/webp' | 'image/png'
}

async function generateSquareMark(prompt: string): Promise<GeneratedImage> {
  const openai = requireOpenAIClient()
  const compact = prompt.slice(0, 1200)
  const errors: string[] = []

  try {
    const result = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      quality: 'low',
      output_format: 'webp',
      output_compression: 70,
    })
    const b64 = result.data?.[0]?.b64_json
    if (!b64) throw new Error('OpenAI gpt-image-1 returned no image data')
    return { buffer: Buffer.from(b64, 'base64'), mimeType: 'image/webp' }
  } catch (primaryError) {
    errors.push(`gpt-image-1: ${openaiErrorText(primaryError)}`)
    try {
      const retry = await openai.images.generate({
        model: 'gpt-image-1',
        prompt: compact,
        size: '1024x1024',
        quality: 'low',
        output_format: 'webp',
        output_compression: 70,
      })
      const b64 = retry.data?.[0]?.b64_json
      if (!b64) throw new Error('OpenAI gpt-image-1 compact returned no image data')
      return { buffer: Buffer.from(b64, 'base64'), mimeType: 'image/webp' }
    } catch (compactError) {
      errors.push(`gpt-image-1 compact: ${openaiErrorText(compactError)}`)
      try {
        const fallback = await openai.images.generate({
          model: 'dall-e-3',
          prompt: compact.slice(0, 3800),
          size: '1024x1024',
          quality: 'standard',
          response_format: 'b64_json',
          n: 1,
        })
        const b64 = fallback.data?.[0]?.b64_json
        if (!b64) throw new Error('OpenAI dall-e-3 returned no image data')
        return { buffer: Buffer.from(b64, 'base64'), mimeType: 'image/png' }
      } catch (dalleError) {
        errors.push(`dall-e-3: ${openaiErrorText(dalleError)}`)
        throw new Error(`Image generation failed. ${errors.join(' | ')}`)
      }
    }
  }
}

export async function generateHeroClientLogo(input: {
  name: string
  abbr: string
  color: string
}): Promise<string> {
  const name = input.name.trim()
  const abbr = input.abbr.trim().slice(0, 4) || 'XX'
  const color = /^#[0-9a-fA-F]{6}$/.test(input.color) ? input.color : '#1a6b3c'
  if (!name) throw new Error('Client name is required')

  const prompt = [
    'Original square brand-mark monogram, not a copy of any real company logo.',
    `Letters to show exactly: "${abbr}".`,
    `Solid rounded-square background fill ${color}, initials in white.`,
    'Flat vector geometric app-icon, generous padding, no 3D, no photorealism,',
    'no textures, no extra symbols, no full company name spelled in the image,',
    'no trademarked logos.',
    `Company name is for context only and must not appear: ${name}.`,
  ].join(' ')

  const image = await generateSquareMark(prompt)
  const slug = slugifyHeroId(name)
  return uploadSiteImageAdmin(
    'hero-clients',
    slug,
    image.buffer,
    `logo-${Date.now()}.${image.mimeType === 'image/png' ? 'png' : 'webp'}`,
    image.mimeType
  )
}

export async function generateHeroProjectIcon(input: {
  label: string
}): Promise<string> {
  const label = input.label.trim()
  if (!label) throw new Error('Project label is required')

  const prompt = [
    `Simple flat UI glyph icon representing: ${label}.`,
    'Single-colour forest green #1a6b3c on a white rounded square.',
    'Lucide / feather-icon style, 2px strokes, centred, generous padding.',
    'No text, no photorealism, no shadows, no 3D, no logos.',
  ].join(' ')

  const image = await generateSquareMark(prompt)
  const slug = slugifyHeroId(label)
  return uploadSiteImageAdmin(
    'hero-projects',
    slug,
    image.buffer,
    `icon-${Date.now()}.${image.mimeType === 'image/png' ? 'png' : 'webp'}`,
    image.mimeType
  )
}
