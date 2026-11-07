'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { db } from '@/db'
import { users } from '@/db/schema'
import { auth } from '@/lib/auth/auth'
import { error, okay, type Result } from '@/utils/result'
import {
  type CreateCategoryInput,
  createCategorySchema,
  type DeleteCategoryInput,
  deleteCategorySchema,
  type MergeCategoriesInput,
  mergeCategoriesSchema,
  type UpdateCategoryInput,
  updateCategorySchema,
} from '../schemas/category.schema'
import {
  createCategory,
  type DeleteCategoryResult,
  type DeleteUnusedCategoriesResult,
  deleteCategory,
  deleteUnusedCategories,
  type MergeCategoriesResult,
  mergeCategories,
  updateCategory,
} from '../services/categories-service'
import type { AdminCategoryItem, CategoryError } from '../types'

async function verifyCategoryAdminAccess(): Promise<Result<{ userId: string }, CategoryError>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return error({ reason: 'UNAUTHORIZED' })
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { banned: true, role: true },
    })

    if (!dbUser || dbUser.banned) {
      return error({ reason: 'FORBIDDEN' })
    }

    const role = dbUser.role ?? session.user.role
    if (role !== 'admin' && role !== 'editor') {
      return error({ reason: 'FORBIDDEN' })
    }

    return okay({ userId: session.user.id })
  } catch (err) {
    console.error('Error verifying category management access:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}

function revalidateCategoryPaths() {
  revalidatePath('/blog')
  revalidatePath('/dashboard/posts')
  revalidatePath('/dashboard/categories')
  for (const locale of ['en', 'es', 'fr']) {
    revalidatePath(`/${locale}/blog`)
    revalidatePath(`/${locale}/dashboard/posts`)
    revalidatePath(`/${locale}/dashboard/categories`)
  }
}

export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<Result<AdminCategoryItem, CategoryError>> {
  const [authErr] = await verifyCategoryAdminAccess()
  if (authErr) return error(authErr)

  const parsed = createCategorySchema.safeParse(input)
  if (!parsed.success) {
    return error({
      reason: 'VALIDATION_ERROR',
      message: parsed.error.issues[0]?.message,
    })
  }

  const [createErr, category] = await createCategory(parsed.data)
  if (createErr) return error(createErr)

  revalidateCategoryPaths()
  return okay(category)
}

export async function updateCategoryAction(
  input: UpdateCategoryInput,
): Promise<Result<AdminCategoryItem, CategoryError>> {
  const [authErr] = await verifyCategoryAdminAccess()
  if (authErr) return error(authErr)

  const parsed = updateCategorySchema.safeParse(input)
  if (!parsed.success) {
    return error({
      reason: 'VALIDATION_ERROR',
      message: parsed.error.issues[0]?.message,
    })
  }

  const [updateErr, category] = await updateCategory(parsed.data)
  if (updateErr) return error(updateErr)

  revalidateCategoryPaths()
  return okay(category)
}

export async function deleteCategoryAction(
  input: DeleteCategoryInput,
): Promise<Result<DeleteCategoryResult, CategoryError>> {
  const [authErr] = await verifyCategoryAdminAccess()
  if (authErr) return error(authErr)

  const parsed = deleteCategorySchema.safeParse(input)
  if (!parsed.success) {
    return error({
      reason: 'VALIDATION_ERROR',
      message: parsed.error.issues[0]?.message,
    })
  }

  const [deleteErr, result] = await deleteCategory(parsed.data.id)
  if (deleteErr) return error(deleteErr)

  revalidateCategoryPaths()
  return okay(result)
}

export async function mergeCategoriesAction(
  input: MergeCategoriesInput,
): Promise<Result<MergeCategoriesResult, CategoryError>> {
  const [authErr] = await verifyCategoryAdminAccess()
  if (authErr) return error(authErr)

  const parsed = mergeCategoriesSchema.safeParse(input)
  if (!parsed.success) {
    return error({
      reason: 'VALIDATION_ERROR',
      message: parsed.error.issues[0]?.message,
    })
  }

  const [mergeErr, result] = await mergeCategories(parsed.data)
  if (mergeErr) return error(mergeErr)

  revalidateCategoryPaths()
  return okay(result)
}

export async function deleteUnusedCategoriesAction(): Promise<
  Result<DeleteUnusedCategoriesResult, CategoryError>
> {
  const [authErr] = await verifyCategoryAdminAccess()
  if (authErr) return error(authErr)

  const [deleteErr, result] = await deleteUnusedCategories()
  if (deleteErr) return error(deleteErr)

  revalidateCategoryPaths()
  return okay(result)
}
