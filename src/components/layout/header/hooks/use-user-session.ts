import { useEffect, useState, useTransition } from 'react'
import { useRouter } from '@/i18n/navigation'
import { type Session, signOut, useSession } from '@/lib/auth/auth-client'
import { getInitials } from '@/utils/get-initials'

export function useUserSession(initialSession?: Session | null) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { data: clientSession, isPending: isSessionPending } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentSession = clientSession !== undefined ? clientSession : (initialSession ?? null)
  const user = currentSession?.user
  const initials = getInitials(user?.name)
  const userRole = (user as { role?: string } | undefined)?.role
  const isAdmin = userRole === 'admin'
  const isEditor = userRole === 'editor'
  const canAccessDashboard = isAdmin || isEditor

  const isLoading = isPending || (isSessionPending && !mounted && !currentSession)

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/')
            router.refresh()
          },
        },
      })
    })
  }

  return {
    user,
    initials,
    isAdmin,
    isEditor,
    canAccessDashboard,
    isLoading,
    isPending,
    handleSignOut,
  }
}
