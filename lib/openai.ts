import 'server-only'
import OpenAI from 'openai'

const OPENAI_KEY_HINT =
  'OPENAI_API_KEY is not configured. Add it to .env.local for local dev. On Firebase App Hosting, set it under Backend → Settings → Environment (or as a Secret in apphosting.yaml), then create a new rollout — console env changes only apply after the next deploy.'

/**
 * Read the OpenAI API key at call time (not module load).
 * Uses bracket access so Next.js does not bake a build-time `undefined`
 * into the server bundle when the var is only present at App Hosting runtime.
 */
export function getOpenAIApiKey(): string | null {
  const key = String(process.env['OPENAI_API_KEY'] ?? '').trim()
  if (!key) return null
  return key
}

export function openaiKeyMissingMessage(): string {
  return OPENAI_KEY_HINT
}

export function requireOpenAIClient(): OpenAI {
  const apiKey = getOpenAIApiKey()
  if (!apiKey) {
    throw new Error(OPENAI_KEY_HINT)
  }
  return new OpenAI({ apiKey })
}
