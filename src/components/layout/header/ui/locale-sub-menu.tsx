'use client'

import { Check, Globe } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { LOCALE_META } from '@/config/locale'
import { routing } from '@/i18n/routing'
import { useLocaleSwitcher } from '../hooks/use-locale-switcher'

export function LocaleSubMenu() {
  const tGlobal = useTranslations('common')
  const { currentLocale, changeLocale, isPending } = useLocaleSwitcher()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2 cursor-pointer" disabled={isPending}>
        <Globe className="size-4 text-muted-foreground" />
        <span>{tGlobal('labels.language')}</span>
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent>
        {routing.locales.map((loc) => {
          const meta = LOCALE_META[loc]
          const isSelected = currentLocale === loc

          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => changeLocale(loc)}
              role="menuitemradio"
              aria-checked={isSelected}
              disabled={isPending}
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
  )
}
