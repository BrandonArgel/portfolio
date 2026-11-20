import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { postsToCategories } from '@/db/schema'
import {
  createTestDb,
  seedTestCategory,
  seedTestPost,
  seedTestUser,
  type TestDbContext,
} from '@/db/test-db'
import {
  countTotalPublishedPosts,
  findPublishedPostMeta,
  getAdminPosts,
  getAllCategories,
  getAllCategoriesAdmin,
  getAllPublishedPostsForSitemap,
  getPostBySlug,
  getPostTranslationFallback,
  getPostTranslationsByGroupId,
  getPublishedPostBySlug,
  getPublishedPosts,
} from './posts-query-service'

describe('posts-query-service', () => {
  let ctx: TestDbContext

  beforeEach(async () => {
    ctx = await createTestDb()
  })

  afterEach(() => {
    ctx.close()
  })

  test('queries published posts, categories, escaped search, and pagination', async () => {
    const author = await seedTestUser(ctx.db, { id: 'ed-1', role: 'editor', name: 'Brandon' })
    const tsCat = await seedTestCategory(ctx.db, {
      id: 'c1',
      name: 'TypeScript',
      slug: 'typescript',
    })
    const unusedCat = await seedTestCategory(ctx.db, { id: 'c2', name: 'Empty', slug: 'empty' })

    const older = await seedTestPost(ctx.db, {
      id: 'p1',
      authorId: author.id,
      title: '100% Fast Bun Guide',
      slug: 'fast-bun-guide',
      content: 'Content for Bun guide',
      locale: 'en',
      published: true,
      draft: false,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    })
    const newer = await seedTestPost(ctx.db, {
      id: 'p2',
      authorId: author.id,
      title: 'Next.js 16 Patterns',
      slug: 'nextjs-16-patterns',
      content: 'App Router 100x architecture',
      locale: 'en',
      published: true,
      draft: false,
      createdAt: new Date('2026-01-05T00:00:00Z'),
    })
    await seedTestPost(ctx.db, {
      id: 'p3',
      authorId: author.id,
      title: 'Unpublished Draft',
      slug: 'unpublished-draft',
      locale: 'en',
      published: false,
      draft: true,
      createdAt: new Date('2026-01-10T00:00:00Z'),
    })

    await ctx.db.insert(postsToCategories).values([
      { postId: older.id, categoryId: tsCat.id },
      { postId: newer.id, categoryId: tsCat.id },
    ])

    const [catErr, pubCats] = await getAllCategories('en', ctx.db)
    expect(catErr).toBeNull()
    expect(pubCats).toEqual([
      { id: tsCat.id, name: 'TypeScript', slug: 'typescript', postCount: 2 },
    ])

    const [adminCatErr, allCats] = await getAllCategoriesAdmin(undefined, ctx.db)
    expect(adminCatErr).toBeNull()
    expect(allCats?.map((c) => c.id).sort()).toEqual([tsCat.id, unusedCat.id].sort())

    expect(await countTotalPublishedPosts('en', ctx.db)).toBe(2)

    const [pubErr, pubPage] = await getPublishedPosts(
      { sortBy: 'oldest', limit: 1, page: 1 },
      ctx.db,
    )
    expect(pubErr).toBeNull()
    expect(pubPage?.total).toBe(2)
    expect(pubPage?.totalPages).toBe(2)
    expect(pubPage?.posts.map((p) => p.id)).toEqual(['p1'])

    const [searchErr, searchRes] = await getPublishedPosts({ searchQuery: '100%' }, ctx.db)
    expect(searchErr).toBeNull()
    expect(searchRes?.posts.map((p) => p.id)).toEqual(['p1'])

    const [partialErr, partialRes] = await getPublishedPosts({ searchQuery: '100' }, ctx.db)
    expect(partialErr).toBeNull()
    expect(partialRes?.posts.map((p) => p.id)).toEqual(['p2', 'p1'])

    const [catFilterErr, catFiltered] = await getPublishedPosts(
      { categorySlug: 'typescript' },
      ctx.db,
    )
    expect(catFilterErr).toBeNull()
    expect(catFiltered?.posts).toHaveLength(2)

    expect(await findPublishedPostMeta('p1', ctx.db)).toEqual({
      id: 'p1',
      slug: 'fast-bun-guide',
      locale: 'en',
    })
    expect(await findPublishedPostMeta('p3', ctx.db)).toBeNull()
  })

  test('getAdminPosts scopes non-admin editors to their own posts', async () => {
    const editorA = await seedTestUser(ctx.db, { id: 'ed-a', role: 'editor' })
    const editorB = await seedTestUser(ctx.db, { id: 'ed-b', role: 'editor' })

    await seedTestPost(ctx.db, {
      id: 'pa',
      authorId: editorA.id,
      title: '100% Admin Post A',
      slug: 'post-a',
      published: false,
    })
    await seedTestPost(ctx.db, {
      id: 'pb',
      authorId: editorB.id,
      title: '100x Admin Post B',
      slug: 'post-b',
      published: true,
    })

    const [, ownOnly] = await getAdminPosts({ userId: editorA.id, isAdmin: false }, ctx.db)
    expect(ownOnly?.posts.map((p) => p.id)).toEqual(['pa'])

    const [, allForAdmin] = await getAdminPosts({ userId: editorA.id, isAdmin: true }, ctx.db)
    expect(allForAdmin?.totalCount).toBe(2)

    const [percentErr, percentOnly] = await getAdminPosts(
      { userId: editorA.id, isAdmin: true, search: '100%' },
      ctx.db,
    )
    expect(percentErr).toBeNull()
    expect(percentOnly?.posts.map((p) => p.id)).toEqual(['pa'])

    const [slugErr, slugMatch] = await getAdminPosts(
      { userId: editorA.id, isAdmin: true, search: 'post-b' },
      ctx.db,
    )
    expect(slugErr).toBeNull()
    expect(slugMatch?.posts.map((p) => p.id)).toEqual(['pb'])
  })

  test('getPostBySlug, getPublishedPostBySlug, and translation/sitemap queries resolve locale variants', async () => {
    const author = await seedTestUser(ctx.db, { id: 'ed-1', role: 'editor' })
    const groupId = crypto.randomUUID()

    await seedTestPost(ctx.db, {
      id: 'en-post',
      authorId: author.id,
      slug: 'shared-slug',
      locale: 'en',
      published: true,
      translationGroupId: groupId,
    })
    await seedTestPost(ctx.db, {
      id: 'es-post',
      authorId: author.id,
      slug: 'shared-slug',
      locale: 'es',
      published: true,
      translationGroupId: groupId,
    })
    await seedTestPost(ctx.db, {
      id: 'draft-only',
      authorId: author.id,
      slug: 'secret-draft',
      locale: 'en',
      published: false,
      draft: true,
    })

    expect((await getPostBySlug('missing', ctx.db))[0]).toEqual({
      reason: 'POST_NOT_FOUND',
      identifier: 'missing',
    })
    expect((await getPublishedPostBySlug('secret-draft', 'en', ctx.db))[0]).toEqual({
      reason: 'POST_NOT_FOUND',
      identifier: 'secret-draft',
    })

    const [esErr, esPost] = await getPublishedPostBySlug('shared-slug', 'es', ctx.db)
    expect(esErr).toBeNull()
    expect(esPost?.id).toBe('es-post')

    const [fallbackErr, frFallback] = await getPublishedPostBySlug('shared-slug', 'fr', ctx.db)
    expect(fallbackErr).toBeNull()
    expect(frFallback).not.toBeNull()

    const siblings = await getPostTranslationsByGroupId(groupId, ctx.db)
    expect(siblings).toHaveLength(2)

    expect(await getPostTranslationFallback(groupId, 'es', ctx.db)).toBe('shared-slug')
    expect(await getPostTranslationFallback(groupId, 'fr', ctx.db)).toBeNull()

    const sitemapPosts = await getAllPublishedPostsForSitemap(ctx.db)
    expect(sitemapPosts).toHaveLength(2)
  })
})
