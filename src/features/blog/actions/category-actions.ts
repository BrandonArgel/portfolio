'use server'

import { revalidateLocalizedPaths } from '@/lib/actions/revalidate-localized-paths'
import { runAuthorizedAction } from '@/lib/actions/run-authorized-action'
import type { Result } from '@/utils/result'
import {
  type CreateCategoryInput,
  createCategorySchema,
  type DeleteCategoryInput,
  deleteCategorySchema,
  type MergeCategoriesInput,
  mergeCategoriesSchema,
  type UpdateCategoryInput,
  updateCategorySchema,
} from '../schemas/category-schema'
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

function revalidateCategoryPaths() {
  revalidateLocalizedPaths(['/blog', '/dashboard/posts', '/dashboard/categories'])
}

export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<Result<AdminCategoryItem, CategoryError>> {
  return runAuthorizedAction({
    role: 'editor',
    schema: createCategorySchema,
    input,
    handler: (data) => createCategory(data),
    onSuccess: revalidateCategoryPaths,
  })
}

export async function updateCategoryAction(
  input: UpdateCategoryInput,
): Promise<Result<AdminCategoryItem, CategoryError>> {
  return runAuthorizedAction({
    role: 'editor',
    schema: updateCategorySchema,
    input,
    handler: (data) => updateCategory(data),
    onSuccess: revalidateCategoryPaths,
  })
}

export async function deleteCategoryAction(
  input: DeleteCategoryInput,
): Promise<Result<DeleteCategoryResult, CategoryError>> {
  return runAuthorizedAction({
    role: 'editor',
    schema: deleteCategorySchema,
    input,
    handler: (data) => deleteCategory(data.id),
    onSuccess: revalidateCategoryPaths,
  })
}

export async function mergeCategoriesAction(
  input: MergeCategoriesInput,
): Promise<Result<MergeCategoriesResult, CategoryError>> {
  return runAuthorizedAction({
    role: 'editor',
    schema: mergeCategoriesSchema,
    input,
    handler: (data) => mergeCategories(data),
    onSuccess: revalidateCategoryPaths,
  })
}

export async function deleteUnusedCategoriesAction(): Promise<
  Result<DeleteUnusedCategoriesResult, CategoryError>
> {
  return runAuthorizedAction({
    role: 'editor',
    handler: () => deleteUnusedCategories(),
    onSuccess: revalidateCategoryPaths,
  })
}
