'use client'

import { useTranslations } from 'next-intl'
import { useUserSession } from '@/components/layout/user-menu/use-user-session'
import { UserMenuItems } from '@/components/layout/user-menu/user-menu-items'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import type { Session } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  initialSession?: Session | null
  className?: string
}

export function UserPreferencesMenu({ initialSession, className }: UserMenuProps) {
  const tHeader = useTranslations('components.layout.header')

  const {
    user,
    initials,
    isAdmin,
    isEditor,
    canAccessDashboard,
    isLoading,
    isSignOutPending,
    handleSignOut,
  } = useUserSession(initialSession)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'relative size-8 rounded-full ring-offset-background outline-none transition-all hover:ring-2 hover:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer',
          className,
        )}
        aria-label={tHeader('open_user_menu')}
        disabled={isLoading}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-sm">
            <Spinner className="size-5 animate-spin text-primary" />
          </div>
        )}

        <Avatar
          className={cn(
            'size-8',
            user ? 'border-2 border-primary' : 'border border-border/80 bg-muted/50',
          )}
        >
          {user && <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User avatar'} />}
          <AvatarFallback
            className={user ? 'bg-primary/10 text-xs text-primary' : 'text-muted-foreground'}
          >
            {initials || <span className="size-4 block bg-current rounded-full opacity-50" />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 p-1.5 shadow-lg border-border/60"
      >
        <UserMenuItems
          user={user}
          isAdmin={isAdmin}
          isEditor={isEditor}
          canAccessDashboard={canAccessDashboard}
          showDashboardLink
          isSignOutPending={isSignOutPending}
          onSignOut={handleSignOut}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
