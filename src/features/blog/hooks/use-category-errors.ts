'use client'

import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { sileo } from 'sileo'
import type { CategoryError } from '../types/errors'

export function useCategoryErrors() {
  const t = useTranslations('features.blog.categories.errors')
  const tGlobal = useTranslations('common.errors')

  const handleCategoryError = useCallback(
    (err: CategoryError) => {
      switch (err.reason) {
        case 'CATEGORY_NOT_FOUND':
          sileo.error({
            title: t('CATEGORY_NOT_FOUND.title'),
            description: t('CATEGORY_NOT_FOUND.description'),
          })
          return
        case 'TARGET_CATEGORY_NOT_FOUND':
          sileo.error({
            title: t('TARGET_CATEGORY_NOT_FOUND.title'),
            description: t('TARGET_CATEGORY_NOT_FOUND.description'),
          })
          return
        case 'DUPLICATE_CATEGORY_NAME':
          sileo.error({
            title: t('DUPLICATE_CATEGORY_NAME.title'),
            description: t('DUPLICATE_CATEGORY_NAME.description', { name: err.name }),
          })
          return
        case 'DUPLICATE_CATEGORY_SLUG':
          sileo.error({
            title: t('DUPLICATE_CATEGORY_SLUG.title'),
            description: t('DUPLICATE_CATEGORY_SLUG.description', { slug: err.slug }),
          })
          return
        case 'SAME_CATEGORY_MERGE':
          sileo.error({
            title: t('SAME_CATEGORY_MERGE.title'),
            description: t('SAME_CATEGORY_MERGE.description'),
          })
          return
        case 'UNAUTHORIZED':
          sileo.error({
            title: t('UNAUTHORIZED.title'),
            description: t('UNAUTHORIZED.description'),
          })
          return
        case 'FORBIDDEN':
          sileo.error({
            title: t('FORBIDDEN.title'),
            description: t('FORBIDDEN.description'),
          })
          return
        case 'VALIDATION_ERROR':
          sileo.error({
            title: t('VALIDATION_ERROR.title'),
            description: err.message || t('VALIDATION_ERROR.description'),
          })
          return
        case 'DATABASE_ERROR':
          sileo.error({
            title: t('DATABASE_ERROR.title'),
            description: t('DATABASE_ERROR.description'),
          })
          return
        default:
          sileo.error({
            title: tGlobal('unexpected_title'),
            description: tGlobal('unexpected_description'),
          })
      }
    },
    [t, tGlobal],
  )

  return { handleCategoryError }
}
