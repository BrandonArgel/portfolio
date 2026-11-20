import { and, eq, ne, or } from 'drizzle-orm'
import { type AppDatabase, db } from '@/db'
import { categories, posts, postsToCategories } from '@/db/schema'
import { withDatabaseError } from '@/db/utils'
import { error, okay, type Result, tryCatchResult } from '@/utils/result'
import { normalizeCategorySlug } from '../schemas/category-schema'
import {
  isValidPostSlug,
  type SavePostInput,
  type TogglePublishStatusInput,
  validateSavePostInput,
} from '../schemas/post-schema'
import type { PostError } from '../types'

interface PostMutationActor {
  id: string
  name: string | null
  role: string
}

export interface SavedPostSnapshot {
  id: string
  title: string
  slug: string
  locale: string
  coverImageAlt: string | null
  canonicalUrl: string | null
  published: boolean
  draft: boolean
  updatedAt: string
  lastEditorName: string | null
}

export interface SavePostResult {
  post: SavedPostSnapshot
  postId: string
  slug: string
  previousSlug: string | null
  slugChanged: boolean
  published: boolean
  draft: boolean
  updatedAt: string
  lastEditorName: string | null
}

export interface DiscardDraftResult {
  postId: string
  slug: string
  locale: string
  content: string
  published: boolean
  draft: false
  updatedAt: string
  lastEditorName: string | null
}

export interface DeletePostResult {
  postId: string
  slug: string
  locale: string
}

export interface TogglePublishStatusResult {
  postId: string
  slug: string
  locale: string
  published: boolean
  draft: boolean
}

/**
 * Inspects SQLite / LibSQL error messages and codes to map unique constraint violations
 * on `(locale, slug)` (`idx_posts_locale_slug`) or `title` into typed `PostError` values.
 */
function mapDatabasePostError(
  thrown: unknown,
  context: { slug: string; title: string; locale: string },
): PostError {
  const rawMessage =
    thrown instanceof Error
      ? `${thrown.name} ${thrown.message} ${(thrown as { code?: string }).code ?? ''}`
      : String(thrown)
  const lower = rawMessage.toLowerCase()

  const isUniqueConstraint =
    lower.includes('unique constraint failed') ||
    lower.includes('sqlite_constraint_unique') ||
    lower.includes('sqlite_constraint') ||
    lower.includes('idx_posts_locale_slug')

  if (isUniqueConstraint) {
    if (lower.includes('posts.title') || lower.includes('idx_posts_title')) {
      return {
        reason: 'DUPLICATE_POST_TITLE',
        title: context.title,
      }
    }

    return {
      reason: 'DUPLICATE_POST_SLUG',
      slug: context.slug,
      locale: context.locale,
    }
  }

  return {
    reason: 'DATABASE_ERROR',
    details: thrown,
  }
}

async function assertUniquePostSlug(
  params: {
    locale: string
    slug: string
    excludeId?: string
  },
  database: AppDatabase,
): Promise<Result<true, Extract<PostError, { reason: 'DUPLICATE_POST_SLUG' }>>> {
  const slugAndLocale = and(eq(posts.locale, params.locale), eq(posts.slug, params.slug))
  const duplicateBySlug = await database.query.posts.findFirst({
    where: params.excludeId ? and(ne(posts.id, params.excludeId), slugAndLocale) : slugAndLocale,
    columns: { id: true, slug: true },
  })

  if (duplicateBySlug) {
    return error({
      reason: 'DUPLICATE_POST_SLUG',
      slug: params.slug,
      locale: params.locale,
    })
  }

  return okay(true)
}

async function syncPostCategories(
  postId: string,
  categoryNames: string[],
  database: AppDatabase,
): Promise<void> {
  if (categoryNames.length === 0) return

  for (const rawCategoryName of categoryNames) {
    const categoryName = rawCategoryName.trim()
    if (!categoryName) continue

    const categorySlug = normalizeCategorySlug(categoryName)
    if (!categorySlug) continue

    let category = await database.query.categories.findFirst({
      where: or(eq(categories.slug, categorySlug), eq(categories.name, categoryName)),
    })

    if (!category) {
      const inserted = await database
        .insert(categories)
        .values({ name: categoryName, slug: categorySlug })
        .onConflictDoNothing({ target: categories.name })
        .returning()

      if (inserted.length > 0) {
        category = inserted[0]
      } else {
        category = await database.query.categories.findFirst({
          where: or(eq(categories.slug, categorySlug), eq(categories.name, categoryName)),
        })
      }
    }

    if (category) {
      await database
        .insert(postsToCategories)
        .values({
          postId,
          categoryId: category.id,
        })
        .onConflictDoNothing()
    }
  }
}

