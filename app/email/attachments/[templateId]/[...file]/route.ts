import { serveEmailTemplatePdf } from '@/lib/guides/whitepaper-file'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export async function GET(
  request: Request,
  context: { params: Promise<{ templateId: string; file: string[] }> }
) {
  const { templateId, file } = await context.params
  const filename = (file ?? []).join('/')
  return serveEmailTemplatePdf(templateId, filename, request.url)
}
