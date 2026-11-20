'use server'

import { revalidateLocalizedPaths } from '@/lib/actions/revalidate-localized-paths'
import { runAuthorizedAction } from '@/lib/actions/run-authorized-action'
import type { Result } from '@/utils/result'
import { togglePostLikeSchema } from '../schemas/like-schema'
import { togglePostLike } from '../services/likes-service'
import type { LikeError, ToggleLikeResult } from '../types'

/**
 * Server Action that toggles a post like for the authenticated user
 * using the `Result<ToggleLikeResult, LikeError>` pattern.
 */
export async function togglePostLikeAction(
  postId: string,
): Promise<Result<ToggleLikeResult, LikeError>> {
  return runAuthorizedAction({
    role: 'user',
    schema: togglePostLikeSchema,
    input: postId,
    handler: (validatedPostId, actor) => togglePostLike(validatedPostId, actor.id),
    onSuccess: (result) => revalidateLocalizedPaths(['/blog', `/blog/${result.slug}`]),
  })
}
