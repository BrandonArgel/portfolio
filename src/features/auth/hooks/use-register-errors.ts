'use client'

import { useTranslations } from 'next-intl'
import { sileo } from 'sileo'
import type { RegisterError } from '../types/errors'

export function useRegisterErrors() {
  const t = useTranslations('features.auth.register.errors')
  const tGlobal = useTranslations('common.errors')

  const handleRegisterError = (err: RegisterError) => {
    const errorMessages = {
      USER_ALREADY_EXISTS: {
        title: t('USER_ALREADY_EXISTS.title'),
        description: t('USER_ALREADY_EXISTS.description'),
      },
      WEAK_PASSWORD: {
        title: t('WEAK_PASSWORD.title'),
        description: t('WEAK_PASSWORD.description'),
      },
      AUTO_LOGIN_FAILED: {
        title: t('AUTO_LOGIN_FAILED.title'),
        description: t('AUTO_LOGIN_FAILED.description'),
      },
      RATE_LIMITED: {
        title: t('RATE_LIMITED.title'),
        description: t('RATE_LIMITED.description'),
      },
      FORBIDDEN: {
        title: t('FORBIDDEN.title'),
        description: t('FORBIDDEN.description'),
      },
      UNKNOWN_ERROR: {
        title: t('UNKNOWN_ERROR.title'),
        description: t('UNKNOWN_ERROR.description'),
      },
    } satisfies Record<RegisterError['reason'], { title: string; description: string }>

    const defaultErrorMessage = {
      title: tGlobal('unexpected_title'),
      description: tGlobal('unexpected_description'),
    }

    const message = errorMessages[err.reason as keyof typeof errorMessages] || defaultErrorMessage

    sileo.error(message)
  }

  return { handleRegisterError }
}
