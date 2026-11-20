import { and, eq, sql } from 'drizzle-orm'
import { type AppDatabase, db } from '@/db'
import { posts } from '@/db/schema'
import { withDatabaseError } from '@/db/utils'
import { error, okay, type Result } from '@/utils/result'
import type { PostViewError } from '../types'

/**
 * Atomically increments `views_count` for a published blog post.
 * Ignores drafts and non-existent IDs by gating the SQL UPDATE on `published = true`.
 */
export function incrementPostViews(
  postId: string,
  database: AppDatabase = db,
): Promise<Result<{ viewsCount: number }, PostViewError>> {
  return withDatabaseError<{ viewsCount: number }, Extract<PostViewError, { reason: 'NOT_FOUND' }>>(
    `Error incrementing views for post ${postId}`,
    async () => {
      const [updated] = await database
        .update(posts)
        .set({ viewsCount: sql`${posts.viewsCount} + 1` })
        .where(and(eq(posts.id, postId), eq(posts.published, true)))
        .returning({ viewsCount: posts.viewsCount })

      if (!updated) {
        return error({ reason: 'NOT_FOUND', identifier: postId })
      }

      return okay({ viewsCount: updated.viewsCount })
    },
  )
}
