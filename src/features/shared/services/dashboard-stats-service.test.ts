import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test'
import { createTestDb, seedTestPost, seedTestUser, type TestDbContext } from '@/db/test-db'
import { getDashboardStats } from './dashboard-stats-service'

describe('getDashboardStats', () => {
  let ctx: TestDbContext

  beforeEach(async () => {
    ctx = await createTestDb()
  })

  afterEach(() => {
    ctx.close()
  })

  test('computes published/draft article counts, totalViews, and gates totalUsers on isAdmin', async () => {
    expect(await getDashboardStats(true, ctx.db)).toEqual([
      null,
      { totalPosts: 0, publishedPosts: 0, draftPosts: 0, totalUsers: 0, totalViews: 0 },
    ])

    const author = await seedTestUser(ctx.db, { id: 'u1', role: 'admin' })
    await seedTestUser(ctx.db, { id: 'u2', role: 'user' })

    await seedTestPost(ctx.db, {
      authorId: author.id,
      slug: 'pub-1',
      published: true,
      viewsCount: 45,
    })
    await seedTestPost(ctx.db, {
      authorId: author.id,
      slug: 'pub-2',
      published: true,
      viewsCount: 15,
    })
    await seedTestPost(ctx.db, {
      authorId: author.id,
      slug: 'draft-1',
      published: false,
      viewsCount: 5,
    })

    expect(await getDashboardStats(true, ctx.db)).toEqual([
      null,
      { totalPosts: 3, publishedPosts: 2, draftPosts: 1, totalUsers: 2, totalViews: 65 },
    ])

    expect(await getDashboardStats(false, ctx.db)).toEqual([
      null,
      { totalPosts: 3, publishedPosts: 2, draftPosts: 1, totalUsers: 0, totalViews: 65 },
    ])
  })

  test('returns DATABASE_ERROR when database fails', async () => {
    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
    ctx.close()

    const [err] = await getDashboardStats(true, ctx.db)
    expect(err?.reason).toBe('DATABASE_ERROR')
    consoleSpy.mockRestore()
  })
})
