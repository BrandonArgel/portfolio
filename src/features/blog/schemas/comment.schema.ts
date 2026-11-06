import { z } from 'zod'

export const COMMENT_MAX_LENGTH = 2000

export const createCommentSchema = z.object({
  id: z.uuid().optional(),
  postId: z.string().min(1, 'Post ID is required'),
  parentId: z.string().min(1).nullable().optional(),
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(COMMENT_MAX_LENGTH, `Comment cannot exceed ${COMMENT_MAX_LENGTH} characters`),
})

export const updateCommentSchema = z.object({
  commentId: z.string().min(1, 'Comment ID is required'),
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(COMMENT_MAX_LENGTH, `Comment cannot exceed ${COMMENT_MAX_LENGTH} characters`),
})

export const deleteCommentSchema = z.object({
  commentId: z.string().min(1, 'Comment ID is required'),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>
