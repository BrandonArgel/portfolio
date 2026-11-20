'use client'

import { LayoutDashboard, LogIn, LogOut, ShieldCheck, Sparkles, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Link } from '@/i18n/navigation'
import { LocaleSubMenu } from './locale-sub-menu'
import { ThemeSubMenu } from './theme-sub-menu'

interface UserMenuUser {
  name?: string | null
  email?: string | null
}

interface UserMenuItemsProps {
  user: UserMenuUser | undefined
  isAdmin: boolean
  isEditor: boolean
  canAccessDashboard: boolean
  showDashboardLink?: boolean
  showEditorIcon?: boolean
  isSignOutPending: boolean
  onSignOut: () => void
}

export function UserMenuItems({
  user,
  isAdmin,
  isEditor,
  canAccessDashboard,
  showDashboardLink = false,
  showEditorIcon = false,
  isSignOutPending,
  onSignOut,
}: UserMenuItemsProps) {
  const tGlobal = useTranslations('common')
  const tRoles = useTranslations('components.layout.dashboard.roles')

  return (
    <>
      {user && (
        <>
          <div className="px-2 py-1.5 flex flex-col space-y-1">
            {(isAdmin || (isEditor && !isAdmin)) && (
              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <Badge variant="softPrimary" className="w-fit text-xs h-4 px-1.5 py-0">
                    <ShieldCheck className="size-2.5 mr-1 text-primary" />
                    {tGlobal('labels.admin')}
                  </Badge>
                )}
                {isEditor && !isAdmin && (
                  <Badge variant="softBlue" className="w-fit text-xs h-4 px-1.5 py-0 font-medium">
                    {showEditorIcon && <Sparkles className="size-2.5 mr-1" />}
                    {tRoles('editor')}
                  </Badge>
                )}
              </div>
            )}
            <p className="text-sm font-semibold truncate">{user.name || tGlobal('labels.user')}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
        </>
      )}

      <DropdownMenuGroup>
        <ThemeSubMenu />
        <LocaleSubMenu />
        {user && (
          <DropdownMenuItem render={<Link href="/account" />} className="gap-2 cursor-pointer">
            <User className="size-4 text-muted-foreground" />
            <span>{tGlobal('labels.profile')}</span>
          </DropdownMenuItem>
        )}

        {showDashboardLink && user && canAccessDashboard && (
          <DropdownMenuItem render={<Link href="/dashboard" />} className="gap-2 cursor-pointer">
            <LayoutDashboard className="size-4 text-muted-foreground" />
            <span>{tGlobal('labels.dashboard')}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {user ? (
        <DropdownMenuItem
          variant="destructive"
          onClick={onSignOut}
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
    </>
  )
}
