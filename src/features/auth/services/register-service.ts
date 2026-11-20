import { signUp, type User } from '@/lib/auth/auth-client'
import { error, okay, type Result, tryCatchResult } from '@/utils/result'
import type { SignUpForm } from '../schemas/auth-schema'
import type { RegisterError } from '../types/errors'
import { loginService } from './login-service'

export interface SignUpEmailResponse {
  error: { code?: string; status?: number } | null
}

export interface RegisterServiceDeps {
  signUpEmail?: (params: {
    email: string
    password: string
    name: string
  }) => Promise<SignUpEmailResponse>
  login?: typeof loginService
}

export function registerService(
  data: Omit<SignUpForm, 'confirmPassword' | 'acceptTerms'>,
  deps: RegisterServiceDeps = {},
): Promise<Result<User, RegisterError>> {
  const executeSignUp =
    deps.signUpEmail ?? ((params) => signUp.email(params) as Promise<SignUpEmailResponse>)
  const executeLogin = deps.login ?? loginService

  return tryCatchResult<User, RegisterError, { reason: 'UNKNOWN_ERROR' }>(
    async () => {
      const { error: signUpError } = await executeSignUp({
        email: data.email,
        password: data.password,
        name: data.name,
      })

      if (signUpError) {
        if (signUpError.code === 'USER_ALREADY_EXISTS') {
          return error({ reason: 'USER_ALREADY_EXISTS' })
        }
        if (signUpError.status === 429) {
          return error({ reason: 'RATE_LIMITED' })
        }
        if (signUpError.status === 403) {
          return error({ reason: 'FORBIDDEN' })
        }
        if (signUpError.code === 'INVALID_PASSWORD' || signUpError.code === 'WEAK_PASSWORD') {
          return error({ reason: 'WEAK_PASSWORD' })
        }

        return error({ reason: 'UNKNOWN_ERROR' })
      }

      const [loginErr, user] = await executeLogin({
        email: data.email,
        password: data.password,
        rememberMe: false,
      })

      if (loginErr) {
        return error({ reason: 'AUTO_LOGIN_FAILED' })
      }

      return okay(user)
    },
    (thrown) => {
      console.error('Error in registerService:', thrown)
      return { reason: 'UNKNOWN_ERROR' }
    },
  )
}
