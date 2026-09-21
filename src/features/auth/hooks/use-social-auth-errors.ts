'use client'

import { useTranslations } from 'next-intl'

export function useSocialErrors() {
  const t = useTranslations('features.auth.social')
  const tGlobal = useTranslations('common')

  const getSocialErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case 'OAUTH_CALLBACK_ERROR':
      case 'ACCESS_DENIED':
        return t('access_denied')
      case 'OAUTH_CREATE_USER_ERROR':
        return t('create_error')
      default:
        return tGlobal('system_description')
    }
  }

  return { getSocialErrorMessage }
}
