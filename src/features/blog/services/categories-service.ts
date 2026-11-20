import { and, asc, eq, inArray, ne, notInArray, sql } from 'drizzle-orm'
import { type AppDatabase, db } from '@/db'
import { categories, posts, postsToCategories } from '@/db/schema'
import { withDatabaseError } from '@/db/utils'
import { error, okay, type Result } from '@/utils/result'
import {
  type CreateCategoryInput,
  type MergeCategoriesInput,
  normalizeCategorySlug,
  type UpdateCategoryInput,
} from '../schemas/category-schema'
import type { AdminCategoryItem, CategoryError, DatabaseError } from '../types'

export interface DeleteCategoryResult {
  id: string
  name: string
  affectedPosts: number
}

export interface MergeCategoriesResult {
  sourceCategoryId: string
  targetCategoryId: string
  sourceName: string
  targetName: string
  movedPostsCount: number
}

export interface DeleteUnusedCategoriesResult {
  deletedCount: number
  deletedIds: string[]
}

interface NormalizedCategoryInput {
  name: string
  slug: string
  description: string
}

function normalizeCategoryInput(input: {
  name: string
  slug?: string
  description?: string
}): Result<NormalizedCategoryInput, Extract<CategoryError, { reason: 'VALIDATION_ERROR' }>> {
  const name = input.name.trim()
  const slug = normalizeCategorySlug(input.slug?.trim() || name)
  const description = input.description?.trim() ?? ''

  if (!name || !slug) {
    return error({ reason: 'VALIDATION_ERROR' })
  }

  return okay({ name, slug, description })
}

async function assertUniqueCategoryNameAndSlug(
  params: {
    name: string
    slug: string
    excludeId?: string
  },
  database: AppDatabase,
): Promise<
  Result<
    true,
    Extract<CategoryError, { reason: 'DUPLICATE_CATEGORY_NAME' | 'DUPLICATE_CATEGORY_SLUG' }>
  >
> {
  const nameMatch = sql`lower(${categories.name}) = lower(${params.name})`
  const existingByName = await database.query.categories.findFirst({
    where: params.excludeId ? and(ne(categories.id, params.excludeId), nameMatch) : nameMatch,
    columns: { id: true, name: true },
  })

  if (existingByName) {
    return error({
      reason: 'DUPLICATE_CATEGORY_NAME',
      name: existingByName.name,
    })
  }

  const slugMatch = eq(categories.slug, params.slug)
  const existingBySlug = await database.query.categories.findFirst({
    where: params.excludeId ? and(ne(categories.id, params.excludeId), slugMatch) : slugMatch,
    columns: { id: true, slug: true },
  })

  if (existingBySlug) {
    return error({
      reason: 'DUPLICATE_CATEGORY_SLUG',
      slug: existingBySlug.slug,
    })
  }

  return okay(true)
}

/**
 * Fetches all blog categories along with their post usage metrics
 * (`totalPosts`, `publishedPosts`, `draftPosts`).
 */
export function getAdminCategoriesWithMetrics(
  database: AppDatabase = db,
): Promise<Result<AdminCategoryItem[], DatabaseError>> {
  return withDatabaseError('Error fetching admin categories with metrics', async () => {
    const rows = await database
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        totalPosts: sql<number>`count(distinct ${posts.id})`.mapWith(Number),
        publishedPosts:
          sql<number>`count(distinct case when ${posts.published} = 1 then ${posts.id} end)`.mapWith(
            Number,
          ),
        draftPosts:
          sql<number>`count(distinct case when ${posts.published} = 0 then ${posts.id} end)`.mapWith(
            Number,
          ),
      })
      .from(categories)
      .leftJoin(postsToCategories, eq(categories.id, postsToCategories.categoryId))
      .leftJoin(posts, eq(postsToCategories.postId, posts.id))
      .groupBy(
        categories.id,
        categories.name,
        categories.slug,
        categories.description,
        categories.createdAt,
        categories.updatedAt,
      )
      .orderBy(asc(categories.name))

    const formatted: AdminCategoryItem[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? '',
      totalPosts: row.totalPosts ?? 0,
      publishedPosts: row.publishedPosts ?? 0,
      draftPosts: row.draftPosts ?? 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))

    return okay(formatted)
  })
}

