'use client'

import {
  AlignLeft,
  FileEdit,
  Globe,
  Hash,
  Image as ImageIcon,
  Languages,
  Link2,
  RefreshCw,
  RotateCcw,
  Trash2,
  Type,
  Upload,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useRef, useState } from 'react'
import { sileo } from 'sileo'
import { z } from 'zod'
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from '@/components/ui/attachment'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { LOCALE_META } from '@/config/locale'
import { uploadImageAction } from '@/features/blog/actions/image.action'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { generateSlug } from '@/utils/string-utils'
import { type BlogFrontmatter, BlogFrontmatterSchema } from '../schemas/post.schema'

export interface PostMetadataFormProps {
  data: BlogFrontmatter
  onChange: (newData: BlogFrontmatter) => void
  existingCategories?: string[]
  onTogglePublish?: (published: boolean) => void
  onDiscardDraft?: () => void
  isDiscardingDraft?: boolean
  idPrefix?: string
  className?: string
}

export function PostMetadataForm({
  data,
  onChange,
  existingCategories = [],
  onTogglePublish,
  onDiscardDraft,
  isDiscardingDraft = false,
  idPrefix = 'post-metadata',
  className,
}: PostMetadataFormProps) {
  const t = useTranslations('features.blog.composer')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [categoryInput, setCategoryInput] = useState('')
  const chipsAnchor = useComboboxAnchor()

  const filteredCategories = existingCategories.filter(
    (c) => !data.categories.includes(c) && c.toLowerCase().includes(categoryInput.toLowerCase()),
  )

  const showCreate =
    categoryInput.trim() !== '' &&
    ![...filteredCategories, ...data.categories].some(
      (c) => c.toLowerCase() === categoryInput.trim().toLowerCase(),
    )

  const validation = BlogFrontmatterSchema.safeParse(data)
  const errors = !validation.success ? z.flattenError(validation.error).fieldErrors : {}

  const updateField = <K extends keyof BlogFrontmatter>(
    key: K,
    value: BlogFrontmatter[K],
    markDraft = true,
  ) => {
    const newData: BlogFrontmatter = {
      ...data,
      [key]: value,
      ...(markDraft ? { draft: true } : {}),
    }

    if (key === 'title') {
      const currentGeneratedSlug = generateSlug(data.title)
      if (!data.slug || data.slug === currentGeneratedSlug) {
        newData.slug = generateSlug(value as string)
      }
    }

    onChange(newData)
  }

  const handleRegenerateSlug = () => {
    if (!data.title) return
    onChange({
      ...data,
      slug: generateSlug(data.title),
      draft: true,
    })
  }

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      const newCategory = categoryInput.trim()
      if (newCategory) {
        const exists = data.categories.some((c) => c.toLowerCase() === newCategory.toLowerCase())

        if (!exists) {
          updateField('categories', [...data.categories, newCategory])
        }

        setCategoryInput('')
      }
    }
  }

  const { execute: executeUploadCover, isExecuting: isUploadingCover } = useAction(
    uploadImageAction,
    {
      onSuccess: (res) => {
        if (res.data?.success && res.data.url) {
          updateField('coverImage', res.data.url)
          sileo.success({ title: t('notifications.cover_uploaded') })
        }
      },
      onError: ({ error }) => {
        sileo.error({
          title: t('notifications.cover_upload_error'),
          description: error.serverError?.description,
        })
      },
    },
  )

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      sileo.error({
        title: t('notifications.invalid_file_title'),
        description: t('notifications.invalid_file_description'),
      })
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    executeUploadCover({ formData })
    e.target.value = ''
  }

  const hasUnpublishedChanges = data.published && data.draft

  return (
    <div className={cn('space-y-6', className)}>
      {/* 1. TITLE & SLUG */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-title`} className="text-xs font-medium text-foreground">
            <Type className="size-3.5 text-muted-foreground" />
            {t('frontmatter.field_title')}
          </Label>
          <Input
            id={`${idPrefix}-title`}
            value={data.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder={t('frontmatter.title_placeholder')}
            aria-invalid={Boolean(errors.title)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${idPrefix}-slug`} className="text-xs font-medium text-foreground">
              <Link2 className="size-3.5 text-muted-foreground" />
              {t('frontmatter.field_slug')}
            </Label>
            {data.title && data.slug !== generateSlug(data.title) && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleRegenerateSlug}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <RefreshCw className="size-3" />
                {t('frontmatter.sync_slug')}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-8 items-center rounded-md border border-border bg-muted/40 px-2.5 text-xs text-muted-foreground select-none">
              /blog/
            </span>
            <Input
              id={`${idPrefix}-slug`}
              value={data.slug}
              onChange={(e) => updateField('slug', generateSlug(e.target.value))}
              placeholder={t('frontmatter.slug_placeholder')}
              className="flex-1 font-mono text-xs"
              aria-invalid={Boolean(errors.slug)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* 2. DESCRIPTION */}
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`} className="text-xs font-medium text-foreground">
          <AlignLeft className="size-3.5 text-muted-foreground" />
          {t('frontmatter.field_description')}
        </Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={data.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          placeholder={t('frontmatter.description_placeholder')}
          className="resize-none text-sm"
        />
      </div>

      <Separator />

      {/* 3. COVER IMAGE (Attachment + Preview + URL) */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-foreground">
          <ImageIcon className="size-3.5 text-muted-foreground" />
          {t('frontmatter.field_cover_image')}
        </Label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverUpload}
        />

        {data.coverImage ? (
          <div className="space-y-2.5">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted/20">
              {/* biome-ignore lint/performance/noImgElement: Dynamic cover preview */}
              <img
                src={data.coverImage}
                alt={data.title || 'Cover preview'}
                className="h-full w-full object-cover"
              />
            </div>

            <Attachment
              state={isUploadingCover ? 'uploading' : 'done'}
              className="w-full justify-between"
            >
              <AttachmentMedia variant="image">
                {/* biome-ignore lint/performance/noImgElement: Attachment thumbnail */}
                <img src={data.coverImage} alt="" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{t('frontmatter.cover_attached')}</AttachmentTitle>
                <AttachmentDescription>{data.coverImage}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCover}
                  aria-label={t('frontmatter.replace_cover')}
                >
                  {isUploadingCover ? <Spinner /> : <Upload />}
                </AttachmentAction>
                <AttachmentAction
                  type="button"
                  onClick={() => updateField('coverImage', '')}
                  disabled={isUploadingCover}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={t('frontmatter.remove_cover')}
                >
                  <Trash2 />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </div>
        ) : (
          <Attachment
            state={isUploadingCover ? 'uploading' : 'idle'}
            className="w-full cursor-pointer hover:border-primary/50 hover:bg-muted/30"
          >
            <AttachmentTrigger
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingCover}
            />
            <AttachmentMedia variant="icon">
              {isUploadingCover ? <Spinner /> : <Upload />}
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{t('frontmatter.upload_cover')}</AttachmentTitle>
              <AttachmentDescription>{t('frontmatter.upload_cover_hint')}</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        )}

        <Input
          type="url"
          value={data.coverImage || ''}
          onChange={(e) => updateField('coverImage', e.target.value)}
          placeholder={t('frontmatter.cover_image_placeholder')}
          className="text-xs"
        />
      </div>

      <Separator />

      {/* 4. CATEGORIES */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-foreground">
          <Hash className="size-3.5 text-muted-foreground" />
          {t('frontmatter.field_categories')}
        </Label>
        <Combobox<string, true>
          multiple
          value={data.categories}
          onValueChange={(value) => updateField('categories', value)}
          onInputValueChange={(inputValue) => setCategoryInput(inputValue)}
        >
          <ComboboxValue>
            {(selectedCategories: string[]) => (
              <ComboboxChips ref={chipsAnchor} className="w-full">
                {selectedCategories.map((cat) => (
                  <ComboboxChip key={cat}>{cat}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  onKeyDown={handleCategoryKeyDown}
                  placeholder={t('frontmatter.add_category_placeholder')}
                />
              </ComboboxChips>
            )}
          </ComboboxValue>
          <ComboboxContent anchor={chipsAnchor}>
            <ComboboxList>
              {filteredCategories.map((cat) => (
                <ComboboxItem key={cat} value={cat}>
                  {cat}
                </ComboboxItem>
              ))}
              {showCreate && (
                <ComboboxItem value={categoryInput.trim()}>
                  {t('frontmatter.create_category', { category: categoryInput.trim() })}
                </ComboboxItem>
              )}
            </ComboboxList>
            {filteredCategories.length === 0 && !showCreate && (
              <ComboboxEmpty>{t('frontmatter.no_categories_found')}</ComboboxEmpty>
            )}
          </ComboboxContent>
        </Combobox>
      </div>

      <Separator />

      {/* 5. LOCALE */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-foreground">
          <Languages className="size-3.5 text-muted-foreground" />
          {t('frontmatter.field_locale')}
        </Label>
        <Combobox<string>
          value={data.locale}
          onValueChange={(value) => {
            if (value) updateField('locale', value as Locale)
          }}
          itemToStringLabel={(code) => LOCALE_META[code as Locale]?.nativeName ?? code}
        >
          <ComboboxInput
            placeholder={t('frontmatter.select_locale_placeholder')}
            className="w-full"
          />
          <ComboboxContent>
            <ComboboxList>
              {Object.entries(LOCALE_META).map(([code, meta]) => (
                <ComboboxItem key={code} value={code}>
                  <span>{meta.flag}</span>
                  <span>{meta.nativeName}</span>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <Separator />

      {/* 6. PUBLICATION STATUS CONTROLS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-foreground">
            <Globe className="size-3.5 text-muted-foreground" />
            {t('frontmatter.publication_status')}
          </Label>
          {hasUnpublishedChanges ? (
            <Badge variant="softOrange">{t('status.unpublished_changes')}</Badge>
          ) : data.published ? (
            <Badge variant="softGreen">{t('status.published')}</Badge>
          ) : (
            <Badge variant="softYellow">{t('status.draft')}</Badge>
          )}
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-foreground">
                {t('frontmatter.field_published')}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.published
                  ? t('frontmatter.published_hint')
                  : t('frontmatter.unpublished_hint')}
              </p>
            </div>
            <Switch
              checked={data.published}
              onCheckedChange={(checked) => {
                if (onTogglePublish) {
                  onTogglePublish(checked)
                } else {
                  onChange({
                    ...data,
                    published: checked,
                    draft: !checked ? true : data.draft,
                  })
                }
              }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileEdit
                className={cn(
                  'size-3.5 shrink-0',
                  data.draft ? 'text-amber-500' : 'text-muted-foreground',
                )}
              />
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-foreground">
                  {t('frontmatter.draft_overlay_label')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.draft
                    ? t('frontmatter.draft_active_hint')
                    : t('frontmatter.draft_synced_hint')}
                </p>
              </div>
            </div>
            <Switch
              checked={data.draft}
              onCheckedChange={(checked) => updateField('draft', checked, false)}
            />
          </div>

          {hasUnpublishedChanges && onDiscardDraft && (
            <>
              <Separator />
              <div className="pt-0.5">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={onDiscardDraft}
                  disabled={isDiscardingDraft}
                >
                  {isDiscardingDraft ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <RotateCcw className="size-3.5" />
                  )}
                  {t('frontmatter.discard_draft_changes')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
