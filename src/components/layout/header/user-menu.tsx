'use client'

import { LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type MouseEvent, useTransition } from 'react'
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
import { signOut, type User } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'
import { getInitials } from '@/utils/get-initials'
import { ThemeSelectorSubmenu } from './theme-selector'

interface UserMenuProps {
  user: User
  className?: string
}

export function UserMenu({ user, className }: UserMenuProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const initials = getInitials(user.name)
  const isAdmin = (user as { role?: string }).role === 'admin'

  const handleSignOut = (e: MouseEvent) => {
    startTransition(async () => {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/')
            router.refresh()
          },
          onError: () => {},
        },
      })
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'relative size-8 rounded-full ring-offset-background outline-none transition-all hover:ring-2 hover:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary',
          className,
        )}
        aria-label="Open user menu"
        disabled={isPending}
      >
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-sm">
            <Spinner className="size-5 animate-spin text-primary" />
          </div>
        )}
        <Avatar className="size-8 border border-border/80">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User avatar'} />
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials || <UserIcon className="size-4" />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 p-1.5 shadow-lg border border-border/60"
      >
        {/* User info header */}
        <div className="px-2 py-1.5">
          <div className="flex flex-col space-y-1">
            {isAdmin && (
              <Badge variant="secondary" className="text-xs">
                <ShieldCheck className="size-3 text-primary" />
                Admin
              </Badge>
            )}
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold leading-none truncate text-foreground">
                {user.name || 'User'}
              </p>
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {isAdmin && (
            <DropdownMenuItem render={<Link href="/dashboard" />} className="gap-2 cursor-pointer">
              <LayoutDashboard className="size-4 text-muted-foreground" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          )}

          <ThemeSelectorSubmenu />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign out action */}
        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignOut}
          disabled={isPending}
          className="gap-2 cursor-pointer"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
