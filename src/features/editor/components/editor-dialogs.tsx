'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { useEditorUI } from '../store/use-editor-ui'

// ─── Video Dialog ────────────────────────────────────────────────────────────

function VideoDialog() {
  const t = useTranslations('features.editor.video_dialog')
  const { isOpen, pendingCallback } = useEditorUI((s) => s.videoDialog)
  const closeVideoDialog = useEditorUI((s) => s.closeVideoDialog)

  const [videoUrl, setVideoUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset local state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setVideoUrl('')
      // Allow the dialog to render before focusing
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleSubmit = useCallback(() => {
    if (pendingCallback && videoUrl.trim()) {
      pendingCallback({ videoUrl: videoUrl.trim() })
    }
    closeVideoDialog()
  }, [pendingCallback, videoUrl, closeVideoDialog])

  const handleCancel = useCallback(() => {
    closeVideoDialog()
  }, [closeVideoDialog])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            ref={inputRef}
            type="url"
            placeholder={t('placeholder')}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!videoUrl.trim()}>
            {t('insert')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Math Editor Dialog ──────────────────────────────────────────────────────

function MathEditorDialog() {
  const t = useTranslations('features.editor.math')
  const { isOpen, latex: initialLatex, type, pendingCallback } = useEditorUI((s) => s.mathDialog)
  const closeMathDialog = useEditorUI((s) => s.closeMathDialog)

  const [latex, setLatex] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync local state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setLatex(initialLatex)
      const timer = setTimeout(() => textareaRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen, initialLatex])

  const handleSubmit = useCallback(() => {
    if (pendingCallback && latex.trim()) {
      pendingCallback({ latex: latex.trim() })
    }
    closeMathDialog()
  }, [pendingCallback, latex, closeMathDialog])

  const handleCancel = useCallback(() => {
    closeMathDialog()
  }, [closeMathDialog])

  const typeLabel = type === 'inline' ? 'Inline' : 'Block'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {typeLabel} {t('label')}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="math-editor-textarea" className="sr-only">
            {t('label')}
          </Label>
          <Textarea
            ref={textareaRef}
            id="math-editor-textarea"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={t('placeholder')}
            className="font-mono text-sm min-h-24"
            spellCheck={false}
            autoComplete="off"
          />
          <span className="text-[10px] text-muted-foreground px-0.5">
            {t('hint')} · Ctrl+Enter to confirm
          </span>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!latex.trim()}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Composite ───────────────────────────────────────────────────────────────

export function EditorDialogs() {
  return (
    <>
      <VideoDialog />
      <MathEditorDialog />
    </>
  )
}
