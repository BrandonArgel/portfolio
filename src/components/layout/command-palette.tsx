'use client'

import { useTheme } from '@teispace/next-themes'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Separator } from '@/components/ui/separator'
import {
  type CommandActionId,
  commandPaletteConfig,
  type NavMessageKey,
  navConfig,
} from '@/config/nav'
import { useIsMac } from '@/hooks/use-is-mac'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import { useRouter } from '@/i18n/navigation'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const isMac = useIsMac()
  const tCmd = useTranslations('components.layout.command_palette')
  const tNav = useTranslations('components.nav')
  const tGlobal = useTranslations('common')
  const tHeader = useTranslations('components.layout.header')

  // Global toggle shortcuts
  useKeyboardShortcut('t', () => toggleTheme())
  useKeyboardShortcut('ctrl+k', () => setOpen((prev) => !prev))

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  const handleSelect = (callback: () => void) => {
    setOpen(false)
    callback()
  }

  const handleAction = (actionId: CommandActionId) => {
    if (actionId === 'toggle-theme') {
      handleSelect(toggleTheme)
    }
  }

  // Derive grouped navigation pages dynamically from navConfig
  const navigationGroups = useMemo(() => {
    const groups: Array<{
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
        groups.push({
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
        const navGroup = groups.find((g) => g.heading === navLabel)
        if (navGroup) {
          navGroup.items.push({
            titleKey: item.titleKey,
            href: item.href,
            icon: item.icon,
          })
        } else {
          groups.unshift({
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

    return groups
  }, [tNav, tGlobal])

  return (
    <>
      {/* Header Search Trigger Button */}
      <Button
        type="button"
        aria-label={tHeader('open_search')}
        onClick={() => setOpen(true)}
        className="flex xl:hidden items-center cursor-pointer bg-transparent border-none outline-none text-left"
        variant="ghost"
      >
        <Search className="shrink-0 text-muted-foreground" />
      </Button>
      <button
        type="button"
        aria-label={tHeader('open_search')}
        onClick={() => setOpen(true)}
        className="hidden xl:flex items-center cursor-pointer bg-transparent p-0 border-none outline-none text-left"
      >
        <InputGroup className="h-9 w-64 rounded-md border border-input/40 bg-input/20 px-2.5 text-xs text-muted-foreground hover:bg-input/35 hover:text-foreground hover:border-input/60 transition-colors shadow-none select-none">
          <InputGroupAddon align="inline-start" className="p-0 mr-2">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
          </InputGroupAddon>
          <span className="flex-1 text-xs text-muted-foreground text-left">
            {tGlobal('actions.search')}...
          </span>
          <InputGroupAddon align="inline-end" className="p-0 ml-auto">
            <KbdGroup className="gap-0.5">
              <Kbd className="h-4.5 min-w-4 text-xs px-1 bg-muted/60 text-muted-foreground">
                {isMac ? '⌘' : 'Ctrl'}
              </Kbd>
              <Kbd className="h-4.5 min-w-4 text-xs px-1 bg-muted/60 text-muted-foreground">K</Kbd>
            </KbdGroup>
          </InputGroupAddon>
        </InputGroup>
      </button>

      {/* Command Palette Modal */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
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
    </>
  )
}
