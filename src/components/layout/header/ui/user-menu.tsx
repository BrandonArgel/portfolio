'use client'

import { LayoutDashboard, LogIn, LogOut, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { Link } from '@/i18n/navigation'
import type { Session } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'
import { useUserSession } from '../hooks/use-user-session'
import { LocaleSubMenu } from './locale-sub-menu'
import { ThemeSubMenu } from './theme-sub-menu'

interface UserMenuProps {
  initialSession?: Session | null
  className?: string
}

export function UserPreferencesMenu({ initialSession, className }: UserMenuProps) {
  const tGlobal = useTranslations('common')
  const tHeader = useTranslations('components.layout.header')

  const {
    user,
    initials,
    isAdmin,
    isEditor,
    canAccessDashboard,
    isLoading,
    isPending,
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
        disabled={isPending}
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
        {user && (
          <>
            <div className="px-2 py-1.5 flex flex-col space-y-1">
              {isAdmin && (
                <Badge variant="softPrimary" className="w-fit text-xs h-4 px-1.5 py-0">
                  <ShieldCheck className="size-2.5 mr-1 text-primary" />
                  {tGlobal('labels.admin')}
                </Badge>
              )}
              {isEditor && (
                <Badge variant="softBlue" className="w-fit text-xs h-4 px-1.5 py-0 font-medium">
                  Editor
                </Badge>
              )}
              <p className="text-sm font-semibold truncate">
                {user.name || tGlobal('labels.user')}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          {user && canAccessDashboard && (
            <DropdownMenuItem render={<Link href="/dashboard" />} className="gap-2 cursor-pointer">
              <LayoutDashboard className="size-4 text-muted-foreground" />
              <span>{tGlobal('labels.dashboard')}</span>
            </DropdownMenuItem>
          )}

          <ThemeSubMenu />
          <LocaleSubMenu />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {user ? (
          <DropdownMenuItem
            variant="destructive"
            onClick={handleSignOut}
            disabled={isPending}
            className="gap-2 cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>{isPending ? tGlobal('states.signing_out') : tGlobal('actions.sign_out')}</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            render={<Link href="/login" />}
            className="gap-2 cursor-pointer text-foreground hover:text-primary"
          >
            <LogIn className="size-4 text-primary" />
            <span>{tGlobal('actions.sign_in')}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
