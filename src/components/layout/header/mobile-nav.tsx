'use client'

import { LayoutDashboard, LogOut, Menu, ShieldCheck, User as UserIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { navConfig } from '@/config/nav'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { signOut, useSession } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'
import { getInitials } from '@/utils/get-initials'
import { AuthButtons } from '../../../features/auth/components/auth-buttons'
import { LocaleSwitcherButtons } from './locale-switcher'
import { ThemeToggleButtons } from './theme-selector'

function MobileNavLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname()
  const tNav = useTranslations('components.nav')
  const tGlobal = useTranslations('common.labels')

  return (
    <nav aria-label="Mobile navigation" className="w-full">
      <Accordion className="w-full space-y-2 flex flex-col">
        {navConfig.map((item) => {
          if (item.items && item.items.length > 0) {
            return (
              <AccordionItem value={item.titleKey} key={item.titleKey} className="border-none">
                <AccordionTrigger className="hover:no-underline py-2 px-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                  {tNav(item.titleKey)}
                </AccordionTrigger>
                <AccordionContent className="group ml-3 mt-1 space-y-1 [&_a]:no-underline">
                  {item.items.map((subItem) => {
                    const isSubActive = pathname === subItem.href
                    const SubIcon = subItem.icon

                    return (
                      <Link
                        key={subItem.titleKey}
                        href={subItem.href}
                        onClick={onNavigate}
                        className={cn(
                          'w-full inline-flex justify-start gap-3 py-2 px-2.5 rounded-lg group transition-colors',
                          isSubActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-accent text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {SubIcon && (
                          <SubIcon
                            className={cn(
                              'size-4 mt-0.5 shrink-0 transition-colors',
                              isSubActive
                                ? 'text-primary'
                                : 'text-muted-foreground group-hover:text-foreground',
                            )}
                          />
                        )}
                        <div>
                          <p className="text-sm leading-tight text-left">
                            {tNav(subItem.titleKey)}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 font-normal">
                            {tNav(subItem.descriptionKey)}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </AccordionContent>
              </AccordionItem>
            )
          }

          const isActive = pathname === (item.href || '/')

          return (
            <Link
              key={item.titleKey}
              href={item.href || '#'}
              onClick={onNavigate}
              className={cn(
                'px-3 py-2.5 flex items-center justify-between rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'bg-muted/30 text-foreground hover:bg-muted hover:text-primary',
              )}
            >
              <span>{tNav(item.titleKey)}</span>
              {isActive && (
                <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {tGlobal('active')}
                </Badge>
              )}
            </Link>
          )
        })}
      </Accordion>
    </nav>
  )
}

function MobileNavUser({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { data: session, isPending } = useSession()
  const tGlobal = useTranslations('common')

  useEffect(() => {
    setMounted(true)
  }, [])

  const user = session?.user
  const initials = getInitials(user?.name)
  const isAdmin = (user as { role?: string } | undefined)?.role === 'admin'

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            onNavigate()
            router.push('/')
            router.refresh()
          },
          onError: () => setIsSigningOut(false),
        },
      })
    } catch {
      setIsSigningOut(false)
    }
  }

  if (!mounted || isPending) {
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
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      {isAdmin && (
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
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="w-full gap-2 font-medium"
      >
        {isSigningOut ? <Spinner className="size-4 animate-spin" /> : <LogOut className="size-4" />}
        <span>{isSigningOut ? tGlobal('states.signing_out') : tGlobal('actions.sign_out')}</span>
      </Button>
    </div>
  )
}

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const closeDrawer = useCallback(() => setOpen(false), [])
  const tGlobal = useTranslations('common.labels')
  const tHeader = useTranslations('components.header')

  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerTrigger
        render={
          <Button variant="ghost">
            <Menu className="size-5" />
          </Button>
        }
        className={cn(
          'size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
        aria-label={tHeader('open_nav_menu')}
      />

      <DrawerContent className="bg-background border-border text-foreground">
        <DrawerHeader className="text-left px-4 pt-4 pb-2 border-b border-border/40">
          <DrawerTitle className="text-base font-semibold">{tGlobal('navigation')}</DrawerTitle>
        </DrawerHeader>

        <div className="mx-auto w-full max-w-md px-4 pt-4 pb-6 max-h-[75vh] overflow-y-auto flex flex-col gap-5">
          <MobileNavLinks onNavigate={closeDrawer} />

          <Separator />

          <div className="flex flex-col gap-y-1">
            <span className="text-xs font-medium text-muted-foreground p-2">
              {tGlobal('language')}
            </span>
            <LocaleSwitcherButtons className="w-full" />
          </div>

          <Separator />

          <div className="flex flex-col gap-y-1">
            <span className="text-xs font-medium text-muted-foreground p-2">
              {tGlobal('interface_theme')}
            </span>
            <ThemeToggleButtons />
          </div>

          <Separator />

          <DrawerFooter className="px-0 py-0 gap-3">
            <MobileNavUser onNavigate={closeDrawer} />
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
