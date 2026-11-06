'use client'

import {
  ArrowBigUp, // Para Shift
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowRightToLine, // Para Tab
  ArrowUp,
  Command,
  CornerDownLeft, // Para Enter
  Delete, // Para Backspace
  Option,
} from 'lucide-react'
import * as React from 'react'
import { useIsMac } from '@/hooks/use-is-mac'
import { cn } from '@/lib/utils'
import { Kbd, KbdGroup } from './kbd'

interface ShortcutProps extends React.ComponentProps<typeof KbdGroup> {
  /** El string del atajo, ej: "mod+shift+a" */
  keys: string
  /** Símbolo de separación, por defecto "+" */
  separator?: React.ReactNode
}

// Mapa de íconos para teclas comunes
const iconMap: Record<string, React.ElementType> = {
  shift: ArrowBigUp,
  enter: CornerDownLeft,
  backspace: Delete,
  tab: ArrowRightToLine,
  up: ArrowUp,
  down: ArrowDown,
  left: ArrowLeft,
  right: ArrowRight,
}

// Mapa de textos para teclas que no usan ícono
const textMap: Record<string, string> = {
  escape: 'Esc',
  space: 'Space',
  ctrl: 'Ctrl', // En Windows
  alt: 'Alt', // En Windows
}

export function Shortcut({ keys, separator = '+', className, ...props }: ShortcutProps) {
  const isMac = useIsMac()

  const keyArray = keys.toLowerCase().split('+')

  const renderKey = (key: string) => {
    if (key === 'mod') {
      return isMac ? <Command className="size-3" /> : 'Ctrl'
    }
    if (key === 'alt' && isMac) {
      return <Option className="size-3" />
    }
    if (key === 'ctrl' && isMac) {
      return '^' // El símbolo de control en Mac
    }

    // 2. Si hay un ícono mapeado en Lucide
    const Icon = iconMap[key]
    if (Icon) {
      return <Icon className="size-3" />
    }

    // 3. Si hay un texto especial (como Esc o Space)
    if (textMap[key]) {
      return textMap[key]
    }

    // 4. Fallback: la letra normal en mayúscula
    return key.toUpperCase()
  }

  return (
    <KbdGroup className={cn('gap-1.5', className)} {...props}>
      {keyArray.map((key, index) => (
        <React.Fragment key={index}>
          <Kbd>{renderKey(key)}</Kbd>
          {index < keyArray.length - 1 && separator && (
            <span className="text-muted-foreground font-sans text-xs font-medium">{separator}</span>
          )}
        </React.Fragment>
      ))}
    </KbdGroup>
  )
}
