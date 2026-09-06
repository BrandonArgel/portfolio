'use client'

import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { UserPreferencesMenu } from '@/components/layout/header/ui/user-menu'
import { Badge } from '@/components/ui/badge'
import { Button, LinkButton } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Separator } from '@/components/ui/separator'
import { Link, usePathname } from '@/i18n/navigation'
import type { Session } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'

export interface AdminHeaderProps {
  session?: Session | null
  initialSession?: Session | null
  isAdmin?: boolean
  isEditor?: boolean
}

export function AdminHeader({
  session,
  initialSession,
  isAdmin: propIsAdmin,
  isEditor: propIsEditor,
}: AdminHeaderProps) {
  const t = useTranslations('components.layout.dashboard')
  const pathname = usePathname()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const activeSession = session ?? initialSession
  const userRole = (activeSession?.user as { role?: string } | undefined)?.role
  const isAdmin = propIsAdmin ?? userRole === 'admin'
  const isEditor = propIsEditor ?? userRole === 'editor'

  const isOverviewActive = pathname === '/dashboard'
  const isPostsActive = pathname === '/dashboard/posts' || pathname.startsWith('/dashboard/posts/')
  const isCoursesActive =
    pathname === '/dashboard/courses' || pathname.startsWith('/dashboard/courses/')
  const isContentActive = isPostsActive || isCoursesActive
  const isUsersActive = pathname === '/dashboard/users' || pathname.startsWith('/dashboard/users/')

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full border-b border-border/80 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="section-container flex items-center justify-between">
        {/* 1. Left (Brand): Dashboard title + Role badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg transition-transform active:scale-95"
          >
            <span className="font-bold text-base sm:text-lg tracking-tight">{t('title')}</span>
          </Link>

          {isAdmin && (
            <Badge variant="softPrimary" className="text-xs h-5 px-2 py-0 font-medium shrink-0">
              <ShieldCheck className="size-3 mr-1 text-primary" />
              {t('roles.admin')}
            </Badge>
          )}

          {isEditor && !isAdmin && (
            <Badge
              variant="outline"
              className="text-xs h-5 px-2 py-0 font-medium text-blue-500 border-blue-500/30 bg-blue-500/10 shrink-0"
            >
              <Sparkles className="size-3 mr-1 text-blue-500" />
              {t('roles.editor')}
            </Badge>
          )}
        </div>

        {/* 2. Center (Navigation): Shadcn UI NavigationMenu */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {/* Item 1 (Overview) */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'bg-transparent relative rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer',
                    isOverviewActive &&
                      'text-primary hover:text-primary font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full',
                  )}
                  render={<Link href="/dashboard" />}
                >
                  {t('nav.overview')}
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Item 2 (Content - Dropdown) */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent data-[state=open]:text-foreground data-[state=open]:bg-accent/80 transition-colors',
                    isContentActive &&
                      'text-primary hover:text-primary font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full',
                  )}
                >
                  {t('nav.content')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    {/* Blog */}
                    <li>
                      <NavigationMenuLink
                        render={<Link href="/dashboard/posts" />}
                        className={cn(
                          'group flex items-start gap-3.5 select-none rounded-lg p-3 leading-none no-underline outline-none transition-colors duration-200 hover:bg-emerald-500/10 focus:bg-emerald-500/10 cursor-pointer',
                          isPostsActive && 'bg-emerald-500/15',
                        )}
                      >
                        <div
                          className={cn(
                            'p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 group-hover:scale-105',
                            isPostsActive &&
                              'bg-emerald-500/20 text-emerald-500 ring-1 ring-emerald-500/30',
                          )}
                        >
                          <BookOpen className="size-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={cn(
                              'text-sm font-medium leading-none mb-1.5 transition-colors duration-200 text-foreground group-hover:text-emerald-500',
                              isPostsActive && 'text-emerald-500 font-semibold',
                            )}
                          >
                            {t('nav.blog')}
                          </div>
                          <p
                            className={cn(
                              'line-clamp-2 text-xs leading-relaxed transition-colors duration-200 text-muted-foreground group-hover:text-foreground/80',
                              isPostsActive && 'text-foreground/90 font-medium',
                            )}
                          >
                            {t('nav.blog_description')}
                          </p>
                        </div>
                      </NavigationMenuLink>
                    </li>

                    {/* Courses */}
                    <li>
                      <NavigationMenuLink
                        render={<Link href="/dashboard/courses" />}
                        className={cn(
                          'group flex items-start gap-3.5 select-none rounded-lg p-3 leading-none no-underline outline-none transition-colors duration-200 hover:bg-blue-500/10 focus:bg-blue-500/10 cursor-pointer',
                          isCoursesActive && 'bg-blue-500/15',
                        )}
                      >
                        <div
                          className={cn(
                            'p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 group-hover:scale-105',
                            isCoursesActive &&
                              'bg-blue-500/20 text-blue-500 ring-1 ring-blue-500/30',
                          )}
                        >
                          <GraduationCap className="size-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={cn(
                              'text-sm font-medium leading-none mb-1.5 transition-colors duration-200 text-foreground group-hover:text-blue-500',
                              isCoursesActive && 'text-blue-500 font-semibold',
                            )}
                          >
                            {t('nav.courses')}
                          </div>
                          <p
                            className={cn(
                              'line-clamp-2 text-xs leading-relaxed transition-colors duration-200 text-muted-foreground group-hover:text-foreground/80',
                              isCoursesActive && 'text-foreground/90 font-medium',
                            )}
                          >
                            {t('nav.courses_description')}
                          </p>
                        </div>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Item 3 (Users) */}
              {isAdmin && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'bg-transparent relative rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer',
                      isUsersActive &&
                        'text-primary hover:text-primary font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full',
                    )}
                    render={<Link href="/dashboard/users" />}
                  >
                    {t('nav.users')}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* 3. Right (Actions): Back to site button + User Avatar dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LinkButton
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground shrink-0"
            href="/"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">{t('back_to_site')}</span>
          </LinkButton>

          <UserPreferencesMenu initialSession={activeSession} />

          {/* Mobile Navigation Menu Drawer */}
          <div className="inline-flex md:hidden">
            <Drawer open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen} showSwipeHandle>
              <DrawerTrigger
                render={
                  <Button
                    variant="ghost"
                    className="size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring p-0"
                    aria-label="Toggle navigation menu"
                  >
                    <Menu className="size-5" />
                  </Button>
                }
              />
              <DrawerContent className="bg-background border-border text-foreground">
                <DrawerHeader className="text-left px-4 pt-4 pb-2 border-b border-border/40">
                  <DrawerTitle className="text-base font-semibold">{t('title')}</DrawerTitle>
                </DrawerHeader>

                <div className="mx-auto w-full max-w-md px-4 pt-4 pb-6 flex flex-col gap-3">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileNavOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                      isOverviewActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground',
                    )}
                  >
                    <LayoutDashboard className="size-4" />
                    <span>{t('nav.overview')}</span>
                  </Link>

                  <div className="space-y-1">
                    <div className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('nav.content')}
                    </div>
                    <Link
                      href="/dashboard/posts"
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                        isPostsActive
                          ? 'bg-emerald-500/10 text-emerald-500 font-semibold'
                          : 'text-muted-foreground',
                      )}
                    >
                      <BookOpen className="size-4 text-emerald-500" />
                      <span>{t('nav.blog')}</span>
                    </Link>
                    <Link
                      href="/dashboard/courses"
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                        isCoursesActive
                          ? 'bg-blue-500/10 text-blue-500 font-semibold'
                          : 'text-muted-foreground',
                      )}
                    >
                      <GraduationCap className="size-4 text-blue-500" />
                      <span>{t('nav.courses')}</span>
                    </Link>
                  </div>

                  {isAdmin && (
                    <>
                      <Separator />
                      <Link
                        href="/dashboard/users"
                        onClick={() => setIsMobileNavOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                          isUsersActive
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground',
                        )}
                      >
                        <Users className="size-4" />
                        <span>{t('nav.users')}</span>
                      </Link>
                    </>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  )
}
