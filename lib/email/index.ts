/**
 * Public boundary for transactional email.
 * Import from `@/lib/email` in server code only.
 */

export { sendEmail } from '@/lib/email/sendgrid'
export {
  EmailError,
  EmailConfigError,
  EmailValidationError,
  EmailSendError,
  isEmailError,
  isEmailSendError,
} from '@/lib/email/errors'
export {
  getEmailConfigSnapshot,
  hintsForSendGridStatus,
} from '@/lib/email/diagnostics'
export type {
  SendEmailInput,
  SendEmailResult,
  SendEmailAttachment,
  EmailFailureKind,
} from '@/lib/email/types'
export type {
  EmailConfigSnapshot,
  EmailEnvVarStatus,
} from '@/lib/email/diagnostics'
