import { asc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { comments } from '@/db/schema'
import { error, okay, type Result } from '@/utils/result'
import type { BlogComment, PostCommentsData, PostQueryError } from '../types'

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

/**
 * Assembles a flat list of comment rows (ordered by createdAt ascending)
 * into a hierarchical tree of top-level comments and nested replies in O(N) time.
 */
export function buildCommentTree(rows: DbCommentRow[]): BlogComment[] {
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

/**
 * Fetches all comments for a given `postId` in a single query ordered by `createdAt`,
 * including author metadata, and returns the assembled nested tree + total count.
 */
export async function getPostComments(
  postId: string,
): Promise<Result<PostCommentsData, PostQueryError>> {
  try {
    const rows = await db.query.comments.findMany({
      where: eq(comments.postId, postId),
      orderBy: [asc(comments.createdAt)],
      with: commentWithAuthor,
    })

    const nestedComments = buildCommentTree(rows)

    return okay({
      comments: nestedComments,
      totalCount: rows.length,
    })
  } catch (err) {
    console.error(`Error fetching comments for post ${postId}:`, err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}
