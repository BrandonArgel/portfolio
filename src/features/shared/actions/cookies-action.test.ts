import { describe, expect, mock, spyOn, test } from 'bun:test'

const mockSetCookie = mock(
  (_name: string, _value: string, _options?: Record<string, unknown>) => {},
)
let shouldThrowCookies = false

mock.module('next/headers', () => ({
  cookies: async () => {
    if (shouldThrowCookies) {
      throw new Error('Cookies unavailable')
    }
    return {
      set: mockSetCookie,
    }
  },
  headers: async () => new Headers(),
}))

const { setCookieConsent } = await import('./cookies-action')

describe('setCookieConsent', () => {
  test('writes cookie-consent cookie and returns okay(undefined)', async () => {
    mockSetCookie.mockClear()
    shouldThrowCookies = false

    const res = await setCookieConsent(true)

    expect(res).toEqual([null, undefined])
    expect(mockSetCookie).toHaveBeenCalledWith(
      'cookie-consent',
      'true',
      expect.objectContaining({
        maxAge: 31536000,
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
      }),
    )
  })

  test('returns COOKIE_WRITE_FAILED when setting cookies throws', async () => {
    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
    shouldThrowCookies = true

    const [err] = await setCookieConsent(false)

    shouldThrowCookies = false
    consoleSpy.mockRestore()
    expect(err?.reason).toBe('COOKIE_WRITE_FAILED')
  })
})
