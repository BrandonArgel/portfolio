'use client'

import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { sileo } from 'sileo'
import { translateErrorReason } from '@/hooks/use-domain-error-toast'
import { assertNever } from '@/utils/result'
import type { CategoryError } from '../types/errors'

export function useCategoryErrors() {
  const t = useTranslations('features.blog.categories.errors')

  const handleCategoryError = useCallback(
    (err: CategoryError) => {
      switch (err.reason) {
        case 'CATEGORY_NOT_FOUND':
        case 'TARGET_CATEGORY_NOT_FOUND':
        case 'SAME_CATEGORY_MERGE':
        case 'UNAUTHORIZED':
        case 'FORBIDDEN':
        case 'VALIDATION_ERROR':
        case 'DATABASE_ERROR':
          sileo.error(translateErrorReason(t, err.reason))
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
        default:
          return assertNever(err)
      }
    },
    [t],
  )

  return { handleCategoryError }
}
