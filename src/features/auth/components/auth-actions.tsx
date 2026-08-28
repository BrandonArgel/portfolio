'use client'

import { UserPreferencesMenu } from '@/components/layout/header/user-menu'
import type { Session } from '@/lib/auth/auth-client'

interface AuthActionsProps {
  className?: string
  initialSession?: Session | null
}

export function AuthActions({ className, initialSession }: AuthActionsProps) {
  return <UserPreferencesMenu className={className} initialSession={initialSession} />
}
