'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { comments, posts } from '@/db/schema'
import { ActionError, authActionClient } from '@/lib/safe-action'
import {
  createCommentSchema,
  deleteCommentSchema,
  updateCommentSchema,
} from '../schemas/comment.schema'
import type { BlogComment } from '../types'

function revalidatePostPaths(slug: string, locale: string) {
  revalidatePath(`/blog/${slug}`)
  revalidatePath(`/${locale}/blog/${slug}`)
}

export const createCommentAction = authActionClient
  .inputSchema(createCommentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, postId, parentId, content } = parsedInput

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
        throw new ActionError('Post Not Found', 'The post you are commenting on does not exist.')
      }

      if (parentId) {
        const parentComment = await db.query.comments.findFirst({
          where: and(eq(comments.id, parentId), eq(comments.postId, postId)),
          columns: { id: true },
        })

        if (!parentComment) {
          throw new ActionError(
            'Parent Comment Not Found',
            'The comment you are replying to no longer exists.',
          )
        }
      }

      const now = new Date()

      const [inserted] = await db
        .insert(comments)
        .values({
          ...(id ? { id } : {}),
          content,
          postId,
          authorId: ctx.user.id,
          parentId: parentId ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .returning()

      if (!inserted) {
        throw new ActionError('Failed to create comment', 'Could not save your comment.')
      }

      revalidatePostPaths(existingPost.slug, existingPost.locale)

      const createdComment: BlogComment = {
        id: inserted.id,
        content: inserted.content,
        postId: inserted.postId,
        authorId: inserted.authorId,
        parentId: inserted.parentId,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
        author: {
          id: ctx.user.id,
          name: ctx.user.name,
          image: ctx.user.image ?? null,
          role: ctx.user.role ?? 'user',
        },
        replies: [],
      }

      return {
        success: true,
        comment: createdComment,
      }
    } catch (error) {
      console.error('Error creating comment:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError(
        'Failed to post comment',
        error instanceof Error ? error.message : 'An unexpected database error occurred.',
      )
    }
  })

export const updateCommentAction = authActionClient
  .inputSchema(updateCommentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { commentId, content } = parsedInput

    try {
      const existingComment = await db.query.comments.findFirst({
        where: eq(comments.id, commentId),
        with: {
          post: {
            columns: {
              slug: true,
              locale: true,
            },
          },
        },
      })

      if (!existingComment) {
        throw new ActionError(
          'Comment Not Found',
          'The comment you are trying to edit no longer exists.',
        )
      }

      if (existingComment.authorId !== ctx.user.id) {
        throw new ActionError('Insufficient Permissions', 'You can only edit your own comments.')
      }

      const now = new Date()

      await db
        .update(comments)
        .set({
          content,
          updatedAt: now,
        })
        .where(eq(comments.id, commentId))

      if (existingComment.post) {
        revalidatePostPaths(existingComment.post.slug, existingComment.post.locale)
      }

      return {
        success: true,
        commentId,
        content,
        updatedAt: now.toISOString(),
      }
    } catch (error) {
      console.error('Error updating comment:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError(
        'Failed to update comment',
        error instanceof Error ? error.message : 'An unexpected database error occurred.',
      )
    }
  })

export const deleteCommentAction = authActionClient
  .inputSchema(deleteCommentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { commentId } = parsedInput

    try {
      const existingComment = await db.query.comments.findFirst({
        where: eq(comments.id, commentId),
        with: {
          post: {
            columns: {
              slug: true,
              locale: true,
            },
          },
        },
      })

      if (!existingComment) {
        throw new ActionError(
          'Comment Not Found',
          'The comment you are trying to delete no longer exists.',
        )
      }

      const isOwner = existingComment.authorId === ctx.user.id
      const isAdmin = ctx.user.role === 'admin'

      if (!isOwner && !isAdmin) {
        throw new ActionError(
          'Insufficient Permissions',
          'You do not have permission to delete this comment.',
        )
      }

      await db.delete(comments).where(eq(comments.id, commentId))

      if (existingComment.post) {
        revalidatePostPaths(existingComment.post.slug, existingComment.post.locale)
      }

      return {
        success: true,
        commentId,
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError(
        'Failed to delete comment',
        error instanceof Error ? error.message : 'An unexpected database error occurred.',
      )
    }
  })
