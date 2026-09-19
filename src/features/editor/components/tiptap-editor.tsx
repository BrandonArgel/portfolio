'use client'

import { DragHandle } from '@tiptap/extension-drag-handle-react'
import { EditorContent } from '@tiptap/react'
import { GripVertical } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'

import { Spinner } from '@/components/ui/spinner'

import { useEditor } from '../hooks/use-editor'
import { BubbleMenu } from './bubble-menu'
import { MathBubbleMenu } from './math-bubble-menu'

interface TiptapEditorProps {
  initialContent: string
  onChange?: (content: string) => void
  onImageUpload?: (file: File) => Promise<string | undefined>
  onSavingChange: (isSaving: boolean) => void
}

export const TiptapEditor = memo(function TiptapEditor({
  initialContent,
  onChange,
  onImageUpload,
  onSavingChange,
}: TiptapEditorProps) {
  const t = useTranslations('features.editor')

  const editor = useEditor({
    initialContent,
    onChange,
    onImageUpload,
    onSavingChange,
  })

  if (!editor) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-150 text-muted-foreground">
        <Spinner className="size-6" />
        <span className="text-sm">{t('loading')}</span>
      </div>
    )
  }

  return (
    <div className="relative overflow-y-auto min-h-150">
      <DragHandle
        editor={editor}
        className="hidden sm:flex items-center justify-center size-6 cursor-grab active:cursor-grabbing rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
      >
        <GripVertical className="size-4" />
      </DragHandle>
      <EditorContent editor={editor} className="relative" />
      <BubbleMenu editor={editor} />
      <MathBubbleMenu editor={editor} />
    </div>
  )
})
