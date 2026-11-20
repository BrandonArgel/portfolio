'use client'

import { useTranslations } from 'next-intl'
import { sileo } from 'sileo'
import { translateErrorReason } from '@/hooks/use-domain-error-toast'
import { assertNever } from '@/utils/result'
import type { LoginError } from '../types/errors'

export function useLoginErrors() {
  const t = useTranslations('features.auth.login.errors')
  const tGlobal = useTranslations('common.errors')

  const handleLoginError = (error: LoginError) => {
    switch (error.reason) {
      case 'INVALID_CREDENTIALS':
      case 'FORBIDDEN':
      case 'UNVERIFIED_EMAIL':
      case 'BANNED':
      case 'RATE_LIMITED':
        sileo.error(translateErrorReason(t, error.reason))
        return
      case 'UNKNOWN_ERROR':
        sileo.error({
          title: tGlobal('unknown_title'),
          description: tGlobal('unknown_description'),
        })
        return
      default:
        return assertNever(error)
    }
  }

  return { handleLoginError }
}
