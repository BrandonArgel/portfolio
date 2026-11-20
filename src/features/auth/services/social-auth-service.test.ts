import { describe, expect, spyOn, test } from 'bun:test'
import type { SocialAuthError } from '../types/errors'
import { socialAuthService } from './social-auth-service'

describe('socialAuthService', () => {
  test('returns okay(undefined) when OAuth request succeeds', async () => {
    const res = await socialAuthService('github', '/dashboard', {
      signInSocial: async () => ({ error: null }),
    })

    expect(res).toEqual([null, undefined])
  })

  test('maps OAuth error codes to SocialAuthError variants', async () => {
    const cases: Array<[string | undefined, SocialAuthError['reason']]> = [
      ['OAUTH_CALLBACK_ERROR', 'OAUTH_CALLBACK_ERROR'],
      ['ACCESS_DENIED', 'ACCESS_DENIED'],
      ['OAUTH_CREATE_USER_ERROR', 'OAUTH_CREATE_USER_ERROR'],
      ['SOMETHING_ELSE', 'UNKNOWN_ERROR'],
      [undefined, 'UNKNOWN_ERROR'],
    ]

    for (const [code, expectedReason] of cases) {
      const [err] = await socialAuthService('google', '/', {
        signInSocial: async () => ({ error: { code } }),
      })
      expect(err?.reason).toBe(expectedReason)
    }
  })

  test('returns UNKNOWN_ERROR when social sign-in throws', async () => {
    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})

    const [err] = await socialAuthService('discord', '/', {
      signInSocial: async () => {
        throw new Error('Popup blocked')
      },
    })

    expect(err).toEqual({ reason: 'UNKNOWN_ERROR' })
    consoleSpy.mockRestore()
  })
})
