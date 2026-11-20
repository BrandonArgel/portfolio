import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { createTestDb, seedTestPost, seedTestUser, type TestDbContext } from '@/db/test-db'
import {
  getUserBookmarkedPosts,
  isPostBookmarkedByUser,
  togglePostBookmark,
} from './bookmarks-service'

describe('bookmarks-service', () => {
  let ctx: TestDbContext

  beforeEach(async () => {
    ctx = await createTestDb()
  })

  afterEach(() => {
    ctx.close()
  })

  test('toggles bookmarks, excludes unpublished posts, and checks status', async () => {
    const user = await seedTestUser(ctx.db, { id: 'u1', role: 'user' })
    const author = await seedTestUser(ctx.db, { id: 'a1', role: 'editor' })

    const pubPost = await seedTestPost(ctx.db, {
      id: 'post-pub',
      authorId: author.id,
      slug: 'bookmarked-post',
      published: true,
    })
    const draftPost = await seedTestPost(ctx.db, {
      id: 'post-draft',
      authorId: author.id,
      slug: 'draft-post',
      published: false,
    })

    // Missing or unpublished post fails with NOT_FOUND
    expect((await togglePostBookmark(user.id, 'missing', ctx.db))[0]).toEqual({
      reason: 'NOT_FOUND',
      identifier: 'missing',
    })
    expect((await togglePostBookmark(user.id, draftPost.id, ctx.db))[0]).toEqual({
      reason: 'NOT_FOUND',
      identifier: draftPost.id,
    })

    // First toggle adds bookmark
    const [addErr, addRes] = await togglePostBookmark(user.id, pubPost.id, ctx.db)
    expect(addErr).toBeNull()
    expect(addRes).toMatchObject({ bookmarked: true, postId: pubPost.id })
    expect(await isPostBookmarkedByUser(user.id, pubPost.id, ctx.db)).toBe(true)

    const [listErr, list] = await getUserBookmarkedPosts(user.id, ctx.db)
    expect(listErr).toBeNull()
    expect(list?.map((p) => p.id)).toEqual([pubPost.id])

    // Second toggle removes bookmark
    const [remErr, remRes] = await togglePostBookmark(user.id, pubPost.id, ctx.db)
    expect(remErr).toBeNull()
    expect(remRes).toMatchObject({ bookmarked: false, postId: pubPost.id })
    expect(await isPostBookmarkedByUser(user.id, pubPost.id, ctx.db)).toBe(false)
  })
})