/**
 * Creates a new blog category with normalized slug and unique name/slug validation.
 */
export function createCategory(
  input: CreateCategoryInput,
  database: AppDatabase = db,
): Promise<Result<AdminCategoryItem, CategoryError>> {
  return withDatabaseError<AdminCategoryItem, CategoryError>(
    'Error creating category',
    async () => {
      const [normErr, normalized] = normalizeCategoryInput(input)
      if (normErr) return error(normErr)

      const [uniqueErr] = await assertUniqueCategoryNameAndSlug(
        {
          name: normalized.name,
          slug: normalized.slug,
        },
        database,
      )
      if (uniqueErr) return error(uniqueErr)

      const now = new Date()
      const [inserted] = await database
        .insert(categories)
        .values({
          name: normalized.name,
          slug: normalized.slug,
          description: normalized.description,
          createdAt: now,
          updatedAt: now,
        })
        .returning()

      if (!inserted) {
        return error({ reason: 'DATABASE_ERROR' })
      }

      return okay({
        id: inserted.id,
        name: inserted.name,
        slug: inserted.slug,
        description: inserted.description ?? '',
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
      })
    },
  )
}

/**
 * Updates an existing category's name, slug, and description.
 * Because `postsToCategories` references `categories.id`, renaming or updating a category
 * automatically updates it across all linked articles.
 */
export function updateCategory(
  input: UpdateCategoryInput,
  database: AppDatabase = db,
): Promise<Result<AdminCategoryItem, CategoryError>> {
  return withDatabaseError<AdminCategoryItem, CategoryError>(
    'Error updating category',
    async () => {
      const existing = await database.query.categories.findFirst({
        where: eq(categories.id, input.id),
        columns: { id: true },
      })

      if (!existing) {
        return error({
          reason: 'CATEGORY_NOT_FOUND',
          identifier: input.id,
        })
      }

      const [normErr, normalized] = normalizeCategoryInput(input)
      if (normErr) return error(normErr)

      const [uniqueErr] = await assertUniqueCategoryNameAndSlug(
        {
          name: normalized.name,
          slug: normalized.slug,
          excludeId: input.id,
        },
        database,
      )
      if (uniqueErr) return error(uniqueErr)

      const now = new Date()
      const [updated] = await database
        .update(categories)
        .set({
          name: normalized.name,
          slug: normalized.slug,
          description: normalized.description,
          updatedAt: now,
        })
        .where(eq(categories.id, input.id))
        .returning()

      if (!updated) {
        return error({ reason: 'DATABASE_ERROR' })
      }

      const [metrics] = await database
        .select({
          totalPosts: sql<number>`count(distinct ${posts.id})`.mapWith(Number),
          publishedPosts:
            sql<number>`count(distinct case when ${posts.published} = 1 then ${posts.id} end)`.mapWith(
              Number,
            ),
          draftPosts:
            sql<number>`count(distinct case when ${posts.published} = 0 then ${posts.id} end)`.mapWith(
              Number,
            ),
        })
        .from(postsToCategories)
        .leftJoin(posts, eq(postsToCategories.postId, posts.id))
        .where(eq(postsToCategories.categoryId, input.id))

      return okay({
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description ?? '',
        totalPosts: metrics?.totalPosts ?? 0,
        publishedPosts: metrics?.publishedPosts ?? 0,
        draftPosts: metrics?.draftPosts ?? 0,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      })
    },
  )
}

/**
 * Deletes a category by ID and removes its `postsToCategories` associations.
 */
