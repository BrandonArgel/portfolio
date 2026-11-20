import { describe, expect, spyOn, test } from 'bun:test'
import type { User } from '@/lib/auth/auth-client'
import type { LoginError } from '../types/errors'
import { loginService } from './login-service'

const CREDENTIALS = {
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true,
}

const MOCK_USER = {
  id: 'user-1',
  name: 'Brandon',
  email: 'user@example.com',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
} as User

describe('loginService', () => {
  test('returns okay(user) on successful sign-in', async () => {
    const res = await loginService(CREDENTIALS, {
      signInEmail: async () => ({ data: { user: MOCK_USER }, error: null }),
    })

    expect(res).toEqual([null, MOCK_USER])
  })

  test('maps known better-auth error codes and statuses to typed LoginError reasons', async () => {
    const cases: Array<[{ code?: string; status?: number }, LoginError['reason']]> = [
      [{ code: 'BANNED_USER' }, 'BANNED'],
      [{ code: 'EMAIL_NOT_VERIFIED' }, 'UNVERIFIED_EMAIL'],
      [{ code: 'INVALID_EMAIL_OR_PASSWORD' }, 'INVALID_CREDENTIALS'],
      [{ status: 401 }, 'INVALID_CREDENTIALS'],
      [{ status: 429 }, 'RATE_LIMITED'],
      [{ status: 403 }, 'FORBIDDEN'],
      [{ code: 'OTHER_ERROR', status: 500 }, 'UNKNOWN_ERROR'],
    ]

    for (const [signInError, expectedReason] of cases) {
      const [err] = await loginService(CREDENTIALS, {
        signInEmail: async () => ({ data: null, error: signInError }),
      })
      expect(err?.reason).toBe(expectedReason)
    }
  })

  test('returns UNKNOWN_ERROR when signInEmail rejects', async () => {
    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})

    const [err] = await loginService(CREDENTIALS, {
      signInEmail: async () => {
        throw new Error('Network unreachable')
      },
    })

    expect(err).toEqual({ reason: 'UNKNOWN_ERROR' })
    consoleSpy.mockRestore()
  })
})
