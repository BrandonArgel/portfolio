import { and, asc, count, desc, eq, inArray, or } from 'drizzle-orm'
import { cache } from 'react'
import { type AppDatabase, db } from '@/db'
import { categories, posts, postsToCategories } from '@/db/schema'
import { likeContains, withDatabaseError } from '@/db/utils'
import { error, okay, type Result } from '@/utils/result'
import type { AdminPostSort } from '../constants/blog'
import type {
  BlogCategory,
  BlogPost,
  BlogPostCardItem,
  DatabaseError,
  PostQueryError,
} from '../types'
import { calculateReadTime } from '../utils/calculate-read-time'
import { extractExcerpt } from '../utils/extract-excerpt'

export function getAllCategories(
  locale: string,
  database: AppDatabase = db,
): Promise<Result<BlogCategory[], DatabaseError>> {
  return withDatabaseError('Error fetching categories', async () => {
    const dbCategories = await database
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
  })
}

export async function countTotalPublishedPosts(
  locale?: string,
  database: AppDatabase = db,
): Promise<number> {
  try {
    const conditions = [eq(posts.published, true)]
    if (locale) {
      conditions.push(eq(posts.locale, locale))
    }

    const [res] = await database
      .select({ count: count(posts.id) })
      .from(posts)
      .where(and(...conditions))

    return res?.count ?? 0
  } catch (err) {
    console.error('Error counting published posts:', err)
    return 0
  }
}

export interface PublishedPostMeta {
  id: string
  slug: string
  locale: string
}

export function findPublishedPostMeta(
  postId: string,
  database: AppDatabase = db,
): Promise<PublishedPostMeta | null> {
  return database.query.posts
    .findFirst({
      where: and(eq(posts.id, postId), eq(posts.published, true)),
      columns: {
        id: true,
        slug: true,
        locale: true,
      },
    })
    .then((row) => row ?? null)
}

export interface PaginatedPosts {
  posts: BlogPostCardItem[]
  total: number
  totalPages: number
  currentPage: number
}

export interface PublishedPostsOptions {
  categorySlug?: string
  searchQuery?: string
  page?: number
  limit?: number
  sortBy?: string
}

