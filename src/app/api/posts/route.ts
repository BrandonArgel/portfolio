import { type NextRequest, NextResponse } from 'next/server'
import { getPublishedPosts } from '@/services/posts.service'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 3

  try {
    const [err, posts] = await getPublishedPosts(
      undefined,
      undefined,
      Number.isNaN(limit) ? 3 : limit,
    )
    if (err) {
      return NextResponse.json({ success: false, error: err.reason }, { status: 500 })
    }
    return NextResponse.json({
      success: true,
      data: posts,
    })
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch posts',
      },
      { status: 500 },
    )
  }
}
