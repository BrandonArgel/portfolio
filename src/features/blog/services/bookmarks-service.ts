import { and, desc, eq } from 'drizzle-orm'
import { type AppDatabase, db } from '@/db'
import { postBookmarks } from '@/db/schema'
import { withDatabaseError } from '@/db/utils'
import { error, okay, type Result } from '@/utils/result'
import type { BlogError, BlogPostCardItem, DatabaseError, ToggleBookmarkResult } from '../types'
import { calculateReadTime } from '../utils/calculate-read-time'
import { extractExcerpt } from '../utils/extract-excerpt'
import { findPublishedPostMeta } from './posts-service'

/**
 * Toggles a bookmark for an authenticated user on a published post.
 * If the bookmark exists, it is deleted (`bookmarked: false`); otherwise, it is created (`bookmarked: true`).
 */
export function togglePostBookmark(
  userId: string,
  postId: string,
  database: AppDatabase = db,
): Promise<Result<ToggleBookmarkResult, BlogError>> {
  return withDatabaseError<ToggleBookmarkResult, Extract<BlogError, { reason: 'NOT_FOUND' }>>(
    `Error toggling bookmark for user ${userId} and post ${postId}`,
    async () => {
      const existingPost = await findPublishedPostMeta(postId, database)
      if (!existingPost) {
        return error({ reason: 'NOT_FOUND', identifier: postId })
      }

      const existingBookmark = await database.query.postBookmarks.findFirst({
        where: and(eq(postBookmarks.userId, userId), eq(postBookmarks.postId, postId)),
        columns: {
          postId: true,
        },
      })

      if (existingBookmark) {
        await database
          .delete(postBookmarks)
          .where(and(eq(postBookmarks.userId, userId), eq(postBookmarks.postId, postId)))

        return okay({
          bookmarked: false,
          postId: existingPost.id,
          slug: existingPost.slug,
          locale: existingPost.locale,
        })
      }

      await database
        .insert(postBookmarks)
        .values({
          userId,
          postId,
          createdAt: new Date(),
        })
        .onConflictDoNothing()

      return okay({
        bookmarked: true,
        postId: existingPost.id,
        slug: existingPost.slug,
        locale: existingPost.locale,
      })
    },
  )
}

/**
 * Returns all published posts bookmarked by the given user, ordered by most recently bookmarked first.
 */
export function getUserBookmarkedPosts(
  userId: string,
  database: AppDatabase = db,
): Promise<Result<BlogPostCardItem[], DatabaseError>> {
  return withDatabaseError(`Error fetching bookmarked posts for user ${userId}`, async () => {
    const rows = await database.query.postBookmarks.findMany({
      where: eq(postBookmarks.userId, userId),
      orderBy: [desc(postBookmarks.createdAt)],
      with: {
        post: {
          with: {
            postCategories: {
              with: {
                category: true,
              },
            },
          },
        },
      },
    })

    const bookmarkedPosts: BlogPostCardItem[] = []

    for (const row of rows) {
      const post = row.post
      if (!post?.published) continue

      const mappedCategories = post.postCategories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      }))

      bookmarkedPosts.push({
        id: post.id,
        title: post.title,
        slug: post.slug,
        description: post.description,
        excerpt: extractExcerpt(post.content),
        coverImage: post.coverImage,
        categories: mappedCategories,
        readTimeMinutes: calculateReadTime(post.content),
        publishedAt: post.createdAt,
        isBookmarked: true,
      })
    }

    return okay(bookmarkedPosts)
  })
}

/**
 * Returns whether a specific post is bookmarked by the given user.
 */
export async function isPostBookmarkedByUser(
  userId: string,
  postId: string,
  database: AppDatabase = db,
): Promise<boolean> {
  try {
    const row = await database.query.postBookmarks.findFirst({
      where: and(eq(postBookmarks.userId, userId), eq(postBookmarks.postId, postId)),
      columns: { postId: true },
    })

    return Boolean(row)
  } catch (err) {
    console.error(`Error checking bookmark status for user ${userId} and post ${postId}:`, err)
    return false
  }
}
