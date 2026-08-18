/**
 * Built-in visual treatments for AI blog hero images.
 * Client-safe — used by the admin picker and the image API.
 */

export const BLOG_AI_IMAGE_STYLES = [
  {
    id: 'infographic',
    label: 'Infographic',
    description:
      'Clean diagram, process steps, or data visual — graphic, not a photo.',
    prompt: `Visual treatment: infographic / diagram.
Flat or lightly isometric graphic design. Simple process steps, systems motifs, geometric shapes, or a restrained chart-like composition.
Not a photograph and not a painted illustration. No photorealistic people.
Soft forest-green (#1a6b3c) accents and light neutrals. Limited detail so the file stays small after compression.`,
  },
  {
    id: 'photo-office',
    label: 'Photo — office',
    description:
      'Realistic workplace: desk, laptop, screens — contemporary office, not a diagram.',
    prompt: `Visual treatment: photorealistic office photograph.
Natural light in a contemporary professional office. Desk with a laptop or monitor showing a spreadsheet-like grid that is not readable. Supporting detail: documents, coffee, plants — not a posed stock-photo handshake.
Do not render this as an infographic, isometric diagram, or flat vector graphic.
Wide landscape crop suitable for a website blog hero.`,
  },
  {
    id: 'photo-collaboration',
    label: 'Photo — collaboration',
    description:
      'People working together around a laptop or whiteboard in an office.',
    prompt: `Visual treatment: photorealistic candid of colleagues collaborating.
Two or three professionals around a laptop, printouts, or whiteboard in a modern office. Natural expressions, not looking at camera. Diverse ages. Faces may be visible but this is not a close-up portrait.
Do not render this as an infographic, isometric diagram, or flat vector graphic.
Wide landscape crop suitable for a website blog hero.`,
  },
  {
    id: 'photo-factory',
    label: 'Photo — factory',
    description:
      'Manufacturing plant, production line, or workshop — industrial, not an office.',
    prompt: `Visual treatment: photorealistic manufacturing / factory photograph.
A contemporary factory, production line, or light-industrial workshop. Machinery, workbenches, safety gear, or assembled parts in natural or industrial lighting. People may be present at work, not posing for camera.
Do not render this as an infographic, isometric diagram, or flat vector graphic.
No readable text, logos, or brand names on machines, PPE, or signage.
Wide landscape crop suitable for a website blog hero.`,
  },
  {
    id: 'photo-construction',
    label: 'Photo — construction',
    description:
      'Building site, plant, or civil works — hi-vis and structure, not a desk.',
    prompt: `Visual treatment: photorealistic construction-site photograph.
A real building site, plant upgrade, or civil works setting. Scaffolding, steel, concrete, hi-vis, plans or a tablet in someone's hands. Candid working atmosphere, not a posed stock-photo handshake.
Do not render this as an infographic, isometric diagram, or flat vector graphic.
No readable text, logos, or brand names on signage, vehicles, or drawings.
Wide landscape crop suitable for a website blog hero.`,
  },
  {
    id: 'editorial',
    label: 'Editorial illustration',
    description:
      'Magazine-style illustrated scene — atmospheric, not a process diagram.',
    prompt: `Visual treatment: editorial illustration (magazine / thought-leadership).
Painted or digital-illustrated scene suggesting business systems, spreadsheets, or decision-making. Atmospheric and human-scale.
Not a process infographic, not a flat icon collage, and not a photograph.
Soft forest-green accents and warm neutrals. Wide landscape crop.`,
  },
] as const

export type BlogAiImageStyleId = (typeof BLOG_AI_IMAGE_STYLES)[number]['id']

export function isBlogAiImageStyleId(
  value: unknown
): value is BlogAiImageStyleId {
  return (
    typeof value === 'string' &&
    BLOG_AI_IMAGE_STYLES.some((style) => style.id === value)
  )
}

export function blogAiImageStylePrompt(id: unknown): string {
  if (!isBlogAiImageStyleId(id)) return ''
  const style = BLOG_AI_IMAGE_STYLES.find((item) => item.id === id)
  return style?.prompt ?? ''
}

export const BLOG_AI_IMAGE_SHARED_CONSTRAINTS = `This is a small website blog hero / card image for XLS Experts New Zealand — not print, not a billboard.
No readable text, numbers, logos, watermarks, or brand names on screens, paper, or signage.`
