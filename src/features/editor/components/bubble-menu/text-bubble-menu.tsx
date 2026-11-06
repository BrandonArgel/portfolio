'use client'

import { isTextSelection } from '@tiptap/core'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus'
import {
  Bold,
  Code,
  Eraser,
  Highlighter,
  Italic,
  Link as LinkIcon,
  Sigma,
  Strikethrough,
  Underline,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

import { ToggleGroup } from '@/components/ui/toggle-group'
import { getActiveMarkColor } from '../../config/colors'
import { ColorPickerPopover } from '../color-picker-popover'
import { LinkDialog } from './link-dialog'
import { MenuToggleItem } from './menu-toggle-item'

export interface TextBubbleMenuProps {
  editor: Editor
}

function canShowTextBubbleMenu(editor: Editor): boolean {
  const { state } = editor
  const { selection } = state
  const { from, to, empty } = selection

  if (
    !editor.isEditable ||
    empty ||
    from === to ||
    !isTextSelection(selection) ||
    editor.isActive('table') ||
    editor.isActive('codeBlock') ||
    editor.isActive('blockMath') ||
    editor.isActive('inlineMath') ||
    editor.isActive('image') ||
    editor.isActive('youtube') ||
    editor.isActive('horizontalRule')
  ) {
    return false
  }

  return state.doc.textBetween(from, to, ' ').trim().length > 0
}

export function TextBubbleMenu({ editor }: TextBubbleMenuProps) {
  const t = useTranslations('features.editor.bubble_menu')
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const activeStates = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive('bold'),
      isItalic: editor.isActive('italic'),
      isUnderline: editor.isActive('underline'),
      isStrike: editor.isActive('strike'),
      isHighlight: editor.isActive('highlight'),
      isCode: editor.isActive('code'),
      isInlineMath: editor.isActive('inlineMath'),
      isLink: editor.isActive('link'),
      canToggleStrike:
        editor.isEditable &&
        editor.isFocused &&
        !editor.isActive('codeBlock') &&
        !editor.isActive('blockMath'),
      canShowBubbleMenu: canShowTextBubbleMenu(editor),
      activeTextColor: getActiveMarkColor(editor, 'textStyle', 'text'),
      activeHighlightColor: getActiveMarkColor(editor, 'highlight', 'highlight'),
    }),
  })

  const activeValues = useMemo(() => {
    const values: string[] = []
    if (activeStates.isBold) values.push('bold')
    if (activeStates.isItalic) values.push('italic')
    if (activeStates.isUnderline) values.push('underline')
    if (activeStates.isStrike) values.push('strikethrough')
    if (activeStates.isHighlight) values.push('highlight')
    if (activeStates.isCode) values.push('code')
    if (activeStates.isInlineMath) values.push('inlineMath')
    if (activeStates.isLink) values.push('link')
    return values
  }, [activeStates])

  useEffect(() => {
    if (!activeStates.canShowBubbleMenu && isColorPickerOpen) {
      setIsColorPickerOpen(false)
    }
  }, [activeStates.canShowBubbleMenu, isColorPickerOpen])

  const handleInlineMath = () => {
    if (editor.isActive('inlineMath')) {
      const latex = editor.getAttributes('inlineMath').latex as string | undefined
      if (latex) {
        editor.chain().focus().deleteSelection().insertContent(latex).run()
      } else {
        editor.chain().focus().deleteInlineMath().run()
      }
      return
    }

    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ').trim()
    if (!selectedText) return

    editor.chain().focus().deleteSelection().insertInlineMath({ latex: selectedText }).run()
  }

  const handleOpenLinkDialog = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    setLinkUrl(previousUrl || '')
    setIsLinkDialogOpen(true)
  }

  const handleSaveLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    setIsLinkDialogOpen(false)
  }

  const isSelectionShortcutEnabled = Boolean(activeStates.canShowBubbleMenu && !isLinkDialogOpen)

  return (
    <>
      <TiptapBubbleMenu
        editor={editor}
        pluginKey="textBubbleMenu"
        shouldShow={({ editor }) => canShowTextBubbleMenu(editor)}
        className="flex flex-col items-center gap-1 overflow-hidden rounded-md border border-border bg-background p-1 shadow-xl"
      >
        <ToggleGroup
          multiple
          value={activeValues}
          onValueChange={() => {}}
          className="flex items-center gap-1"
        >
          <MenuToggleItem
            value="bold"
            icon={Bold}
            action={() => editor.chain().focus().toggleBold().run()}
            label={t('bold')}
            shortcutKey="mod+b"
          />
          <MenuToggleItem
            value="italic"
            icon={Italic}
            action={() => editor.chain().focus().toggleItalic().run()}
            label={t('italic')}
            shortcutKey="mod+i"
          />
          <MenuToggleItem
            value="underline"
            icon={Underline}
            action={() => editor.chain().focus().toggleUnderline().run()}
            label={t('underline')}
            shortcutKey="mod+u"
          />
          <MenuToggleItem
            value="strikethrough"
            icon={Strikethrough}
            action={() => {
              if (editor.isActive('codeBlock') || editor.isActive('blockMath')) return
              editor.chain().focus().toggleStrike().run()
            }}
            label={t('strikethrough')}
            shortcutKey="mod+shift+x"
            registerShortcut
            shortcutEnabled={Boolean(activeStates.canToggleStrike && !isLinkDialogOpen)}
          />
          <MenuToggleItem
            value="highlight"
            icon={Highlighter}
            action={() => editor.chain().focus().toggleHighlight().run()}
            label={t('highlight')}
            shortcutKey="mod+shift+h"
          />
        </ToggleGroup>
        <ToggleGroup
          multiple
          value={activeValues}
          onValueChange={() => {}}
          className="flex items-center gap-1"
        >
          <MenuToggleItem
            value="code"
            icon={Code}
            action={() => editor.chain().focus().toggleCode().run()}
            label={t('inline_code')}
            shortcutKey="mod+e"
          />
          <MenuToggleItem
            value="link"
            icon={LinkIcon}
            action={handleOpenLinkDialog}
            label={t('link')}
            shortcutKey="mod+shift+l"
            registerShortcut
            shortcutEnabled={isSelectionShortcutEnabled}
          />
          <MenuToggleItem
            value="inlineMath"
            icon={Sigma}
            action={handleInlineMath}
            label={t('inline_math')}
            shortcutKey="mod+shift+e"
            registerShortcut
            shortcutEnabled={isSelectionShortcutEnabled}
          />
          <ColorPickerPopover
            editor={editor}
            activeTextColor={activeStates.activeTextColor}
            activeHighlightColor={activeStates.activeHighlightColor}
            open={isColorPickerOpen}
            onOpenChange={setIsColorPickerOpen}
            shortcutKey="mod+shift+p"
            shortcutEnabled={isSelectionShortcutEnabled}
          />
          <MenuToggleItem
            value="clearFormat"
            icon={Eraser}
            action={() => editor.chain().focus().unsetAllMarks().run()}
            label={t('clear_format')}
            shortcutKey="mod+shift+c"
            registerShortcut
            shortcutEnabled={isSelectionShortcutEnabled}
          />
        </ToggleGroup>
      </TiptapBubbleMenu>

      <LinkDialog
        open={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        url={linkUrl}
        onUrlChange={setLinkUrl}
        onSave={handleSaveLink}
      />
    </>
  )
}
