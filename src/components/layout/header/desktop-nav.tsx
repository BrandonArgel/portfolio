'use client'

import { useTranslations } from 'next-intl'
import { NavDropdownItem } from '@/components/layout/header/nav-dropdown-item'
import { NavItemLink } from '@/components/layout/header/nav-link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { navConfig } from '@/config/nav'
import { cn } from '@/lib/utils'

interface DesktopNavProps {
  className?: string
}

export function DesktopNav({ className }: DesktopNavProps) {
  const t = useTranslations('components.nav')

  return (
    <nav aria-label="Main navigation" className={cn('items-center', className)}>
      <NavigationMenu>
        <NavigationMenuList className="gap-1">
          {navConfig.map((item) => (
            <NavigationMenuItem key={item.titleKey}>
              {item.items && item.items.length > 0 ? (
                <>
                  <NavigationMenuTrigger className="bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent data-[state=open]:text-foreground data-[state=open]:bg-accent/80 transition-colors">
                    {t(item.titleKey)}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-100 gap-2 p-3 md:w-125 md:grid-cols-2">
                      {item.items.map((subItem) => (
                        <NavDropdownItem
                          key={subItem.titleKey}
                          href={subItem.href}
                          title={t(subItem.titleKey)}
                          description={t(subItem.descriptionKey)}
                          iconNode={
                            subItem.icon ? <subItem.icon className="size-4.5" /> : undefined
                          }
                          color={item.color}
                        />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavItemLink href={item.href || '/'} title={t(item.titleKey)} />
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  )
}
