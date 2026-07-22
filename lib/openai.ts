import 'server-only'
import OpenAI from 'openai'

export function getOpenAIApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim()
  if (!key) return null
  return key
}

export function requireOpenAIClient(): OpenAI {
  const apiKey = getOpenAIApiKey()
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not set. Add it to .env.local and App Hosting environment variables.'
    )
  }
  return new OpenAI({ apiKey })
}
