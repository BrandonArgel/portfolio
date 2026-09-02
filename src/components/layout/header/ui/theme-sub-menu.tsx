// src/components/layout/header/ui/theme-sub-menu.tsx
'use client'

import { useTheme } from '@teispace/next-themes'
import { Check, SunMoon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { THEME_OPTIONS } from '@/config/theme'

export function ThemeSubMenu() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  const tGlobal = useTranslations('common')
  const tTheme = useTranslations('components.theme_selector')

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
        <SunMoon className="size-4 text-muted-foreground" />
        <span>{tGlobal('labels.theme')}</span>
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent>
        {THEME_OPTIONS.map(({ value, labelKey, icon: Icon }) => {
          const isSelected = mounted && theme === value

          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              role="menuitemradio"
              aria-checked={isSelected}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Icon className="size-4 text-muted-foreground" />
              <span className="flex-1">{tTheme(labelKey)}</span>
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
