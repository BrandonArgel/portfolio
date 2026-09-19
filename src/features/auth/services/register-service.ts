import { signUp, type User } from '@/lib/auth/auth-client'
import { error, okay, type Result } from '@/utils/result'
import type { SignUpForm } from '../schemas/auth-schema'
import type { RegisterError } from '../types/errors'
import { loginService } from './login-service'

export async function registerService(
  data: Omit<SignUpForm, 'confirmPassword' | 'acceptTerms'>,
): Promise<Result<User, RegisterError>> {
  const { error: signUpError } = await signUp.email({
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

  const [loginErr, user] = await loginService({
    email: data.email,
    password: data.password,
    rememberMe: false,
  })

  if (loginErr) {
    return error({ reason: 'AUTO_LOGIN_FAILED' })
  }

  return okay(user)
}
