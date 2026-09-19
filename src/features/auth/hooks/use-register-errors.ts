'use client'

import { useTranslations } from 'next-intl'
import { sileo } from 'sileo'
import { useRouter } from '@/i18n/navigation'
import type { RegisterError } from '../types/errors'

export function useRegisterErrors() {
  const t = useTranslations('features.auth.register')
  const tGlobal = useTranslations('common')
  const router = useRouter()

  const handleRegisterError = (err: RegisterError) => {
    switch (err.reason) {
      case 'USER_ALREADY_EXISTS':
        sileo.error({
          title: t('email_in_use_title'),
          description: t('email_in_use_description'),
        })
        break
      case 'WEAK_PASSWORD':
        sileo.error({
          title: t('invalid_password_title'),
          description: t('invalid_password_description'),
        })
        break
      case 'AUTO_LOGIN_FAILED':
        sileo.warning({
          title: t('partial_success_title'),
          description: t('partial_success_description'),
        })
        router.push('/login')
        break
      case 'RATE_LIMITED':
        sileo.error({
          title: t('rate_limited_title'),
          description: t('rate_limited_description'),
        })
        break
      case 'FORBIDDEN':
        sileo.error({
          title: t('forbidden_title'),
          description: t('forbidden_description'),
        })
        break
      case 'UNKNOWN_ERROR':
        sileo.error({
          title: t('registration_failed_title'),
          description: t('registration_failed_description'),
        })
        break
      default:
        err satisfies never
        sileo.error({
          title: tGlobal('errors.system_title'),
          description: tGlobal('errors.system_description'),
        })
    }
  }

  return { handleRegisterError }
}
