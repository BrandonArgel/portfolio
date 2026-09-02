'use client'

import { useTranslations } from 'next-intl'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { navConfig } from '@/config/nav'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export function MobileNavLinks({ onNavigate }: { onNavigate: () => void }) {
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
