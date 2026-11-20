'use server'

import { revalidateLocalizedPaths } from '@/lib/actions/revalidate-localized-paths'
import { runAuthorizedAction } from '@/lib/actions/run-authorized-action'
import { verifyAccess } from '@/lib/auth/verify-access'
import { error, okay, type Result } from '@/utils/result'
import {
  type DeletePostInput,
  type DiscardDraftChangesInput,
  deletePostSchema,
  discardDraftChangesSchema,
  type SavePostInput,
  type TogglePublishStatusInput,
  togglePublishStatusSchema,
  validateSavePostInput,
} from '../schemas/post-schema'
import {
  type DeletePostResult,
  type DiscardDraftResult,
  deletePost,
  discardPostDraft,
  type SavePostResult,
  savePost,
  type TogglePublishStatusResult,
  togglePostPublishStatus,
} from '../services/posts-mutation-service'
import type { PostError } from '../types'

function revalidatePostPaths(slug: string, previousSlug?: string | null) {
  const paths = ['/blog', `/blog/${slug}`, '/dashboard/posts']
  if (previousSlug && previousSlug !== slug) {
    paths.push(`/blog/${previousSlug}`)
  }
  revalidateLocalizedPaths(paths)
}

export async function savePostAction(
  input: SavePostInput,
): Promise<Result<SavePostResult, PostError>> {
  const [authErr, actor] = await verifyAccess('editor')
  if (authErr) return error(authErr)

  const [validationErr, parsedInput] = validateSavePostInput(input)
  if (validationErr) return error(validationErr)

  const [saveErr, result] = await savePost(parsedInput, actor)
  if (saveErr) return error(saveErr)

  if (parsedInput.intent !== 'auto_save') {
    revalidatePostPaths(result.slug, result.previousSlug)
  }

  return okay(result)
}

export async function discardDraftChangesAction(
  input: DiscardDraftChangesInput,
): Promise<Result<DiscardDraftResult, PostError>> {
  return runAuthorizedAction({
    role: 'editor',
    schema: discardDraftChangesSchema,
    input,
    handler: (data, actor) => discardPostDraft(data.postId, actor),
    onSuccess: (result) => revalidateLocalizedPaths([`/dashboard/posts/${result.slug}/edit`]),
  })
}

export async function deletePostAction(
  input: DeletePostInput,
): Promise<Result<DeletePostResult, PostError>> {
  return runAuthorizedAction({
    role: 'admin',
    schema: deletePostSchema,
    input,
    handler: (data, actor) => deletePost(data.postId, actor),
    onSuccess: (result) => revalidatePostPaths(result.slug),
  })
}

export async function togglePublishStatusAction(
  input: TogglePublishStatusInput,
): Promise<Result<TogglePublishStatusResult, PostError>> {
  return runAuthorizedAction({
    role: 'editor',
    schema: togglePublishStatusSchema,
    input,
    handler: (data, actor) => togglePostPublishStatus(data, actor),
    onSuccess: (result) => revalidatePostPaths(result.slug),
  })
}
