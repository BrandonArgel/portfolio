'use client'

import { DragHandle } from '@tiptap/extension-drag-handle-react'
import { EditorContent } from '@tiptap/react'
import { GripVertical } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useState } from 'react'

import { Spinner } from '@/components/ui/spinner'

import { useEditor } from '../hooks/use-editor'
import { BubbleMenu } from './bubble-menu'
import { EditorDialogs } from './editor-dialogs'
import { EditorIndicators } from './editor-indicators'
import { EditorLoader } from './editor-loader'
import { MathBubbleMenu } from './math-bubble-menu'

interface TiptapEditorProps {
  draftId: string
  initialContent: string
  onChange?: (content: string) => void
  onImageUpload?: (file: File) => Promise<string | undefined>
}

export const TiptapEditor = memo(function TiptapEditor({
  draftId,
  initialContent,
  onChange,
  onImageUpload,
}: TiptapEditorProps) {
  const t = useTranslations('features.editor')

  const [isSaving, setIsSaving] = useState(false)

  const onSavingChange = useCallback((saving: boolean) => {
    setIsSaving(saving)
  }, [])

  const editor = useEditor({
    initialContent,
    onChange,
    onImageUpload,
    onSavingChange,
  })

  if (!editor) return <EditorLoader text={t('loading')} />

  return (
    <>
      <DragHandle
        editor={editor}
        className="flex items-center justify-center size-5 mt-1 cursor-grab active:cursor-grabbing rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
      >
        <GripVertical className="size-4" />
      </DragHandle>
      <EditorIndicators editor={editor} draftId={draftId} isSaving={isSaving} />
      <EditorContent className="h-full w-full" editor={editor} />
      <BubbleMenu editor={editor} />
      <MathBubbleMenu editor={editor} />
      <EditorDialogs />
    </>
  )
})
