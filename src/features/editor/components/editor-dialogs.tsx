'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

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

function VideoDialogForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (videoUrl: string) => void
}) {
  const t = useTranslations('features.editor.video_dialog')
  const [videoUrl, setVideoUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (videoUrl.trim()) {
      onSubmit(videoUrl.trim())
    }
    onClose()
  }

  return (
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
        <Button type="button" variant="ghost" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={!videoUrl.trim()}>
          {t('insert')}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function VideoDialog() {
  const { isOpen, pendingCallback } = useEditorUI((s) => s.videoDialog)
  const closeVideoDialog = useEditorUI((s) => s.closeVideoDialog)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeVideoDialog()}>
      {isOpen && (
        <VideoDialogForm
          onClose={closeVideoDialog}
          onSubmit={(videoUrl) => pendingCallback?.({ videoUrl })}
        />
      )}
    </Dialog>
  )
}

// ─── Math Editor Dialog ──────────────────────────────────────────────────────

function MathEditorDialogForm({
  initialLatex,
  type,
  onClose,
  onSubmit,
}: {
  initialLatex: string
  type: 'inline' | 'block'
  onClose: () => void
  onSubmit: (latex: string) => void
}) {
  const t = useTranslations('features.editor.math')
  const [latex, setLatex] = useState(initialLatex)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (latex.trim()) {
      onSubmit(latex.trim())
    }
    onClose()
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{type === 'inline' ? t('inline_title') : t('block_title')}</DialogTitle>
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
          {t('hint')} · {t('confirm_shortcut')}
        </span>
      </div>
      <DialogFooter className="sm:justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={!latex.trim()}>
          {t('confirm')}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function MathEditorDialog() {
  const { isOpen, latex: initialLatex, type, pendingCallback } = useEditorUI((s) => s.mathDialog)
  const closeMathDialog = useEditorUI((s) => s.closeMathDialog)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeMathDialog()}>
      {isOpen && (
        <MathEditorDialogForm
          initialLatex={initialLatex}
          type={type}
          onClose={closeMathDialog}
          onSubmit={(latex) => pendingCallback?.({ latex })}
        />
      )}
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
