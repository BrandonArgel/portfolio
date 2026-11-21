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
import { type ChangeEvent, type KeyboardEvent, type RefObject, useState } from 'react'
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
import { IMAGE_INPUT_ACCEPT } from '@/config/image-upload'
import { LOCALE_META } from '@/config/locale'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { generateSlug } from '@/utils/string-utils'
import type { BlogFrontmatter } from '../schemas/post-schema'

const SEO_TITLE_MIN = 50
const SEO_TITLE_MAX = 60
const SEO_DESCRIPTION_MIN = 120
const SEO_DESCRIPTION_MAX = 160

type SeoLengthStatus = 'empty' | 'short' | 'optimal' | 'long'

function getSeoLengthStatus(length: number, min: number, max: number): SeoLengthStatus {
  if (length === 0) return 'empty'
  if (length < min) return 'short'
  if (length <= max) return 'optimal'
  return 'long'
}

function getSeoLengthColorClass(status: SeoLengthStatus): string {
  if (status === 'optimal') return 'text-emerald-600 dark:text-emerald-400'
  if (status === 'long') return 'text-amber-600 dark:text-amber-400'
  return 'text-muted-foreground'
}

interface SeoLengthCounterProps {
  value: string
  min: number
  max: number
}

function SeoLengthCounter({ value, min, max }: SeoLengthCounterProps) {
  const t = useTranslations('features.blog.composer')
  const length = value.trim().length
  const status = getSeoLengthStatus(length, min, max)

  const statusText =
    status === 'optimal'
      ? t('frontmatter.seo_counter_optimal')
      : status === 'long'
        ? t('frontmatter.seo_counter_long', { max })
        : t('frontmatter.seo_counter_short', { min, max })

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 text-[11px]',
        getSeoLengthColorClass(status),
      )}
    >
      <span>{statusText}</span>
      <span className="tabular-nums shrink-0">
        {t('frontmatter.seo_counter_range', { count: length, min, max })}
      </span>
    </div>
  )
}

type FrontmatterFieldErrors = Partial<Record<keyof BlogFrontmatter, string[] | undefined>>

type UpdateFrontmatterField = <K extends keyof BlogFrontmatter>(
  key: K,
  value: BlogFrontmatter[K],
  markDraft?: boolean,
) => void

interface MetadataIdentitySectionProps {
  idPrefix: string
  data: BlogFrontmatter
  errors: FrontmatterFieldErrors
  onUpdateField: UpdateFrontmatterField
  onRegenerateSlug: () => void
}

