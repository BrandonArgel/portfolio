'use client'

import type { Editor } from '@tiptap/react'

import { TooltipProvider } from '@/components/ui/tooltip'

import { TableBubbleMenu } from './bubble-menu/table-bubble-menu'
import { TextBubbleMenu } from './bubble-menu/text-bubble-menu'

export interface BubbleMenuProps {
  editor: Editor
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  if (!editor) return null

  return (
    <TooltipProvider delay={300}>
      <TextBubbleMenu editor={editor} />
      <TableBubbleMenu editor={editor} />
    </TooltipProvider>
  )
}

export { LinkDialog, type LinkDialogProps } from './bubble-menu/link-dialog'
export { MenuToggleItem, type MenuToggleItemProps } from './bubble-menu/menu-toggle-item'
export { TableBubbleMenu, type TableBubbleMenuProps } from './bubble-menu/table-bubble-menu'
export { TextBubbleMenu, type TextBubbleMenuProps } from './bubble-menu/text-bubble-menu'
