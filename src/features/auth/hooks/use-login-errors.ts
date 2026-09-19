'use client'

import { useTranslations } from 'next-intl'
import { sileo } from 'sileo'
import type { LoginError } from '../types/errors'

export function useLoginErrors() {
  const t = useTranslations('features.auth.login')
  const tGlobal = useTranslations('common')

  const handleLoginError = (error: LoginError) => {
    switch (error.reason) {
      case 'INVALID_CREDENTIALS':
        sileo.error({
          title: t('invalid_credentials_title'),
          description: t('invalid_credentials_description'),
        })
        break

      case 'FORBIDDEN':
        sileo.error({
          title: t('forbidden_title'),
          description: t('forbidden_description'),
        })
        break

      case 'UNVERIFIED_EMAIL':
        sileo.error({
          title: t('unverified_email_title'),
          description: t('unverified_email_description'),
        })
        break

      case 'BANNED':
        sileo.error({
          title: t('banned_title'),
          description: t('banned_description'),
        })
        break

      case 'RATE_LIMITED':
        sileo.error({
          title: t('rate_limited_title'),
          description: t('rate_limited_description'),
        })
        break

      case 'UNKNOWN_ERROR':
        sileo.error({
          title: tGlobal('errors.system_title'),
          description: tGlobal('errors.system_description'),
        })
        break

      default:
        error satisfies never
        sileo.error({
          title: tGlobal('errors.unexpected_title'),
          description: tGlobal('errors.unexpected_description'),
        })
    }
  }

  return { handleLoginError }
}
