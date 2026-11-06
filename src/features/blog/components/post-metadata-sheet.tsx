'use client'

import { useTranslations } from 'next-intl'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PostMetadataForm, type PostMetadataFormProps } from './post-metadata-form'

export interface PostMetadataSheetProps extends Omit<PostMetadataFormProps, 'idPrefix'> {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostMetadataSheet({
  open,
  onOpenChange,
  data,
  onChange,
  existingCategories,
  onTogglePublish,
  onDiscardDraft,
  isDiscardingDraft,
  className,
}: PostMetadataSheetProps) {
  const t = useTranslations('features.blog.composer')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full data-[side=right]:sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden"
      >
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="text-base font-semibold">{t('frontmatter.title')}</SheetTitle>
          <SheetDescription className="text-xs">
            {t('frontmatter.sheet_description')}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <PostMetadataForm
            idPrefix="post-metadata-sheet"
            data={data}
            onChange={onChange}
            existingCategories={existingCategories}
            onTogglePublish={onTogglePublish}
            onDiscardDraft={onDiscardDraft}
            isDiscardingDraft={isDiscardingDraft}
            className={className}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
