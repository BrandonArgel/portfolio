import { signIn, signUp } from '@/lib/auth/auth-client'
import { error, okay, type Result } from '@/utils/result'
import type { SignInForm, SignUpForm } from '../schemas/auth.schema'

export type LoginError =
  | { reason: 'INVALID_CREDENTIALS' }
  | { reason: 'UNKNOWN_ERROR' }
  | { reason: 'FORBIDDEN' }
  | { reason: 'UNVERIFIED_EMAIL' }
  | { reason: 'BANNED' }
  | { reason: 'RATE_LIMITED' }

export async function loginUserService(
  data: SignInForm,
): Promise<Result<{ name: string }, LoginError>> {
  const { data: sessionData, error: signInError } = await signIn.email({
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

  return okay({ name: sessionData?.user?.name || '' })
}

export type RegisterError =
  | { reason: 'USER_ALREADY_EXISTS' }
  | { reason: 'WEAK_PASSWORD' }
  | { reason: 'AUTO_LOGIN_FAILED' }
  | { reason: 'UNKNOWN_ERROR' }

export async function registerUserService(
  data: Omit<SignUpForm, 'confirmPassword' | 'acceptTerms'>,
): Promise<Result<{ name: string }, RegisterError>> {
  const { error: signUpError } = await signUp.email({ ...data })

  if (signUpError) {
    if (signUpError.status === 409) return error({ reason: 'USER_ALREADY_EXISTS' })
    if (signUpError.status === 400) return error({ reason: 'WEAK_PASSWORD' })
    return error({
      reason: 'UNKNOWN_ERROR',
    })
  }

  const [loginErr, user] = await loginUserService({
    email: data.email,
    password: data.password,
    rememberMe: false,
  })

  if (loginErr) {
    return error({ reason: 'AUTO_LOGIN_FAILED' })
  }

  return okay(user)
}
