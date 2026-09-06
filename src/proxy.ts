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

  if (isProtectedRoute) {
    const locale = pathname.match(localePattern)?.[1] || routing.defaultLocale

    if (!hasSessionToken) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }

    // Verify session validity via Better Auth get-session endpoint to catch revoked or banned users upon hard reload
    try {
      const sessionUrl = new URL('/api/auth/get-session', request.url)
      const res = await fetch(sessionUrl, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      })

      if (res.ok) {
        const session = await res.json()
        const isBanned = Boolean(session?.user?.banned)

        if (!session || !session.user || isBanned) {
          const redirectRes = NextResponse.redirect(new URL(`/${locale}/login`, request.url))
          redirectRes.cookies.delete('better-auth.session_token')
          redirectRes.cookies.delete('__Secure-better-auth.session_token')
          return redirectRes
        }
      } else {
        const redirectRes = NextResponse.redirect(new URL(`/${locale}/login`, request.url))
        redirectRes.cookies.delete('better-auth.session_token')
        redirectRes.cookies.delete('__Secure-better-auth.session_token')
        return redirectRes
      }
    } catch {
      // In case the API is temporarily unreachable, fallback to server component layout validation
    }
  }

  return intlResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$).*)',
  ],
}
