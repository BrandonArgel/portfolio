'use client'

import { useTheme } from '@teispace/next-themes'
import {
  Check,
  Globe,
  LayoutDashboard,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  ShieldCheck,
  Sun,
  SunMoon,
  User as UserIcon,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState, useTransition } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { LOCALE_META } from '@/i18n/locale-meta'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { type Locale, routing } from '@/i18n/routing'
import { type Session, signOut, useSession } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'
import { getInitials } from '@/utils/get-initials'

const THEME_OPTIONS = [
  { value: 'light', labelKey: 'light', icon: Sun },
  { value: 'dark', labelKey: 'dark', icon: Moon },
  { value: 'system', labelKey: 'system', icon: Monitor },
] as const

interface UserMenuProps {
  initialSession?: Session | null
  className?: string
}

export function UserPreferencesMenu({ initialSession, className }: UserMenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useLocale() as Locale

  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { data: clientSession, isPending: isSessionPending } = useSession()
  const { theme, setTheme } = useTheme()

  const tGlobal = useTranslations('common')
  const tTheme = useTranslations('components.theme_selector')
  const tHeader = useTranslations('components.header')

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentSession = clientSession !== undefined ? clientSession : (initialSession ?? null)
  const user = currentSession?.user
  const initials = getInitials(user?.name)
  const isAdmin = (user as { role?: string } | undefined)?.role === 'admin'

  const handleSignOut = () => {
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

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) return
    const params = new URLSearchParams(searchParams.toString())
    const query = params.toString() ? `?${params.toString()}` : ''

    startTransition(() => {
      router.replace(`${pathname}${query}`, { locale: nextLocale })
    })
  }

  const isLoading = isPending || (isSessionPending && !mounted && !currentSession)

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

        {user ? (
          <Avatar className="size-8 border-2 border-primary">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User avatar'} />
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials || <UserIcon className="size-4" />}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="size-8 border border-border/80 bg-muted/50 text-muted-foreground hover:text-foreground">
            <AvatarFallback className="bg-muted/50 text-muted-foreground">
              <UserIcon className="size-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 p-1.5 shadow-lg border border-border/60"
      >
        {/* User Info Header (When authenticated) */}
        {user && (
          <>
            <div className="px-2 py-1.5">
              <div className="flex flex-col space-y-1">
                {isAdmin && (
                  <Badge variant="softPrimary" className="w-fit text-[10px] h-4 px-1.5 py-0">
                    <ShieldCheck className="size-2.5 mr-1 text-primary" />
                    {tGlobal('labels.admin')}
                  </Badge>
                )}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold leading-none truncate text-foreground">
                    {user.name || tGlobal('labels.user')}
                  </p>
                </div>
                <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          {/* Admin Dashboard */}
          {user && isAdmin && (
            <DropdownMenuItem render={<Link href="/dashboard" />} className="gap-2 cursor-pointer">
              <LayoutDashboard className="size-4 text-muted-foreground" />
              <span>{tGlobal('labels.dashboard')}</span>
            </DropdownMenuItem>
          )}

          {/* Theme Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
              <SunMoon className="size-4 text-muted-foreground" />
              <span>{tGlobal('labels.theme')}</span>
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {THEME_OPTIONS.map(({ value, labelKey, icon: Icon }) => {
                const isSelected = mounted && theme === value

                return (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => setTheme(value)}
                    role="menuitemradio"
                    aria-checked={isSelected}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="flex-1">{tTheme(labelKey)}</span>
                    <div className="flex size-4 shrink-0 items-center justify-center">
                      {isSelected && <Check className="size-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Language Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
              <Globe className="size-4 text-muted-foreground" />
              <span>{tGlobal('labels.language')}</span>
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {routing.locales.map((loc) => {
                const meta = LOCALE_META[loc]
                const isSelected = locale === loc

                return (
                  <DropdownMenuItem
                    key={loc}
                    onClick={() => switchLocale(loc)}
                    role="menuitemradio"
                    aria-checked={isSelected}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span aria-hidden="true" className="text-base">
                      {meta?.flag}
                    </span>
                    <span className="flex-1 truncate">{meta?.nativeName ?? loc}</span>
                    <div className="flex size-4 shrink-0 items-center justify-center">
                      {isSelected && <Check className="size-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Authentication Action */}
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
            className="gap-2 cursor-pointer font-medium text-foreground hover:text-primary"
          >
            <LogIn className="size-4 text-primary" />
            <span>{tGlobal('actions.sign_in')}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
