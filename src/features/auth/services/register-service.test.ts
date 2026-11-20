import { describe, expect, spyOn, test } from 'bun:test'
import type { User } from '@/lib/auth/auth-client'
import { error, okay } from '@/utils/result'
import type { RegisterError } from '../types/errors'
import { registerService } from './register-service'

const INPUT = {
  name: 'Brandon',
  email: 'brandon@example.com',
  password: 'strongpassword',
}

const MOCK_USER = {
  id: 'user-1',
  name: 'Brandon',
  email: 'brandon@example.com',
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
} as User

describe('registerService', () => {
  test('returns okay(user) when sign-up and auto-login succeed', async () => {
    const res = await registerService(INPUT, {
      signUpEmail: async () => ({ error: null }),
      login: async () => okay(MOCK_USER),
    })

    expect(res).toEqual([null, MOCK_USER])
  })

  test('maps known sign-up error codes and statuses', async () => {
    const cases: Array<[{ code?: string; status?: number }, RegisterError['reason']]> = [
      [{ code: 'USER_ALREADY_EXISTS' }, 'USER_ALREADY_EXISTS'],
      [{ status: 429 }, 'RATE_LIMITED'],
      [{ status: 403 }, 'FORBIDDEN'],
      [{ code: 'INVALID_PASSWORD' }, 'WEAK_PASSWORD'],
      [{ code: 'WEAK_PASSWORD' }, 'WEAK_PASSWORD'],
      [{ code: 'UNEXPECTED' }, 'UNKNOWN_ERROR'],
    ]

    for (const [signUpError, expectedReason] of cases) {
      const [err] = await registerService(INPUT, {
        signUpEmail: async () => ({ error: signUpError }),
      })
      expect(err?.reason).toBe(expectedReason)
    }
  })

  test('returns AUTO_LOGIN_FAILED when sign-up succeeds but follow-up login fails', async () => {
    const [err] = await registerService(INPUT, {
      signUpEmail: async () => ({ error: null }),
      login: async () => error({ reason: 'INVALID_CREDENTIALS' }),
    })

    expect(err).toEqual({ reason: 'AUTO_LOGIN_FAILED' })
  })

  test('returns UNKNOWN_ERROR when signUpEmail throws', async () => {
    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})

    const [err] = await registerService(INPUT, {
      signUpEmail: async () => {
        throw new Error('Network error')
      },
    })

    expect(err).toEqual({ reason: 'UNKNOWN_ERROR' })
    consoleSpy.mockRestore()
  })
})
