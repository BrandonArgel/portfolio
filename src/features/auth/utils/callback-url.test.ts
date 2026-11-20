import { describe, expect, test } from 'bun:test'
import { resolveSafeCallbackUrl } from './callback-url'

describe('resolveSafeCallbackUrl', () => {
  test('accepts relative internal paths', () => {
    expect(resolveSafeCallbackUrl('/dashboard')).toBe('/dashboard')
    expect(resolveSafeCallbackUrl('/blog/hello-world#comments')).toBe('/blog/hello-world#comments')
  })

  test('rejects external URLs, protocol-relative URLs, and empty values', () => {
    expect(resolveSafeCallbackUrl(null)).toBeNull()
    expect(resolveSafeCallbackUrl(undefined)).toBeNull()
    expect(resolveSafeCallbackUrl('')).toBeNull()
    expect(resolveSafeCallbackUrl('//evil.example/phish')).toBeNull()
    expect(resolveSafeCallbackUrl('https://evil.example')).toBeNull()
    expect(resolveSafeCallbackUrl('javascript:alert(1)')).toBeNull()
  })
})
