import { z } from 'zod'

/**
 * Normalizes an arbitrary category name or custom slug into lowercase kebab-case.
 * Strips diacritics/accents, collapses whitespace and punctuation into single hyphens,
 * and trims leading/trailing hyphens.
 */
export function normalizeCategorySlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(60, 'Category name is too long'),
  slug: z.string().trim().max(80, 'Category slug is too long').optional(),
  description: z.string().trim().max(240, 'Description is too long').optional().default(''),
})

export const updateCategorySchema = z.object({
  id: z.string().trim().min(1, 'Category ID is required'),
  name: z.string().trim().min(1, 'Category name is required').max(60, 'Category name is too long'),
  slug: z.string().trim().max(80, 'Category slug is too long').optional(),
  description: z.string().trim().max(240, 'Description is too long').optional().default(''),
})

export const deleteCategorySchema = z.object({
  id: z.string().trim().min(1, 'Category ID is required'),
})

export const mergeCategoriesSchema = z.object({
  sourceCategoryId: z.string().trim().min(1, 'Source category ID is required'),
  targetCategoryId: z.string().trim().min(1, 'Target category ID is required'),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>
export type MergeCategoriesInput = z.infer<typeof mergeCategoriesSchema>
