import { signIn, signUp } from '@/lib/auth/auth-client'
import { error, okay, type Result } from '@/utils/result'
import type { SignInForm, SignUpForm } from '../schemas/auth.schema'

export type LoginError =
  | { reason: 'INVALID_CREDENTIALS' }
  | { reason: 'UNKNOWN_ERROR'; details: string }

export async function loginUserService(
  data: SignInForm,
): Promise<Result<{ name: string }, LoginError>> {
  const { data: sessionData, error: signInError } = await signIn.email({
    email: data.email,
    password: data.password,
    rememberMe: data.rememberMe || false,
  })

  if (signInError) {
    if (signInError.status === 401 || signInError.status === 403) {
      return error({ reason: 'INVALID_CREDENTIALS' })
    }
    return error({
      reason: 'UNKNOWN_ERROR',
      details: signInError.message || 'Failed to authenticate',
    })
  }

  return okay({ name: sessionData?.user?.name || '' })
}

export type RegisterError =
  | { reason: 'USER_ALREADY_EXISTS' }
  | { reason: 'WEAK_PASSWORD' }
  | { reason: 'AUTO_LOGIN_FAILED' }
  | { reason: 'UNKNOWN_ERROR'; details: string }

export async function registerUserService(
  data: Omit<SignUpForm, 'confirmPassword' | 'acceptTerms'>,
): Promise<Result<{ name: string }, RegisterError>> {
  const { error: signUpError } = await signUp.email({ ...data })

  if (signUpError) {
    if (signUpError.status === 409) return error({ reason: 'USER_ALREADY_EXISTS' })
    if (signUpError.status === 400) return error({ reason: 'WEAK_PASSWORD' })
    return error({
      reason: 'UNKNOWN_ERROR',
      details: signUpError.message || 'Registration failed',
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
