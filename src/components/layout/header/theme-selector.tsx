'use client'

import { Check, Monitor, Moon, Sun, SunMoon } from 'lucide-react'
import { useTheme } from 'next-themes'
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
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export function ThemeSelectorSubmenu() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
        <SunMoon className="size-4 text-muted-foreground" />
        <span>Theme</span>
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent>
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
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

              <span className="flex-1">{label}</span>

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

export function ThemeToggleButtons() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

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

        return (
          <Button
            key={key}
            variant={isActive ? 'default' : 'secondary'}
            onClick={() => setTheme(key)}
            className={`flex-1 capitalize font-medium transition-colors ${
              isActive ? 'pointer-events-none' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="mr-2 size-4" />
            {key}
          </Button>
        )
      })}
    </ButtonGroup>
  )
}
