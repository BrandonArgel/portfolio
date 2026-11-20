'use client'

import { useTranslations } from 'next-intl'
import { useDomainErrorToast } from '@/hooks/use-domain-error-toast'
import type { BlogError } from '../types/errors'

export function useBlogErrors() {
  const t = useTranslations('features.blog.errors')
  const { handleError: handleBlogError } = useDomainErrorToast<BlogError>(t)
  return { handleBlogError }
}
