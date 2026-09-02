import { headers } from 'next/headers'
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action'
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

// 2. Authentication Middleware: verifies active session
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    throw new ActionError('Unauthorized', 'You are not authorized. Please sign in to continue.')
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
