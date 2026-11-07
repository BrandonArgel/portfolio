import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { postBookmarks, posts } from '@/db/schema'
import { error, okay, type Result } from '@/utils/result'
import type { BlogError, BlogPostCardItem, PostQueryError, ToggleBookmarkResult } from '../types'
import { calculateReadTime } from '../utils/calculate-read-time'
import { extractExcerpt } from '../utils/extract-excerpt'

/**
 * Toggles a bookmark for an authenticated user on a published post.
 * If the bookmark exists, it is deleted (`bookmarked: false`); otherwise, it is created (`bookmarked: true`).
 */
export async function togglePostBookmark(
  userId: string,
  postId: string,
): Promise<Result<ToggleBookmarkResult, BlogError>> {
  try {
    const existingPost = await db.query.posts.findFirst({
      where: and(eq(posts.id, postId), eq(posts.published, true)),
      columns: {
        id: true,
        slug: true,
        locale: true,
      },
    })

    if (!existingPost) {
      return error({ reason: 'NOT_FOUND', identifier: postId })
    }

    const existingBookmark = await db.query.postBookmarks.findFirst({
      where: and(eq(postBookmarks.userId, userId), eq(postBookmarks.postId, postId)),
      columns: {
        postId: true,
      },
    })

    if (existingBookmark) {
      await db
        .delete(postBookmarks)
        .where(and(eq(postBookmarks.userId, userId), eq(postBookmarks.postId, postId)))

      return okay({
        bookmarked: false,
        postId: existingPost.id,
        slug: existingPost.slug,
        locale: existingPost.locale,
      })
    }

    await db
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
  } catch (err) {
    console.error(`Error toggling bookmark for user ${userId} and post ${postId}:`, err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

/**
 * Returns all published posts bookmarked by the given user, ordered by most recently bookmarked first.
 */
export async function getUserBookmarkedPosts(
  userId: string,
): Promise<Result<BlogPostCardItem[], PostQueryError>> {
  try {
    const rows = await db.query.postBookmarks.findMany({
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
  } catch (err) {
    console.error(`Error fetching bookmarked posts for user ${userId}:`, err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

/**
 * Returns whether a specific post is bookmarked by the given user.
 */
export async function isPostBookmarkedByUser(userId: string, postId: string): Promise<boolean> {
  try {
    const row = await db.query.postBookmarks.findFirst({
      where: and(eq(postBookmarks.userId, userId), eq(postBookmarks.postId, postId)),
      columns: { postId: true },
    })

    return Boolean(row)
  } catch (err) {
    console.error(`Error checking bookmark status for user ${userId} and post ${postId}:`, err)
    return false
  }
}
