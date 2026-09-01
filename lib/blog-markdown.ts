import type { BlogSection } from '@/lib/types'

/**
 * Convert markdown blog body into structured BlogSection[] used by the CMS.
 * Supports: paragraphs, ## / ### headings, -/* numbered lists, and a simple
 * FAQ pattern (## FAQ followed by ### questions).
 */
export function markdownToBlogSections(markdown: string): BlogSection[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const sections: BlogSection[] = []
  let introUsed = false
  let inFaq = false
  let listItems: string[] = []
  let faqBuffer: { q: string; a: string }[] = []
  let pendingFaqQ: string | null = null
  let pendingFaqA: string[] = []

  function flushList() {
    if (listItems.length === 0) return
    sections.push({ type: 'ul', items: [...listItems] })
    listItems = []
  }

  function flushFaqAnswer() {
    if (!pendingFaqQ) {
      pendingFaqA = []
      return
    }
    const a = pendingFaqA.join('\n\n').trim()
    faqBuffer.push({ q: pendingFaqQ, a: a || '' })
    pendingFaqQ = null
    pendingFaqA = []
  }

  function flushFaq() {
    flushFaqAnswer()
    if (faqBuffer.length > 0) {
      sections.push({ type: 'faq', faqs: [...faqBuffer] })
      faqBuffer = []
    }
    inFaq = false
  }

  function pushParagraph(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    if (inFaq) {
      if (pendingFaqQ) pendingFaqA.push(trimmed)
      return
    }
    if (!introUsed && sections.length === 0) {
      sections.push({ type: 'intro', text: trimmed })
      introUsed = true
    } else {
      sections.push({ type: 'p', text: trimmed })
    }
  }

  let paragraph: string[] = []

  function flushParagraph() {
    if (paragraph.length === 0) return
    pushParagraph(paragraph.join(' '))
    paragraph = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      flushParagraph()
      continue
    }

    const h2 = /^##\s+(.+)$/.exec(trimmed)
    if (h2) {
      flushList()
      flushParagraph()
      const heading = h2[1].trim()
      if (/^faq$/i.test(heading)) {
        flushFaq()
        inFaq = true
      } else {
        if (inFaq) flushFaq()
        sections.push({ type: 'h2', heading })
      }
      continue
    }

    const h3 = /^###\s+(.+)$/.exec(trimmed)
    if (h3) {
      flushList()
      flushParagraph()
      const heading = h3[1].trim()
      if (inFaq) {
        flushFaqAnswer()
        pendingFaqQ = heading
      } else {
        sections.push({ type: 'h3', heading })
      }
      continue
    }

    // Ignore top-level # title — metadata already has title
    if (/^#\s+/.test(trimmed)) {
      flushList()
      flushParagraph()
      continue
    }

    const listItem = /^[-*+]\s+(.+)$/.exec(trimmed)
    const numbered = /^\d+[.)]\s+(.+)$/.exec(trimmed)
    if (listItem || numbered) {
      flushParagraph()
      if (inFaq && pendingFaqQ) {
        // Keep FAQ answers as prose; fold list lines into the answer
        pendingFaqA.push(`• ${(listItem || numbered)![1].trim()}`)
      } else {
        listItems.push((listItem || numbered)![1].trim())
      }
      continue
    }

    flushList()
    paragraph.push(trimmed)
  }

  flushList()
  flushParagraph()
  if (inFaq) flushFaq()

  return sections.length > 0 ? sections : [{ type: 'p', text: '' }]
}

export function estimateReadTimeFromSections(sections: BlogSection[]): string {
  let words = 0
  for (const s of sections) {
    if (s.text) words += s.text.split(/\s+/).filter(Boolean).length
    if (s.heading) words += s.heading.split(/\s+/).filter(Boolean).length
    if (s.items) {
      for (const item of s.items) {
        words += item.split(/\s+/).filter(Boolean).length
      }
    }
    if (s.faqs) {
      for (const faq of s.faqs) {
        words += faq.q.split(/\s+/).filter(Boolean).length
        words += faq.a.split(/\s+/).filter(Boolean).length
      }
    }
  }
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

export function slugifyBlogTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Inverse of markdownToBlogSections — used to seed AI Assist from an existing post. */
export function blogSectionsToMarkdown(sections: BlogSection[]): string {
  const parts: string[] = []
  for (const s of sections) {
    switch (s.type) {
      case 'intro':
      case 'p': {
        const text = s.text?.trim()
        if (text) parts.push(text)
        break
      }
      case 'h2': {
        const heading = s.heading?.trim()
        const text = s.text?.trim()
        if (heading) parts.push(`## ${heading}`)
        if (text) parts.push(text)
        break
      }
      case 'h3': {
        const heading = s.heading?.trim()
        const text = s.text?.trim()
        if (heading) parts.push(`### ${heading}`)
        if (text) parts.push(text)
        break
      }
      case 'ul': {
        const items = (s.items ?? []).map((item) => item.trim()).filter(Boolean)
        if (items.length > 0) {
          parts.push(items.map((item) => `- ${item}`).join('\n'))
        }
        break
      }
      case 'faq': {
        const faqs = s.faqs ?? []
        if (faqs.length > 0) {
          const faqParts = ['## FAQ']
          for (const faq of faqs) {
            const q = faq.q.trim()
            const a = faq.a.trim()
            if (q) faqParts.push(`### ${q}`)
            if (a) faqParts.push(a)
          }
          parts.push(faqParts.join('\n\n'))
        }
        break
      }
    }
  }
  return parts.join('\n\n').trim()
}
