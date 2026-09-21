'use client'

import { Layers, ShieldCheck, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Link } from '@/i18n/navigation'
import type { Session } from '@/lib/auth/auth-client'

export interface SidebarBrandProps {
  session?: Session | null
  isAdmin?: boolean
  isEditor?: boolean
}

export function SidebarBrand({
  session,
  isAdmin: propIsAdmin,
  isEditor: propIsEditor,
}: SidebarBrandProps) {
  const t = useTranslations('components.layout.dashboard')

  const userRole = (session?.user as { role?: string } | undefined)?.role
  const isAdmin = propIsAdmin ?? userRole === 'admin'
  const isEditor = propIsEditor ?? userRole === 'editor'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Layers className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <span className="truncate font-semibold">{t('title')}</span>
              {isAdmin && (
                <Badge
                  variant="softPrimary"
                  className="h-4 px-1.5 py-0 text-[10px] font-medium shrink-0"
                >
                  <ShieldCheck className="size-2.5 mr-0.5 text-primary" />
                  {t('roles.admin')}
                </Badge>
              )}
              {isEditor && !isAdmin && (
                <Badge
                  variant="softBlue"
                  className="h-4 px-1.5 py-0 text-[10px] font-medium shrink-0"
                >
                  <Sparkles className="size-2.5 mr-0.5" />
                  {t('roles.editor')}
                </Badge>
              )}
            </div>
            <span className="truncate text-xs text-muted-foreground">Brandon Argel</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
