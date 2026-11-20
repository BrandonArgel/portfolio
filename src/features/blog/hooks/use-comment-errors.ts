'use client'

import { useTranslations } from 'next-intl'
import { useDomainErrorToast } from '@/hooks/use-domain-error-toast'
import type { CommentError } from '../types/errors'

export function useCommentErrors() {
  const t = useTranslations('features.blog.reader.comments.errors')
  const { handleError: handleCommentError } = useDomainErrorToast<CommentError>(t)
  return { handleCommentError }
}
