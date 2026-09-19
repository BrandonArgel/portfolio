import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPublishedPosts } from '@/features/blog/services/posts-service'
import { getHttpStatusFromError } from '@/utils/http-status'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(3),
})

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams)
  const parseResult = querySchema.safeParse(searchParams)

  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: 'BAD_REQUEST', details: parseResult.error.flatten() },
      { status: 400 },
    )
  }

  const { limit } = parseResult.data

  const [err, res] = await getPublishedPosts(undefined, undefined, 1, limit)

  if (err) {
    const status = getHttpStatusFromError(err.reason)

    return NextResponse.json({ success: false, error: err.reason }, { status })
  }

  return NextResponse.json({
    success: true,
    data: res.posts,
    total: res.total,
    totalPages: res.totalPages,
    currentPage: res.currentPage,
  })
}
