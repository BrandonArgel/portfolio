'use client'

import { useTranslations } from 'next-intl'

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
import { Label } from '@/components/ui/label'

export interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  onUrlChange: (url: string) => void
  onSave: () => void
}

export function LinkDialog({ open, onOpenChange, url, onUrlChange, onSave }: LinkDialogProps) {
  const t = useTranslations('features.editor.bubble_menu')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSave()}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button type="button" onClick={onSave}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
