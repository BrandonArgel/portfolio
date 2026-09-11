'use client'

import { ActionButton } from '@/components/ui/action-button'
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS,
} from '@/features/auth/config/o-auth-providers'
import { signIn } from '@/lib/auth/auth-client'

export function SocialAuthButtons() {
  return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
    const Icon = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].Icon

    return (
      <ActionButton
        key={provider}
        action={async () => {
          const res = await signIn.social({
            provider,
            callbackURL: `/?loggedIn=social&provider=${provider}`,
          })
          if (res.error) {
            return { error: true, message: res.error.message || 'Authentication failed' }
          }
        }}
        variant="outline"
        className="w-full"
      >
        <Icon />
        {SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}
      </ActionButton>
    )
  })
}
