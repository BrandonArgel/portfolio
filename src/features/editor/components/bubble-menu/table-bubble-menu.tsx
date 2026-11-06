'use client'

import type { Editor } from '@tiptap/react'
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus'
import {
  BetweenVerticalStart as ColumnInsertLeft,
  BetweenVerticalEnd as ColumnInsertRight,
  type LucideIcon,
  BetweenHorizontalEnd as RowInsertBottom,
  BetweenHorizontalStart as RowInsertTop,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface TableBubbleMenuProps {
  editor: Editor
}

interface TableActionButtonProps {
  icon: LucideIcon
  action: () => void
  label: string
  danger?: boolean
}

function TableActionButton({ icon: Icon, action, label, danger = false }: TableActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={action}
            className={cn(
              'size-7 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              danger && 'text-destructive/80 hover:bg-destructive/10 hover:text-destructive',
            )}
          >
            <Icon className="size-4" />
          </Button>
        }
      />
      <TooltipContent sideOffset={8}>
        <span className="text-xs font-medium">{label}</span>
      </TooltipContent>
    </Tooltip>
  )
}

export function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  const t = useTranslations('features.editor.bubble_menu')

  return (
    <TiptapBubbleMenu
      editor={editor}
      pluginKey="tableBubbleMenu"
      shouldShow={({ editor }) => {
        return editor.isEditable && editor.isActive('table')
      }}
      options={{
        placement: 'top',
        offset: 8,
      }}
      className="flex max-w-[calc(100vw-2rem)] items-center gap-0.5 overflow-x-auto rounded-md border border-border bg-background p-1 shadow-xl"
    >
      {/* Column Operations */}
      <TableActionButton
        icon={ColumnInsertLeft}
        action={() => editor.chain().focus().addColumnBefore().run()}
        label={t('add_column_before')}
      />
      <TableActionButton
        icon={ColumnInsertRight}
        action={() => editor.chain().focus().addColumnAfter().run()}
        label={t('add_column_after')}
      />
      <TableActionButton
        icon={Trash2}
        action={() => editor.chain().focus().deleteColumn().run()}
        label={t('delete_column')}
        danger
      />

      <Separator orientation="vertical" className="mx-0.5 h-4" />

      {/* Row Operations */}
      <TableActionButton
        icon={RowInsertTop}
        action={() => editor.chain().focus().addRowBefore().run()}
        label={t('add_row_before')}
      />
      <TableActionButton
        icon={RowInsertBottom}
        action={() => editor.chain().focus().addRowAfter().run()}
        label={t('add_row_after')}
      />
      <TableActionButton
        icon={Trash2}
        action={() => editor.chain().focus().deleteRow().run()}
        label={t('delete_row')}
        danger
      />

      <Separator orientation="vertical" className="mx-0.5 h-4" />

      {/* Table Operations */}
      <TableActionButton
        icon={Trash2}
        action={() => editor.chain().focus().deleteTable().run()}
        label={t('delete_table')}
        danger
      />
    </TiptapBubbleMenu>
  )
}
