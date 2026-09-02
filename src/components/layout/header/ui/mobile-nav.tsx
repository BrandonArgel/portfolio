'use client'

import { Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
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
import { cn } from '@/lib/utils'
import { LocaleSwitcher } from './locale-switcher'
import { MobileNavLinks } from './mobile-nav-links'
import { MobileNavUser } from './mobile-nav-user'
import { ThemeToggleButtons } from './theme-selector'

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
          <Button
            variant="ghost"
            className={cn(
              'size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring p-0',
              className,
            )}
            aria-label={tHeader('open_nav_menu')}
          >
            <Menu className="size-5" />
          </Button>
        }
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
            <LocaleSwitcher />
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
