import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { createTestDb, seedTestPost, seedTestUser, type TestDbContext } from '@/db/test-db'
import { createComment, deleteComment, getPostComments, updateComment } from './comments-service'

describe('comments-service', () => {
  let ctx: TestDbContext

  beforeEach(async () => {
    ctx = await createTestDb()
  })

  afterEach(() => {
    ctx.close()
  })

  test('createComment, getPostComments, updateComment, and deleteComment enforce tree & ownership', async () => {
    const author = await seedTestUser(ctx.db, { id: 'u1', name: 'Alice', role: 'user' })
    const otherUser = await seedTestUser(ctx.db, { id: 'u2', name: 'Bob', role: 'user' })
    const admin = await seedTestUser(ctx.db, { id: 'ad1', name: 'Admin', role: 'admin' })

    const pubPost = await seedTestPost(ctx.db, {
      id: 'post-1',
      authorId: admin.id,
      slug: 'hello',
      locale: 'en',
      published: true,
    })
    const draftPost = await seedTestPost(ctx.db, {
      id: 'post-draft',
      authorId: admin.id,
      slug: 'draft',
      locale: 'en',
      published: false,
    })

    const authorActor = { id: author.id, name: author.name, image: null, role: 'user' }
    const otherActor = { id: otherUser.id, name: otherUser.name, image: null, role: 'user' }
    const adminActor = { id: admin.id, name: admin.name, image: null, role: 'admin' }

    // Cannot comment on missing or draft post
    expect(
      (await createComment({ postId: 'missing', content: 'Hi' }, authorActor, ctx.db))[0],
    ).toEqual({
      reason: 'POST_NOT_FOUND',
      identifier: 'missing',
    })
    expect(
      (await createComment({ postId: draftPost.id, content: 'Hi' }, authorActor, ctx.db))[0],
    ).toEqual({
      reason: 'POST_NOT_FOUND',
      identifier: draftPost.id,
    })

    // Cannot reply to nonexistent parent
    expect(
      (
        await createComment(
          { postId: pubPost.id, parentId: 'no-parent', content: 'Reply' },
          authorActor,
          ctx.db,
        )
      )[0],
    ).toEqual({ reason: 'PARENT_COMMENT_NOT_FOUND', identifier: 'no-parent' })

    // Create root comment and nested reply
    const [rootErr, rootRes] = await createComment(
      { postId: pubPost.id, content: 'Root comment' },
      authorActor,
      ctx.db,
    )
    expect(rootErr).toBeNull()
    if (!rootRes) throw new Error('Expected root comment')

    const [replyErr] = await createComment(
      { postId: pubPost.id, parentId: rootRes.comment.id, content: 'Nested reply' },
      otherActor,
      ctx.db,
    )
    expect(replyErr).toBeNull()

    const [treeErr, tree] = await getPostComments(pubPost.id, ctx.db)
    expect(treeErr).toBeNull()
    expect(tree?.totalCount).toBe(2)
    expect(tree?.comments).toHaveLength(1)
    expect(tree?.comments[0]?.replies).toHaveLength(1)
    expect(tree?.comments[0]?.replies[0]?.content).toBe('Nested reply')

    // Ownership checks on updateComment
    expect(
      (await updateComment({ commentId: 'missing', content: 'Edit' }, authorActor, ctx.db))[0],
    ).toEqual({ reason: 'COMMENT_NOT_FOUND', identifier: 'missing' })

    expect(
      (
        await updateComment({ commentId: rootRes.comment.id, content: 'Hack' }, otherActor, ctx.db)
      )[0],
    ).toEqual({ reason: 'FORBIDDEN' })

    const [updErr, updRes] = await updateComment(
      { commentId: rootRes.comment.id, content: 'Edited root' },
      authorActor,
      ctx.db,
    )
    expect(updErr).toBeNull()
    expect(updRes?.content).toBe('Edited root')

    // Other user cannot delete; admin can delete and cascade removes child reply
    expect((await deleteComment({ commentId: rootRes.comment.id }, otherActor, ctx.db))[0]).toEqual(
      { reason: 'FORBIDDEN' },
    )

    const [delErr] = await deleteComment({ commentId: rootRes.comment.id }, adminActor, ctx.db)
    expect(delErr).toBeNull()

    const [, afterDelete] = await getPostComments(pubPost.id, ctx.db)
    expect(afterDelete?.totalCount).toBe(0)
  })
})
