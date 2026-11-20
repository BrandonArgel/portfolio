'use client'

import { useTranslations } from 'next-intl'
import { useDomainErrorToast } from '@/hooks/use-domain-error-toast'
import type { ContactError } from '../types/errors'

export function useContactErrors() {
  const t = useTranslations('features.contact.errors')
  const { handleError: handleContactError } = useDomainErrorToast<ContactError>(t)
  return { handleContactError }
}
