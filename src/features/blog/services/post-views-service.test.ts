import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { eq } from 'drizzle-orm'
import { posts } from '@/db/schema'
import { createTestDb, seedTestPost, seedTestUser, type TestDbContext } from '@/db/test-db'
import { incrementPostViews } from './post-views-service'

describe('post-views-service', () => {
  let ctx: TestDbContext

  beforeEach(async () => {
    ctx = await createTestDb()
  })

  afterEach(() => {
    ctx.close()
  })

  test('atomically increments viewsCount on published posts and handles concurrent calls', async () => {
    const author = await seedTestUser(ctx.db, { id: 'author-1', role: 'editor' })
    const post = await seedTestPost(ctx.db, {
      id: 'pub-post',
      authorId: author.id,
      slug: 'atomic-views-post',
      published: true,
    })

    expect(post.viewsCount).toBe(0)

    const [err1, res1] = await incrementPostViews(post.id, ctx.db)
    expect(err1).toBeNull()
    expect(res1).toEqual({ viewsCount: 1 })

    const results = await Promise.all([
      incrementPostViews(post.id, ctx.db),
      incrementPostViews(post.id, ctx.db),
      incrementPostViews(post.id, ctx.db),
    ])

    for (const [err] of results) {
      expect(err).toBeNull()
    }

    const updatedRow = await ctx.db.query.posts.findFirst({
      where: eq(posts.id, post.id),
      columns: { viewsCount: true },
    })
    expect(updatedRow?.viewsCount).toBe(4)
  })

  test('returns NOT_FOUND and never increments views for draft or missing posts', async () => {
    const author = await seedTestUser(ctx.db, { id: 'author-1', role: 'editor' })
    const draft = await seedTestPost(ctx.db, {
      id: 'draft-post',
      authorId: author.id,
      slug: 'draft-post',
      published: false,
      draft: true,
    })

    expect(await incrementPostViews('nonexistent-id', ctx.db)).toEqual([
      { reason: 'NOT_FOUND', identifier: 'nonexistent-id' },
      null,
    ])
    expect(await incrementPostViews(draft.id, ctx.db)).toEqual([
      { reason: 'NOT_FOUND', identifier: draft.id },
      null,
    ])

    const draftRow = await ctx.db.query.posts.findFirst({
      where: eq(posts.id, draft.id),
      columns: { viewsCount: true },
    })
    expect(draftRow?.viewsCount).toBe(0)
  })
})
