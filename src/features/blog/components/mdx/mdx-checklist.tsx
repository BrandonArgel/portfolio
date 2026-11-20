'use client'

import type React from 'react'
import { createContext, useContext, useState } from 'react'

import { cn } from '@/lib/utils'

const ChecklistContext = createContext<{ interactive: boolean }>({ interactive: false })

interface ChecklistProps {
  interactive?: boolean
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export function Checklist({ interactive, disabled, children, className }: ChecklistProps) {
  const isInteractive = disabled ? false : (interactive ?? true)

  return (
    <ChecklistContext value={{ interactive: isInteractive }}>
      <div data-checklist={isInteractive ? 'interactive' : 'readonly'} className={className}>
        {children}
      </div>
    </ChecklistContext>
  )
}

export function MdxTaskCheckbox({
  checked,
  defaultChecked,
  disabled: _mdxDisabled,
  onChange: _onChange,
  readOnly: _readOnly,
  type: _type,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'input'>) {
  const { interactive } = useContext(ChecklistContext)
  const initialChecked = Boolean(checked ?? defaultChecked)
  const [isChecked, setIsChecked] = useState(initialChecked)

  const baseClasses =
    'mx-0 mt-1.5 size-4 shrink-0 rounded border-border accent-primary focus:ring-0'

  if (!interactive) {
    return (
      <input
        type="checkbox"
        checked={initialChecked}
        disabled
        readOnly
        className={cn(baseClasses, 'cursor-default', className)}
        {...props}
      />
    )
  }

  return (
    <input
      type="checkbox"
      checked={isChecked}
      onChange={(event) => setIsChecked(event.target.checked)}
      className={cn(baseClasses, 'cursor-pointer', className)}
      {...props}
    />
  )
}
