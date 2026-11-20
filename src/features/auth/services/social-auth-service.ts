import type { SupportedOAuthProvider } from '@/config/o-auth-providers'
import { signIn } from '@/lib/auth/auth-client'
import { error, okay, type Result, tryCatchResult } from '@/utils/result'
import type { SocialAuthError } from '../types/errors'

export interface SocialSignInResponse {
  error: { code?: string } | null
}

export interface SocialAuthServiceDeps {
  signInSocial?: (params: {
    provider: SupportedOAuthProvider
    callbackURL: string
  }) => Promise<SocialSignInResponse>
}

function mapSocialAuthErrorCode(code: string | undefined): SocialAuthError {
  switch (code) {
    case 'OAUTH_CALLBACK_ERROR':
      return { reason: 'OAUTH_CALLBACK_ERROR' }
    case 'ACCESS_DENIED':
      return { reason: 'ACCESS_DENIED' }
    case 'OAUTH_CREATE_USER_ERROR':
      return { reason: 'OAUTH_CREATE_USER_ERROR' }
    default:
      return { reason: 'UNKNOWN_ERROR' }
  }
}

export function socialAuthService(
  provider: SupportedOAuthProvider,
  callbackURL: string,
  deps: SocialAuthServiceDeps = {},
): Promise<Result<void, SocialAuthError>> {
  const executeSocialSignIn =
    deps.signInSocial ?? ((params) => signIn.social(params) as Promise<SocialSignInResponse>)

  return tryCatchResult<void, SocialAuthError, { reason: 'UNKNOWN_ERROR' }>(
    async () => {
      const res = await executeSocialSignIn({
        provider,
        callbackURL,
      })

      if (res.error) {
        return error(mapSocialAuthErrorCode(res.error.code))
      }

      return okay(undefined)
    },
    (thrown) => {
      console.error('Error in socialAuthService:', thrown)
      return { reason: 'UNKNOWN_ERROR' }
    },
  )
}
