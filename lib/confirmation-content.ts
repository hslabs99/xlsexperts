/**
 * Editable confirmation / contact success copy stored in Firestore.
 */

export type ConfirmationStep = {
  n: string
  text: string
}

export type ConfirmationContent = {
  /** Eyebrow above the done heading, e.g. "Message received" */
  eyebrow: string
  heading: string
  subheading: string
  /** Green panel heading on the right */
  panelHeading: string
  panelBody: string
  whatHappensNextTitle: string
  whatHappensNext: ConfirmationStep[]
}

export const DEFAULT_CONFIRMATION_CONTENT: ConfirmationContent = {
  eyebrow: 'Message received',
  heading: 'Thanks — we will be in touch.',
  subheading:
    'We have received your enquiry and will get back to you same business day. Keep an eye on your inbox.',
  panelHeading: 'Thanks — we will be in touch shortly.',
  panelBody:
    'We typically respond same business day. Keep an eye on your inbox.',
  whatHappensNextTitle: 'What happens next',
  whatHappensNext: [
    {
      n: '1',
      text: 'We review your enquiry and reach out to discuss your requirements — no commitment needed.',
    },
    {
      n: '2',
      text: 'We provide a no-obligation quote and estimated delivery timeframe.',
    },
    {
      n: '3',
      text: 'Once agreed, we build in stages and keep you updated throughout.',
    },
  ],
}

export function normalizeConfirmationContent(
  raw: unknown
): ConfirmationContent {
  if (!raw || typeof raw !== 'object') return DEFAULT_CONFIRMATION_CONTENT
  const data = raw as Record<string, unknown>
  const stepsRaw = Array.isArray(data.whatHappensNext)
    ? data.whatHappensNext
    : DEFAULT_CONFIRMATION_CONTENT.whatHappensNext

  const whatHappensNext = stepsRaw
    .map((step, index) => {
      if (!step || typeof step !== 'object') return null
      const s = step as Record<string, unknown>
      const text = typeof s.text === 'string' ? s.text.trim() : ''
      if (!text) return null
      return {
        n: typeof s.n === 'string' && s.n.trim() ? s.n.trim() : String(index + 1),
        text,
      }
    })
    .filter((s): s is ConfirmationStep => Boolean(s))

  return {
    eyebrow:
      typeof data.eyebrow === 'string' && data.eyebrow.trim()
        ? data.eyebrow.trim()
        : DEFAULT_CONFIRMATION_CONTENT.eyebrow,
    heading:
      typeof data.heading === 'string' && data.heading.trim()
        ? data.heading.trim()
        : DEFAULT_CONFIRMATION_CONTENT.heading,
    subheading:
      typeof data.subheading === 'string' && data.subheading.trim()
        ? data.subheading.trim()
        : DEFAULT_CONFIRMATION_CONTENT.subheading,
    panelHeading:
      typeof data.panelHeading === 'string' && data.panelHeading.trim()
        ? data.panelHeading.trim()
        : DEFAULT_CONFIRMATION_CONTENT.panelHeading,
    panelBody:
      typeof data.panelBody === 'string' && data.panelBody.trim()
        ? data.panelBody.trim()
        : DEFAULT_CONFIRMATION_CONTENT.panelBody,
    whatHappensNextTitle:
      typeof data.whatHappensNextTitle === 'string' &&
      data.whatHappensNextTitle.trim()
        ? data.whatHappensNextTitle.trim()
        : DEFAULT_CONFIRMATION_CONTENT.whatHappensNextTitle,
    whatHappensNext:
      whatHappensNext.length > 0
        ? whatHappensNext
        : DEFAULT_CONFIRMATION_CONTENT.whatHappensNext,
  }
}
