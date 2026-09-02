import { and, desc, eq, inArray, like, or } from 'drizzle-orm'
import { db } from '@/db'
import { categories, posts, postsToCategories } from '@/db/schema'
import type { BlogCategory, BlogPost, BlogPostCardItem } from '@/types/blog'
import { calculateReadTime } from '@/utils/calculate-read-time'
import { extractExcerpt } from '@/utils/extract-excerpt'
import { error, okay, type Result } from '@/utils/result'

export type PostError =
  | { reason: 'DATABASE_ERROR'; details?: unknown }
  | { reason: 'NOT_FOUND'; identifier?: string }

function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&')
}

export async function getAllCategories(): Promise<Result<BlogCategory[], PostError>> {
  try {
    const dbCategories = await db.query.categories.findMany({
      orderBy: [categories.name],
    })
    return okay(dbCategories)
  } catch (err) {
    console.error('Error fetching categories:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

export async function getPublishedPosts(
  categorySlug?: string,
  searchQuery?: string,
  limit = 10,
): Promise<Result<BlogPostCardItem[], PostError>> {
  try {
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

    const dbPosts = await db.query.posts.findMany({
      where: and(...conditions),
      orderBy: [desc(posts.createdAt)],
      limit,
      with: {
        postCategories: {
          with: {
            category: true,
          },
        },
      },
    })

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
        tags: mappedTags,
        readTimeMinutes: calculateReadTime(post.content),
        publishedAt: post.createdAt,
      }
    })

    return okay(formatted)
  } catch (err) {
    console.error('Error fetching published posts:', err)
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
