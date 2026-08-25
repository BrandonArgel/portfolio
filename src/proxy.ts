import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const authRoutes = ['/login', '/register', '/login/identify']
const protectedRoutes = ['/dashboard', '/settings']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasSessionToken =
    request.cookies.has('better-auth.session_token') ||
    request.cookies.has('__Secure-better-auth.session_token')

  const isAuthRoute = authRoutes.includes(pathname)

  if (isAuthRoute && hasSessionToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !hasSessionToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
