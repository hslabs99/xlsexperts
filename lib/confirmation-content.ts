/**
 * Editable thank-you / confirmation copy stored in Firestore.
 * Shown on `/thank-you` after a standard enquiry or discovery booking.
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
  /** Highlight panel heading */
  panelHeading: string
  panelBody: string
  whatHappensNextTitle: string
  whatHappensNext: ConfirmationStep[]
  /** Discovery booking variants */
  discoveryEyebrow: string
  discoveryHeading: string
  discoverySubheading: string
  discoveryPanelHeading: string
  discoveryPanelBody: string
  /** Reassurance block — keep them from shopping other consultants */
  reassureTitle: string
  reassureBody: string
}

export const DEFAULT_CONFIRMATION_CONTENT: ConfirmationContent = {
  eyebrow: "You're in good hands",
  heading: "Thank you — we've got this from here.",
  subheading:
    'Your enquiry is with Mike personally. We will review what you sent and be in touch the same business day with a clear next step — so you can relax and leave the spreadsheet problem with us.',
  panelHeading: 'Sit tight — we will contact you shortly.',
  panelBody:
    'Most clients hear from us within a few hours on a business day. We will confirm we understand the problem, outline the approach, and give you a fixed-price path forward.',
  whatHappensNextTitle: 'What happens next',
  whatHappensNext: [
    {
      n: '1',
      text: 'We review your enquiry carefully and reach out personally — usually same business day. No obligation, no hard sell.',
    },
    {
      n: '2',
      text: 'We clarify scope, then provide a clear fixed-price quote and realistic delivery timeframe so you know exactly where you stand.',
    },
    {
      n: '3',
      text: 'Once agreed, we build in stages, keep you updated, and hand over a solution your team can rely on — with support if you need it.',
    },
  ],
  discoveryEyebrow: 'Discovery call requested',
  discoveryHeading: 'Great — looking forward to speaking with you.',
  discoverySubheading:
    'Your preferred time is locked in on our side. Keep an eye on your inbox for confirmation details. Until then, there is nothing else you need to arrange — we will handle the next step.',
  discoveryPanelHeading: 'We will confirm your call shortly.',
  discoveryPanelBody:
    'Mike will be your point of contact from here. Come ready to walk through the spreadsheet or process — the discovery call is how we map the fastest path to a working solution.',
  reassureTitle: 'No need to look elsewhere',
  reassureBody:
    'You are already speaking with a New Zealand specialist in Excel, VBA, and enterprise spreadsheet systems. Stay with this conversation — we will respond promptly, quote clearly, and take ownership of getting your project over the line.',
}

function pickString(
  raw: unknown,
  fallback: string
): string {
  return typeof raw === 'string' && raw.trim() ? raw.trim() : fallback
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
    eyebrow: pickString(data.eyebrow, DEFAULT_CONFIRMATION_CONTENT.eyebrow),
    heading: pickString(data.heading, DEFAULT_CONFIRMATION_CONTENT.heading),
    subheading: pickString(
      data.subheading,
      DEFAULT_CONFIRMATION_CONTENT.subheading
    ),
    panelHeading: pickString(
      data.panelHeading,
      DEFAULT_CONFIRMATION_CONTENT.panelHeading
    ),
    panelBody: pickString(
      data.panelBody,
      DEFAULT_CONFIRMATION_CONTENT.panelBody
    ),
    whatHappensNextTitle: pickString(
      data.whatHappensNextTitle,
      DEFAULT_CONFIRMATION_CONTENT.whatHappensNextTitle
    ),
    whatHappensNext:
      whatHappensNext.length > 0
        ? whatHappensNext
        : DEFAULT_CONFIRMATION_CONTENT.whatHappensNext,
    discoveryEyebrow: pickString(
      data.discoveryEyebrow,
      DEFAULT_CONFIRMATION_CONTENT.discoveryEyebrow
    ),
    discoveryHeading: pickString(
      data.discoveryHeading,
      DEFAULT_CONFIRMATION_CONTENT.discoveryHeading
    ),
    discoverySubheading: pickString(
      data.discoverySubheading,
      DEFAULT_CONFIRMATION_CONTENT.discoverySubheading
    ),
    discoveryPanelHeading: pickString(
      data.discoveryPanelHeading,
      DEFAULT_CONFIRMATION_CONTENT.discoveryPanelHeading
    ),
    discoveryPanelBody: pickString(
      data.discoveryPanelBody,
      DEFAULT_CONFIRMATION_CONTENT.discoveryPanelBody
    ),
    reassureTitle: pickString(
      data.reassureTitle,
      DEFAULT_CONFIRMATION_CONTENT.reassureTitle
    ),
    reassureBody: pickString(
      data.reassureBody,
      DEFAULT_CONFIRMATION_CONTENT.reassureBody
    ),
  }
}

export type ThankYouLeadType = 'enquiry' | 'discovery'

export function resolveThankYouCopy(
  content: ConfirmationContent,
  type: ThankYouLeadType
): {
  eyebrow: string
  heading: string
  subheading: string
  panelHeading: string
  panelBody: string
  whatHappensNextTitle: string
  whatHappensNext: ConfirmationStep[]
  reassureTitle: string
  reassureBody: string
} {
  if (type === 'discovery') {
    return {
      eyebrow: content.discoveryEyebrow,
      heading: content.discoveryHeading,
      subheading: content.discoverySubheading,
      panelHeading: content.discoveryPanelHeading,
      panelBody: content.discoveryPanelBody,
      whatHappensNextTitle: content.whatHappensNextTitle,
      whatHappensNext: content.whatHappensNext,
      reassureTitle: content.reassureTitle,
      reassureBody: content.reassureBody,
    }
  }
  return {
    eyebrow: content.eyebrow,
    heading: content.heading,
    subheading: content.subheading,
    panelHeading: content.panelHeading,
    panelBody: content.panelBody,
    whatHappensNextTitle: content.whatHappensNextTitle,
    whatHappensNext: content.whatHappensNext,
    reassureTitle: content.reassureTitle,
    reassureBody: content.reassureBody,
  }
}
