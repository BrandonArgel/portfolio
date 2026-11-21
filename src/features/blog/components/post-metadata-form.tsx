'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { type ChangeEvent, useRef, useState } from 'react'
import { sileo } from 'sileo'
import { z } from 'zod'
import { Separator } from '@/components/ui/separator'
import { isCompressibleImageMimeType } from '@/config/image-upload'
import { cn } from '@/lib/utils'
import { generateSlug } from '@/utils/string-utils'
import { useImageUpload } from '../hooks/use-image-upload'
import { type BlogFrontmatter, BlogFrontmatterSchema } from '../schemas/post-schema'
import { applyTitleChangeToFrontmatter } from '../utils/blog-composer-utils'
import { resolveImageMimeType } from '../utils/image-mime'
import {
  type CoverCropRect,
  isExactCoverAspectRatio,
  readImageNaturalDimensions,
} from '../utils/optimize-cover-image'
import {
  MetadataCoverSection,
  MetadataIdentitySection,
  MetadataPublicationSection,
  MetadataTaxonomyLocaleSection,
} from './post-metadata-sections'

const DynamicCoverCropDialog = dynamic(
  () => import('./cover-crop-dialog').then((mod) => mod.CoverCropDialog),
  { ssr: false },
)

interface PendingCoverCrop {
  file: File
  naturalWidth: number
  naturalHeight: number
}

function useCoverUploadFlow(onUploaded: (url: string) => void) {
  const t = useTranslations('features.blog.composer')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [pendingCoverCrop, setPendingCoverCrop] = useState<PendingCoverCrop | null>(null)
  const { upload: uploadCover, isUploading: isUploadingCover } = useImageUpload({
    context: 'cover',
  })

  const resetCoverFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const runCoverUpload = async (file: File, cropRect?: CoverCropRect) => {
    const url = await uploadCover(file, cropRect ? { cropRect } : undefined)
    if (!url) return

    onUploaded(url)
    sileo.success({ title: t('notifications.cover_uploaded') })
  }

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    resetCoverFileInput()
    if (!file) return

    const mimeType = resolveImageMimeType(file)
    if (!mimeType || !isCompressibleImageMimeType(mimeType)) {
      await runCoverUpload(file)
      return
    }

    const dims = await readImageNaturalDimensions(file)
    if (!dims || isExactCoverAspectRatio(dims.width, dims.height)) {
      await runCoverUpload(file)
      return
    }

    setPendingCoverCrop({
      file,
      naturalWidth: dims.width,
      naturalHeight: dims.height,
    })
  }

  const handleCancelCoverCrop = () => {
    resetCoverFileInput()
    setPendingCoverCrop(null)
  }

  const handleConfirmCoverCrop = async (cropRect: CoverCropRect) => {
    const pendingFile = pendingCoverCrop?.file
    resetCoverFileInput()
    setPendingCoverCrop(null)
    if (!pendingFile) return

    await runCoverUpload(pendingFile, cropRect)
  }

  return {
    fileInputRef,
    pendingCoverCrop,
    isUploadingCover,
    handleCoverUpload,
    handleCancelCoverCrop,
    handleConfirmCoverCrop,
  }
}

export interface PostMetadataFormProps {
  data: BlogFrontmatter
  onChange: (newData: BlogFrontmatter) => void
  existingCategories?: string[]
  isExistingPost?: boolean
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
  isExistingPost = false,
  onTogglePublish,
  onDiscardDraft,
  isDiscardingDraft = false,
  idPrefix = 'post-metadata',
  className,
}: PostMetadataFormProps) {
  const validation = BlogFrontmatterSchema.safeParse(data)
  const errors = validation.success ? {} : z.flattenError(validation.error).fieldErrors

  const updateField = <K extends keyof BlogFrontmatter>(
    key: K,
    value: BlogFrontmatter[K],
    markDraft = true,
  ) => {
    if (key === 'title') {
      const updated = applyTitleChangeToFrontmatter(data, value as string, isExistingPost)
      onChange(markDraft ? updated : { ...updated, draft: data.draft })
      return
    }

    onChange({
      ...data,
      [key]: value,
      ...(markDraft ? { draft: true } : {}),
    })
  }

  const handleRegenerateSlug = () => {
    if (!data.title) return
    onChange({
      ...data,
      slug: generateSlug(data.title).replace(/^-+|-+$/g, ''),
      draft: true,
    })
  }

  const handlePublishedChange = (checked: boolean) => {
    if (onTogglePublish) {
      onTogglePublish(checked)
      return
    }

    onChange({
      ...data,
      published: checked,
      draft: !checked ? true : data.draft,
    })
  }

  const coverFlow = useCoverUploadFlow((url) => updateField('coverImage', url))

  return (
    <div className={cn('space-y-6', className)}>
      <MetadataIdentitySection
        idPrefix={idPrefix}
        data={data}
        errors={errors}
        onUpdateField={updateField}
        onRegenerateSlug={handleRegenerateSlug}
      />

      <Separator />

      <MetadataCoverSection
        idPrefix={idPrefix}
        data={data}
        errors={errors}
        fileInputRef={coverFlow.fileInputRef}
        isUploadingCover={coverFlow.isUploadingCover}
        onCoverFileChange={coverFlow.handleCoverUpload}
        onUpdateField={updateField}
      />

      <Separator />

      <MetadataTaxonomyLocaleSection
        categories={data.categories}
        locale={data.locale}
        existingCategories={existingCategories}
        onUpdateField={updateField}
      />

      <Separator />

      <MetadataPublicationSection
        published={data.published}
        draft={data.draft}
        onPublishedChange={handlePublishedChange}
        onDraftChange={(checked) => updateField('draft', checked, false)}
        onDiscardDraft={onDiscardDraft}
        isDiscardingDraft={isDiscardingDraft}
      />

      {coverFlow.pendingCoverCrop && (
        <DynamicCoverCropDialog
          file={coverFlow.pendingCoverCrop.file}
          naturalWidth={coverFlow.pendingCoverCrop.naturalWidth}
          naturalHeight={coverFlow.pendingCoverCrop.naturalHeight}
          onCancel={coverFlow.handleCancelCoverCrop}
          onConfirm={coverFlow.handleConfirmCoverCrop}
          isSubmitting={coverFlow.isUploadingCover}
        />
      )}
    </div>
  )
}
