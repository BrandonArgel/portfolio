'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { revalidateLocalizedPaths } from '@/lib/actions/revalidate-localized-paths'
import { runAuthorizedAction } from '@/lib/actions/run-authorized-action'
import type { Result } from '@/utils/result'
import { togglePostBookmark } from '../services/bookmarks-service'
import type { BlogError, ToggleBookmarkResult } from '../types'

const postIdSchema = z.string().trim().min(1)

function revalidateBookmarkPaths(slug: string, postLocale: string) {
  revalidateLocalizedPaths(['/blog'])
  revalidatePath(`/blog/${slug}`)
  revalidatePath(`/${postLocale}/blog/${slug}`)
}

/**
 * Server Action that toggles a post bookmark for the currently authenticated user
 * using the `Result<ToggleBookmarkResult, BlogError>` pattern.
 */
export async function togglePostBookmarkAction(
  postId: string,
): Promise<Result<ToggleBookmarkResult, BlogError>> {
  return runAuthorizedAction({
    role: 'user',
    schema: postIdSchema,
    input: postId,
    handler: (validatedPostId, actor) => togglePostBookmark(actor.id, validatedPostId),
    onSuccess: (result) => revalidateBookmarkPaths(result.slug, result.locale),
  })
}
