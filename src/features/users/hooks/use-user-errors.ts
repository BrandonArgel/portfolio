'use client'

import { useTranslations } from 'next-intl'
import { useDomainErrorToast } from '@/hooks/use-domain-error-toast'
import type { UserError } from '../types/errors'

export function useUserErrors() {
  const t = useTranslations('features.users.errors')
  const { handleError: handleUserError } = useDomainErrorToast<UserError>(t)
  return { handleUserError }
}
