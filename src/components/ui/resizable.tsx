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
  groupRef: groupRefProp,
  onLayoutChanged: onLayoutChangedProp,
  ...props
}: ResizablePanelGroupProps) {
  const resolvedOrientation = orientation ?? direction
  const internalGroupRef = ResizablePrimitive.useGroupRef()

  const setGroupRef = React.useCallback(
    (instance: ResizablePrimitive.GroupImperativeHandle | null) => {
      internalGroupRef.current = instance
      if (!groupRefProp) return
      if (typeof groupRefProp === 'function') {
        groupRefProp(instance)
      } else {
        ;(
          groupRefProp as React.MutableRefObject<ResizablePrimitive.GroupImperativeHandle | null>
        ).current = instance
      }
    },
    [groupRefProp, internalGroupRef],
  )

  React.useEffect(() => {
    if (defaultLayoutProp || !autoSaveId) return
    try {
      const saved = window.localStorage.getItem(`react-resizable-panels:${autoSaveId}`)
      if (!saved) return
      const parsed = JSON.parse(saved) as ResizablePrimitive.Layout
      if (parsed && typeof parsed === 'object') {
        internalGroupRef.current?.setLayout(parsed)
      }
    } catch {
      // Ignore storage or JSON errors
    }
  }, [autoSaveId, defaultLayoutProp, internalGroupRef])

  const handleLayoutChanged = React.useCallback(
    (layout: ResizablePrimitive.Layout, meta: ResizablePrimitive.LayoutChangedMeta) => {
      onLayoutChangedProp?.(layout, meta)
      if (autoSaveId && typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(
            `react-resizable-panels:${autoSaveId}`,
            JSON.stringify(layout),
          )
        } catch {}
      }
    },
    [autoSaveId, onLayoutChangedProp],
  )

  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      orientation={resolvedOrientation}
      defaultLayout={defaultLayoutProp}
      groupRef={setGroupRef}
      onLayoutChanged={handleLayoutChanged}
      className={cn('flex h-full w-full aria-[orientation=vertical]:flex-col', className)}
      {...props}
    />
  )
}

function formatPanelSize(size: number | string | undefined): number | string | undefined {
  if (typeof size === 'number' && size >= 0 && size <= 100) {
    return `${size}%`
  }
  return size
}

function ResizablePanel({
  defaultSize,
  minSize,
  maxSize,
  collapsedSize,
  className,
  style,
  ...props
}: ResizablePrimitive.PanelProps) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      defaultSize={formatPanelSize(defaultSize)}
      minSize={formatPanelSize(minSize)}
      maxSize={formatPanelSize(maxSize)}
      collapsedSize={formatPanelSize(collapsedSize)}
      className={cn('min-w-0', className)}
      style={{ overflow: 'hidden', ...style }}
      {...props}
    />
  )
}

export type ResizableHandleProps = ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}

function ResizableHandle({ withHandle, className, ...props }: ResizableHandleProps) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        'relative z-20 flex w-px shrink-0 items-center justify-center bg-border transition-colors outline-hidden after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2 hover:bg-primary/40 focus-visible:outline-hidden data-[separator=active]:bg-primary aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-2 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="pointer-events-none z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border transition-colors in-data-[separator=active]:bg-primary" />
      )}
    </ResizablePrimitive.Separator>
  )
}

export {
  type GroupImperativeHandle,
  type PanelImperativeHandle,
  useGroupRef,
  usePanelRef,
} from 'react-resizable-panels'
export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
