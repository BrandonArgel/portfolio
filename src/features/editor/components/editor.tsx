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

interface LazyEditorWrapperProps {
  draftId: string
  initialContent: string
  onChange: (content: string) => void
  onImageUpload: (file: File) => Promise<string | undefined>
}

export const Editor = (props: LazyEditorWrapperProps) => {
  return <DynamicTiptapEditor {...props} />
}
