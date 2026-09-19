'use client'

import { useTranslations } from 'next-intl'
import { ActionButton } from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS,
} from '@/features/auth/config/o-auth-providers'
import { useSocialErrors } from '@/features/auth/hooks/use-social-auth-errors'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useMounted } from '@/hooks/use-mounted'
import { signIn } from '@/lib/auth/auth-client'

export function SocialAuthButtons() {
  const t = useTranslations('features.auth')
  const { getSocialErrorMessage } = useSocialErrors()
  const [lastUsed] = useLocalStorage<string | null>('last-used-provider', null)
  const mounted = useMounted()

  return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
    const Icon = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].Icon
    const isLastUsed = lastUsed === provider
    const showLastUsed = mounted && isLastUsed

    return (
      <ActionButton
        key={provider}
        action={async () => {
          window.localStorage.setItem('last-used-provider', JSON.stringify(provider))

          const res = await signIn.social({
            provider,
            callbackURL: `/?loggedIn=social&provider=${provider}`,
          })

          if (res.error) {
            return { error: true, message: getSocialErrorMessage(res.error.code) }
          }
        }}
        variant="outline"
        className="relative w-full"
        disabled={!mounted}
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