export function MetadataIdentitySection({
  idPrefix,
  data,
  errors,
  onUpdateField,
  onRegenerateSlug,
}: MetadataIdentitySectionProps) {
  const t = useTranslations('features.blog.composer')
  const showSyncSlug = Boolean(data.title) && data.slug !== generateSlug(data.title)

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-title`} className="text-xs font-medium text-foreground">
            <Type className="size-3.5 text-muted-foreground" />
            {t('frontmatter.field_title')}
          </Label>
          <Input
            id={`${idPrefix}-title`}
            value={data.title}
            onChange={(e) => onUpdateField('title', e.target.value)}
            placeholder={t('frontmatter.title_placeholder')}
            aria-invalid={Boolean(errors.title)}
          />
          <SeoLengthCounter value={data.title} min={SEO_TITLE_MIN} max={SEO_TITLE_MAX} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${idPrefix}-slug`} className="text-xs font-medium text-foreground">
              <Link2 className="size-3.5 text-muted-foreground" />
              {t('frontmatter.field_slug')}
            </Label>
            {showSyncSlug && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={onRegenerateSlug}
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
              onChange={(e) => onUpdateField('slug', generateSlug(e.target.value))}
              onBlur={() => onUpdateField('slug', data.slug.replace(/^-+|-+$/g, ''), false)}
              placeholder={t('frontmatter.slug_placeholder')}
              className="flex-1 font-mono text-xs"
              aria-invalid={Boolean(errors.slug)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`${idPrefix}-canonical-url`}
            className="text-xs font-medium text-foreground"
          >
            <Link2 className="size-3.5 text-muted-foreground" />
            {t('frontmatter.field_canonical_url')}
          </Label>
          <Input
            id={`${idPrefix}-canonical-url`}
            type="url"
            value={data.canonicalUrl || ''}
            onChange={(e) => onUpdateField('canonicalUrl', e.target.value)}
            onBlur={() => onUpdateField('canonicalUrl', (data.canonicalUrl || '').trim(), false)}
            placeholder={t('frontmatter.canonical_url_placeholder')}
            className="font-mono text-xs"
            aria-invalid={Boolean(errors.canonicalUrl)}
          />
          {errors.canonicalUrl ? (
            <p className="text-[11px] text-destructive">{t('frontmatter.canonical_url_invalid')}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              {t('frontmatter.canonical_url_hint')}
            </p>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`} className="text-xs font-medium text-foreground">
          <AlignLeft className="size-3.5 text-muted-foreground" />
          {t('frontmatter.field_description')}
        </Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={data.description}
          onChange={(e) => onUpdateField('description', e.target.value)}
          rows={3}
          placeholder={t('frontmatter.description_placeholder')}
          className="resize-none text-sm"
        />
        <SeoLengthCounter
          value={data.description}
          min={SEO_DESCRIPTION_MIN}
          max={SEO_DESCRIPTION_MAX}
        />
      </div>
    </>
  )
}

interface UploadedCoverAttachmentProps {
  coverImage: string
  previewAlt: string
  isUploadingCover: boolean
  onSelectFile: () => void
  onRemoveCover: () => void
}

function UploadedCoverAttachment({
  coverImage,
  previewAlt,
  isUploadingCover,
  onSelectFile,
  onRemoveCover,
}: UploadedCoverAttachmentProps) {
  const t = useTranslations('features.blog.composer')

  return (
    <div className="space-y-2.5">
      <div className="relative w-full overflow-hidden rounded-xl bg-muted/20">
        {/* biome-ignore lint/performance/noImgElement: admin cover preview renders arbitrary external or blob URLs */}
        <img src={coverImage} alt={previewAlt} className="h-full w-full object-cover" />
      </div>

      <Attachment
        state={isUploadingCover ? 'uploading' : 'done'}
        className="w-full justify-between"
      >
        <AttachmentMedia variant="image">
          {/* biome-ignore lint/performance/noImgElement: Attachment thumbnail */}
          <img src={coverImage} alt="" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{t('frontmatter.cover_attached')}</AttachmentTitle>
          <AttachmentDescription>{coverImage}</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction
            type="button"
            onClick={onSelectFile}
            disabled={isUploadingCover}
            aria-label={t('frontmatter.replace_cover')}
          >
            {isUploadingCover ? <Spinner /> : <Upload />}
          </AttachmentAction>
          <AttachmentAction
            type="button"
            onClick={onRemoveCover}
            disabled={isUploadingCover}
            className="text-muted-foreground hover:text-destructive"
            aria-label={t('frontmatter.remove_cover')}
          >
            <Trash2 />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  )
}

interface IdleCoverAttachmentProps {
  isUploadingCover: boolean
  onSelectFile: () => void
}

function IdleCoverAttachment({ isUploadingCover, onSelectFile }: IdleCoverAttachmentProps) {
  const t = useTranslations('features.blog.composer')

  return (
    <Attachment
      state={isUploadingCover ? 'uploading' : 'idle'}
      className="w-full cursor-pointer hover:border-primary/50 hover:bg-muted/30"
    >
      <AttachmentTrigger onClick={onSelectFile} disabled={isUploadingCover} />
      <AttachmentMedia variant="icon">
        {isUploadingCover ? <Spinner /> : <Upload />}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{t('frontmatter.upload_cover')}</AttachmentTitle>
        <AttachmentDescription>{t('frontmatter.upload_cover_hint')}</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  )
}

interface MetadataCoverSectionProps {
  idPrefix: string
  data: BlogFrontmatter
  errors: FrontmatterFieldErrors
  fileInputRef: RefObject<HTMLInputElement | null>
  isUploadingCover: boolean
  onCoverFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  onUpdateField: UpdateFrontmatterField
}

export function MetadataCoverSection({
  idPrefix,
  data,
  errors,
  fileInputRef,
  isUploadingCover,
  onCoverFileChange,
  onUpdateField,
}: MetadataCoverSectionProps) {
  const t = useTranslations('features.blog.composer')
  const triggerFilePicker = () => fileInputRef.current?.click()
  const previewAlt = data.coverImageAlt || data.title || 'Cover preview'

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-foreground">
        <ImageIcon className="size-3.5 text-muted-foreground" />
        {t('frontmatter.field_cover_image')}
      </Label>

      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_INPUT_ACCEPT}
        className="hidden"
        onChange={onCoverFileChange}
      />

      {data.coverImage ? (
        <UploadedCoverAttachment
          coverImage={data.coverImage}
          previewAlt={previewAlt}
          isUploadingCover={isUploadingCover}
          onSelectFile={triggerFilePicker}
          onRemoveCover={() => onUpdateField('coverImage', '')}
        />
      ) : (
        <IdleCoverAttachment isUploadingCover={isUploadingCover} onSelectFile={triggerFilePicker} />
      )}

      <Input
        type="url"
        value={data.coverImage || ''}
        onChange={(e) => onUpdateField('coverImage', e.target.value)}
        placeholder={t('frontmatter.cover_image_placeholder')}
        className="text-xs"
      />

      <div className="space-y-1.5 pt-1">
        <Label
          htmlFor={`${idPrefix}-cover-image-alt`}
          className="text-xs font-medium text-foreground"
        >
          {t('frontmatter.field_cover_image_alt')}
        </Label>
        <Input
          id={`${idPrefix}-cover-image-alt`}
          value={data.coverImageAlt || ''}
          onChange={(e) => onUpdateField('coverImageAlt', e.target.value)}
          placeholder={t('frontmatter.cover_image_alt_placeholder')}
          maxLength={200}
          className="text-xs"
          aria-invalid={Boolean(errors.coverImageAlt)}
        />
        <p className="text-[11px] text-muted-foreground">{t('frontmatter.cover_image_alt_hint')}</p>
      </div>
    </div>
  )
}

interface MetadataTaxonomyLocaleSectionProps {
  categories: string[]
  locale: Locale
  existingCategories: string[]
  onUpdateField: UpdateFrontmatterField
}

export function MetadataTaxonomyLocaleSection({
  categories,
  locale,
  existingCategories,
  onUpdateField,
}: MetadataTaxonomyLocaleSectionProps) {
  const t = useTranslations('features.blog.composer')
  const [categoryInput, setCategoryInput] = useState('')
  const chipsAnchor = useComboboxAnchor()

  const trimmedCategory = categoryInput.trim()
  const filteredCategories = existingCategories.filter(
    (category) =>
      !categories.includes(category) &&
      category.toLowerCase().includes(categoryInput.toLowerCase()),
  )
  const showCreate =
    trimmedCategory !== '' &&
    ![...filteredCategories, ...categories].some(
      (category) => category.toLowerCase() === trimmedCategory.toLowerCase(),
    )

  const handleCategoryKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (!trimmedCategory) return

    const exists = categories.some(
      (category) => category.toLowerCase() === trimmedCategory.toLowerCase(),
    )
    if (!exists) {
      onUpdateField('categories', [...categories, trimmedCategory])
    }
    setCategoryInput('')
  }

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs font-medium text-foreground">
          <Hash className="size-3.5 text-muted-foreground" />
          {t('frontmatter.field_categories')}
        </Label>
        <Combobox<string, true>
          multiple
          value={categories}
          onValueChange={(value) => onUpdateField('categories', value)}
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
                <ComboboxItem value={trimmedCategory}>
                  {t('frontmatter.create_category', { category: trimmedCategory })}
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

      <div className="space-y-2">
        <Label className="text-xs font-medium text-foreground">
          <Languages className="size-3.5 text-muted-foreground" />
          {t('frontmatter.field_locale')}
        </Label>
        <Combobox<string>
          value={locale}
          onValueChange={(value) => {
            if (value) onUpdateField('locale', value as Locale)
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
    </>
  )
}

function getPublicationBadgeConfig(
  published: boolean,
  draft: boolean,
): {
  variant: 'softOrange' | 'softGreen' | 'softYellow'
  labelKey: 'status.unpublished_changes' | 'status.published' | 'status.draft'
} {
  if (published && draft) {
    return { variant: 'softOrange', labelKey: 'status.unpublished_changes' }
  }
  if (published) {
    return { variant: 'softGreen', labelKey: 'status.published' }
  }
  return { variant: 'softYellow', labelKey: 'status.draft' }
}

interface MetadataPublicationSectionProps {
  published: boolean
  draft: boolean
  onPublishedChange: (checked: boolean) => void
  onDraftChange: (checked: boolean) => void
  onDiscardDraft?: () => void
  isDiscardingDraft: boolean
}

export function MetadataPublicationSection({
  published,
  draft,
  onPublishedChange,
  onDraftChange,
  onDiscardDraft,
  isDiscardingDraft,
}: MetadataPublicationSectionProps) {
  const t = useTranslations('features.blog.composer')
  const hasUnpublishedChanges = published && draft
  const badge = getPublicationBadgeConfig(published, draft)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-foreground">
          <Globe className="size-3.5 text-muted-foreground" />
          {t('frontmatter.publication_status')}
        </Label>
        <Badge variant={badge.variant}>{t(badge.labelKey)}</Badge>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-foreground">
              {t('frontmatter.field_published')}
            </p>
            <p className="text-xs text-muted-foreground">
              {published ? t('frontmatter.published_hint') : t('frontmatter.unpublished_hint')}
            </p>
          </div>
          <Switch checked={published} onCheckedChange={onPublishedChange} />
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileEdit
              className={cn(
                'size-3.5 shrink-0',
                draft ? 'text-amber-500' : 'text-muted-foreground',
              )}
            />
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-foreground">
                {t('frontmatter.draft_overlay_label')}
              </p>
              <p className="text-xs text-muted-foreground">
                {draft ? t('frontmatter.draft_active_hint') : t('frontmatter.draft_synced_hint')}
              </p>
            </div>
          </div>
          <Switch checked={draft} onCheckedChange={onDraftChange} />
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
  )
}
