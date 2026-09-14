'use client'

import { DragHandle } from '@tiptap/extension-drag-handle-react'
import { EditorContent } from '@tiptap/react'
import { GripVertical } from 'lucide-react'
import { memo } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

import { useEditor } from '../hooks/use-editor'
import { BubbleMenu } from './bubble-menu'

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
  console.count('TiptapEditor render')
  const editor = useEditor({ initialContent, onChange, onImageUpload, onSavingChange })

  if (!editor) {
    return <EditorSkeleton />
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
    </div>
  )
})

const EditorSkeleton = () => (
  <div className="relative w-full max-w-none flex-1 overflow-hidden rounded-xl border border-border bg-background shadow-sm flex flex-col min-h-150">
    <div className="p-8 sm:p-12 flex flex-col gap-4">
      <Skeleton className="h-8 w-1/3 mb-4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
)
