'use client'

import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Shortcut } from '@/components/ui/shortcut'
import { ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'

export interface MenuToggleItemProps {
  value: string
  icon: LucideIcon
  action: () => void
  label: string
  shortcutKey?: string
  registerShortcut?: boolean
  shortcutEnabled?: boolean
}

export function MenuToggleItem({
  value,
  icon: Icon,
  action,
  label,
  shortcutKey,
  registerShortcut = false,
  shortcutEnabled = false,
}: MenuToggleItemProps) {
  const tActions = useTranslations('common.actions')

  useKeyboardShortcut(shortcutKey ?? '', action, {
    ignoreInInputs: false,
    enabled: Boolean(registerShortcut && shortcutKey && shortcutEnabled),
  })

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ToggleGroupItem
            value={value}
            aria-label={tActions('toggle_bubble_item', { value })}
            onClick={action}
          >
            <Icon className="size-4" />
          </ToggleGroupItem>
        }
      />
      <TooltipContent sideOffset={8} className="flex flex-col items-center gap-1">
        <span className="text-xs font-medium">{label}</span>
        {shortcutKey && <Shortcut keys={shortcutKey} />}
      </TooltipContent>
    </Tooltip>
  )
}
