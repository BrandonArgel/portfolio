'use client'

import { ChevronsUpDown, LogIn, LogOut, ShieldCheck, Sparkles, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useUserSession } from '@/components/layout/header/hooks/use-user-session'
import { LocaleSubMenu } from '@/components/layout/header/ui/locale-sub-menu'
import { ThemeSubMenu } from '@/components/layout/header/ui/theme-sub-menu'
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Spinner } from '@/components/ui/spinner'
import { Link } from '@/i18n/navigation'
import type { Session } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'

export interface SidebarNavUserProps {
  initialSession?: Session | null
  className?: string
}

export function SidebarNavUser({ initialSession, className }: SidebarNavUserProps) {
  const tGlobal = useTranslations('common')
  const tHeader = useTranslations('components.layout.header')
  const { isMobile } = useSidebar()

  const { user, initials, isAdmin, isEditor, isLoading, isSignOutPending, handleSignOut } =
    useUserSession(initialSession)

  return (
    <SidebarMenu className={className}>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                disabled={isLoading}
                aria-label={tHeader('open_user_menu')}
              >
                <div className="relative size-8 shrink-0">
                  {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-sm">
                      <Spinner className="size-4 animate-spin text-primary" />
                    </div>
                  )}
                  <Avatar
                    className={cn(
                      'size-8 rounded-lg',
                      user ? 'border border-primary/40' : 'border border-border/80',
                    )}
                  >
                    {user && (
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name ?? 'User avatar'}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <AvatarFallback className="rounded-lg bg-primary/10 text-xs text-primary font-medium">
                      {initials || (
                        <span className="size-3.5 block bg-current rounded-full opacity-50" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">
                    {user?.name || tGlobal('labels.user')}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                </div>

                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            }
          />

          <DropdownMenuContent
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={8}
            className="w-64 p-1.5 shadow-lg border-border/60"
          >
            {user && (
              <>
                <div className="px-2 py-1.5 flex flex-col space-y-1">
                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <Badge variant="softPrimary" className="w-fit text-xs h-4 px-1.5 py-0">
                        <ShieldCheck className="size-2.5 mr-1 text-primary" />
                        {tGlobal('labels.admin')}
                      </Badge>
                    )}
                    {isEditor && !isAdmin && (
                      <Badge
                        variant="softBlue"
                        className="w-fit text-xs h-4 px-1.5 py-0 font-medium"
                      >
                        <Sparkles className="size-2.5 mr-1" />
                        Editor
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-semibold truncate">
                    {user.name || tGlobal('labels.user')}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuGroup>
              {user && (
                <DropdownMenuItem
                  render={<Link href="/account" />}
                  className="gap-2 cursor-pointer"
                >
                  <User className="size-4 text-muted-foreground" />
                  <span>{tGlobal('labels.profile')}</span>
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
                disabled={isSignOutPending}
                className="gap-2 cursor-pointer"
              >
                <LogOut className="size-4" />
                <span>
                  {isSignOutPending ? tGlobal('states.signing_out') : tGlobal('actions.sign_out')}
                </span>
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
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
