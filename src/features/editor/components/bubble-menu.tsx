'use client'

import type { Editor } from '@tiptap/react'
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus'
import { Bold, Code, Highlighter, Italic, Link as LinkIcon, Strikethrough } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMac } from '@/hooks/use-is-mac'

interface BubbleMenuProps {
  editor: Editor
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  const t = useTranslations('features.editor.bubble_menu')
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const isMac = useIsMac()
  const modKey = isMac ? '⌘' : 'Ctrl'

  if (!editor) return null

  const activeValues: string[] = []
  if (editor.isActive('bold')) activeValues.push('bold')
  if (editor.isActive('italic')) activeValues.push('italic')
  if (editor.isActive('strike')) activeValues.push('strikethrough')
  if (editor.isActive('code')) activeValues.push('code')
  if (editor.isActive('highlight')) activeValues.push('highlight')
  if (editor.isActive('link')) activeValues.push('link')

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

  const MenuToggleItem = ({ value, icon: Icon, action, label, shortcutKey }: any) => (
    <Tooltip>
      <TooltipTrigger
        render={
          <ToggleGroupItem value={value} aria-label={`Toggle ${value}`} onClick={action}>
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
        <TiptapBubbleMenu
          editor={editor}
          className="flex items-center overflow-hidden rounded-md border border-border bg-background shadow-xl p-1"
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
            />
            <MenuToggleItem
              value="italic"
              icon={Italic}
              action={() => editor.chain().focus().toggleItalic().run()}
              label={t('italic')}
              shortcutKey="I"
            />
            <MenuToggleItem
              value="strikethrough"
              icon={Strikethrough}
              action={() => editor.chain().focus().toggleStrike().run()}
              label={t('strikethrough')}
              shortcutKey="Shift+X"
            />
            <MenuToggleItem
              value="code"
              icon={Code}
              action={() => editor.chain().focus().toggleCode().run()}
              label={t('inline_code')}
              shortcutKey="E"
            />
            <MenuToggleItem
              value="highlight"
              icon={Highlighter}
              action={() => editor.chain().focus().toggleHighlight().run()}
              label={t('highlight')}
              shortcutKey="Shift+H"
            />

            <div className="w-px h-5 bg-border mx-1" />

            <Tooltip>
              {/* ✨ SOLUCIÓN: Aplicamos lo mismo al botón de enlace */}
              <TooltipTrigger
                render={
                  <ToggleGroupItem
                    value="link"
                    aria-label="Toggle link"
                    onClick={handleOpenLinkDialog}
                  >
                    <LinkIcon className="size-4" />
                  </ToggleGroupItem>
                }
              />
              <TooltipContent sideOffset={8}>
                <span className="text-xs font-medium">{t('add_link')}</span>
              </TooltipContent>
            </Tooltip>
          </ToggleGroup>
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
