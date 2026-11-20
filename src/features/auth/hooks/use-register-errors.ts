'use client'

import { useTranslations } from 'next-intl'
import { useDomainErrorToast } from '@/hooks/use-domain-error-toast'
import type { RegisterError } from '../types/errors'

export function useRegisterErrors() {
  const t = useTranslations('features.auth.register.errors')
  const { handleError: handleRegisterError } = useDomainErrorToast<RegisterError>(t)
  return { handleRegisterError }
}
