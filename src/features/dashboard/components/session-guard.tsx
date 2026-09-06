'use client'

import { useParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { authClient, useSession } from '@/lib/auth/auth-client'
import { AUTH_REVOKED_EVENT, handleSessionRevoked } from '@/lib/auth-interceptor'

interface SessionGuardProps {
  children: React.ReactNode
}

export function SessionGuard({ children }: SessionGuardProps) {
  const params = useParams()
  const pathname = usePathname()
  const locale = (params?.locale as string) || 'en'
  const { data: session, isPending } = useSession()
  const isKickingRef = useRef(false)

  const kick = useCallback(() => {
    if (isKickingRef.current) return
    isKickingRef.current = true
    handleSessionRevoked(locale)
  }, [locale])

  // 1. Check current useSession reactive state
  useEffect(() => {
    if (isPending) return

    const isBanned = Boolean((session?.user as { banned?: boolean })?.banned)

    if (!session || !session.user || isBanned) {
      kick()
    }
  }, [session, isPending, kick])

  // 2. Re-verify session on route navigation or tab focus
  useEffect(() => {
    let mounted = true

    const verifySession = async () => {
      try {
        const res = await authClient.getSession()
        if (!mounted) return

        const currentSession = res.data
        const isBanned = Boolean((currentSession?.user as { banned?: boolean })?.banned)

        if (!currentSession || !currentSession.user || isBanned) {
          kick()
        }
      } catch {
        if (mounted) kick()
      }
    }

    if (pathname) {
      verifySession()
    }

    const onFocus = () => {
      verifySession()
    }

    window.addEventListener('focus', onFocus)
    return () => {
      mounted = false
      window.removeEventListener('focus', onFocus)
    }
  }, [pathname, kick])

  // 3. Listen for global session revocation events (e.g. from Server Action failures)
  useEffect(() => {
    const onRevoked = () => {
      kick()
    }

    window.addEventListener(AUTH_REVOKED_EVENT, onRevoked)
    return () => {
      window.removeEventListener(AUTH_REVOKED_EVENT, onRevoked)
    }
  }, [kick])

  return <>{children}</>
}
