'use client'

import { useEffect, useState } from 'react'
import { type Session, useSession } from '@/lib/auth/auth-client'
import { AuthButtons } from './auth-buttons'
import { AuthSkeleton } from './auth-skeleton'
import { UserMenu } from './user-menu'

interface AuthActionsProps {
  className: string
  initialSession?: Session | null
}

export function AuthActions({ className, initialSession }: AuthActionsProps) {
  const serverSession = initialSession ?? null
  const { data: clientSession, isPending } = useSession()
  const [mounted, setMounted] = useState(false)

  const currentSession = clientSession !== undefined ? clientSession : serverSession
  const user = currentSession?.user

  useEffect(() => {
    setMounted(true)
  }, [])

  if (isPending || (!mounted && !currentSession)) {
    return <AuthSkeleton className={className} />
  }

  if (user) {
    return <UserMenu user={user} className={className} />
  }

  return <AuthButtons className={className} />
}
