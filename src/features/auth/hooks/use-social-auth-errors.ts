'use client'

import { useTranslations } from 'next-intl'
import { sileo } from 'sileo'
import { translateErrorReason } from '@/hooks/use-domain-error-toast'
import { assertNever } from '@/utils/result'
import type { SocialAuthError } from '../types/errors'

export function useSocialAuthErrors() {
  const t = useTranslations('features.auth.social.errors')
  const tGlobal = useTranslations('common.errors')

  const handleSocialAuthError = (err: SocialAuthError) => {
    switch (err.reason) {
      case 'OAUTH_CALLBACK_ERROR':
      case 'ACCESS_DENIED':
      case 'OAUTH_CREATE_USER_ERROR':
        sileo.error(translateErrorReason(t, err.reason))
        return
      case 'UNKNOWN_ERROR':
        sileo.error({
          title: tGlobal('unknown_title'),
          description: tGlobal('unknown_description'),
        })
        return
      default:
        return assertNever(err)
    }
  }

  return { handleSocialAuthError }
}
