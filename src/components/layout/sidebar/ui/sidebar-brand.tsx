'use client'

import { PanelLeftIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function SidebarBrand() {
  const t = useTranslations('components.layout.dashboard')
  const { toggleSidebar } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={t('title')} onClick={toggleSidebar}>
          <div className="flex aspect-square items-center justify-center rounded-lg shrink-0">
            <PanelLeftIcon className="size-8" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-lg truncate font-semibold">{t('title')}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
