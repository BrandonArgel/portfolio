'use server'

import { revalidatePath } from 'next/cache'
import type { z } from 'zod'
import { runAuthorizedAction } from '@/lib/actions/run-authorized-action'
import type { Result } from '@/utils/result'
import {
  createCommentSchema,
  deleteCommentSchema,
  updateCommentSchema,
} from '../schemas/comment-schema'
import {
  type CreateCommentResult,
  createComment,
  type DeleteCommentResult,
  deleteComment,
  type UpdateCommentResult,
  updateComment,
} from '../services/comments-service'
import type { CommentError } from '../types'

function revalidateCommentPostPaths(slug?: string, locale?: string) {
  if (!slug || !locale) return
  revalidatePath(`/blog/${slug}`)
  revalidatePath(`/${locale}/blog/${slug}`)
}

export async function createCommentAction(
  input: z.input<typeof createCommentSchema>,
): Promise<Result<CreateCommentResult, CommentError>> {
  return runAuthorizedAction({
    role: 'user',
    schema: createCommentSchema,
    input,
    handler: (data, actor) => createComment(data, actor),
    onSuccess: (result) => revalidateCommentPostPaths(result.postSlug, result.postLocale),
  })
}

export async function updateCommentAction(
  input: z.input<typeof updateCommentSchema>,
): Promise<Result<UpdateCommentResult, CommentError>> {
  return runAuthorizedAction({
    role: 'user',
    schema: updateCommentSchema,
    input,
    handler: (data, actor) => updateComment(data, actor),
    onSuccess: (result) => revalidateCommentPostPaths(result.postSlug, result.postLocale),
  })
}

export async function deleteCommentAction(
  input: z.input<typeof deleteCommentSchema>,
): Promise<Result<DeleteCommentResult, CommentError>> {
  return runAuthorizedAction({
    role: 'user',
    schema: deleteCommentSchema,
    input,
    handler: (data, actor) => deleteComment(data, actor),
    onSuccess: (result) => revalidateCommentPostPaths(result.postSlug, result.postLocale),
  })
}
