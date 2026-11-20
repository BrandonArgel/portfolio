import { signIn, type User } from '@/lib/auth/auth-client'
import { error, okay, type Result, tryCatchResult } from '@/utils/result'
import type { SignInForm } from '../schemas/auth-schema'
import type { LoginError } from '../types/errors'

export interface SignInEmailResponse {
  data: { user: User } | null
  error: { code?: string; status?: number } | null
}

export interface LoginServiceDeps {
  signInEmail?: (params: {
    email: string
    password: string
    rememberMe: boolean
  }) => Promise<SignInEmailResponse>
}

export function loginService(
  data: SignInForm,
  deps: LoginServiceDeps = {},
): Promise<Result<User, LoginError>> {
  const executeSignIn =
    deps.signInEmail ?? ((params) => signIn.email(params) as Promise<SignInEmailResponse>)

  return tryCatchResult<User, LoginError, { reason: 'UNKNOWN_ERROR' }>(
    async () => {
      const { data: signInData, error: signInError } = await executeSignIn({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
      })

      if (signInError || !signInData?.user) {
        if (signInError?.code === 'BANNED_USER') {
          return error({ reason: 'BANNED' })
        }

        if (signInError?.code === 'EMAIL_NOT_VERIFIED') {
          return error({ reason: 'UNVERIFIED_EMAIL' })
        }

        if (signInError?.status === 401 || signInError?.code === 'INVALID_EMAIL_OR_PASSWORD') {
          return error({ reason: 'INVALID_CREDENTIALS' })
        }

        if (signInError?.status === 429) {
          return error({ reason: 'RATE_LIMITED' })
        }

        if (signInError?.status === 403) {
          return error({ reason: 'FORBIDDEN' })
        }

        return error({ reason: 'UNKNOWN_ERROR' })
      }

      return okay(signInData.user)
    },
    (thrown) => {
      console.error('Error in loginService:', thrown)
      return { reason: 'UNKNOWN_ERROR' }
    },
  )
}
