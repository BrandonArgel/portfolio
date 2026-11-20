import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test'
import { eq } from 'drizzle-orm'
import { accounts, sessions, users } from '@/db/schema'
import { createTestDb, seedTestUser, type TestDbContext } from '@/db/test-db'
import { banUser, getAdminUsers, unbanUser, updateUserRole } from './users-service'

describe('users-service', () => {
  let ctx: TestDbContext

  beforeEach(async () => {
    ctx = await createTestDb()
  })

  afterEach(() => {
    ctx.close()
  })

  test('getAdminUsers supports pagination, role filtering, escaped LIKE search, and providers', async () => {
    const alice = await seedTestUser(ctx.db, {
      id: 'alice',
      name: 'Alice 100%',
      email: 'alice@example.com',
      role: 'admin',
      createdAt: new Date('2026-01-03T00:00:00Z'),
    })
    await seedTestUser(ctx.db, {
      id: 'bob',
      name: 'Bob 100x',
      email: 'bob@example.com',
      role: 'editor',
      createdAt: new Date('2026-01-02T00:00:00Z'),
    })
    await seedTestUser(ctx.db, {
      id: 'carol',
      name: 'Carol Reader',
      email: 'carol@example.com',
      role: 'user',
      createdAt: new Date('2026-01-01T00:00:00Z'),
    })

    await ctx.db.insert(accounts).values([
      {
        id: 'acc-1',
        accountId: 'gh-1',
        providerId: 'github',
        userId: alice.id,
      },
      {
        id: 'acc-2',
        accountId: 'gh-2',
        providerId: 'github',
        userId: alice.id,
      },
      {
        id: 'acc-3',
        accountId: 'gg-1',
        providerId: 'google',
        userId: alice.id,
      },
    ])

    const [pageErr, page1] = await getAdminUsers({ page: 1, limit: 2 }, ctx.db)
    expect(pageErr).toBeNull()
    expect(page1?.totalCount).toBe(3)
    expect(page1?.totalPages).toBe(2)
    expect(page1?.users.map((u) => u.id)).toEqual(['alice', 'bob'])
    expect(page1?.users[0]?.providers).toEqual(['github', 'google'])
    expect(page1?.users[1]?.providers).toEqual(['credential'])

    const [roleErr, editors] = await getAdminUsers({ role: 'editor' }, ctx.db)
    expect(roleErr).toBeNull()
    expect(editors?.users.map((u) => u.id)).toEqual(['bob'])

    const [likeErr, percentMatches] = await getAdminUsers({ search: '100%' }, ctx.db)
    expect(likeErr).toBeNull()
    expect(percentMatches?.users.map((u) => u.id)).toEqual(['alice'])

    const [prefixErr, prefixMatches] = await getAdminUsers({ search: '100' }, ctx.db)
    expect(prefixErr).toBeNull()
    expect(prefixMatches?.users.map((u) => u.id)).toEqual(['alice', 'bob'])
  })

  test('updateUserRole enforces existence, prevents self-demotion, and updates role', async () => {
    const admin = await seedTestUser(ctx.db, { id: 'admin-1', role: 'admin' })
    const editor = await seedTestUser(ctx.db, { id: 'editor-1', role: 'editor' })

    expect(
      (await updateUserRole({ userId: 'missing', newRole: 'editor' }, admin.id, ctx.db))[0],
    ).toEqual({
      reason: 'USER_NOT_FOUND',
      identifier: 'missing',
    })

    expect(
      (await updateUserRole({ userId: admin.id, newRole: 'editor' }, admin.id, ctx.db))[0],
    ).toEqual({
      reason: 'CANNOT_DEMOTE_SELF',
    })

    const [stayErr, stayRes] = await updateUserRole(
      { userId: admin.id, newRole: 'admin' },
      admin.id,
      ctx.db,
    )
    expect(stayErr).toBeNull()
    expect(stayRes).toEqual({ userId: admin.id, newRole: 'admin' })

    const [err, res] = await updateUserRole(
      { userId: editor.id, newRole: 'admin' },
      admin.id,
      ctx.db,
    )
    expect(err).toBeNull()
    expect(res).toEqual({ userId: editor.id, newRole: 'admin' })

    const updated = await ctx.db.query.users.findFirst({ where: eq(users.id, editor.id) })
    expect(updated?.role).toBe('admin')
  })

  test('banUser and unbanUser manage ban state, active sessions, and self-ban guards', async () => {
    const admin = await seedTestUser(ctx.db, { id: 'admin-1', role: 'admin' })
    const target = await seedTestUser(ctx.db, { id: 'target-1', role: 'user' })

    await ctx.db.insert(sessions).values({
      id: 'sess-1',
      token: 'tok-1',
      userId: target.id,
      expiresAt: new Date(Date.now() + 86_400_000),
    })

    expect(
      (await banUser({ userId: admin.id, reason: 'Self', durationInDays: 7 }, admin.id, ctx.db))[0],
    ).toEqual({ reason: 'CANNOT_BAN_SELF' })

    expect(
      (
        await banUser({ userId: 'missing', reason: 'Spam', durationInDays: 7 }, admin.id, ctx.db)
      )[0],
    ).toEqual({ reason: 'USER_NOT_FOUND', identifier: 'missing' })

    const [banErr, banRes] = await banUser(
      { userId: target.id, reason: '  Abuse  ', durationInDays: 7 },
      admin.id,
      ctx.db,
    )
    expect(banErr).toBeNull()
    expect(banRes).toEqual({ userId: target.id, banned: true })

    const bannedRow = await ctx.db.query.users.findFirst({ where: eq(users.id, target.id) })
    expect(bannedRow?.banned).toBe(true)
    expect(bannedRow?.banReason).toBe('Abuse')
    expect(bannedRow?.banExpires).not.toBeNull()

    const remainingSessions = await ctx.db.query.sessions.findMany({
      where: eq(sessions.userId, target.id),
    })
    expect(remainingSessions).toHaveLength(0)

    const [permErr] = await banUser(
      { userId: target.id, reason: 'Severe', durationInDays: 'permanent' },
      admin.id,
      ctx.db,
    )
    expect(permErr).toBeNull()
    const permRow = await ctx.db.query.users.findFirst({ where: eq(users.id, target.id) })
    expect(permRow?.banExpires).toBeNull()

    expect((await unbanUser('missing', ctx.db))[0]).toEqual({
      reason: 'USER_NOT_FOUND',
      identifier: 'missing',
    })

    const [unbanErr, unbanRes] = await unbanUser(target.id, ctx.db)
    expect(unbanErr).toBeNull()
    expect(unbanRes).toEqual({ userId: target.id, banned: false })

    const restored = await ctx.db.query.users.findFirst({ where: eq(users.id, target.id) })
    expect(restored?.banned).toBe(false)
    expect(restored?.banReason).toBeNull()
    expect(restored?.banExpires).toBeNull()
  })

  test('returns DATABASE_ERROR when DB client is closed', async () => {
    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
    ctx.close()

    expect((await getAdminUsers({}, ctx.db))[0]?.reason).toBe('DATABASE_ERROR')
    expect((await unbanUser('u-1', ctx.db))[0]?.reason).toBe('DATABASE_ERROR')
    consoleSpy.mockRestore()
  })
})
