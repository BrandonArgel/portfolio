'use client'

import { EditorContent } from '@tiptap/react'
import { CloudCheck, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useEditor } from '../hooks/use-editor'
import { BubbleMenu } from './bubble-menu'

interface EditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  onImageUpload?: (file: File) => Promise<string | undefined>
}

export function Editor({ initialContent = '', onChange, onImageUpload }: EditorProps) {
  const t = useTranslations('features.editor')
  const { editor, isSaving } = useEditor({
    initialContent,
    onChange,
    onImageUpload,
  })

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !editor) return <EditorSkeleton />

  return (
    <div className="relative w-full max-w-none flex-1 overflow-hidden rounded-xl border border-border bg-background shadow-sm flex flex-col">
      <div className="absolute top-4 right-6 z-10 flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background/60 backdrop-blur-md px-2.5 py-1.5 rounded-md border border-border/50 shadow-sm transition-all duration-300">
        {isSaving ? (
          <>
            <Loader2 className="size-3.5 animate-spin text-primary" />
            <span>{t('writing')}</span>
          </>
        ) : (
          <>
            <CloudCheck className="size-3.5 text-green-500" />
            <span>{t('saved_locally')}</span>
          </>
        )}
      </div>
      <div className="overflow-y-auto min-h-150">
        <EditorContent editor={editor} />
        <BubbleMenu editor={editor} />
      </div>
    </div>
  )
}

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