/**
 * Creates or updates a blog post (supporting draft auto-save, manual draft save, publish, and unpublish).
 * Tracks `previousSlug` and `slugChanged` so the client editor can gracefully redirect without a 404.
 */
export async function savePost(
  rawInput: SavePostInput,
  actor: PostMutationActor,
  database: AppDatabase = db,
): Promise<Result<SavePostResult, PostError>> {
  const [validationErr, validatedInput] = validateSavePostInput(rawInput)
  if (validationErr) {
    return error(validationErr)
  }

  const {
    id,
    title,
    slug,
    description,
    content,
    locale,
    translationGroupId,
    intent,
    categories: categoryNames,
    coverImage,
    coverImageAlt,
    canonicalUrl,
  } = validatedInput

  const normalizedCoverImageAlt = coverImageAlt?.trim() || null
  const normalizedCanonicalUrl = canonicalUrl?.trim() || null

  return tryCatchResult<SavePostResult, PostError, PostError>(
    async () => {
      let postId = id
      let previousSlug: string | null = null
      let slugChanged = false

      const finalTranslationGroupId = translationGroupId || crypto.randomUUID()
      const now = new Date()

      let nextPublished = false
      let nextDraft = true

      if (postId) {
        const existingPost = await database.query.posts.findFirst({
          where: eq(posts.id, postId),
          columns: {
            id: true,
            slug: true,
            locale: true,
            authorId: true,
            content: true,
            draftContent: true,
            published: true,
          },
        })

        if (!existingPost) {
          return error({ reason: 'POST_NOT_FOUND', identifier: postId })
        }

        if (actor.role !== 'admin' && existingPost.authorId !== actor.id) {
          return error({ reason: 'FORBIDDEN' })
        }

        const [uniqueErr] = await assertUniquePostSlug(
          { locale, slug, excludeId: postId },
          database,
        )
        if (uniqueErr) return error(uniqueErr)

        previousSlug = existingPost.slug
        slugChanged = previousSlug !== slug

        let nextContent = existingPost.content
        let nextDraftContent: string | null = existingPost.draftContent

        if (intent === 'publish') {
          nextPublished = true
          nextDraft = false
          nextContent = content
          nextDraftContent = null
        } else if (intent === 'unpublish') {
          nextPublished = false
          nextDraft = true
          nextContent = existingPost.content || content
          nextDraftContent = content || existingPost.draftContent || existingPost.content
        } else if (existingPost.published) {
          nextPublished = true
          nextDraft = true
          nextContent = existingPost.content
          nextDraftContent = content
        } else {
          nextPublished = false
          nextDraft = true
          nextContent = content
          nextDraftContent = content
        }

        await database
          .update(posts)
          .set({
            title,
            slug,
            description,
            content: nextContent,
            draftContent: nextDraftContent,
            coverImage: coverImage ?? null,
            coverImageAlt: normalizedCoverImageAlt,
            canonicalUrl: normalizedCanonicalUrl,
            locale,
            translationGroupId: finalTranslationGroupId,
            published: nextPublished,
            draft: nextDraft,
            lastModifiedBy: actor.id,
            updatedAt: now,
          })
          .where(eq(posts.id, postId))

        await database.delete(postsToCategories).where(eq(postsToCategories.postId, postId))
      } else {
        const [uniqueErr] = await assertUniquePostSlug({ locale, slug }, database)
        if (uniqueErr) return error(uniqueErr)

        if (intent === 'publish') {
          nextPublished = true
          nextDraft = false
        } else {
          nextPublished = false
          nextDraft = true
        }

        const [newPost] = await database
          .insert(posts)
          .values({
            title,
            slug,
            description,
            content,
            draftContent: nextDraft ? content : null,
            coverImage: coverImage ?? null,
            coverImageAlt: normalizedCoverImageAlt,
            canonicalUrl: normalizedCanonicalUrl,
            locale,
            translationGroupId: finalTranslationGroupId,
            published: nextPublished,
            draft: nextDraft,
            authorId: actor.id,
            lastModifiedBy: actor.id,
            updatedAt: now,
          })
          .returning({ id: posts.id })

        if (!newPost) {
          return error({ reason: 'DATABASE_ERROR' })
        }

        postId = newPost.id
        previousSlug = null
        slugChanged = false
      }

      await syncPostCategories(postId, categoryNames, database)

      const updatedAtIso = now.toISOString()
      const snapshot: SavedPostSnapshot = {
        id: postId,
        title,
        slug,
        locale,
        coverImageAlt: normalizedCoverImageAlt,
        canonicalUrl: normalizedCanonicalUrl,
        published: nextPublished,
        draft: nextDraft,
        updatedAt: updatedAtIso,
        lastEditorName: actor.name,
      }

      return okay({
        post: snapshot,
        postId,
        slug,
        previousSlug,
        slugChanged,
        published: nextPublished,
        draft: nextDraft,
        updatedAt: updatedAtIso,
        lastEditorName: actor.name,
      })
    },
    (thrown) => {
      console.error('Error saving post:', thrown)
      return mapDatabasePostError(thrown, { slug, title, locale })
    },
  )
}

