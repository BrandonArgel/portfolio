import { and, count, eq } from 'drizzle-orm'
import { type AppDatabase, db } from '@/db'
import { postLikes } from '@/db/schema'
import { withDatabaseError } from '@/db/utils'
import { error, okay, type Result } from '@/utils/result'
import type { LikeError, PostLikeStatus, ToggleLikeResult } from '../types'
import { findPublishedPostMeta } from './posts-service'

/**
 * Toggles a like for an authenticated user on a published post and returns the updated aggregate count.
 */
export function togglePostLike(
  postId: string,
  userId: string,
  database: AppDatabase = db,
): Promise<Result<ToggleLikeResult, LikeError>> {
  return withDatabaseError<ToggleLikeResult, Extract<LikeError, { reason: 'NOT_FOUND' }>>(
    `Error toggling like for user ${userId} and post ${postId}`,
    async () => {
      const existingPost = await findPublishedPostMeta(postId, database)
      if (!existingPost) {
        return error({ reason: 'NOT_FOUND', identifier: postId })
      }

      const existingLike = await database.query.postLikes.findFirst({
        where: and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)),
        columns: { postId: true },
      })

      let liked: boolean

      if (existingLike) {
        await database
          .delete(postLikes)
          .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
        liked = false
      } else {
        await database
          .insert(postLikes)
          .values({
            postId,
            userId,
            createdAt: new Date(),
          })
          .onConflictDoNothing()
        liked = true
      }

      const [countResult] = await database
        .select({ count: count(postLikes.postId) })
        .from(postLikes)
        .where(eq(postLikes.postId, postId))

      return okay({
        liked,
        likesCount: countResult?.count ?? 0,
        postId: existingPost.id,
        slug: existingPost.slug,
        locale: existingPost.locale,
      })
    },
  )
}

/**
 * Returns total likes count for a post and whether the optional user has liked it.
 */
export async function getPostLikeStatus(
  postId: string,
  userId?: string,
  database: AppDatabase = db,
): Promise<PostLikeStatus> {
  try {
    const [countRows, existingLike] = await Promise.all([
      database
        .select({ count: count(postLikes.postId) })
        .from(postLikes)
        .where(eq(postLikes.postId, postId)),
      userId
        ? database.query.postLikes.findFirst({
            where: and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)),
            columns: { postId: true },
          })
        : Promise.resolve(undefined),
    ])

    return {
      likesCount: countRows[0]?.count ?? 0,
      isLiked: Boolean(existingLike),
    }
  } catch (err) {
    console.error(`Error fetching like status for post ${postId}:`, err)
    return {
      likesCount: 0,
      isLiked: false,
    }
  }
}
