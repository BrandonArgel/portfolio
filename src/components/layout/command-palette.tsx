'use client'

import { useTheme } from '@teispace/next-themes'
import { Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { useIsMac } from '@/hooks/use-is-mac'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'

const DynamicCommandPaletteDialog = dynamic(
  () => import('./command-palette-dialog').then((mod) => mod.CommandPaletteDialog),
  { ssr: false },
)

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const isMac = useIsMac()
  const tGlobal = useTranslations('common')
  const tHeader = useTranslations('components.layout.header')

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  const openCommandPalette = () => {
    setHasOpened(true)
    setOpen(true)
  }

  // Global toggle shortcuts
  useKeyboardShortcut('t', () => toggleTheme())
  useKeyboardShortcut('mod+k', () => {
    setHasOpened(true)
    setOpen((prev) => !prev)
  })

  return (
    <>
      {/* Header Search Trigger Button */}
      <Button
        type="button"
        aria-label={tHeader('open_search')}
        onClick={openCommandPalette}
        className="flex xl:hidden items-center cursor-pointer bg-transparent border-none outline-none text-left"
        variant="ghost"
      >
        <Search className="shrink-0 text-muted-foreground" />
      </Button>
      <button
        type="button"
        aria-label={tHeader('open_search')}
        onClick={openCommandPalette}
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

      {/* Lazy-loaded Command Palette Modal */}
      {hasOpened && (
        <DynamicCommandPaletteDialog
          open={open}
          onOpenChange={setOpen}
          onToggleTheme={toggleTheme}
        />
      )}
    </>
  )
}
