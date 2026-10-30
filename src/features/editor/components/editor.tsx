'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { EditorLoader } from './editor-loader'

const DynamicEditorLoader = () => {
  const t = useTranslations('features.editor')
  return <EditorLoader text={t('loading')} />
}

const DynamicTiptapEditor = dynamic(
  () => import('@/features/editor/components/tiptap-editor').then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => <DynamicEditorLoader />,
  },
)

interface EditorLazyWrapperProps {
  draftId: string
  initialContent: string
  onChange: (content: string) => void
  onImageUpload: (file: File) => Promise<string | undefined>
}

export const Editor = (props: EditorLazyWrapperProps) => {
  return (
    <div
      className="relative h-full w-full max-w-none flex-1 bg-secondary-background rounded-xl border border-border overflow-hidden dev
     shadow-sm flex items-center justify-center gap-3 text-muted-foreground"
    >
      <DynamicTiptapEditor {...props} />
    </div>
  )
}