export function getPublishedPosts(
  { categorySlug, searchQuery, page = 1, limit = 9, sortBy }: PublishedPostsOptions = {},
  database: AppDatabase = db,
): Promise<Result<PaginatedPosts, DatabaseError>> {
  return withDatabaseError('Error fetching published posts', async () => {
    const safePage = Math.max(1, page)
    const offset = (safePage - 1) * limit

    const conditions = [eq(posts.published, true)]

    if (searchQuery) {
      const searchCondition = or(
        likeContains(posts.title, searchQuery),
        likeContains(posts.content, searchQuery),
      )

      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    if (categorySlug) {
      conditions.push(
        inArray(
          posts.id,
          database
            .select({ postId: postsToCategories.postId })
            .from(postsToCategories)
            .innerJoin(categories, eq(categories.id, postsToCategories.categoryId))
            .where(eq(categories.slug, categorySlug)),
        ),
      )
    }

    const whereClause = and(...conditions)

    const [dbPosts, [countResult]] = await Promise.all([
      database.query.posts.findMany({
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
      database
        .select({ count: count(posts.id) })
        .from(posts)
        .where(whereClause),
    ])

    const total = countResult?.count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    const formatted: BlogPostCardItem[] = dbPosts.map((post) => {
      const mappedCategories = post.postCategories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      }))

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: extractExcerpt(post.content),
        description: post.description,
        coverImage: post.coverImage,
        categories: mappedCategories,
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
  })
}

// ── Admin Dashboard ─────────────────────────────────────────────

export interface AdminPostItem {
  id: string
  title: string
  slug: string
  coverImage: string | null
  published: boolean
  draft: boolean
  viewsCount: number
  locale: string
  authorId: string
  authorName: string
  lastEditorName: string | null
  createdAt: Date
  updatedAt: Date
  categories: BlogCategory[]
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
  sort?: AdminPostSort
  userId?: string
  isAdmin?: boolean
}

export function getAdminPosts(
  params: AdminPostsParams = {},
  database: AppDatabase = db,
): Promise<Result<PaginatedAdminPosts, DatabaseError>> {
  return withDatabaseError('Error fetching admin posts', async () => {
    const {
      page = 1,
      limit = 10,
      search,
      locale,
      categoryId,
      sort = 'latest',
      userId,
      isAdmin,
    } = params
    const safePage = Math.max(1, page)
    const offset = (safePage - 1) * limit

    const conditions = []

    // Non-admin users only see their own posts
    if (!isAdmin && userId) {
      conditions.push(eq(posts.authorId, userId))
    }

    // Search by title or slug
    if (search) {
      const searchCondition = or(
        likeContains(posts.title, search),
        likeContains(posts.slug, search),
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
          database
            .select({ postId: postsToCategories.postId })
            .from(postsToCategories)
            .where(eq(postsToCategories.categoryId, categoryId)),
        ),
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const orderByClause =
      sort === 'oldest'
        ? [asc(posts.createdAt)]
        : sort === 'views_desc'
          ? [desc(posts.viewsCount), desc(posts.createdAt)]
          : sort === 'views_asc'
            ? [asc(posts.viewsCount), desc(posts.createdAt)]
            : [desc(posts.createdAt)]

    const [dbPosts, [countResult]] = await Promise.all([
      database.query.posts.findMany({
        where: whereClause,
        orderBy: orderByClause,
        limit,
        offset,
        with: {
          author: { columns: { name: true } },
          lastEditor: { columns: { name: true } },
          postCategories: { with: { category: true } },
        },
      }),
      database
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
      draft: post.draft,
      viewsCount: post.viewsCount,
      locale: post.locale,
      authorId: post.authorId,
      authorName: post.author.name,
      lastEditorName: post.lastEditor?.name ?? null,
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
  })
}

export function getAllCategoriesAdmin(
  locale?: string,
  database: AppDatabase = db,
): Promise<Result<BlogCategory[], DatabaseError>> {
  return withDatabaseError<BlogCategory[]>('Error fetching all categories for admin', async () => {
    if (locale) {
      const dbCategories = await database
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

    const dbCategories = await database
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .orderBy(categories.name)

    return okay(dbCategories)
  })
}

export function getPostBySlug(
  slug: string,
  database: AppDatabase = db,
): Promise<Result<BlogPost, PostQueryError>> {
  return withDatabaseError<BlogPost, Extract<PostQueryError, { reason: 'POST_NOT_FOUND' }>>(
    `Error fetching post by slug ${slug}`,
    async () => {
      const dbPost = await database.query.posts.findFirst({
        where: eq(posts.slug, slug),
        with: postWithRelations,
      })

      return toPostResult(dbPost, slug)
    },
  )
}

/**
 * Fetches a published post by slug. When `locale` is given, the post written in that locale is
 * preferred (slugs are only unique per locale), falling back to any published post with that slug.
 * Wrapped in React `cache` so `generateMetadata`, the page and OG routes share a single query.
 */
export const getPublishedPostBySlug = cache(
  (
    slug: string,
    locale?: string,
    database: AppDatabase = db,
  ): Promise<Result<BlogPost, PostQueryError>> =>
    withDatabaseError<BlogPost, Extract<PostQueryError, { reason: 'POST_NOT_FOUND' }>>(
      `Error fetching published post by slug ${slug}`,
      async () => {
        const baseCondition = and(eq(posts.slug, slug), eq(posts.published, true))

        const localizedPost = locale
          ? await database.query.posts.findFirst({
              where: and(baseCondition, eq(posts.locale, locale)),
              with: postWithRelations,
            })
          : undefined

        const dbPost =
          localizedPost ??
          (await database.query.posts.findFirst({
            where: baseCondition,
            with: postWithRelations,
          }))

        return toPostResult(dbPost, slug)
      },
    ),
)

// ── Shared helpers ──────────────────────────────────────────────

const postWithRelations = {
  author: { columns: { name: true, image: true, emailVerified: true } },
  lastEditor: { columns: { name: true } },
  postCategories: { with: { category: true } },
} as const

type DbPostWithRelations = NonNullable<
  Awaited<ReturnType<typeof db.query.posts.findFirst<{ with: typeof postWithRelations }>>>
>

function toPostResult(
  dbPost: DbPostWithRelations | undefined,
  slug: string,
): Result<BlogPost, Extract<PostQueryError, { reason: 'POST_NOT_FOUND' }>> {
  if (!dbPost) {
    return error({ reason: 'POST_NOT_FOUND', identifier: slug })
  }

  return okay(mapDbPostToBlogPost(dbPost))
}

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
    description: dbPost.description,
    content: dbPost.content,
    draftContent: dbPost.draftContent,
    excerpt: extractExcerpt(dbPost.content),
    coverImage: dbPost.coverImage,
    coverImageAlt: dbPost.coverImageAlt,
    canonicalUrl: dbPost.canonicalUrl,
    locale: dbPost.locale,
    published: dbPost.published,
    draft: dbPost.draft,
    authorId: dbPost.authorId,
    authorName: dbPost.author.name,
    authorImage: dbPost.author.image,
    authorEmailVerified: Boolean(dbPost.author.emailVerified),
    lastModifiedBy: dbPost.lastModifiedBy,
    lastEditorName: dbPost.lastEditor?.name ?? null,
    translationGroupId: dbPost.translationGroupId ?? undefined,
    categories: mappedTags,
    readTimeMinutes: calculateReadTime(dbPost.content),
    viewsCount: dbPost.viewsCount,
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

export async function getAllPublishedPostsForSitemap(
  database: AppDatabase = db,
): Promise<SitemapPost[]> {
  try {
    const dbPosts = await database
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
  database: AppDatabase = db,
): Promise<{ locale: string; slug: string }[]> {
  try {
    const siblings = await database
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
  database: AppDatabase = db,
): Promise<string | null> {
  if (!translationGroupId) return null

  try {
    const post = await database.query.posts.findFirst({
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
