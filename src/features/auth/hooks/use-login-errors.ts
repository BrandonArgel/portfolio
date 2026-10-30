'use client'

import { useTranslations } from 'next-intl'
import { sileo } from 'sileo'
import type { LoginError } from '../types/errors'

export function useLoginErrors() {
  const t = useTranslations('features.auth.login.errors')
  const tGlobal = useTranslations('common.errors')

  const handleLoginError = (error: LoginError) => {
    const errorMessages = {
      INVALID_CREDENTIALS: {
        title: t('INVALID_CREDENTIALS.title'),
        description: t('INVALID_CREDENTIALS.description'),
      },
      FORBIDDEN: {
        title: t('FORBIDDEN.title'),
        description: t('FORBIDDEN.description'),
      },
      UNVERIFIED_EMAIL: {
        title: t('UNVERIFIED_EMAIL.title'),
        description: t('UNVERIFIED_EMAIL.description'),
      },
      BANNED: {
        title: t('BANNED.title'),
        description: t('BANNED.description'),
      },
      RATE_LIMITED: {
        title: t('RATE_LIMITED.title'),
        description: t('RATE_LIMITED.description'),
      },
      UNKNOWN_ERROR: {
        title: tGlobal('unknown_title'),
        description: tGlobal('unknown_description'),
      },
    } satisfies Record<LoginError['reason'], { title: string; description: string }>

    const defaultErrorMessage = {
      title: tGlobal('unexpected_title'),
      description: tGlobal('unexpected_description'),
    }

    const message = errorMessages[error.reason as keyof typeof errorMessages] || defaultErrorMessage

    sileo.error(message)
  }

  return { handleLoginError }
}
