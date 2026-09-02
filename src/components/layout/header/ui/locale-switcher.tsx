'use client'

import { Check } from 'lucide-react'

import { LOCALE_META } from '@/config/locale'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { useLocaleSwitcher } from '../hooks/use-locale-switcher'

interface LocaleSwitcherProps {
  className?: string
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const { currentLocale, changeLocale, isPending } = useLocaleSwitcher()

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)}>
      {routing.locales.map((loc) => {
        const meta = LOCALE_META[loc]
        const isSelected = currentLocale === loc

        return (
          <button
            type="button"
            key={loc}
            onClick={() => changeLocale(loc)}
            disabled={isPending}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer',
              isSelected
                ? 'bg-primary/15 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            <span aria-hidden="true" className="text-base">
              {meta?.flag}
            </span>

            <span className="flex-1 text-left">{meta?.nativeName ?? loc}</span>

            {isSelected && <Check className="size-4" />}
          </button>
        )
      })}
    </div>
  )
}
