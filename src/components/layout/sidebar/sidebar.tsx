'use client'

import type * as React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import type { Session } from '@/lib/auth/auth-client'
import { SidebarBrand } from './ui/sidebar-brand'
import { SidebarNavMain } from './ui/sidebar-nav-main'
import { SidebarNavUser } from './ui/sidebar-nav-user'

export interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session?: Session | null
  isAdmin?: boolean
  isEditor?: boolean
}

export function DashboardSidebar({
  session,
  isAdmin,
  isEditor,
  collapsible = 'icon',
  ...props
}: DashboardSidebarProps) {
  return (
    <Sidebar collapsible={collapsible} {...props}>
      <SidebarHeader>
        <SidebarBrand session={session} isAdmin={isAdmin} isEditor={isEditor} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavMain isAdmin={isAdmin} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarNavUser initialSession={session} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export { DashboardSidebar as Sidebar }
