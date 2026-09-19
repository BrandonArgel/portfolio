'use client'

import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus'
import { Pencil, Sigma, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'

import { useEditorUI } from '../store/use-editor-ui'

interface MathBubbleMenuProps {
  editor: Editor
}

export function MathBubbleMenu({ editor }: MathBubbleMenuProps) {
  const t = useTranslations('features.editor.math')

  const { isInlineMath, latex } = useEditorState({
    editor,
    selector: ({ editor }) => {
      const isInlineMath = editor.isActive('inlineMath')
      const isBlockMath = editor.isActive('blockMath')

      let latex = ''
      if (isInlineMath) {
        latex = editor.getAttributes('inlineMath').latex || ''
      } else if (isBlockMath) {
        latex = editor.getAttributes('blockMath').latex || ''
      }

      return { isInlineMath, isBlockMath, latex }
    },
  })

  const handleEdit = useCallback(() => {
    const type = isInlineMath ? 'inline' : 'block'
    const nodeType = isInlineMath ? 'inlineMath' : 'blockMath'

    useEditorUI.getState().openMathDialog(latex, type, ({ latex: newLatex }) => {
      editor.chain().updateAttributes(nodeType, { latex: newLatex }).run()
    })
  }, [editor, isInlineMath, latex])

  const handleDelete = useCallback(() => {
    editor.chain().focus().deleteSelection().run()
  }, [editor])

  return (
    <TiptapBubbleMenu
      editor={editor}
      pluginKey="mathBubbleMenu"
      shouldShow={({ editor }) => editor.isActive('inlineMath') || editor.isActive('blockMath')}
      options={{
        placement: 'bottom',
        offset: 8,
      }}
      className="flex items-center gap-1.5 rounded-xl border border-border bg-background/95 p-1.5 shadow-xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10 text-primary shrink-0">
        <Sigma className="size-3.5" />
      </div>

      <Button variant="ghost" size="sm" onClick={handleEdit} className="gap-1.5 h-7 px-2 text-xs">
        <Pencil className="size-3" />
        {t('label')}
      </Button>

      <div className="h-4 w-px bg-border" />

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        className="gap-1.5 h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="size-3" />
      </Button>
    </TiptapBubbleMenu>
  )
}
