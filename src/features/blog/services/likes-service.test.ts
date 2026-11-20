import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { eq } from 'drizzle-orm'
import { postLikes, posts, users } from '@/db/schema'
import { createTestDb, seedTestPost, seedTestUser, type TestDbContext } from '@/db/test-db'
import { getPostLikeStatus, togglePostLike } from './likes-service'

describe('likes-service', () => {
  let ctx: TestDbContext

  beforeEach(async () => {
    ctx = await createTestDb()
  })

  afterEach(() => {
    ctx.close()
  })

  test('toggles likes for multiple users, tracks accurate counts, and rejects missing/draft posts', async () => {
    const reader1 = await seedTestUser(ctx.db, { id: 'u1', role: 'user' })
    const reader2 = await seedTestUser(ctx.db, { id: 'u2', role: 'user' })
    const author = await seedTestUser(ctx.db, { id: 'a1', role: 'editor' })

    const pubPost = await seedTestPost(ctx.db, {
      id: 'post-pub',
      authorId: author.id,
      slug: 'liked-post',
      published: true,
    })
    const draftPost = await seedTestPost(ctx.db, {
      id: 'post-draft',
      authorId: author.id,
      slug: 'draft-post',
      published: false,
    })

    // Missing or unpublished posts return NOT_FOUND
    expect((await togglePostLike('missing', reader1.id, ctx.db))[0]).toEqual({
      reason: 'NOT_FOUND',
      identifier: 'missing',
    })
    expect((await togglePostLike(draftPost.id, reader1.id, ctx.db))[0]).toEqual({
      reason: 'NOT_FOUND',
      identifier: draftPost.id,
    })

    // Initial state has 0 likes
    expect(await getPostLikeStatus(pubPost.id, undefined, ctx.db)).toEqual({
      likesCount: 0,
      isLiked: false,
    })

    // User 1 likes the post
    const [err1, res1] = await togglePostLike(pubPost.id, reader1.id, ctx.db)
    expect(err1).toBeNull()
    expect(res1).toEqual({
      liked: true,
      likesCount: 1,
      postId: pubPost.id,
      slug: 'liked-post',
      locale: 'en',
    })
    expect(await getPostLikeStatus(pubPost.id, reader1.id, ctx.db)).toEqual({
      likesCount: 1,
      isLiked: true,
    })
    expect(await getPostLikeStatus(pubPost.id, reader2.id, ctx.db)).toEqual({
      likesCount: 1,
      isLiked: false,
    })

    // User 2 likes the post
    const [err2, res2] = await togglePostLike(pubPost.id, reader2.id, ctx.db)
    expect(err2).toBeNull()
    expect(res2).toMatchObject({ liked: true, likesCount: 2 })
    expect(await getPostLikeStatus(pubPost.id, undefined, ctx.db)).toEqual({
      likesCount: 2,
      isLiked: false,
    })

    // User 1 unlikes the post
    const [remErr, remRes] = await togglePostLike(pubPost.id, reader1.id, ctx.db)
    expect(remErr).toBeNull()
    expect(remRes).toMatchObject({ liked: false, likesCount: 1 })
    expect(await getPostLikeStatus(pubPost.id, reader1.id, ctx.db)).toEqual({
      likesCount: 1,
      isLiked: false,
    })
    expect(await getPostLikeStatus(pubPost.id, reader2.id, ctx.db)).toEqual({
      likesCount: 1,
      isLiked: true,
    })
  })

  test('cascades post_likes deletions when user or post is deleted', async () => {
    const reader1 = await seedTestUser(ctx.db, { id: 'u1', role: 'user' })
    const reader2 = await seedTestUser(ctx.db, { id: 'u2', role: 'user' })
    const author = await seedTestUser(ctx.db, { id: 'a1', role: 'editor' })

    const pubPost = await seedTestPost(ctx.db, {
      id: 'post-cascade',
      authorId: author.id,
      slug: 'cascade-post',
      published: true,
    })

    await togglePostLike(pubPost.id, reader1.id, ctx.db)
    await togglePostLike(pubPost.id, reader2.id, ctx.db)
    expect(await getPostLikeStatus(pubPost.id, undefined, ctx.db)).toEqual({
      likesCount: 2,
      isLiked: false,
    })

    // Deleting user 1 cascades their like row
    await ctx.db.delete(users).where(eq(users.id, reader1.id))
    expect(await getPostLikeStatus(pubPost.id, undefined, ctx.db)).toEqual({
      likesCount: 1,
      isLiked: false,
    })

    // Deleting the post cascades all remaining like rows
    await ctx.db.delete(posts).where(eq(posts.id, pubPost.id))
    const remainingRows = await ctx.db
      .select()
      .from(postLikes)
      .where(eq(postLikes.postId, pubPost.id))
    expect(remainingRows).toHaveLength(0)
  })
})
