import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action'
import { db } from '@/db'
import { user } from '@/db/schema'
import { auth } from '@/lib/auth/auth'

export class ActionError extends Error {
  description?: string

  constructor(title: string, description?: string) {
    super(title)
    this.name = 'ActionError'
    this.description = description
  }
}

export type ActionServerError = {
  title: string
  description?: string
}

// 1. Base client with structured server error handling
export const actionClient = createSafeActionClient({
  handleServerError(e: Error): ActionServerError {
    if (e instanceof ActionError) {
      return {
        title: e.message,
        description: e.description,
      }
    }

    if (e instanceof Error) {
      if (e.message === 'SESSION_REVOKED') {
        return {
          title: 'SESSION_REVOKED',
          description: 'Your session has been revoked or your account has been suspended.',
        }
      }

      return {
        title: e.message || DEFAULT_SERVER_ERROR_MESSAGE,
        description: undefined,
      }
    }

    return {
      title: DEFAULT_SERVER_ERROR_MESSAGE,
      description: undefined,
    }
  },
})

// 2. Authentication Middleware: verifies active session and real-time ban status
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    throw new ActionError('SESSION_REVOKED', 'Your session is invalid or expired.')
  }

  const realUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { banned: true },
  })

  if (!realUser || realUser.banned) {
    throw new ActionError('SESSION_REVOKED', 'Your account has been suspended.')
  }

  return next({
    ctx: {
      session,
      user: session.user,
    },
  })
})

// 3. Editor Authorization Middleware: role === 'admin' || role === 'editor'
export const editorActionClient = authActionClient.use(async ({ ctx, next }) => {
  const role = ctx.user.role

  if (role !== 'admin' && role !== 'editor') {
    throw new ActionError(
      'Insufficient Permissions',
      'Editor or Administrator role is required to perform this action.',
    )
  }

  return next({
    ctx: {
      session: ctx.session,
      user: ctx.user,
    },
  })
})

// 4. Admin Authorization Middleware: role === 'admin'
export const adminActionClient = authActionClient.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new ActionError(
      'Insufficient Permissions',
      'Administrator role is required to perform this action.',
    )
  }

  return next({
    ctx: {
      session: ctx.session,
      user: ctx.user,
    },
  })
})
