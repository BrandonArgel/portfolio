import { describe, expect, test } from 'bun:test'
import { contactMessageSchema } from './contact-schema'

describe('contactMessageSchema', () => {
  test('accepts a valid contact submission', () => {
    const result = contactMessageSchema.safeParse({
      name: 'Brandon',
      email: 'brandon@example.com',
      subject: 'Project Inquiry',
      message: 'Hello, I would love to collaborate on a project.',
    })

    expect(result.success).toBe(true)
  })

  test('rejects invalid email and fields shorter than minimum bounds', () => {
    expect(
      contactMessageSchema.safeParse({
        name: 'A',
        email: 'invalid-email',
        subject: 'Hi',
        message: 'Too short',
      }).success,
    ).toBe(false)
  })
})
