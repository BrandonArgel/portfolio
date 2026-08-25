import { headers } from 'next/headers'
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action'
import { auth } from '@/lib/auth/auth' // Tu configuración de Better Auth

// 1. Cliente base (sin protección extra, útil para validación de Zod)
export const actionClient = createSafeActionClient({
  handleReturnedServerError(e) {
    // Manejo de errores amigable
    if (e instanceof Error) return e.message
    return DEFAULT_SERVER_ERROR_MESSAGE
  },
})

// 2. Middleware de Autenticación Básica
export const authActionClient = actionClient.use(async ({ next }) => {
  // Obtenemos la sesión actual
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    throw new Error('No estás autorizado. Por favor inicia sesión.')
  }

  // Le pasamos los datos del usuario a la función final
  return next({ ctx: { user: session.user } })
})

// 3. Middleware de Autorización por Roles (RBAC)
export const adminActionClient = authActionClient.use(async ({ ctx, next }) => {
  // 'ctx' contiene el usuario que inyectó el authActionClient

  if (ctx.user.role !== 'admin') {
    throw new Error('Permisos insuficientes. Se requiere rol de administrador.')
  }

  // Si es admin, continúa la ejecución
  return next({ ctx: { user: ctx.user } })
})
