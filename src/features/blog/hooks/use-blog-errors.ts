'use client'

import { useTranslations } from 'next-intl'
import { sileo } from 'sileo'
import type { BlogError } from '../types/errors'

export function useBlogErrors() {
  const t = useTranslations('features.blog.errors')
  const tGlobal = useTranslations('common.errors')

  const handleBlogError = (err: BlogError) => {
    const errorMessages = {
      NOT_FOUND: {
        title: t('NOT_FOUND.title'),
        description: t('NOT_FOUND.description'),
      },
      UNAUTHORIZED: {
        title: t('UNAUTHORIZED.title'),
        description: t('UNAUTHORIZED.description'),
      },
      FORBIDDEN: {
        title: t('FORBIDDEN.title'),
        description: t('FORBIDDEN.description'),
      },
      DATABASE_ERROR: {
        title: t('DATABASE_ERROR.title'),
        description: t('DATABASE_ERROR.description'),
      },
      VALIDATION_ERROR: {
        title: t('VALIDATION_ERROR.title'),
        description:
          err.reason === 'VALIDATION_ERROR' ? err.message : t('VALIDATION_ERROR.description'),
      },
    } satisfies Record<BlogError['reason'], { title: string; description: string }>

    const defaultErrorMessage = {
      title: tGlobal('unexpected_title'),
      description: tGlobal('unexpected_description'),
    }

    const message = errorMessages[err.reason as keyof typeof errorMessages] || defaultErrorMessage

    sileo.error(message)
  }

  return { handleBlogError }
}
