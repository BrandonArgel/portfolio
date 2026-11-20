import { describe, expect, test } from 'bun:test'
import {
  createCategorySchema,
  deleteCategorySchema,
  mergeCategoriesSchema,
  normalizeCategorySlug,
  updateCategorySchema,
} from './category-schema'

describe('normalizeCategorySlug', () => {
  test('normalizes accents, symbols, spaces, and edge hyphens', () => {
    expect(normalizeCategorySlug('  Programación & Diseño!  ')).toBe('programacion-diseno')
    expect(normalizeCategorySlug('C++ / TypeScript --- Next.js')).toBe('c-typescript-next-js')
    expect(normalizeCategorySlug('***')).toBe('')
  })
})

describe('category schemas', () => {
  test('createCategorySchema enforces name bounds and optional description default', () => {
    const ok = createCategorySchema.safeParse({ name: '  TypeScript  ' })
    expect(ok.success).toBe(true)
    if (ok.success) {
      expect(ok.data).toEqual({ name: 'TypeScript', description: '' })
    }

    expect(createCategorySchema.safeParse({ name: '   ' }).success).toBe(false)
    expect(createCategorySchema.safeParse({ name: 'a'.repeat(61) }).success).toBe(false)
    expect(createCategorySchema.safeParse({ name: 'Valid', slug: 's'.repeat(81) }).success).toBe(
      false,
    )
    expect(
      createCategorySchema.safeParse({ name: 'Valid', description: 'd'.repeat(241) }).success,
    ).toBe(false)
  })

  test('updateCategorySchema, deleteCategorySchema, mergeCategoriesSchema validate IDs', () => {
    expect(updateCategorySchema.safeParse({ id: 'cat-1', name: 'Go' }).success).toBe(true)
    expect(updateCategorySchema.safeParse({ id: ' ', name: 'Go' }).success).toBe(false)

    expect(deleteCategorySchema.safeParse({ id: 'cat-1' }).success).toBe(true)
    expect(deleteCategorySchema.safeParse({ id: '' }).success).toBe(false)

    expect(
      mergeCategoriesSchema.safeParse({ sourceCategoryId: 'a', targetCategoryId: 'b' }).success,
    ).toBe(true)
    expect(
      mergeCategoriesSchema.safeParse({ sourceCategoryId: '', targetCategoryId: 'b' }).success,
    ).toBe(false)
  })
})
