import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { postsToCategories } from '@/db/schema'
import { createTestDb, seedTestPost, seedTestUser, type TestDbContext } from '@/db/test-db'
import {
  createCategory,
  deleteCategory,
  deleteUnusedCategories,
  getAdminCategoriesWithMetrics,
  mergeCategories,
  updateCategory,
} from './categories-service'

describe('categories-service', () => {
  let ctx: TestDbContext

  beforeEach(async () => {
    ctx = await createTestDb()
  })

  afterEach(() => {
    ctx.close()
  })

  test('createCategory validates input and enforces unique name (case-insensitive) and slug', async () => {
    expect((await createCategory({ name: '   ', description: '' }, ctx.db))[0]).toEqual({
      reason: 'VALIDATION_ERROR',
    })
    expect((await createCategory({ name: '***', description: '' }, ctx.db))[0]).toEqual({
      reason: 'VALIDATION_ERROR',
    })

    const [err, created] = await createCategory(
      { name: 'Programación Web', description: '  Artículos web  ' },
      ctx.db,
    )
    expect(err).toBeNull()
    expect(created?.slug).toBe('programacion-web')
    expect(created?.description).toBe('Artículos web')

    expect(
      (await createCategory({ name: 'programación web', description: '' }, ctx.db))[0],
    ).toEqual({
      reason: 'DUPLICATE_CATEGORY_NAME',
      name: 'Programación Web',
    })

    expect(
      (
        await createCategory(
          { name: 'Other Name', slug: 'programacion-web', description: '' },
          ctx.db,
        )
      )[0],
    ).toEqual({
      reason: 'DUPLICATE_CATEGORY_SLUG',
      slug: 'programacion-web',
    })
  })

  test('updateCategory updates fields cleanly and guards duplicates and missing IDs', async () => {
    expect(
      (await updateCategory({ id: 'missing', name: 'New', description: '' }, ctx.db))[0],
    ).toEqual({
      reason: 'CATEGORY_NOT_FOUND',
      identifier: 'missing',
    })

    const [, catA] = await createCategory({ name: 'TypeScript', description: '' }, ctx.db)
    const [, catB] = await createCategory({ name: 'Next.js', description: '' }, ctx.db)
    if (!catA || !catB) throw new Error('Expected categories to be created')

    expect(
      (await updateCategory({ id: catB.id, name: 'typescript', description: '' }, ctx.db))[0],
    ).toEqual({
      reason: 'DUPLICATE_CATEGORY_NAME',
      name: 'TypeScript',
    })

    const [selfUpdateErr, selfUpdated] = await updateCategory(
      { id: catA.id, name: 'TypeScript', slug: 'typescript', description: 'Updated desc' },
      ctx.db,
    )
    expect(selfUpdateErr).toBeNull()
    expect(selfUpdated?.description).toBe('Updated desc')
  })

  test('getAdminCategoriesWithMetrics, deleteCategory, mergeCategories, and deleteUnusedCategories', async () => {
    const author = await seedTestUser(ctx.db, { role: 'editor' })
    const pubPost = await seedTestPost(ctx.db, {
      authorId: author.id,
      slug: 'pub-post',
      published: true,
      draft: false,
    })
    const draftPost = await seedTestPost(ctx.db, {
      authorId: author.id,
      slug: 'draft-post',
      published: false,
      draft: true,
    })

    const [, cat1] = await createCategory({ name: 'Alpha', description: '' }, ctx.db)
    const [, cat2] = await createCategory({ name: 'Beta', description: '' }, ctx.db)
    const [, catUnused] = await createCategory({ name: 'Gamma', description: '' }, ctx.db)
    if (!cat1 || !cat2 || !catUnused) throw new Error('Expected seeded categories')

    // Link pubPost to both cat1 and cat2 (tests onConflictDoNothing during merge), draftPost to cat1
    await ctx.db.insert(postsToCategories).values([
      { postId: pubPost.id, categoryId: cat1.id },
      { postId: pubPost.id, categoryId: cat2.id },
      { postId: draftPost.id, categoryId: cat1.id },
    ])

    const [metricsErr, metrics] = await getAdminCategoriesWithMetrics(ctx.db)
    expect(metricsErr).toBeNull()
    expect(metrics?.find((c) => c.id === cat1.id)).toMatchObject({
      totalPosts: 2,
      publishedPosts: 1,
      draftPosts: 1,
    })
    expect(metrics?.find((c) => c.id === catUnused.id)?.totalPosts).toBe(0)

    expect(
      (await mergeCategories({ sourceCategoryId: cat1.id, targetCategoryId: cat1.id }, ctx.db))[0],
    ).toEqual({ reason: 'SAME_CATEGORY_MERGE' })

    expect(
      (await mergeCategories({ sourceCategoryId: 'nope', targetCategoryId: cat2.id }, ctx.db))[0],
    ).toEqual({ reason: 'CATEGORY_NOT_FOUND', identifier: 'nope' })

    expect(
      (await mergeCategories({ sourceCategoryId: cat1.id, targetCategoryId: 'nope' }, ctx.db))[0],
    ).toEqual({ reason: 'TARGET_CATEGORY_NOT_FOUND', identifier: 'nope' })

    const [mergeErr, mergeRes] = await mergeCategories(
      { sourceCategoryId: cat1.id, targetCategoryId: cat2.id },
      ctx.db,
    )
    expect(mergeErr).toBeNull()
    expect(mergeRes?.movedPostsCount).toBe(2)

    const [, afterMergeMetrics] = await getAdminCategoriesWithMetrics(ctx.db)
    expect(afterMergeMetrics?.find((c) => c.id === cat1.id)).toBeUndefined()
    expect(afterMergeMetrics?.find((c) => c.id === cat2.id)?.totalPosts).toBe(2)

    // Delete unused removes only Gamma (0 posts)
    const [cleanErr, cleanRes] = await deleteUnusedCategories(ctx.db)
    expect(cleanErr).toBeNull()
    expect(cleanRes).toEqual({ deletedCount: 1, deletedIds: [catUnused.id] })

    // Running deleteUnusedCategories when none remain
    expect(await deleteUnusedCategories(ctx.db)).toEqual([
      null,
      { deletedCount: 0, deletedIds: [] },
    ])

    // Delete Beta and verify affected post count
    expect((await deleteCategory('missing', ctx.db))[0]).toEqual({
      reason: 'CATEGORY_NOT_FOUND',
      identifier: 'missing',
    })
    const [delErr, delRes] = await deleteCategory(cat2.id, ctx.db)
    expect(delErr).toBeNull()
    expect(delRes).toEqual({ id: cat2.id, name: 'Beta', affectedPosts: 2 })
  })
})
