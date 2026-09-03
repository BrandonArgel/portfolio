'use client'

import * as React from 'react'
import * as ResizablePrimitive from 'react-resizable-panels'

import { cn } from '@/lib/utils'

export type ResizablePanelGroupProps = Omit<ResizablePrimitive.GroupProps, 'orientation'> & {
  direction?: 'horizontal' | 'vertical'
  orientation?: 'horizontal' | 'vertical'
  autoSaveId?: string
}

function ResizablePanelGroup({
  className,
  direction = 'horizontal',
  orientation,
  autoSaveId,
  defaultLayout: defaultLayoutProp,
  onLayoutChanged: onLayoutChangedProp,
  ...props
}: ResizablePanelGroupProps) {
  const resolvedOrientation = orientation ?? direction

  const [defaultLayout] = React.useState<ResizablePrimitive.Layout | undefined>(() => {
    if (defaultLayoutProp) return defaultLayoutProp
    if (typeof window !== 'undefined' && autoSaveId) {
      try {
        const saved = localStorage.getItem(`react-resizable-panels:${autoSaveId}`)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return undefined
  })

  const handleLayoutChanged = React.useCallback(
    (layout: ResizablePrimitive.Layout, meta: ResizablePrimitive.LayoutChangedMeta) => {
      onLayoutChangedProp?.(layout, meta)
      if (autoSaveId && typeof window !== 'undefined') {
        try {
          localStorage.setItem(`react-resizable-panels:${autoSaveId}`, JSON.stringify(layout))
        } catch {}
      }
    },
    [autoSaveId, onLayoutChangedProp],
  )

  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      orientation={resolvedOrientation}
      defaultLayout={defaultLayout}
      onLayoutChanged={handleLayoutChanged}
      className={cn('flex h-full w-full aria-[orientation=vertical]:flex-col', className)}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        'relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90',
        className,
      )}
      {...props}
    >
      {withHandle && <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
