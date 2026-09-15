import { useTransition } from 'react'
import { useMounted } from '@/hooks/use-mounted'
import { useRouter } from '@/i18n/navigation'
import { type Session, signOut, useSession } from '@/lib/auth/auth-client'
import { getInitials } from '@/utils/get-initials'

export function useUserSession(initialSession?: Session | null) {
  const router = useRouter()
  const mounted = useMounted()
  const [isPending, startTransition] = useTransition()

  const { data: clientSession, isPending: isSessionPending } = useSession()

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
