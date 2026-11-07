'use client'

import Cookies from 'js-cookie'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import type { PanelSize } from 'react-resizable-panels'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  usePanelRef,
} from '@/components/ui/resizable'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { cn } from '@/lib/utils'

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY = 'dashboard-sidebar-width-px'

const SIDEBAR_COLLAPSED_WIDTH_PX = 48
const SIDEBAR_MIN_WIDTH_PX = 200
const SIDEBAR_DEFAULT_WIDTH_PX = 256
const SIDEBAR_MAX_SIZE_PERCENT = 30
const SIDEBAR_COLLAPSED_THRESHOLD_PX = 56

const SIDEBAR_COLLAPSED_SIZE = `${SIDEBAR_COLLAPSED_WIDTH_PX}px`
const SIDEBAR_MIN_SIZE = `${SIDEBAR_MIN_WIDTH_PX}px`
const SIDEBAR_MAX_SIZE = `${SIDEBAR_MAX_SIZE_PERCENT}%`
const MAIN_PANEL_MIN_SIZE = `${100 - SIDEBAR_MAX_SIZE_PERCENT}%`

const TOGGLE_TRANSITION_MS = 220

function clampExpandedWidthPx(widthPx: number, viewportWidth: number): number {
  const maxPxForViewport = Math.max(
    SIDEBAR_MIN_WIDTH_PX,
    Math.floor(viewportWidth * (SIDEBAR_MAX_SIZE_PERCENT / 100)),
  )
  return Math.min(maxPxForViewport, Math.max(SIDEBAR_MIN_WIDTH_PX, Math.round(widthPx)))
}

export interface DashboardResizableLayoutProps {
  defaultOpen?: boolean
  sidebar: ReactNode
  children: ReactNode
}