async function findAuthorizedPost(postId: string, actor: PostMutationActor, database: AppDatabase) {
  if (!postId.trim()) {
    return error({
      reason: 'VALIDATION_ERROR' as const,
      field: 'postId',
    })
  }

  const existingPost = await database.query.posts.findFirst({
    where: eq(posts.id, postId),
  })

  if (!existingPost) {
    return error({ reason: 'POST_NOT_FOUND' as const, identifier: postId })
  }

  if (actor.role !== 'admin' && existingPost.authorId !== actor.id) {
    return error({ reason: 'FORBIDDEN' as const })
  }

  return okay(existingPost)
}

/**
 * Discards unpublished draft changes on a published post, restoring the live `content`.
 */
export function discardPostDraft(
  postId: string,
  actor: PostMutationActor,
  database: AppDatabase = db,
): Promise<Result<DiscardDraftResult, PostError>> {
  return withDatabaseError<DiscardDraftResult, PostError>(
    'Error discarding draft changes',
    async () => {
      const [findErr, existingPost] = await findAuthorizedPost(postId, actor, database)
      if (findErr) return error(findErr)

      if (!existingPost.draft && existingPost.draftContent === null) {
        return error({ reason: 'NO_DRAFT_TO_DISCARD', identifier: postId })
      }

      const now = new Date()

      await database
        .update(posts)
        .set({
          draftContent: null,
          draft: false,
          lastModifiedBy: actor.id,
          updatedAt: now,
        })
        .where(eq(posts.id, postId))

      return okay({
        postId,
        slug: existingPost.slug,
        locale: existingPost.locale,
        content: existingPost.content,
        published: existingPost.published,
        draft: false,
        updatedAt: now.toISOString(),
        lastEditorName: actor.name,
      })
    },
  )
}

/**
 * Toggles the published status of a post from the admin dashboard list.
 */
export function togglePostPublishStatus(
  input: TogglePublishStatusInput,
  actor: PostMutationActor,
  database: AppDatabase = db,
): Promise<Result<TogglePublishStatusResult, PostError>> {
  const { postId, published } = input

  return withDatabaseError<TogglePublishStatusResult, PostError>(
    'Error toggling publish status',
    async () => {
      const [findErr, existingPost] = await findAuthorizedPost(postId, actor, database)
      if (findErr) return error(findErr)

      const candidateContent = published
        ? (existingPost.draftContent ?? existingPost.content)
        : existingPost.content

      if (published) {
        if (!existingPost.title.trim()) {
          return error({ reason: 'TITLE_REQUIRED' })
        }
        if (!existingPost.slug.trim()) {
          return error({ reason: 'SLUG_REQUIRED' })
        }
        if (!isValidPostSlug(existingPost.slug)) {
          return error({ reason: 'INVALID_SLUG_FORMAT', slug: existingPost.slug })
        }
        if (!candidateContent.trim()) {
          return error({ reason: 'CONTENT_REQUIRED' })
        }
      }

      const nextDraft = !published

      await database
        .update(posts)
        .set({
          published,
          draft: nextDraft,
          content: candidateContent,
          draftContent: published ? null : (existingPost.draftContent ?? existingPost.content),
          lastModifiedBy: actor.id,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId))

      return okay({
        postId,
        slug: existingPost.slug,
        locale: existingPost.locale,
        published,
        draft: nextDraft,
      })
    },
  )
}

/**
 * Permanently deletes a blog post and its category associations.
 * Restricted to administrators.
 */
export async function deletePost(
  postId: string,
  actor: PostMutationActor,
  database: AppDatabase = db,
): Promise<Result<DeletePostResult, PostError>> {
  if (!postId.trim()) {
    return error({
      reason: 'VALIDATION_ERROR',
      field: 'postId',
    })
  }

  if (actor.role !== 'admin') {
    return error({ reason: 'FORBIDDEN' })
  }

  return withDatabaseError<DeletePostResult, PostError>('Error deleting post', async () => {
    const existingPost = await database.query.posts.findFirst({
      where: eq(posts.id, postId),
      columns: {
        id: true,
        slug: true,
        locale: true,
      },
    })

    if (!existingPost) {
      return error({ reason: 'POST_NOT_FOUND', identifier: postId })
    }

    await database.delete(postsToCategories).where(eq(postsToCategories.postId, postId))
    await database.delete(posts).where(eq(posts.id, postId))

    return okay({
      postId: existingPost.id,
      slug: existingPost.slug,
      locale: existingPost.locale,
    })
  })
}
