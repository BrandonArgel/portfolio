import { and, asc, eq } from 'drizzle-orm'
import { type AppDatabase, db } from '@/db'
import { comments } from '@/db/schema'
import { withDatabaseError } from '@/db/utils'
import type { VerifiedActor } from '@/lib/auth/verify-access'
import { error, okay, type Result } from '@/utils/result'
import type { BlogComment, CommentError, DatabaseError, PostCommentsData } from '../types'
import { findPublishedPostMeta } from './posts-service'

const commentWithAuthor = {
  author: {
    columns: {
      id: true,
      name: true,
      image: true,
      role: true,
    },
  },
} as const

type DbCommentRow = NonNullable<
  Awaited<ReturnType<typeof db.query.comments.findFirst<{ with: typeof commentWithAuthor }>>>
>

export interface CreateCommentResult {
  comment: BlogComment
  postSlug: string
  postLocale: string
}

export interface UpdateCommentResult {
  commentId: string
  content: string
  updatedAt: string
  postSlug?: string
  postLocale?: string
}

export interface DeleteCommentResult {
  commentId: string
  postSlug?: string
  postLocale?: string
}

/**
 * Assembles a flat list of comment rows (ordered by createdAt ascending)
 * into a hierarchical tree of top-level comments and nested replies in O(N) time.
 */
function buildCommentTree(rows: DbCommentRow[]): BlogComment[] {
  const commentMap = new Map<string, BlogComment>()
  const rootComments: BlogComment[] = []

  for (const row of rows) {
    commentMap.set(row.id, {
      id: row.id,
      content: row.content,
      postId: row.postId,
      authorId: row.authorId,
      parentId: row.parentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.author.id,
        name: row.author.name,
        image: row.author.image,
        role: row.author.role,
      },
      replies: [],
    })
  }

  for (const comment of commentMap.values()) {
    if (comment.parentId && commentMap.has(comment.parentId)) {
      const parent = commentMap.get(comment.parentId)
      parent?.replies.push(comment)
    } else {
      rootComments.push(comment)
    }
  }

  return rootComments
}

async function findCommentWithPost(commentId: string, database: AppDatabase) {
  const existingComment = await database.query.comments.findFirst({
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
    return error({ reason: 'COMMENT_NOT_FOUND' as const, identifier: commentId })
  }

  return okay(existingComment)
}

/**
 * Fetches all comments for a given `postId` in a single query ordered by `createdAt`,
 * including author metadata, and returns the assembled nested tree + total count.
 */
export function getPostComments(
  postId: string,
  database: AppDatabase = db,
): Promise<Result<PostCommentsData, DatabaseError>> {
  return withDatabaseError(`Error fetching comments for post ${postId}`, async () => {
    const rows = await database.query.comments.findMany({
      where: eq(comments.postId, postId),
      orderBy: [asc(comments.createdAt)],
      with: commentWithAuthor,
    })

    const nestedComments = buildCommentTree(rows)

    return okay({
      comments: nestedComments,
      totalCount: rows.length,
    })
  })
}

export function createComment(
  input: { id?: string; postId: string; parentId?: string | null; content: string },
  actor: VerifiedActor,
  database: AppDatabase = db,
): Promise<
  Result<
    CreateCommentResult,
    Extract<
      CommentError,
      { reason: 'POST_NOT_FOUND' | 'PARENT_COMMENT_NOT_FOUND' | 'DATABASE_ERROR' }
    >
  >
> {
  const { id, postId, parentId, content } = input

  return withDatabaseError<
    CreateCommentResult,
    Extract<
      CommentError,
      { reason: 'POST_NOT_FOUND' | 'PARENT_COMMENT_NOT_FOUND' | 'DATABASE_ERROR' }
    >
  >('Error creating comment', async () => {
    const existingPost = await findPublishedPostMeta(postId, database)
    if (!existingPost) {
      return error({ reason: 'POST_NOT_FOUND', identifier: postId })
    }

    if (parentId) {
      const parentComment = await database.query.comments.findFirst({
        where: and(eq(comments.id, parentId), eq(comments.postId, postId)),
        columns: { id: true },
      })

      if (!parentComment) {
        return error({ reason: 'PARENT_COMMENT_NOT_FOUND', identifier: parentId })
      }
    }

    const now = new Date()

    const [inserted] = await database
      .insert(comments)
      .values({
        ...(id ? { id } : {}),
        content,
        postId,
        authorId: actor.id,
        parentId: parentId ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    if (!inserted) {
      return error({ reason: 'DATABASE_ERROR' })
    }

    const comment: BlogComment = {
      id: inserted.id,
      content: inserted.content,
      postId: inserted.postId,
      authorId: inserted.authorId,
      parentId: inserted.parentId,
      createdAt: inserted.createdAt,
      updatedAt: inserted.updatedAt,
      author: {
        id: actor.id,
        name: actor.name ?? '',
        image: actor.image,
        role: actor.role,
      },
      replies: [],
    }

    return okay({
      comment,
      postSlug: existingPost.slug,
      postLocale: existingPost.locale,
    })
  })
}

export function updateComment(
  input: { commentId: string; content: string },
  actor: VerifiedActor,
  database: AppDatabase = db,
): Promise<
  Result<
    UpdateCommentResult,
    Extract<CommentError, { reason: 'COMMENT_NOT_FOUND' | 'FORBIDDEN' | 'DATABASE_ERROR' }>
  >
> {
  const { commentId, content } = input

  return withDatabaseError<
    UpdateCommentResult,
    Extract<CommentError, { reason: 'COMMENT_NOT_FOUND' | 'FORBIDDEN' }>
  >('Error updating comment', async () => {
    const [findErr, existingComment] = await findCommentWithPost(commentId, database)
    if (findErr) return error(findErr)

    if (existingComment.authorId !== actor.id) {
      return error({ reason: 'FORBIDDEN' })
    }

    const now = new Date()

    await database
      .update(comments)
      .set({
        content,
        updatedAt: now,
      })
      .where(eq(comments.id, commentId))

    return okay({
      commentId,
      content,
      updatedAt: now.toISOString(),
      postSlug: existingComment.post?.slug,
      postLocale: existingComment.post?.locale,
    })
  })
}

export function deleteComment(
  input: { commentId: string },
  actor: VerifiedActor,
  database: AppDatabase = db,
): Promise<
  Result<
    DeleteCommentResult,
    Extract<CommentError, { reason: 'COMMENT_NOT_FOUND' | 'FORBIDDEN' | 'DATABASE_ERROR' }>
  >
> {
  const { commentId } = input

  return withDatabaseError<
    DeleteCommentResult,
    Extract<CommentError, { reason: 'COMMENT_NOT_FOUND' | 'FORBIDDEN' }>
  >('Error deleting comment', async () => {
    const [findErr, existingComment] = await findCommentWithPost(commentId, database)
    if (findErr) return error(findErr)

    const isOwner = existingComment.authorId === actor.id
    const isAdmin = actor.role === 'admin'

    if (!isOwner && !isAdmin) {
      return error({ reason: 'FORBIDDEN' })
    }

    await database.delete(comments).where(eq(comments.id, commentId))

    return okay({
      commentId,
      postSlug: existingComment.post?.slug,
      postLocale: existingComment.post?.locale,
    })
  })
}
