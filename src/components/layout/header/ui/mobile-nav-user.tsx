'use client'

import { LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { AuthButtons } from '@/features/auth/components/auth-buttons'
import { Link } from '@/i18n/navigation'
import { useUserSession } from '../hooks/use-user-session'

export function MobileNavUser({ onNavigate }: { onNavigate: () => void }) {
  const tGlobal = useTranslations('common')
  const {
    user,
    initials,
    isAdmin,
    isEditor,
    canAccessDashboard,
    isLoading,
    isPending,
    handleSignOut,
  } = useUserSession()

  const onSignOut = () => {
    onNavigate()
    handleSignOut()
  }

  if (isLoading) {
    return (
      <div className="space-y-2 w-full py-2">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    )
  }

  if (!user) {
    return <AuthButtons orientation="vertical" size="default" onNavigate={onNavigate} />
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/80 bg-muted/40">
        <Avatar className="size-10 border border-border">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User avatar'} />
          <AvatarFallback className="bg-primary/10 font-semibold text-sm text-primary">
            {initials || <UserIcon className="size-5" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <p className="text-sm font-semibold truncate text-foreground">
              {user.name || tGlobal('labels.user')}
            </p>
            {isAdmin && (
              <Badge variant="softPrimary" className="w-fit text-[10px] h-4 px-1.5 py-0">
                <ShieldCheck className="size-2.5 mr-0.5 text-primary" />
                {tGlobal('labels.admin')}
              </Badge>
            )}
            {isEditor && (
              <Badge variant="softBlue" className="w-fit text-[10px] h-4 px-1.5 py-0 font-medium">
                Editor
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      {canAccessDashboard && (
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 w-full h-9 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
        >
          <LayoutDashboard className="size-4 text-muted-foreground" />
          <span>{tGlobal('labels.dashboard')}</span>
        </Link>
      )}

      <Button
        variant="destructive"
        onClick={onSignOut}
        disabled={isPending}
        className="w-full gap-2 font-medium"
      >
        {isPending ? <Spinner className="size-4 animate-spin" /> : <LogOut className="size-4" />}
        <span>{isPending ? tGlobal('states.signing_out') : tGlobal('actions.sign_out')}</span>
      </Button>
    </div>
  )
}
