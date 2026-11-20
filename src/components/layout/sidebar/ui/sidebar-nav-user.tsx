'use client'

import { ChevronsUpDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useUserSession } from '@/components/layout/user-menu/use-user-session'
import { UserMenuItems } from '@/components/layout/user-menu/user-menu-items'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Spinner } from '@/components/ui/spinner'
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
            <UserMenuItems
              user={user}
              isAdmin={isAdmin}
              isEditor={isEditor}
              canAccessDashboard={canAccessDashboard}
              showEditorIcon
              isSignOutPending={isSignOutPending}
              onSignOut={handleSignOut}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
