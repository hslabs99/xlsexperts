import type { EmailFailureKind } from '@/lib/email/types'

export type SendGridErrorItem = {
  message?: string
  field?: string
  help?: string
}

/**
 * Typed errors so callers can distinguish configuration, validation,
 * and SendGrid submission failures without inspecting raw API payloads.
 */
export class EmailError extends Error {
  readonly kind: EmailFailureKind
  readonly statusCode?: number
  /** Sanitized SendGrid error payload (no API key). */
  readonly sendGridErrors?: SendGridErrorItem[]
  readonly sendGridBody?: unknown

  constructor(
    kind: EmailFailureKind,
    message: string,
    statusCode?: number,
    extras?: { sendGridErrors?: SendGridErrorItem[]; sendGridBody?: unknown }
  ) {
    super(message)
    this.name = 'EmailError'
    this.kind = kind
    this.statusCode = statusCode
    this.sendGridErrors = extras?.sendGridErrors
    this.sendGridBody = extras?.sendGridBody
  }
}

export class EmailConfigError extends EmailError {
  constructor(message: string) {
    super('configuration', message)
    this.name = 'EmailConfigError'
  }
}

export class EmailValidationError extends EmailError {
  constructor(message: string) {
    super('validation', message)
    this.name = 'EmailValidationError'
  }
}

export class EmailSendError extends EmailError {
  constructor(
    message: string,
    statusCode?: number,
    extras?: { sendGridErrors?: SendGridErrorItem[]; sendGridBody?: unknown }
  ) {
    super('sendgrid', message, statusCode, extras)
    this.name = 'EmailSendError'
  }
}

export function isEmailError(error: unknown): error is EmailError {
  return error instanceof EmailError
}

export function isEmailSendError(error: unknown): error is EmailSendError {
  return error instanceof EmailSendError
}
