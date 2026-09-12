'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { SaveIndicator } from './editor-save-indicator'
import { TiptapEditor } from './tiptap-editor'

interface EditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  onImageUpload?: (file: File) => Promise<string | undefined>
}

export function Editor({ initialContent = '', onChange, onImageUpload }: EditorProps) {
  const t = useTranslations('features.editor')
  const [isSaving, setIsSaving] = useState(false)

  const handleSavingChange = useCallback((saving: boolean) => {
    setIsSaving(saving)
  }, [])

  return (
    <div className="relative w-full max-w-none flex-1 overflow-hidden rounded-xl border border-border bg-background shadow-sm flex flex-col">
      <SaveIndicator isSaving={isSaving} />
      <TiptapEditor
        initialContent={initialContent}
        onChange={onChange}
        onImageUpload={onImageUpload}
        onSavingChange={handleSavingChange}
      />
      <span className="sr-only">{t('title')}</span>
    </div>
  )
}
