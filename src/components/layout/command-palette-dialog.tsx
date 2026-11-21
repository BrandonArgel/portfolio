'use client'

import { useTheme } from '@teispace/next-themes'
import { useTranslations } from 'next-intl'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Separator } from '@/components/ui/separator'
import {
  type CommandActionId,
  commandPaletteConfig,
  type NavMessageKey,
  navConfig,
} from '@/config/nav'
import { useIsMac } from '@/hooks/use-is-mac'
import { useRouter } from '@/i18n/navigation'

interface CommandPaletteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleTheme: () => void
}

export function CommandPaletteDialog({
  open,
  onOpenChange,
  onToggleTheme,
}: CommandPaletteDialogProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isMac = useIsMac()
  const tCmd = useTranslations('components.layout.command_palette')
  const tNav = useTranslations('components.nav')
  const tGlobal = useTranslations('common')

  const handleSelect = (callback: () => void) => {
    onOpenChange(false)
    callback()
  }

  const handleAction = (actionId: CommandActionId) => {
    if (actionId === 'toggle-theme') {
      handleSelect(onToggleTheme)
    }
  }

  // Derive grouped navigation pages dynamically from navConfig
  const navigationGroups: Array<{
    heading: string
    items: Array<{
      titleKey: NavMessageKey
      href: string
      descriptionKey?: NavMessageKey
      icon?: React.ElementType
    }>
  }> = []

  for (const item of navConfig) {
    if (item.items && item.items.length > 0) {
      navigationGroups.push({
        heading: tNav(item.titleKey),
        items: item.items.map((sub) => ({
          titleKey: sub.titleKey,
          href: sub.href,
          descriptionKey: sub.descriptionKey,
          icon: sub.icon,
        })),
      })
    } else if (item.href) {
      // Group standalone top-level items under "Navigation"
      const navLabel = tGlobal('labels.navigation')
      const navGroup = navigationGroups.find((g) => g.heading === navLabel)
      if (navGroup) {
        navGroup.items.push({
          titleKey: item.titleKey,
          href: item.href,
          icon: item.icon,
        })
      } else {
        navigationGroups.unshift({
          heading: navLabel,
          items: [
            {
              titleKey: item.titleKey,
              href: item.href,
              icon: item.icon,
            },
          ],
        })
      }
    }
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tCmd('title')}
      description={tCmd('description')}
      className="w-full max-w-125!"
    >
      <CommandInput placeholder={tCmd('placeholder')} />

      <CommandList>
        <CommandEmpty>{tGlobal('states.no_results')}</CommandEmpty>

        {/* Quick Actions (Config Driven) */}
        {commandPaletteConfig.quickActions.length > 0 && (
          <CommandGroup heading={tCmd('quick_actions')}>
            {commandPaletteConfig.quickActions.map((action) => {
              let ActionIcon = action.icon

              if (action.dynamicIcon) {
                ActionIcon =
                  resolvedTheme === 'dark' ? action.dynamicIcon.dark : action.dynamicIcon.light
              }

              return (
                <CommandItem key={action.id} onSelect={() => handleAction(action.id)}>
                  {ActionIcon && <ActionIcon className="size-4 text-primary" />}
                  <span>{tCmd(action.titleKey)}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        {/* Navigation Groups from navConfig */}
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.heading}>
            {(groupIndex > 0 || commandPaletteConfig.quickActions.length > 0) && (
              <CommandSeparator />
            )}
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => {
                const ItemIcon = item.icon
                const title = tNav(item.titleKey)
                const description = item.descriptionKey ? tNav(item.descriptionKey) : ''
                return (
                  <CommandItem
                    key={item.href}
                    value={`${group.heading} ${title} ${description}`}
                    onSelect={() => handleSelect(() => router.push(item.href))}
                  >
                    {ItemIcon && <ItemIcon className="size-4 text-muted-foreground" />}
                    <div className="flex flex-col">
                      <span>{title}</span>
                      {description && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </div>
        ))}

        {/* Extra Custom Groups from commandPaletteConfig */}
        {commandPaletteConfig.extraGroups.map((extraGroup) => (
          <div key={extraGroup.heading}>
            <CommandSeparator />
            <CommandGroup heading={extraGroup.heading}>
              {extraGroup.items.map((item) => {
                const ExtraIcon = item.icon
                const title = tNav(item.titleKey)
                const description = item.descriptionKey ? tNav(item.descriptionKey) : ''
                return (
                  <CommandItem
                    key={item.titleKey}
                    value={`${extraGroup.heading} ${title} ${description} ${item.keywords?.join(' ') || ''}`}
                    onSelect={() => {
                      if (item.actionId) {
                        handleAction(item.actionId)
                      } else if (item.href) {
                        const targetHref = item.href
                        handleSelect(() => router.push(targetHref))
                      }
                    }}
                  >
                    {ExtraIcon && <ExtraIcon className="size-4 text-muted-foreground" />}
                    <div className="flex flex-col">
                      <span>{title}</span>
                      {description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>

      {/* Interactive Command Palette Footer Bar (Config Driven) */}
      {commandPaletteConfig.shortcuts.length > 0 && (
        <div className="flex flex-wrap items-center justify-start gap-4 border-t border-border px-3 py-2 text-xs text-muted-foreground bg-muted/30 select-none">
          {commandPaletteConfig.shortcuts.map((shortcut, i) => (
            <div key={shortcut.labelKey} className="flex items-center gap-1.5">
              {shortcut.modifier ? (
                <KbdGroup className="gap-0.5">
                  <Kbd className="h-4 min-w-4 text-xs px-1 bg-background border border-border/80">
                    {isMac ? '⌘' : 'Ctrl'}
                  </Kbd>
                  <Kbd className="h-4 min-w-4 text-xs px-1 bg-background border border-border/80">
                    {shortcut.key}
                  </Kbd>
                </KbdGroup>
              ) : (
                <Kbd className="h-4 min-w-4 text-xs px-1 bg-background border border-border/80">
                  {shortcut.key}
                </Kbd>
              )}
              <span>{tCmd(shortcut.labelKey)}</span>

              {i !== commandPaletteConfig.shortcuts.length - 1 && (
                <Separator orientation="vertical" className="h-4 mx-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </CommandDialog>
  )
}
