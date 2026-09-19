'use client'

import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus'
import {
  Bold,
  Code,
  BetweenVerticalStart as ColumnInsertLeft,
  BetweenVerticalEnd as ColumnInsertRight,
  Highlighter,
  Italic,
  Link as LinkIcon,
  type LucideIcon,
  BetweenHorizontalEnd as RowInsertBottom,
  BetweenHorizontalStart as RowInsertTop,
  Strikethrough,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMac } from '@/hooks/use-is-mac'
import { cn } from '@/lib/utils'

interface BubbleMenuProps {
  editor: Editor
}

interface MenuToggleItemProps {
  value: string
  icon: LucideIcon
  action: () => void
  label: string
  shortcutKey?: string
  modKey: string
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

export function BubbleMenu({ editor }: BubbleMenuProps) {
  const t = useTranslations('features.editor.bubble_menu')
  const tActions = useTranslations('common.actions')
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const isMac = useIsMac()
  const modKey = isMac ? '⌘' : 'Ctrl'

  const activeStates = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive('bold'),
      isItalic: editor.isActive('italic'),
      isStrike: editor.isActive('strike'),
      isCode: editor.isActive('code'),
      isHighlight: editor.isActive('highlight'),
      isLink: editor.isActive('link'),
    }),
  })

  const activeValues = useMemo(() => {
    const values: string[] = []
    if (activeStates.isBold) values.push('bold')
    if (activeStates.isItalic) values.push('italic')
    if (activeStates.isStrike) values.push('strikethrough')
    if (activeStates.isCode) values.push('code')
    if (activeStates.isHighlight) values.push('highlight')
    if (activeStates.isLink) values.push('link')
    return values
  }, [activeStates])

  if (!editor) return null

  const handleOpenLinkDialog = () => {
    const previousUrl = editor.getAttributes('link').href
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

  const MenuToggleItem = ({
    value,
    icon: Icon,
    action,
    label,
    shortcutKey,
    modKey,
  }: MenuToggleItemProps) => (
    <Tooltip>
      <TooltipTrigger
        render={
          <ToggleGroupItem
            value={value}
            aria-label={tActions('toggle_bubble_item', { value })}
            onClick={action}
          >
            <Icon className="size-4" />
          </ToggleGroupItem>
        }
      />
      <TooltipContent sideOffset={8} className="flex items-center gap-3">
        <span className="text-xs font-medium">{label}</span>
        {shortcutKey && (
          <KbdGroup>
            <Kbd>{modKey}</Kbd>
            {shortcutKey.includes('Shift') && <Kbd>⇧</Kbd>}
            <Kbd>{shortcutKey.replace('Shift+', '')}</Kbd>
          </KbdGroup>
        )}
      </TooltipContent>
    </Tooltip>
  )

  return (
    <>
      <TooltipProvider delay={300}>
        {/* Standard Text Formatting Bubble Menu */}
        <TiptapBubbleMenu
          editor={editor}
          pluginKey="textBubbleMenu"
          shouldShow={({ editor, from, to }) => {
            return (
              editor.isEditable &&
              !editor.isActive('table') &&
              from !== to &&
              !editor.state.selection.empty
            )
          }}
          className="flex items-center overflow-hidden rounded-md border border-border bg-background p-1 shadow-xl"
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
              shortcutKey="B"
              modKey={modKey}
            />
            <MenuToggleItem
              value="italic"
              icon={Italic}
              action={() => editor.chain().focus().toggleItalic().run()}
              label={t('italic')}
              shortcutKey="I"
              modKey={modKey}
            />
            <MenuToggleItem
              value="strikethrough"
              icon={Strikethrough}
              action={() => editor.chain().focus().toggleStrike().run()}
              label={t('strikethrough')}
              shortcutKey="Shift+X"
              modKey={modKey}
            />
            <MenuToggleItem
              value="code"
              icon={Code}
              action={() => editor.chain().focus().toggleCode().run()}
              label={t('inline_code')}
              shortcutKey="E"
              modKey={modKey}
            />
            <MenuToggleItem
              value="highlight"
              icon={Highlighter}
              action={() => editor.chain().focus().toggleHighlight().run()}
              label={t('highlight')}
              shortcutKey="Shift+H"
              modKey={modKey}
            />

            <Separator orientation="vertical" />

            <MenuToggleItem
              value="link"
              icon={LinkIcon}
              action={handleOpenLinkDialog}
              label={t('link')}
              shortcutKey="Shift+L"
              modKey={modKey}
            />
          </ToggleGroup>
        </TiptapBubbleMenu>

        {/* Table Management Bubble Menu */}
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
      </TooltipProvider>

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('insert_link')}</DialogTitle>
            <DialogDescription>{t('link_description')}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                URL
              </Label>
              <Input
                id="link"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveLink()}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setIsLinkDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="button" onClick={handleSaveLink}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
