import { describe, expect, test } from 'bun:test'
import { signInSchema, signUpSchema } from './auth-schema'

describe('signInSchema', () => {
  test('accepts valid credentials and enforces password bounds', () => {
    expect(
      signInSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        rememberMe: false,
      }).success,
    ).toBe(true)

    expect(
      signInSchema.safeParse({
        email: 'not-email',
        password: 'short',
        rememberMe: true,
      }).success,
    ).toBe(false)

    expect(
      signInSchema.safeParse({
        email: 'user@example.com',
        password: 'x'.repeat(129),
        rememberMe: false,
      }).success,
    ).toBe(false)
  })
})

describe('signUpSchema', () => {
  const validPayload = {
    name: 'Brandon',
    email: 'brandon@example.com',
    password: 'strongpassword',
    confirmPassword: 'strongpassword',
    acceptTerms: true,
  }

  test('accepts valid sign-up payload', () => {
    expect(signUpSchema.safeParse(validPayload).success).toBe(true)
  })

  test('rejects rejected terms and mismatched passwords on confirmPassword path', () => {
    expect(signUpSchema.safeParse({ ...validPayload, acceptTerms: false }).success).toBe(false)

    const mismatch = signUpSchema.safeParse({
      ...validPayload,
      confirmPassword: 'differentpassword',
    })
    expect(mismatch.success).toBe(false)
    if (!mismatch.success) {
      expect(mismatch.error.issues[0]?.path).toEqual(['confirmPassword'])
    }
  })
})
