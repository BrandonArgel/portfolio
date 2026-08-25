'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useMemo, useState } from 'react'
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
import { type CommandActionId, commandPaletteConfig, navConfig } from '@/config/nav'
import { useIsMac } from '@/hooks/use-is-mac'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const isMac = useIsMac()

  // Global toggle shortcuts
  useKeyboardShortcut('k', () => setOpen((prev) => !prev), true)
  useKeyboardShortcut('t', () => toggleTheme(), false)

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
        title: string
        href: string
        description?: string
        icon?: React.ElementType
      }>
    }> = []

    for (const item of navConfig) {
      if (item.items && item.items.length > 0) {
        groups.push({
          heading: item.title,
          items: item.items.map((sub) => ({
            title: sub.title,
            href: sub.href,
            description: sub.description,
            icon: sub.icon,
          })),
        })
      } else if (item.href) {
        // Group standalone top-level items under "Navigation"
        const navGroup = groups.find((g) => g.heading === 'Navigation')
        if (navGroup) {
          navGroup.items.push({
            title: item.title,
            href: item.href,
            icon: item.icon,
          })
        } else {
          groups.unshift({
            heading: 'Navigation',
            items: [
              {
                title: item.title,
                href: item.href,
                icon: item.icon,
              },
            ],
          })
        }
      }
    }

    return groups
  }, [])

  return (
    <>
      {/* Header Search Trigger Button */}
      <Button
        type="button"
        aria-label="Open search command palette"
        onClick={() => setOpen(true)}
        className="flex xl:hidden items-center cursor-pointer bg-transparent border-none outline-none text-left"
        variant="ghost"
      >
        <Search className="shrink-0 text-muted-foreground" />
      </Button>
      <button
        type="button"
        aria-label="Open search command palette"
        onClick={() => setOpen(true)}
        className="hidden xl:flex items-center cursor-pointer bg-transparent p-0 border-none outline-none text-left"
      >
        <InputGroup className="h-9 w-64 rounded-md border border-input/40 bg-input/20 px-2.5 text-xs text-muted-foreground hover:bg-input/35 hover:text-foreground hover:border-input/60 transition-colors shadow-none select-none">
          <InputGroupAddon align="inline-start" className="p-0 mr-2">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
          </InputGroupAddon>
          <span className="flex-1 text-xs text-muted-foreground text-left">Search...</span>
          <InputGroupAddon align="inline-end" className="p-0 ml-auto">
            <KbdGroup className="gap-0.5">
              <Kbd className="h-4.5 min-w-4 text-[10px] px-1 bg-muted/60 text-muted-foreground">
                {isMac ? '⌘' : 'Ctrl'}
              </Kbd>
              <Kbd className="h-4.5 min-w-4 text-[10px] px-1 bg-muted/60 text-muted-foreground">
                K
              </Kbd>
            </KbdGroup>
          </InputGroupAddon>
        </InputGroup>
      </button>

      {/* Command Palette Modal */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={commandPaletteConfig.title}
        description={commandPaletteConfig.description}
        className="w-full max-w-125!"
      >
        <CommandInput placeholder={commandPaletteConfig.placeholder} />

        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Quick Actions (Config Driven) */}
          {commandPaletteConfig.quickActions.length > 0 && (
            <CommandGroup heading="Quick actions">
              {commandPaletteConfig.quickActions.map((action) => {
                let ActionIcon = action.icon

                if (action.dynamicIcon) {
                  ActionIcon =
                    resolvedTheme === 'dark' ? action.dynamicIcon.dark : action.dynamicIcon.light
                }

                return (
                  <CommandItem key={action.id} onSelect={() => handleAction(action.id)}>
                    {ActionIcon && <ActionIcon className="size-4 text-primary" />}
                    <span>{action.title}</span>
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
                  return (
                    <CommandItem
                      key={item.href}
                      value={`${group.heading} ${item.title} ${item.description || ''}`}
                      onSelect={() => handleSelect(() => router.push(item.href))}
                    >
                      {ItemIcon && <ItemIcon className="size-4 text-muted-foreground" />}
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.description && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1">
                            {item.description}
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
                  return (
                    <CommandItem
                      key={item.title}
                      value={`${extraGroup.heading} ${item.title} ${item.description || ''} ${item.keywords?.join(' ') || ''}`}
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
                        <span>{item.title}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
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
              // 2. Aquí puedes ajustar el gap-1.5 interno (distancia entre la tecla y el texto)
              <div key={shortcut.label} className="flex items-center gap-1.5">
                {shortcut.modifier ? (
                  <KbdGroup className="gap-0.5">
                    <Kbd className="h-4 min-w-4 text-[10px] px-1 bg-background border border-border/80">
                      {isMac ? '⌘' : 'Ctrl'}
                    </Kbd>
                    <Kbd className="h-4 min-w-4 text-[10px] px-1 bg-background border border-border/80">
                      {shortcut.key}
                    </Kbd>
                  </KbdGroup>
                ) : (
                  <Kbd className="h-4 min-w-4 text-[10px] px-1 bg-background border border-border/80">
                    {shortcut.key}
                  </Kbd>
                )}
                <span>{shortcut.label}</span>

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
