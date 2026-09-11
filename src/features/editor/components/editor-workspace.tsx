'use client'

import { Columns, Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface EditorWorkspaceProps {
  headerActions?: React.ReactNode
  frontMatterNode: React.ReactNode
  editorNode: React.ReactNode
  previewNode: React.ReactNode
}

export function EditorWorkspace({
  editorNode,
  frontMatterNode,
  previewNode,
  headerActions,
}: EditorWorkspaceProps) {
  const t = useTranslations('features.editor')
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <header className="flex flex-col shrink-0 items-center justify-between border-b border-border px-4 bg-muted/10">
        <div className="w-full flex justify-between gap-2">
          {/* Botón para alternar el panel */}
          <TooltipProvider delay={300}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant={showPreview ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="gap-2"
                  >
                    {showPreview ? <EyeOff className="size-4" /> : <Columns className="size-4" />}
                    <span className="hidden sm:inline">
                      {showPreview ? t('hide_preview') : t('show_preview')}
                    </span>
                  </Button>
                }
              />
              <TooltipContent side="bottom">
                <p>{t('toggle_preview')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-2">{headerActions}</div>
        </div>

        <div className="w-full flex">{frontMatterNode}</div>
      </header>

      {/* 🧩 PANELES RESIZABLES */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* PANEL IZQUIERDO: EL EDITOR */}
        <ResizablePanel
          defaultSize={showPreview ? 50 : 100}
          minSize={30}
          className="transition-all duration-300 ease-in-out"
        >
          <div className="h-full">{editorNode}</div>
        </ResizablePanel>

        {/* PANEL DERECHO: LA VISTA PREVIA */}
        {showPreview && (
          <>
            <ResizableHandle
              withHandle
              className="bg-border/60 hover:bg-primary/50 transition-colors"
            />
            <ResizablePanel
              defaultSize={50}
              minSize={30}
              className="animate-in slide-in-from-right-12 duration-300 ease-out"
            >
              <div className="h-full overflow-y-auto bg-muted/20 border-l border-border/50">
                {previewNode}
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
