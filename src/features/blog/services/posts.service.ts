import { and, asc, count, desc, eq, inArray, like, or } from 'drizzle-orm'
import { db } from '@/db'
import { categories, posts, postsToCategories } from '@/db/schema'
import { error, okay, type Result } from '@/utils/result'
import type { BlogCategory, BlogPost, BlogPostCardItem } from '../types'
import { calculateReadTime } from '../utils/calculate-read-time'
import { extractExcerpt } from '../utils/extract-excerpt'

export type PostError =
  | { reason: 'DATABASE_ERROR'; details?: unknown }
  | { reason: 'NOT_FOUND'; identifier?: string }

function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&')
}

export async function getAllCategories(locale: string): Promise<Result<BlogCategory[], PostError>> {
  try {
    const dbCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        postCount: count(posts.id),
      })
      .from(categories)
      .innerJoin(postsToCategories, eq(categories.id, postsToCategories.categoryId))
      .innerJoin(posts, eq(postsToCategories.postId, posts.id))
      .where(and(eq(posts.published, true), eq(posts.locale, locale)))
      .groupBy(categories.id, categories.name, categories.slug)
      .orderBy(categories.name)

    return okay(dbCategories)
  } catch (err) {
    console.error('Error fetching categories:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

export async function countTotalPublishedPosts(locale?: string): Promise<number> {
  try {
    const conditions = [eq(posts.published, true)]
    if (locale) {
      conditions.push(eq(posts.locale, locale))
    }

    const [res] = await db
      .select({ count: count(posts.id) })
      .from(posts)
      .where(and(...conditions))

    return res?.count ?? 0
  } catch (err) {
    console.error('Error counting published posts:', err)
    return 0
  }
}

export interface PaginatedPosts {
  posts: BlogPostCardItem[]
  total: number
  totalPages: number
  currentPage: number
}

export async function getPublishedPosts(
  categorySlug?: string,
  searchQuery?: string,
  page = 1,
  limit = 9,
  sortBy?: string,
): Promise<Result<PaginatedPosts, PostError>> {
  try {
    const safePage = Math.max(1, page)
    const offset = (safePage - 1) * limit

    const conditions = [eq(posts.published, true)]

    if (searchQuery) {
      const escaped = escapeLikePattern(searchQuery)
      const searchCondition = or(
        like(posts.title, `%${escaped}%`),
        like(posts.content, `%${escaped}%`),
      )

      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    if (categorySlug) {
      conditions.push(
        inArray(
          posts.id,
          db
            .select({ postId: postsToCategories.postId })
            .from(postsToCategories)
            .innerJoin(categories, eq(categories.id, postsToCategories.categoryId))
            .where(eq(categories.slug, categorySlug)),
        ),
      )
    }

    const whereClause = and(...conditions)

    const [dbPosts, [countResult]] = await Promise.all([
      db.query.posts.findMany({
        where: whereClause,
        orderBy: sortBy === 'oldest' ? [asc(posts.createdAt)] : [desc(posts.createdAt)],
        limit,
        offset,
        with: {
          postCategories: {
            with: {
              category: true,
            },
          },
        },
      }),
      db
        .select({ count: count(posts.id) })
        .from(posts)
        .where(whereClause),
    ])

    const total = countResult?.count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    const formatted: BlogPostCardItem[] = dbPosts.map((post) => {
      const mappedTags = post.postCategories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      }))

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: extractExcerpt(post.content),
        coverImage: post.coverImage,
        tags: mappedTags,
        readTimeMinutes: calculateReadTime(post.content),
        publishedAt: post.createdAt,
      }
    })

    return okay({
      posts: formatted,
      total,
      totalPages,
      currentPage: safePage,
    })
  } catch (err) {
    console.error('Error fetching published posts:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

// ── Admin Dashboard ─────────────────────────────────────────────

export interface AdminPostItem {
  id: string
  title: string
  slug: string
  coverImage: string | null
  published: boolean
  locale: string
  authorId: string
  authorName: string
  createdAt: Date
  updatedAt: Date
  categories: { id: string; name: string; slug: string }[]
}

export interface PaginatedAdminPosts {
  posts: AdminPostItem[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export interface AdminPostsParams {
  page?: number
  limit?: number
  search?: string
  locale?: string
  categoryId?: string
  userId?: string
  isAdmin?: boolean
}

export async function getAdminPosts(
  params: AdminPostsParams = {},
): Promise<Result<PaginatedAdminPosts, PostError>> {
  try {
    const { page = 1, limit = 10, search, locale, categoryId, userId, isAdmin } = params
    const safePage = Math.max(1, page)
    const offset = (safePage - 1) * limit

    const conditions = []

    // Non-admin users only see their own posts
    if (!isAdmin && userId) {
      conditions.push(eq(posts.authorId, userId))
    }

    // Search by title or slug
    if (search) {
      const escaped = escapeLikePattern(search)
      const searchCondition = or(
        like(posts.title, `%${escaped}%`),
        like(posts.slug, `%${escaped}%`),
      )
      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    // Filter by locale
    if (locale) {
      conditions.push(eq(posts.locale, locale))
    }

    // Filter by category
    if (categoryId) {
      conditions.push(
        inArray(
          posts.id,
          db
            .select({ postId: postsToCategories.postId })
            .from(postsToCategories)
            .where(eq(postsToCategories.categoryId, categoryId)),
        ),
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [dbPosts, [countResult]] = await Promise.all([
      db.query.posts.findMany({
        where: whereClause,
        orderBy: [desc(posts.createdAt)],
        limit,
        offset,
        with: {
          author: { columns: { name: true } },
          postCategories: { with: { category: true } },
        },
      }),
      db
        .select({ count: count(posts.id) })
        .from(posts)
        .where(whereClause),
    ])

    const totalCount = countResult?.count ?? 0
    const totalPages = Math.max(1, Math.ceil(totalCount / limit))

    const formatted: AdminPostItem[] = dbPosts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      coverImage: post.coverImage,
      published: post.published,
      locale: post.locale,
      authorId: post.authorId,
      authorName: post.author.name,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      categories: post.postCategories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
    }))

    return okay({
      posts: formatted,
      totalCount,
      totalPages,
      currentPage: safePage,
    })
  } catch (err) {
    console.error('Error fetching admin posts:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

export async function getAllCategoriesAdmin(
  locale?: string,
): Promise<Result<{ id: string; name: string; slug: string }[], PostError>> {
  try {
    if (locale) {
      const dbCategories = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .innerJoin(postsToCategories, eq(categories.id, postsToCategories.categoryId))
        .innerJoin(posts, eq(postsToCategories.postId, posts.id))
        .where(eq(posts.locale, locale))
        .groupBy(categories.id, categories.name, categories.slug)
        .orderBy(categories.name)

      return okay(dbCategories)
    }

    const dbCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .orderBy(categories.name)

    return okay(dbCategories)
  } catch (err) {
    console.error('Error fetching all categories for admin:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

export async function getPostBySlug(slug: string): Promise<Result<BlogPost, PostError>> {
  try {
    const dbPost = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
      with: postWithRelations,
    })

    if (!dbPost) {
      return error({ reason: 'NOT_FOUND', identifier: slug })
    }

    return okay(mapDbPostToBlogPost(dbPost))
  } catch (err) {
    console.error(`Error fetching post by slug ${slug}:`, err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<Result<BlogPost, PostError>> {
  try {
    const dbPost = await db.query.posts.findFirst({
      where: and(eq(posts.slug, slug), eq(posts.published, true)),
      with: postWithRelations,
    })

    if (!dbPost) {
      return error({ reason: 'NOT_FOUND', identifier: slug })
    }

    return okay(mapDbPostToBlogPost(dbPost))
  } catch (err) {
    console.error(`Error fetching published post by slug ${slug}:`, err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

// ── Shared helpers ──────────────────────────────────────────────

const postWithRelations = {
  author: { columns: { name: true } },
  postCategories: { with: { category: true } },
} as const

type DbPostWithRelations = NonNullable<
  Awaited<ReturnType<typeof db.query.posts.findFirst<{ with: typeof postWithRelations }>>>
>

function mapDbPostToBlogPost(dbPost: DbPostWithRelations): BlogPost {
  const mappedTags = dbPost.postCategories.map((pc) => ({
    id: pc.category.id,
    name: pc.category.name,
    slug: pc.category.slug,
  }))

  return {
    id: dbPost.id,
    title: dbPost.title,
    slug: dbPost.slug,
    content: dbPost.content,
    excerpt: extractExcerpt(dbPost.content),
    coverImage: dbPost.coverImage,
    locale: dbPost.locale,
    published: dbPost.published,
    authorId: dbPost.authorId,
    authorName: dbPost.author.name,
    translationGroupId: dbPost.translationGroupId ?? undefined,
    tags: mappedTags,
    readTimeMinutes: calculateReadTime(dbPost.content),
    createdAt: dbPost.createdAt,
    updatedAt: dbPost.updatedAt,
  }
}

export type SitemapPost = {
  slug: string
  locale: string
  createdAt: Date
  updatedAt: Date
  translationGroupId: string | null
}

export async function getAllPublishedPostsForSitemap(): Promise<SitemapPost[]> {
  try {
    const dbPosts = await db
      .select({
        slug: posts.slug,
        locale: posts.locale,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        translationGroupId: posts.translationGroupId,
      })
      .from(posts)
      .where(eq(posts.published, true))

    return dbPosts
  } catch (err) {
    console.error('Error fetching published posts for sitemap:', err)
    return []
  }
}

export async function getPostTranslationsByGroupId(
  translationGroupId: string,
): Promise<{ locale: string; slug: string }[]> {
  try {
    const siblings = await db
      .select({
        locale: posts.locale,
        slug: posts.slug,
      })
      .from(posts)
      .where(and(eq(posts.translationGroupId, translationGroupId), eq(posts.published, true)))

    return siblings
  } catch (err) {
    console.error('Error fetching post translations by group id:', err)
    return []
  }
}

export async function getPostTranslationFallback(
  translationGroupId: string | null | undefined,
  targetLocale: string,
): Promise<string | null> {
  if (!translationGroupId) return null

  try {
    const post = await db.query.posts.findFirst({
      where: and(
        eq(posts.translationGroupId, translationGroupId),
        eq(posts.locale, targetLocale),
        eq(posts.published, true),
      ),
      columns: { slug: true },
    })

    return post?.slug ?? null
  } catch (err) {
    console.error('Error fetching post translation fallback:', err)
    return null
  }
}
