import { and, count, desc, eq, or } from 'drizzle-orm'
import { type AppDatabase, db } from '@/db'
import { sessions, users } from '@/db/schema'
import { likeContains, withDatabaseError } from '@/db/utils'
import { error, okay, type Result } from '@/utils/result'
import type { UserError, UserQueryError } from '../types/errors'

export type UserRole = 'admin' | 'editor' | 'user'

export interface AdminUserItem {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: string
  banned: boolean
  banReason: string | null
  banExpires: Date | null
  createdAt: Date
  updatedAt: Date
  providers: string[]
}

export interface GetAdminUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: string
}

export interface GetAdminUsersResult {
  users: AdminUserItem[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export interface UpdateUserRoleInput {
  userId: string
  newRole: UserRole
}

export interface UpdateUserRoleResult {
  userId: string
  newRole: UserRole
}

export interface BanUserInput {
  userId: string
  reason: string
  durationInDays: number | 'permanent'
}

export interface BanUserResult {
  userId: string
  banned: true
}

export interface UnbanUserResult {
  userId: string
  banned: false
}

async function ensureUserExists(
  userId: string,
  database: AppDatabase = db,
): Promise<Result<true, Extract<UserError, { reason: 'USER_NOT_FOUND' }>>> {
  const targetUser = await database.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true },
  })

  if (!targetUser) {
    return error({ reason: 'USER_NOT_FOUND', identifier: userId })
  }

  return okay(true)
}

export function getAdminUsers(
  { page = 1, limit = 10, search, role }: GetAdminUsersParams,
  database: AppDatabase = db,
): Promise<Result<GetAdminUsersResult, UserQueryError>> {
  return withDatabaseError('Error fetching admin users', async () => {
    const safePage = Math.max(1, page)
    const safeLimit = Math.max(1, limit)
    const offset = (safePage - 1) * safeLimit

    const conditions = []

    if (role && role !== '_all') {
      conditions.push(eq(users.role, role))
    }

    if (search?.trim()) {
      const term = search.trim()
      conditions.push(or(likeContains(users.name, term), likeContains(users.email, term)))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [dbUsers, [countResult]] = await Promise.all([
      database.query.users.findMany({
        where: whereClause,
        orderBy: [desc(users.createdAt)],
        limit: safeLimit,
        offset,
        with: {
          accounts: {
            columns: {
              providerId: true,
            },
          },
        },
      }),
      database
        .select({ count: count(users.id) })
        .from(users)
        .where(whereClause),
    ])

    const totalCount = countResult?.count ?? 0
    const totalPages = Math.max(1, Math.ceil(totalCount / safeLimit))

    const formattedUsers: AdminUserItem[] = dbUsers.map((u) => {
      const rawProviders = u.accounts?.map((a) => a.providerId) ?? []
      const providers = rawProviders.length > 0 ? Array.from(new Set(rawProviders)) : ['credential']

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: Boolean(u.emailVerified),
        image: u.image,
        role: u.role,
        banned: Boolean(u.banned),
        banReason: u.banReason,
        banExpires: u.banExpires,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        providers,
      }
    })

    return okay({
      users: formattedUsers,
      totalCount,
      totalPages,
      currentPage: safePage,
    })
  })
}

export function updateUserRole(
  { userId, newRole }: UpdateUserRoleInput,
  actorId: string,
  database: AppDatabase = db,
): Promise<
  Result<
    UpdateUserRoleResult,
    Extract<UserError, { reason: 'USER_NOT_FOUND' | 'CANNOT_DEMOTE_SELF' | 'DATABASE_ERROR' }>
  >
> {
  return withDatabaseError<
    UpdateUserRoleResult,
    Extract<UserError, { reason: 'USER_NOT_FOUND' | 'CANNOT_DEMOTE_SELF' }>
  >('Error updating user role', async () => {
    const [findErr] = await ensureUserExists(userId, database)
    if (findErr) return error(findErr)

    if (actorId === userId && newRole !== 'admin') {
      return error({ reason: 'CANNOT_DEMOTE_SELF' })
    }

    await database
      .update(users)
      .set({
        role: newRole,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    return okay({ userId, newRole })
  })
}

export async function banUser(
  { userId, reason, durationInDays }: BanUserInput,
  actorId: string,
  database: AppDatabase = db,
): Promise<
  Result<
    BanUserResult,
    Extract<UserError, { reason: 'USER_NOT_FOUND' | 'CANNOT_BAN_SELF' | 'DATABASE_ERROR' }>
  >
> {
  if (actorId === userId) {
    return error({ reason: 'CANNOT_BAN_SELF' })
  }

  return withDatabaseError<BanUserResult, Extract<UserError, { reason: 'USER_NOT_FOUND' }>>(
    'Error banning user',
    async () => {
      const [findErr] = await ensureUserExists(userId, database)
      if (findErr) return error(findErr)

      const banExpires =
        durationInDays === 'permanent'
          ? null
          : new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000)

      await database
        .update(users)
        .set({
          banned: true,
          banReason: reason.trim(),
          banExpires,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))

      // Terminate all active sessions for the banned user immediately
      await database.delete(sessions).where(eq(sessions.userId, userId))

      return okay({ userId, banned: true })
    },
  )
}

export function unbanUser(
  userId: string,
  database: AppDatabase = db,
): Promise<
  Result<UnbanUserResult, Extract<UserError, { reason: 'USER_NOT_FOUND' | 'DATABASE_ERROR' }>>
> {
  return withDatabaseError<UnbanUserResult, Extract<UserError, { reason: 'USER_NOT_FOUND' }>>(
    'Error unbanning user',
    async () => {
      const [findErr] = await ensureUserExists(userId, database)
      if (findErr) return error(findErr)

      await database
        .update(users)
        .set({
          banned: false,
          banReason: null,
          banExpires: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))

      return okay({ userId, banned: false })
    },
  )
}
