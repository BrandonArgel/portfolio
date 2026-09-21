import { signIn, type User } from '@/lib/auth/auth-client'
import { error, okay, type Result } from '@/utils/result'
import type { SignInForm } from '../schemas/auth-schema'
import type { LoginError } from '../types/errors'

export async function loginService(data: SignInForm): Promise<Result<User, LoginError>> {
  const { data: signInData, error: signInError } = await signIn.email({
    email: data.email,
    password: data.password,
    rememberMe: data.rememberMe || false,
  })

  if (signInError) {
    if (signInError.code === 'BANNED_USER') {
      return error({ reason: 'BANNED' })
    }

    if (signInError.code === 'EMAIL_NOT_VERIFIED') {
      return error({ reason: 'UNVERIFIED_EMAIL' })
    }

    if (signInError.status === 401 || signInError.code === 'INVALID_EMAIL_OR_PASSWORD') {
      return error({ reason: 'INVALID_CREDENTIALS' })
    }

    if (signInError.status === 429) {
      return error({ reason: 'RATE_LIMITED' })
    }

    if (signInError.status === 403) {
      return error({ reason: 'FORBIDDEN' })
    }

    return error({ reason: 'UNKNOWN_ERROR' })
  }

  return okay(signInData.user)
}
