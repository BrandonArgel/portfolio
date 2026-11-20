'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { ActionButton } from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS,
  type SupportedOAuthProvider,
} from '@/config/o-auth-providers'
import { useSocialAuthErrors } from '@/features/auth/hooks/use-social-auth-errors'
import { socialAuthService } from '@/features/auth/services/social-auth-service'
import { getSafeCallbackUrlFromLocation } from '@/features/auth/utils/callback-url'
import { useMounted } from '@/hooks/use-mounted'
import { providerActions, useProviderStore } from '../store/use-provider-store'

export function SocialAuthButtons() {
  const t = useTranslations('features.auth')
  const { handleSocialAuthError } = useSocialAuthErrors()
  const lastUsedProvider = useProviderStore((state) => state.provider)
  const mounted = useMounted()
  const [pendingProvider, setPendingProvider] = useState<SupportedOAuthProvider | null>(null)

  const handleSocialSignIn = async (provider: SupportedOAuthProvider) => {
    setPendingProvider(provider)
    try {
      providerActions.setProvider(provider)

      const safeCallbackUrl =
        getSafeCallbackUrlFromLocation() ?? `/?loggedIn=social&provider=${provider}`

      const [err] = await socialAuthService(provider, safeCallbackUrl)
      if (err) {
        handleSocialAuthError(err)
      }
    } finally {
      setPendingProvider(null)
    }
  }

  return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
    const Icon = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].Icon
    const isLastUsed = provider === lastUsedProvider
    const showLastUsed = mounted && isLastUsed

    return (
      <ActionButton
        key={provider}
        onClick={() => handleSocialSignIn(provider)}
        isLoading={pendingProvider === provider}
        variant="outline"
        className="relative w-full"
        disabled={!mounted || pendingProvider !== null}
      >
        <Icon />
        {SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}

        {showLastUsed && (
          <Badge variant="softBlue" className="absolute -top-2 -right-2 font-normal">
            {t('last_used')}
          </Badge>
        )}
      </ActionButton>
    )
  })
}
