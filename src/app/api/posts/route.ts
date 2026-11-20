import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPublishedPosts } from '@/features/blog/services/posts-service'
import { handleApiError } from '@/utils/http-status'
import { assertNever } from '@/utils/result'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(3),
})

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams)
  const parseResult = querySchema.safeParse(searchParams)

  if (!parseResult.success) {
    return handleApiError({ reason: 'VALIDATION_ERROR' })
  }

  const [err, res] = await getPublishedPosts({
    limit: parseResult.data.limit,
    page: 1,
  })

  if (err) {
    switch (err.reason) {
      case 'DATABASE_ERROR':
        return handleApiError(err)
      default:
        return assertNever(err.reason)
    }
  }

  return NextResponse.json({
    success: true,
    data: res.posts,
    total: res.total,
    totalPages: res.totalPages,
    currentPage: res.currentPage,
  })
}
