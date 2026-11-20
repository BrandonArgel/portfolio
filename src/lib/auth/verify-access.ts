import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { type AppDatabase, db } from '@/db'
import { users } from '@/db/schema'
import { type DatabaseError, withDatabaseError } from '@/db/utils'
import { auth } from '@/lib/auth/auth'
import { error, okay, type Result } from '@/utils/result'

export type RequiredRole = 'user' | 'editor' | 'admin'

export interface VerifiedActor {
  id: string
  name: string | null
  image: string | null
  role: string
}

export type VerifyAccessError = { reason: 'UNAUTHORIZED' } | { reason: 'FORBIDDEN' } | DatabaseError

export interface VerifyAccessSession {
  user?: {
    id?: string
    name?: string | null
    image?: string | null
    role?: string | null
  } | null
}

export interface VerifyAccessDeps {
  getSession?: () => Promise<VerifyAccessSession | null>
  database?: AppDatabase
}

/**
 * Verifies the active session, re-reads ban/role status from the DB, and enforces
 * the minimum required role (`'user'` allows any non-banned user; `'editor'` allows
 * `editor` or `admin`; `'admin'` allows `admin` only).
 */
export function verifyAccess(
  requiredRole: RequiredRole = 'editor',
  deps: VerifyAccessDeps = {},
): Promise<Result<VerifiedActor, VerifyAccessError>> {
  const getSession =
    deps.getSession ?? (async () => auth.api.getSession({ headers: await headers() }))
  const database = deps.database ?? db

  return withDatabaseError<VerifiedActor, { reason: 'UNAUTHORIZED' } | { reason: 'FORBIDDEN' }>(
    'Error verifying user access',
    async () => {
      const session = await getSession()

      if (!session?.user?.id) {
        return error({ reason: 'UNAUTHORIZED' })
      }

      const dbUser = await database.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { banned: true, role: true, name: true, image: true },
      })

      if (!dbUser || dbUser.banned) {
        return error({ reason: 'FORBIDDEN' })
      }

      const role = dbUser.role ?? session.user.role ?? 'user'

      if (requiredRole === 'admin' && role !== 'admin') {
        return error({ reason: 'FORBIDDEN' })
      }

      if (requiredRole === 'editor' && role !== 'admin' && role !== 'editor') {
        return error({ reason: 'FORBIDDEN' })
      }

      return okay({
        id: session.user.id,
        name: dbUser.name ?? session.user.name ?? null,
        image: dbUser.image ?? session.user.image ?? null,
        role,
      })
    },
  )
}
