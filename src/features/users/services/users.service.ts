import { and, count, desc, eq, like, or } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'
import { error, okay, type Result } from '@/utils/result'

export type UserError =
  | { reason: 'DATABASE_ERROR'; details?: unknown }
  | { reason: 'NOT_FOUND'; identifier?: string }

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

function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&')
}

export async function getAdminUsers({
  page = 1,
  limit = 10,
  search,
  role,
}: GetAdminUsersParams): Promise<Result<GetAdminUsersResult, UserError>> {
  try {
    const safePage = Math.max(1, page)
    const safeLimit = Math.max(1, limit)
    const offset = (safePage - 1) * safeLimit

    const conditions = []

    if (role && role !== '_all') {
      conditions.push(eq(users.role, role))
    }

    if (search?.trim()) {
      const escaped = escapeLikePattern(search.trim())
      conditions.push(or(like(users.name, `%${escaped}%`), like(users.email, `%${escaped}%`)))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [dbUsers, [countResult]] = await Promise.all([
      db.query.users.findMany({
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
      db
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
  } catch (err) {
    console.error('Error fetching admin users:', err)
    return error({ reason: 'DATABASE_ERROR', details: err })
  }
}
