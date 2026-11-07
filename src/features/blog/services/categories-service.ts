import { and, asc, eq, inArray, ne, notInArray, sql } from 'drizzle-orm'
import { db } from '@/db'
import { categories, posts, postsToCategories } from '@/db/schema'
import { error, okay, type Result } from '@/utils/result'
import {
  type CreateCategoryInput,
  type MergeCategoriesInput,
  normalizeCategorySlug,
  type UpdateCategoryInput,
} from '../schemas/category.schema'
import type { AdminCategoryItem, CategoryError } from '../types'

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

/**
 * Fetches all blog categories along with their post usage metrics
 * (`totalPosts`, `publishedPosts`, `draftPosts`).
 */
export async function getAdminCategoriesWithMetrics(): Promise<
  Result<AdminCategoryItem[], CategoryError>
> {
  try {
    const rows = await db
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
  } catch (err) {
    console.error('Error fetching admin categories with metrics:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

/**
 * Creates a new blog category with normalized slug and unique name/slug validation.
 */
export async function createCategory(
  input: CreateCategoryInput,
): Promise<Result<AdminCategoryItem, CategoryError>> {
  try {
    const trimmedName = input.name.trim()
    const finalSlug = normalizeCategorySlug(input.slug?.trim() || trimmedName)
    const trimmedDescription = input.description?.trim() ?? ''

    if (!trimmedName || !finalSlug) {
      return error({
        reason: 'VALIDATION_ERROR',
        message: 'A valid category name and slug are required.',
      })
    }

    const existingByName = await db.query.categories.findFirst({
      where: sql`lower(${categories.name}) = lower(${trimmedName})`,
      columns: { id: true, name: true },
    })

    if (existingByName) {
      return error({
        reason: 'DUPLICATE_CATEGORY_NAME',
        name: existingByName.name,
      })
    }

    const existingBySlug = await db.query.categories.findFirst({
      where: eq(categories.slug, finalSlug),
      columns: { id: true, slug: true },
    })

    if (existingBySlug) {
      return error({
        reason: 'DUPLICATE_CATEGORY_SLUG',
        slug: existingBySlug.slug,
      })
    }

    const now = new Date()
    const [inserted] = await db
      .insert(categories)
      .values({
        name: trimmedName,
        slug: finalSlug,
        description: trimmedDescription,
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
  } catch (err) {
    console.error('Error creating category:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

/**
 * Updates an existing category's name, slug, and description.
 * Because `postsToCategories` references `categories.id`, renaming or updating a category
 * automatically updates it across all linked articles.
 */
export async function updateCategory(
  input: UpdateCategoryInput,
): Promise<Result<AdminCategoryItem, CategoryError>> {
  try {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.id, input.id),
    })

    if (!existing) {
      return error({
        reason: 'CATEGORY_NOT_FOUND',
        identifier: input.id,
      })
    }

    const trimmedName = input.name.trim()
    const finalSlug = normalizeCategorySlug(input.slug?.trim() || trimmedName)
    const trimmedDescription = input.description?.trim() ?? ''

    if (!trimmedName || !finalSlug) {
      return error({
        reason: 'VALIDATION_ERROR',
        message: 'A valid category name and slug are required.',
      })
    }

    const duplicateName = await db.query.categories.findFirst({
      where: and(
        ne(categories.id, input.id),
        sql`lower(${categories.name}) = lower(${trimmedName})`,
      ),
      columns: { id: true, name: true },
    })

    if (duplicateName) {
      return error({
        reason: 'DUPLICATE_CATEGORY_NAME',
        name: duplicateName.name,
      })
    }

    const duplicateSlug = await db.query.categories.findFirst({
      where: and(ne(categories.id, input.id), eq(categories.slug, finalSlug)),
      columns: { id: true, slug: true },
    })

    if (duplicateSlug) {
      return error({
        reason: 'DUPLICATE_CATEGORY_SLUG',
        slug: duplicateSlug.slug,
      })
    }

    const now = new Date()
    const [updated] = await db
      .update(categories)
      .set({
        name: trimmedName,
        slug: finalSlug,
        description: trimmedDescription,
        updatedAt: now,
      })
      .where(eq(categories.id, input.id))
      .returning()

    if (!updated) {
      return error({ reason: 'DATABASE_ERROR' })
    }

    const [metrics] = await db
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
  } catch (err) {
    console.error('Error updating category:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

/**
 * Deletes a category by ID and removes its `postsToCategories` associations.
 */
export async function deleteCategory(
  id: string,
): Promise<Result<DeleteCategoryResult, CategoryError>> {
  try {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.id, id),
      columns: { id: true, name: true },
    })

    if (!existing) {
      return error({
        reason: 'CATEGORY_NOT_FOUND',
        identifier: id,
      })
    }

    const linkedRows = await db
      .select({ postId: postsToCategories.postId })
      .from(postsToCategories)
      .where(eq(postsToCategories.categoryId, id))

    await db.delete(postsToCategories).where(eq(postsToCategories.categoryId, id))
    await db.delete(categories).where(eq(categories.id, id))

    return okay({
      id: existing.id,
      name: existing.name,
      affectedPosts: linkedRows.length,
    })
  } catch (err) {
    console.error('Error deleting category:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

/**
 * Merges `sourceCategoryId` into `targetCategoryId`:
 * - Reassigns all `postsToCategories` rows from source to target (ignoring conflicts if a post already has both)
 * - Deletes the source category
 */
export async function mergeCategories({
  sourceCategoryId,
  targetCategoryId,
}: MergeCategoriesInput): Promise<Result<MergeCategoriesResult, CategoryError>> {
  if (sourceCategoryId === targetCategoryId) {
    return error({ reason: 'SAME_CATEGORY_MERGE' })
  }

  try {
    const [sourceCategory, targetCategory] = await Promise.all([
      db.query.categories.findFirst({
        where: eq(categories.id, sourceCategoryId),
        columns: { id: true, name: true },
      }),
      db.query.categories.findFirst({
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

    const sourceLinks = await db
      .select({ postId: postsToCategories.postId })
      .from(postsToCategories)
      .where(eq(postsToCategories.categoryId, sourceCategoryId))

    if (sourceLinks.length > 0) {
      await db
        .insert(postsToCategories)
        .values(
          sourceLinks.map((row) => ({
            postId: row.postId,
            categoryId: targetCategoryId,
          })),
        )
        .onConflictDoNothing()
    }

    await db.delete(postsToCategories).where(eq(postsToCategories.categoryId, sourceCategoryId))
    await db.delete(categories).where(eq(categories.id, sourceCategoryId))
    await db
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
  } catch (err) {
    console.error('Error merging categories:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

/**
 * Deletes all unused/orphaned categories that have 0 associated posts in `postsToCategories`.
 */
export async function deleteUnusedCategories(): Promise<
  Result<DeleteUnusedCategoriesResult, CategoryError>
> {
  try {
    const usedSubquery = db
      .selectDistinct({ categoryId: postsToCategories.categoryId })
      .from(postsToCategories)

    const unusedRows = await db
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

    await db.delete(categories).where(inArray(categories.id, unusedIds))

    return okay({
      deletedCount: unusedIds.length,
      deletedIds: unusedIds,
    })
  } catch (err) {
    console.error('Error deleting unused categories:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}
