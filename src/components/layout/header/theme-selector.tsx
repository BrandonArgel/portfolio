'use client'

import { useTheme } from '@teispace/next-themes'
import { Check, Monitor, Moon, Sun, SunMoon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

const THEME_OPTIONS = [
  { value: 'light', labelKey: 'light', icon: Sun },
  { value: 'dark', labelKey: 'dark', icon: Moon },
  { value: 'system', labelKey: 'system', icon: Monitor },
] as const

export function ThemeSelectorSubmenu() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const t = useTranslations('components.theme_selector')
  const tGlobal = useTranslations('common.labels')

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
        <SunMoon className="size-4 text-muted-foreground" />
        <span>{tGlobal('theme')}</span>
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

              <span className="flex-1">{t(labelKey)}</span>

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

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const THEME_LABEL_KEYS = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const

type ThemeKey = keyof typeof THEME_LABEL_KEYS

export function ThemeToggleButtons() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const t = useTranslations('components.theme_selector')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <ButtonGroup className="w-full">
        {Object.keys(THEME_ICONS).map((key) => (
          <div key={key} className="flex-1 h-9">
            <Skeleton className="h-full w-full rounded-none first:rounded-l-md last:rounded-r-md" />
          </div>
        ))}
      </ButtonGroup>
    )
  }

  return (
    <ButtonGroup className="w-full">
      {Object.entries(THEME_ICONS).map(([key, Icon]) => {
        const isActive = theme === key
        const labelKey = THEME_LABEL_KEYS[key as ThemeKey]

        return (
          <Button
            key={key}
            variant={isActive ? 'default' : 'outline'}
            onClick={() => setTheme(key)}
            className={`flex-1 capitalize font-medium transition-colors ${
              isActive ? 'pointer-events-none' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="mr-2 size-4" />
            {t(labelKey)}
          </Button>
        )
      })}
    </ButtonGroup>
  )
}
