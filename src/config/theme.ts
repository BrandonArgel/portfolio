import { Monitor, Moon, Sun } from 'lucide-react'

export const THEME_OPTIONS = [
  { value: 'light', labelKey: 'light', icon: Sun },
  { value: 'dark', labelKey: 'dark', icon: Moon },
  { value: 'system', labelKey: 'system', icon: Monitor },
] as const
