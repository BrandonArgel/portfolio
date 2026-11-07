'use client'

import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Tags,
  Users,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export interface SidebarNavMainProps {
  isAdmin?: boolean
}

export function SidebarNavMain({ isAdmin = false }: SidebarNavMainProps) {
  const t = useTranslations('components.layout.dashboard')
  const pathname = usePathname()

  const isOverviewActive = pathname === '/dashboard'
  const isPostsRoute =
    pathname === '/dashboard/posts' ||
    pathname.startsWith('/dashboard/posts/') ||
    pathname === '/dashboard/categories' ||
    pathname.startsWith('/dashboard/categories/')
  const isUsersActive = pathname === '/dashboard/users' || pathname.startsWith('/dashboard/users/')

  const [isContentOpen, setIsContentOpen] = useState<boolean>(true)

  return (
    <SidebarGroup>
      <SidebarMenu>
        {/* Overview */}
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href="/dashboard" />}
            isActive={isOverviewActive}
            tooltip={t('nav.overview')}
          >
            <LayoutDashboard className="size-4" />
            <span>{t('nav.overview')}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Content (Collapsible: Articles, New Article) */}
        <Collapsible
          open={isContentOpen}
          onOpenChange={setIsContentOpen}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger
              render={
                <SidebarMenuButton tooltip={t('nav.content')} isActive={isPostsRoute}>
                  <BookOpen className="size-4" />
                  <span className="truncate">{t('nav.content')}</span>
                  <ChevronRight
                    className={cn(
                      'ml-auto size-4 transition-transform duration-200 group-data-[collapsible=icon]:hidden',
                      isContentOpen && 'rotate-90',
                    )}
                  />
                </SidebarMenuButton>
              }
            />
            <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    render={<Link href="/dashboard/posts" />}
                    isActive={pathname === '/dashboard/posts'}
                  >
                    <FileText className="size-4" />
                    <span>{t('posts')}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    render={<Link href="/dashboard/posts/new" />}
                    isActive={pathname === '/dashboard/posts/new'}
                  >
                    <PlusCircle className="size-4" />
                    <span>{t('new_post')}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    render={<Link href="/dashboard/categories" />}
                    isActive={
                      pathname === '/dashboard/categories' ||
                      pathname.startsWith('/dashboard/categories/')
                    }
                  >
                    <Tags className="size-4" />
                    <span>{t('categories')}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        {/* User Management (Admin only) */}
        {isAdmin && (
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/dashboard/users" />}
              isActive={isUsersActive}
              tooltip={t('nav.users')}
            >
              <Users className="size-4" />
              <span>{t('nav.users')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {/* Back to site */}
        <SidebarMenuItem>
          <SidebarMenuButton render={<Link href="/" />} tooltip={t('back_to_site')}>
            <ArrowLeft className="size-4" />
            <span>{t('back_to_site')}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