export function deleteCategory(
  id: string,
  database: AppDatabase = db,
): Promise<Result<DeleteCategoryResult, CategoryError>> {
  return withDatabaseError<DeleteCategoryResult, CategoryError>(
    'Error deleting category',
    async () => {
      const existing = await database.query.categories.findFirst({
        where: eq(categories.id, id),
        columns: { id: true, name: true },
      })

      if (!existing) {
        return error({
          reason: 'CATEGORY_NOT_FOUND',
          identifier: id,
        })
      }

      const linkedRows = await database
        .select({ postId: postsToCategories.postId })
        .from(postsToCategories)
        .where(eq(postsToCategories.categoryId, id))

      await database.delete(postsToCategories).where(eq(postsToCategories.categoryId, id))
      await database.delete(categories).where(eq(categories.id, id))

      return okay({
        id: existing.id,
        name: existing.name,
        affectedPosts: linkedRows.length,
      })
    },
  )
}

/**
 * Merges `sourceCategoryId` into `targetCategoryId`:
 * - Reassigns all `postsToCategories` rows from source to target (ignoring conflicts if a post already has both)
 * - Deletes the source category
 */
export async function mergeCategories(
  { sourceCategoryId, targetCategoryId }: MergeCategoriesInput,
  database: AppDatabase = db,
): Promise<Result<MergeCategoriesResult, CategoryError>> {
  if (sourceCategoryId === targetCategoryId) {
    return error({ reason: 'SAME_CATEGORY_MERGE' })
  }

  return withDatabaseError<MergeCategoriesResult, CategoryError>(
    'Error merging categories',
    async () => {
      const [sourceCategory, targetCategory] = await Promise.all([
        database.query.categories.findFirst({
          where: eq(categories.id, sourceCategoryId),
          columns: { id: true, name: true },
        }),
        database.query.categories.findFirst({
          where: eq(categories.id, targetCategoryId),
          columns: { id: true, name: true },
        }),
      ])

      if (!sourceCategory) {
        return error({
          reason: 'CATEGORY_NOT_FOUND',
          identifier: sourceCategoryId,
        })
      }

      if (!targetCategory) {
        return error({
          reason: 'TARGET_CATEGORY_NOT_FOUND',
          identifier: targetCategoryId,
        })
      }

      const sourceLinks = await database
        .select({ postId: postsToCategories.postId })
        .from(postsToCategories)
        .where(eq(postsToCategories.categoryId, sourceCategoryId))

      if (sourceLinks.length > 0) {
        await database
          .insert(postsToCategories)
          .values(
            sourceLinks.map((row) => ({
              postId: row.postId,
              categoryId: targetCategoryId,
            })),
          )
          .onConflictDoNothing()
      }

      await database
        .delete(postsToCategories)
        .where(eq(postsToCategories.categoryId, sourceCategoryId))
      await database.delete(categories).where(eq(categories.id, sourceCategoryId))
      await database
        .update(categories)
        .set({ updatedAt: new Date() })
        .where(eq(categories.id, targetCategoryId))

      return okay({
        sourceCategoryId,
        targetCategoryId,
        sourceName: sourceCategory.name,
        targetName: targetCategory.name,
        movedPostsCount: sourceLinks.length,
      })
    },
  )
}

/**
 * Deletes all unused/orphaned categories that have 0 associated posts in `postsToCategories`.
 */
export function deleteUnusedCategories(
  database: AppDatabase = db,
): Promise<Result<DeleteUnusedCategoriesResult, CategoryError>> {
  return withDatabaseError<DeleteUnusedCategoriesResult>(
    'Error deleting unused categories',
    async () => {
      const usedSubquery = database
        .selectDistinct({ categoryId: postsToCategories.categoryId })
        .from(postsToCategories)

      const unusedRows = await database
        .select({ id: categories.id })
        .from(categories)
        .where(notInArray(categories.id, usedSubquery))

      const unusedIds = unusedRows.map((row) => row.id)

      if (unusedIds.length === 0) {
        return okay({
          deletedCount: 0,
          deletedIds: [],
        })
      }

      await database.delete(categories).where(inArray(categories.id, unusedIds))

      return okay({
        deletedCount: unusedIds.length,
        deletedIds: unusedIds,
      })
    },
  )
}
