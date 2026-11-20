'use client'

import { useTranslations } from 'next-intl'
import { useDomainErrorToast } from '@/hooks/use-domain-error-toast'
import type { LikeError } from '../types/errors'

export function useLikeErrors() {
  const t = useTranslations('features.blog.like.errors')
  const { handleError: handleLikeError, getErrorMessage: getLikeErrorMessage } =
    useDomainErrorToast<LikeError>(t)

  return { handleLikeError, getLikeErrorMessage }
}
