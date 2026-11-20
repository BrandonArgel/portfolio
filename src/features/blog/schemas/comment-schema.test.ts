import { describe, expect, test } from 'bun:test'
import {
  COMMENT_MAX_LENGTH,
  createCommentSchema,
  deleteCommentSchema,
  updateCommentSchema,
} from './comment-schema'

describe('comment schemas', () => {
  test('createCommentSchema validates UUID id, nullable parentId, and trimmed content length', () => {
    const ok = createCommentSchema.safeParse({
      id: crypto.randomUUID(),
      postId: 'post-1',
      parentId: null,
      content: '  Great article!  ',
    })
    expect(ok.success).toBe(true)
    if (ok.success) {
      expect(ok.data.content).toBe('Great article!')
    }

    expect(
      createCommentSchema.safeParse({
        id: 'not-a-uuid',
        postId: 'post-1',
        content: 'Hello',
      }).success,
    ).toBe(false)

    expect(
      createCommentSchema.safeParse({
        postId: 'post-1',
        content: '   ',
      }).success,
    ).toBe(false)

    expect(
      createCommentSchema.safeParse({
        postId: 'post-1',
        content: 'a'.repeat(COMMENT_MAX_LENGTH + 1),
      }).success,
    ).toBe(false)
  })

  test('updateCommentSchema and deleteCommentSchema validate required fields', () => {
    expect(
      updateCommentSchema.safeParse({
        commentId: 'c-1',
        content: 'a'.repeat(COMMENT_MAX_LENGTH),
      }).success,
    ).toBe(true)
    expect(updateCommentSchema.safeParse({ commentId: '', content: 'ok' }).success).toBe(false)

    expect(deleteCommentSchema.safeParse({ commentId: 'c-1' }).success).toBe(true)
    expect(deleteCommentSchema.safeParse({ commentId: '' }).success).toBe(false)
  })
})
