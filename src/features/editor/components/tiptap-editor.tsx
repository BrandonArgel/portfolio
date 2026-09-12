'use client'

import { EditorContent } from '@tiptap/react'
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
    <div className="overflow-y-auto min-h-150">
      <EditorContent editor={editor} />
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
