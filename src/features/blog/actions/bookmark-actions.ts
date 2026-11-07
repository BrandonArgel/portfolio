'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import { error, okay, type Result } from '@/utils/result'
import { togglePostBookmark } from '../services/bookmarks-service'
import type { BlogError, ToggleBookmarkResult } from '../types'

const postIdSchema = z.string().trim().min(1)

function revalidateBookmarkPaths(slug: string, locale: string) {
  revalidatePath('/blog')
  revalidatePath(`/${locale}/blog`)
  revalidatePath(`/blog/${slug}`)
  revalidatePath(`/${locale}/blog/${slug}`)
}

/**
 * Server Action that toggles a post bookmark for the currently authenticated user
 * using the `Result<ToggleBookmarkResult, BlogError>` pattern.
 */
export async function togglePostBookmarkAction(
  postId: string,
): Promise<Result<ToggleBookmarkResult, BlogError>> {
  const parsed = postIdSchema.safeParse(postId)
  if (!parsed.success) {
    return error({
      reason: 'VALIDATION_ERROR',
      message: 'Invalid post identifier.',
    })
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return error({ reason: 'UNAUTHORIZED' })
    }

    const [toggleErr, result] = await togglePostBookmark(session.user.id, parsed.data)

    if (toggleErr) {
      return error(toggleErr)
    }

    revalidateBookmarkPaths(result.slug, result.locale)

    return okay(result)
  } catch (err) {
    console.error('Error in togglePostBookmarkAction:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}
