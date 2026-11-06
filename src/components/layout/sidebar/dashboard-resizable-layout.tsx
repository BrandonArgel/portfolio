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
const SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY = 'dashboard-sidebar-expanded-width'

const SIDEBAR_DEFAULT_SIZE = 18
const SIDEBAR_MIN_SIZE = 15
const SIDEBAR_MAX_SIZE = 25
const SIDEBAR_COLLAPSED_SIZE = 4
const TOGGLE_TRANSITION_MS = 220

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
  const [expandedSize, setExpandedSize] = useState<number>(SIDEBAR_DEFAULT_SIZE)
  const [isAnimatingToggle, setIsAnimatingToggle] = useState<boolean>(false)

  const openRef = useRef<boolean>(defaultOpen)
  const isSyncingFromPanelRef = useRef<boolean>(false)
  const lastExpandedSizeRef = useRef<number>(SIDEBAR_DEFAULT_SIZE)
  const toggleAnimationTimerRef = useRef<number | null>(null)

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    try {
      const savedWidth = window.localStorage.getItem(SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY)
      if (savedWidth) {
        const parsed = Number.parseFloat(savedWidth)
        if (Number.isFinite(parsed) && parsed >= SIDEBAR_MIN_SIZE && parsed <= SIDEBAR_MAX_SIZE) {
          lastExpandedSizeRef.current = parsed
          setExpandedSize(parsed)
        }
      }
    } catch {
      // Ignore storage access errors
    }

    setIsMounted(true)

    return () => {
      if (toggleAnimationTimerRef.current !== null) {
        window.clearTimeout(toggleAnimationTimerRef.current)
      }
    }
  }, [])

  const startToggleTransition = useCallback(() => {
    setIsAnimatingToggle(true)
    if (toggleAnimationTimerRef.current !== null) {
      window.clearTimeout(toggleAnimationTimerRef.current)
    }
    toggleAnimationTimerRef.current = window.setTimeout(() => {
      setIsAnimatingToggle(false)
      toggleAnimationTimerRef.current = null
    }, TOGGLE_TRANSITION_MS)
  }, [])

  const stopToggleTransition = useCallback(() => {
    if (toggleAnimationTimerRef.current !== null) {
      window.clearTimeout(toggleAnimationTimerRef.current)
      toggleAnimationTimerRef.current = null
    }
    setIsAnimatingToggle(false)
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      openRef.current = nextOpen
      setOpen(nextOpen)

      if (isSyncingFromPanelRef.current) {
        return
      }

      const panel = sidebarPanelRef.current
      if (!panel) return

      startToggleTransition()

      if (nextOpen) {
        if (panel.isCollapsed()) {
          panel.expand()
        }
        const afterExpandPct = panel.getSize().asPercentage
        if (afterExpandPct <= SIDEBAR_COLLAPSED_SIZE + 0.5) {
          panel.resize(`${lastExpandedSizeRef.current}%`)
        }
      } else {
        const currentPct = panel.getSize().asPercentage
        if (currentPct >= SIDEBAR_MIN_SIZE && currentPct <= SIDEBAR_MAX_SIZE) {
          lastExpandedSizeRef.current = currentPct
        }
        if (!panel.isCollapsed()) {
          panel.collapse()
        }
      }
    },
    [sidebarPanelRef, startToggleTransition],
  )

  const handleSidebarResize = useCallback(
    (
      panelSize: PanelSize,
      _panelId: string | number | undefined,
      prevPanelSize: PanelSize | undefined,
    ) => {
      // Ignore the initial mount callback from react-resizable-panels so pre-stabilization
      // measurements never overwrite the server-rendered open/collapsed state.
      if (prevPanelSize === undefined) {
        return
      }

      const panel = sidebarPanelRef.current
      const isPanelCollapsed =
        panel?.isCollapsed() ?? panelSize.asPercentage <= SIDEBAR_COLLAPSED_SIZE + 0.5

      if (
        !isPanelCollapsed &&
        panelSize.asPercentage >= SIDEBAR_MIN_SIZE &&
        panelSize.asPercentage <= SIDEBAR_MAX_SIZE
      ) {
        lastExpandedSizeRef.current = panelSize.asPercentage
        try {
          window.localStorage.setItem(
            SIDEBAR_EXPANDED_WIDTH_STORAGE_KEY,
            String(panelSize.asPercentage),
          )
        } catch {
          // Ignore storage access errors
        }
      }

      const shouldBeOpen = !isPanelCollapsed
      if (shouldBeOpen !== openRef.current) {
        isSyncingFromPanelRef.current = true
        openRef.current = shouldBeOpen
        setOpen(shouldBeOpen)

        Cookies.set(SIDEBAR_COOKIE_NAME, String(shouldBeOpen), {
          expires: 7,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })

        queueMicrotask(() => {
          isSyncingFromPanelRef.current = false
        })
      }
    },
    [sidebarPanelRef],
  )

  const initialSidebarSize = open ? expandedSize : SIDEBAR_COLLAPSED_SIZE
  const initialMainSize = 100 - initialSidebarSize

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
              defaultOpen ? 'w-(--sidebar-width)' : 'w-(--sidebar-width-icon)',
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
          className={cn(
            'h-dvh w-full overflow-hidden',
            isAnimatingToggle &&
              '[&_[data-panel]]:transition-[flex-grow] [&_[data-panel]]:duration-200 [&_[data-panel]]:ease-in-out',
          )}
        >
          <ResizablePanel
            id="dashboard-sidebar-panel"
            panelRef={sidebarPanelRef}
            defaultSize={initialSidebarSize}
            minSize={SIDEBAR_MIN_SIZE}
            maxSize={SIDEBAR_MAX_SIZE}
            collapsible
            collapsedSize={SIDEBAR_COLLAPSED_SIZE}
            onResize={handleSidebarResize}
            className="h-full overflow-hidden"
          >
            {sidebar}
          </ResizablePanel>

          <ResizableHandle
            withHandle
            onPointerDown={stopToggleTransition}
            className="bg-sidebar-border transition-colors hover:bg-primary/40 data-[separator=active]:bg-primary"
          />

          <ResizablePanel
            id="dashboard-main-panel"
            defaultSize={initialMainSize}
            minSize={100 - SIDEBAR_MAX_SIZE}
            className="h-full min-w-0 overflow-hidden"
          >
            <SidebarInset className="h-full min-w-0 overflow-y-auto">{children}</SidebarInset>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </SidebarProvider>
  )
}
