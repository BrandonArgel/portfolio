'use server'

import { error, type Result } from '@/utils/result'
import { recordPostViewSchema } from '../schemas/view-schema'
import { incrementPostViews } from '../services/post-views-service'
import type { PostViewError } from '../types'

/**
 * Public Server Action that records a post view without revalidating routes
 * so passive reader visits do not invalidate page caches on every view.
 */
export async function recordPostViewAction(
  postId: string,
): Promise<Result<{ viewsCount: number }, PostViewError>> {
  const parsed = recordPostViewSchema.safeParse(postId)
  if (!parsed.success) {
    return error({ reason: 'VALIDATION_ERROR' })
  }

  return incrementPostViews(parsed.data)
}
