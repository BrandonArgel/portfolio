import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test'
import { createTestDb, seedTestUser, type TestDbContext } from '@/db/test-db'
import { type RequiredRole, verifyAccess } from './verify-access'

describe('verifyAccess', () => {
  let ctx: TestDbContext

  beforeEach(async () => {
    ctx = await createTestDb()
  })

  afterEach(() => {
    ctx.close()
  })

  test('returns UNAUTHORIZED when session or user id is missing', async () => {
    expect(await verifyAccess('user', { database: ctx.db, getSession: async () => null })).toEqual([
      { reason: 'UNAUTHORIZED' },
      null,
    ])

    expect(
      await verifyAccess('user', { database: ctx.db, getSession: async () => ({ user: {} }) }),
    ).toEqual([{ reason: 'UNAUTHORIZED' }, null])
  })

  test('returns FORBIDDEN when user does not exist in DB or is banned (even if admin)', async () => {
    expect(
      await verifyAccess('user', {
        database: ctx.db,
        getSession: async () => ({ user: { id: 'ghost', role: 'admin' } }),
      }),
    ).toEqual([{ reason: 'FORBIDDEN' }, null])

    const bannedAdmin = await seedTestUser(ctx.db, {
      id: 'banned-admin',
      role: 'admin',
      banned: true,
    })

    expect(
      await verifyAccess('user', {
        database: ctx.db,
        getSession: async () => ({ user: { id: bannedAdmin.id, role: 'admin' } }),
      }),
    ).toEqual([{ reason: 'FORBIDDEN' }, null])
  })

  test('enforces role hierarchy using fresh DB role values', async () => {
    const regularUser = await seedTestUser(ctx.db, { id: 'u1', role: 'user', name: 'Regular' })
    const editorUser = await seedTestUser(ctx.db, {
      id: 'e1',
      role: 'editor',
      name: 'Editor',
      image: 'https://cdn.example/e.png',
    })
    const adminUser = await seedTestUser(ctx.db, { id: 'a1', role: 'admin', name: 'Admin' })

    const matrix: Array<[string, RequiredRole, boolean]> = [
      [regularUser.id, 'user', true],
      [regularUser.id, 'editor', false],
      [regularUser.id, 'admin', false],
      [editorUser.id, 'user', true],
      [editorUser.id, 'editor', true],
      [editorUser.id, 'admin', false],
      [adminUser.id, 'user', true],
      [adminUser.id, 'editor', true],
      [adminUser.id, 'admin', true],
    ]

    for (const [userId, requiredRole, allowed] of matrix) {
      const [err, actor] = await verifyAccess(requiredRole, {
        database: ctx.db,
        getSession: async () => ({ user: { id: userId, role: 'user' } }),
      })

      if (allowed) {
        expect(err).toBeNull()
        expect(actor?.id).toBe(userId)
      } else {
        expect(err).toEqual({ reason: 'FORBIDDEN' })
      }
    }

    const [err, editorActor] = await verifyAccess('editor', {
      database: ctx.db,
      getSession: async () => ({ user: { id: editorUser.id } }),
    })
    expect(err).toBeNull()
    expect(editorActor).toEqual({
      id: 'e1',
      name: 'Editor',
      image: 'https://cdn.example/e.png',
      role: 'editor',
    })
  })

  test('returns DATABASE_ERROR when database query fails', async () => {
    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
    ctx.close()

    const [err] = await verifyAccess('user', {
      database: ctx.db,
      getSession: async () => ({ user: { id: 'any-id' } }),
    })

    expect(err?.reason).toBe('DATABASE_ERROR')
    consoleSpy.mockRestore()
  })
})
