import { describe, expect, test } from 'bun:test'
import { banUserSchema, unbanUserSchema, updateUserRoleSchema } from './user-schema'

describe('user management schemas', () => {
  test('updateUserRoleSchema allows admin, editor, and user only', () => {
    for (const newRole of ['admin', 'editor', 'user'] as const) {
      expect(updateUserRoleSchema.safeParse({ userId: 'u-1', newRole }).success).toBe(true)
    }

    expect(updateUserRoleSchema.safeParse({ userId: 'u-1', newRole: 'superadmin' }).success).toBe(
      false,
    )
    expect(updateUserRoleSchema.safeParse({ userId: '  ', newRole: 'editor' }).success).toBe(false)
  })

  test('banUserSchema accepts permanent or positive numeric duration', () => {
    expect(
      banUserSchema.safeParse({ userId: 'u-1', reason: 'Spam', durationInDays: 'permanent' })
        .success,
    ).toBe(true)
    expect(
      banUserSchema.safeParse({ userId: 'u-1', reason: 'Spam', durationInDays: 7 }).success,
    ).toBe(true)

    expect(
      banUserSchema.safeParse({ userId: 'u-1', reason: 'Spam', durationInDays: 0 }).success,
    ).toBe(false)
    expect(
      banUserSchema.safeParse({ userId: 'u-1', reason: 'Spam', durationInDays: -1 }).success,
    ).toBe(false)
    expect(
      banUserSchema.safeParse({ userId: 'u-1', reason: '  ', durationInDays: 7 }).success,
    ).toBe(false)
  })

  test('unbanUserSchema requires non-empty userId', () => {
    expect(unbanUserSchema.safeParse({ userId: 'u-1' }).success).toBe(true)
    expect(unbanUserSchema.safeParse({ userId: '' }).success).toBe(false)
  })
})
