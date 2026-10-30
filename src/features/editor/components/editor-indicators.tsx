'use client'

import { type Editor, useEditorState } from '@tiptap/react'
import { CircleCheckBig, PencilSparkles } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { memo } from 'react'
import { Separator } from '@/components/ui/separator'
import { useBlogDraftsStore } from '@/features/blog/store/use-blog-drafts-store'

interface EditorIndicatorsProps {
  editor: Editor
  draftId: string
  isSaving?: boolean
}

export const EditorIndicators = memo(function EditorIndicators({
  editor,
  draftId,
  isSaving = false,
}: EditorIndicatorsProps) {
  const t = useTranslations('features.editor')
  const format = useFormatter()

  const lastSaved = useBlogDraftsStore((state) => state.drafts[draftId]?.lastSaved)

  const { charactersCount, wordsCount } = useEditorState({
    editor,
    selector: (context) => ({
      charactersCount: context.editor.storage.characterCount.characters(),
      wordsCount: context.editor.storage.characterCount.words(),
    }),
  })

  const formattedTime = lastSaved ? format.dateTime(new Date(lastSaved), 'time') : null

  return (
    <div className="absolute bottom-0 right-0 z-1 flex items-center gap-3 text-xs font-medium text-muted-foreground bg-background backdrop-blur-md px-3 py-1.5 rounded-tl-md border-b border-l border-border/50 shadow-sm">
      <div className="flex items-center gap-2">
        <span>
          {wordsCount} {t('words')}
        </span>
        <span>
          {charactersCount} {t('characters')}
        </span>
      </div>

      <Separator orientation="vertical" />

      <div className="flex items-center gap-1.5">
        {isSaving ? (
          <>
            <PencilSparkles className="size-3.5 text-primary animate-pulse" />
            <span>{t('writing')}</span>
          </>
        ) : lastSaved ? (
          <>
            <CircleCheckBig className="size-3.5 text-green-600 dark:text-green-400" />
            <span>
              {t('saved_locally')} {formattedTime}
            </span>
          </>
        ) : null}
      </div>
    </div>
  )
})
