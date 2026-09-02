import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const authRoutes = ['/login', '/register', '/login/identify']
const protectedRoutes = ['/dashboard', '/settings']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Run next-intl middleware first (handles locale detection & redirect)
  const intlResponse = intlMiddleware(request)

  // Strip the locale prefix to check against auth/protected routes
  const localePattern = /^\/(en|es|fr)(\/|$)/
  const pathnameWithoutLocale = pathname.replace(localePattern, '/')

  const hasSessionToken =
    request.cookies.has('better-auth.session_token') ||
    request.cookies.has('__Secure-better-auth.session_token')

  const isAuthRoute = authRoutes.includes(pathnameWithoutLocale)

  if (isAuthRoute && hasSessionToken) {
    const locale = pathname.match(localePattern)?.[1] || routing.defaultLocale
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route))

  if (isProtectedRoute && !hasSessionToken) {
    const locale = pathname.match(localePattern)?.[1] || routing.defaultLocale
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  return intlResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
