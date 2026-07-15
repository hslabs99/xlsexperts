import { NextResponse } from 'next/server'
import { publishEmailCaseStudyThumbsToStorage } from '@/lib/email-case-study-thumbs-publish'

/**
 * Compress archive case-study images → Firebase Storage `email/case-studies/*.jpg`
 * and write download URLs to Site Content `email-case-study-thumbs`.
 */
export async function POST() {
  try {
    const result = await publishEmailCaseStudyThumbsToStorage()
    return NextResponse.json({
      ok: result.uploaded > 0 || result.failed === 0,
      ...result,
      hint:
        result.failed > 0 && result.uploaded === 0
          ? 'Storage rejected uploads. Check Firebase Console → Storage is enabled and Rules allow writes to email/case-studies/**.'
          : result.uploaded > 0
            ? 'Discovery emails will now embed these Firebase Storage thumbnail URLs.'
            : undefined,
    })
  } catch (error) {
    console.error('[publish-email-case-study-thumbs]', error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Publish failed',
        uploaded: 0,
        failed: 0,
        items: [],
      },
      { status: 500 }
    )
  }
}
