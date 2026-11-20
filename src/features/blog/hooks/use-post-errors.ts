'use client'

import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { sileo } from 'sileo'
import { type ErrorToastMessage, translateErrorReason } from '@/hooks/use-domain-error-toast'
import { assertNever } from '@/utils/result'
import type { PostError } from '../types/errors'

export function usePostErrors() {
  const t = useTranslations('features.blog.posts.errors')

  const getPostErrorMessage = useCallback(
    (err: PostError): ErrorToastMessage => {
      switch (err.reason) {
        case 'VALIDATION_ERROR':
        case 'TITLE_REQUIRED':
        case 'SLUG_REQUIRED':
        case 'INVALID_SLUG_FORMAT':
        case 'CONTENT_REQUIRED':
        case 'POST_NOT_FOUND':
        case 'NO_DRAFT_TO_DISCARD':
        case 'UNAUTHORIZED':
        case 'FORBIDDEN':
        case 'DATABASE_ERROR':
        case 'UNKNOWN_ERROR':
          return translateErrorReason(t, err.reason)
        case 'DUPLICATE_POST_SLUG':
          return {
            title: t('DUPLICATE_POST_SLUG.title'),
            description: t('DUPLICATE_POST_SLUG.description', { slug: err.slug }),
          }
        case 'DUPLICATE_POST_TITLE':
          return {
            title: t('DUPLICATE_POST_TITLE.title'),
            description: t('DUPLICATE_POST_TITLE.description', { title: err.title }),
          }
        default:
          return assertNever(err)
      }
    },
    [t],
  )

  const handlePostError = useCallback(
    (err: PostError) => {
      sileo.error(getPostErrorMessage(err))
    },
    [getPostErrorMessage],
  )

  return { getPostErrorMessage, handlePostError }
}
