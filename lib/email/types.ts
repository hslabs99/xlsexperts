/**
 * Shared email types for the server-side SendGrid service.
 * Kept separate so this boundary can be extracted for reuse later.
 */

export type SendEmailAttachment = {
  content: string
  filename: string
  type?: string
  disposition?: 'attachment' | 'inline'
  contentId?: string
}

export type SendEmailInput = {
  to: string | string[]
  subject: string
  text: string
  html?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: SendEmailAttachment[]
  /** Stable SendGrid category (not unique per message). */
  category?: string
  /** Internal non-PII reference; sent as custom arg `reference_id`. */
  referenceId?: string
  /**
   * Extra SendGrid custom_args (string values only).
   * Merged with reference_id when both are set.
   */
  customArgs?: Record<string, string>
  /** Enable open + click tracking. Off unless set — campaign mailings only. */
  tracking?: {
    open?: boolean
    click?: boolean
  }
}

/**
 * Outcome when SendGrid accepts the request.
 * "Accepted" means SendGrid queued the message — not that it was delivered.
 */
export type SendEmailResult = {
  accepted: boolean
  statusCode?: number
  messageId?: string
}

export type EmailFailureKind = 'configuration' | 'validation' | 'sendgrid'
