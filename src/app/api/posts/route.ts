// app/api/posts/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPublishedPosts } from '@/features/blog/services/posts-service'
import { handleApiError } from '@/utils/http-status'

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

  // Objeto de opciones en lugar de parámetros posicionales infinitos
  const [err, res] = await getPublishedPosts({
    limit: parseResult.data.limit,
    page: 1,
  })

  // Manejo de error en 2 líneas
  if (err) return handleApiError(err)

  return NextResponse.json({
    success: true,
    data: res.posts,
    total: res.total,
    totalPages: res.totalPages,
    currentPage: res.currentPage,
  })
}