export function DashboardResizableLayout({
  defaultOpen = true,
  sidebar,
  children,
}: DashboardResizableLayoutProps) {
  const isMobile = useIsMobile()
  const sidebarPanelRef = usePanelRef()

  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(defaultOpen)
  const [initialSidebarDefaultSize, setInitialSidebarDefaultSize] = useState<string>(
    defaultOpen ? `${SIDEBAR_DEFAULT_WIDTH_PX}px` : SIDEBAR_COLLAPSED_SIZE,
  )
  const [isAnimatingToggle, setIsAnimatingToggle] = useState<boolean>(false)

  const openRef = useRef<boolean>(defaultOpen)
  const isSyncingFromPanelRef = useRef<boolean>(false)
  const isImperativeResizeRef = useRef<boolean>(false)
  const isAnimatingToggleRef = useRef<boolean>(false)
  const lastExpandedWidthPxRef = useRef<number>(SIDEBAR_DEFAULT_WIDTH_PX)
  const toggleAnimationTimerRef = useRef<number | null>(null)

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    const viewportWidth = window.innerWidth || 1280
    let resolvedExpandedPx = SIDEBAR_DEFAULT_WIDTH_PX

    try {
      const savedWidth = window.localStorage.getItem(SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY)
      if (savedWidth) {
        const parsed = Number.parseFloat(savedWidth)
        if (Number.isFinite(parsed) && parsed >= SIDEBAR_MIN_WIDTH_PX) {
          resolvedExpandedPx = parsed
        }
      }
    } catch {
      // Ignore storage access errors
    }

    const clampedPx = clampExpandedWidthPx(resolvedExpandedPx, viewportWidth)
    lastExpandedWidthPxRef.current = clampedPx

    if (openRef.current) {
      setInitialSidebarDefaultSize(`${clampedPx}px`)
    } else {
      setInitialSidebarDefaultSize(SIDEBAR_COLLAPSED_SIZE)
    }

    setIsMounted(true)

    return () => {
      if (toggleAnimationTimerRef.current !== null) {
        window.clearTimeout(toggleAnimationTimerRef.current)
      }
    }
  }, [])

  const startToggleTransition = useCallback(() => {
    isAnimatingToggleRef.current = true
    setIsAnimatingToggle(true)
    if (toggleAnimationTimerRef.current !== null) {
      window.clearTimeout(toggleAnimationTimerRef.current)
    }
    toggleAnimationTimerRef.current = window.setTimeout(() => {
      isAnimatingToggleRef.current = false
      setIsAnimatingToggle(false)
      toggleAnimationTimerRef.current = null
    }, TOGGLE_TRANSITION_MS)
  }, [])

  const stopToggleTransition = useCallback(() => {
    if (toggleAnimationTimerRef.current !== null) {
      window.clearTimeout(toggleAnimationTimerRef.current)
      toggleAnimationTimerRef.current = null
    }
    isImperativeResizeRef.current = false
    isAnimatingToggleRef.current = false
    setIsAnimatingToggle(false)
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      // Do not run imperative collapse/expand when state change originated from
      // panel resize events.
      if (isSyncingFromPanelRef.current) {
        return
      }

      openRef.current = nextOpen
      setOpen(nextOpen)

      const panel = sidebarPanelRef.current
      if (!panel) return

      isImperativeResizeRef.current = true
      startToggleTransition()

      if (nextOpen) {
        if (panel.isCollapsed()) {
          panel.expand()
        }
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth || 1280 : 1280
        const targetPx = clampExpandedWidthPx(lastExpandedWidthPxRef.current, viewportWidth)
        panel.resize(`${targetPx}px`)
      } else {
        const currentSize = panel.getSize()
        if (!panel.isCollapsed() && currentSize.inPixels >= SIDEBAR_MIN_WIDTH_PX - 2) {
          lastExpandedWidthPxRef.current = Math.round(currentSize.inPixels)
        }
        panel.collapse()
      }

      queueMicrotask(() => {
        isImperativeResizeRef.current = false
      })
    },
    [sidebarPanelRef, startToggleTransition],
  )

  const handleSidebarResize = useCallback(
    (
      panelSize: PanelSize,
      _panelId: string | number | undefined,
      prevPanelSize: PanelSize | undefined,
    ) => {
      // Ignore the initial mount callback from react-resizable-panels and any
      // callbacks fired during an imperative toggle/animation so transient DOM
      // widths never overwrite `open`.
      if (
        prevPanelSize === undefined ||
        isImperativeResizeRef.current ||
        isAnimatingToggleRef.current
      ) {
        return
      }

      const panel = sidebarPanelRef.current
      const isPanelCollapsed = panel
        ? panel.isCollapsed()
        : panelSize.inPixels <= SIDEBAR_COLLAPSED_THRESHOLD_PX

      if (!isPanelCollapsed && panelSize.inPixels >= SIDEBAR_MIN_WIDTH_PX - 2) {
        lastExpandedWidthPxRef.current = Math.round(panelSize.inPixels)
      }

      const shouldBeOpen = !isPanelCollapsed
      if (shouldBeOpen !== openRef.current) {
        isSyncingFromPanelRef.current = true
        openRef.current = shouldBeOpen
        setOpen(shouldBeOpen)
        queueMicrotask(() => {
          isSyncingFromPanelRef.current = false
        })
      }
    },
    [sidebarPanelRef],
  )

  const handleLayoutChanged = useCallback(() => {
    const panel = sidebarPanelRef.current
    if (!panel) return

    // `panel.resize()` and `panel.expand()` synchronously fire `onLayoutChanged`
    // before React commits the new flex-grow style to the DOM (so `getSize().inPixels`
    // still reads the old 48px DOM offsetWidth). Never overwrite `open` during an
    // imperative toggle or its CSS transition.
    if (isImperativeResizeRef.current || isAnimatingToggleRef.current) {
      Cookies.set(SIDEBAR_COOKIE_NAME, String(openRef.current), {
        expires: 7,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      return
    }

    const currentSize = panel.getSize()
    const isPanelCollapsed = panel.isCollapsed()
    const nextOpen = !isPanelCollapsed

    if (nextOpen !== openRef.current) {
      isSyncingFromPanelRef.current = true
      openRef.current = nextOpen
      setOpen(nextOpen)
      queueMicrotask(() => {
        isSyncingFromPanelRef.current = false
      })
    }

    Cookies.set(SIDEBAR_COOKIE_NAME, String(nextOpen), {
      expires: 7,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    if (!isPanelCollapsed && currentSize.inPixels >= SIDEBAR_MIN_WIDTH_PX - 2) {
      const widthPx = Math.round(currentSize.inPixels)
      lastExpandedWidthPxRef.current = widthPx
      try {
        window.localStorage.setItem(SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY, String(widthPx))
      } catch {
        // Ignore storage access errors
      }
    }
  }, [sidebarPanelRef])

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={handleOpenChange}
      openWithShortcut
      className={cn(!isMobile && 'h-dvh overflow-hidden')}
    >
      {!isMounted ? (
        <div className="flex h-dvh w-full overflow-hidden">
          <div
            className={cn(
              'hidden h-full shrink-0 overflow-hidden border-r border-sidebar-border md:block',
              defaultOpen ? 'w-(--sidebar-width) min-w-50' : 'w-(--sidebar-width-icon) min-w-12',
            )}
          >
            {sidebar}
          </div>
          <SidebarInset className="h-full min-w-0 flex-1 overflow-y-auto">
            <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:hidden">
              <SidebarTrigger />
            </header>
            {children}
          </SidebarInset>
        </div>
      ) : isMobile ? (
        <>
          {sidebar}
          <SidebarInset>
            <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:hidden">
              <SidebarTrigger />
            </header>
            {children}
          </SidebarInset>
        </>
      ) : (
        <ResizablePanelGroup
          direction="horizontal"
          onLayoutChanged={handleLayoutChanged}
          className={cn(
            'h-dvh w-full overflow-hidden [&_[data-panel]#dashboard-sidebar-panel]:min-w-12!',
            isAnimatingToggle &&
              '[&_[data-panel]]:transition-[flex-grow] [&_[data-panel]]:duration-200 [&_[data-panel]]:ease-in-out',
          )}
        >
          <ResizablePanel
            id="dashboard-sidebar-panel"
            panelRef={sidebarPanelRef}
            defaultSize={initialSidebarDefaultSize}
            minSize={SIDEBAR_MIN_SIZE}
            maxSize={SIDEBAR_MAX_SIZE}
            collapsible
            collapsedSize={SIDEBAR_COLLAPSED_SIZE}
            groupResizeBehavior="preserve-pixel-size"
            onResize={handleSidebarResize}
            className="flex h-full w-full min-w-12 flex-col overflow-hidden"
          >
            {sidebar}
          </ResizablePanel>

          <ResizableHandle
            withHandle
            onPointerDown={stopToggleTransition}
            className="bg-sidebar-border"
          />

          <ResizablePanel
            id="dashboard-main-panel"
            minSize={MAIN_PANEL_MIN_SIZE}
            className="flex h-full min-w-0 flex-1 flex-col overflow-hidden"
          >
            <SidebarInset className="h-full min-w-0 flex-1 overflow-y-auto">
              {children}
            </SidebarInset>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </SidebarProvider>
  )
}
