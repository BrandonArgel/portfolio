'use client'

import { Loader2, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useCallback } from 'react'
import { sileo } from 'sileo'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { uploadImageAction } from '@/features/blog/actions/image.action'
import { savePostAction } from '@/features/blog/actions/posts.action'
import { Editor } from '@/features/editor/components/editor'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useMounted } from '@/hooks/use-mounted'
import { Link, useRouter } from '@/i18n/navigation'
import { type BlogFrontmatter, defaultFrontmatter } from '../schemas/post.schema'
import { BlogFrontmatterPanel } from './frontmatter-panel'

interface BlogComposerProps {
  initialId?: string
  initialFrontmatter?: BlogFrontmatter
  initialContent?: string
  existingCategories?: string[]
}

export function BlogComposer({
  initialId,
  initialFrontmatter,
  initialContent,
  existingCategories,
}: BlogComposerProps) {
  const t = useTranslations('features.blog.composer')
  const router = useRouter()
  const mounted = useMounted()

  const storageKey = initialId ? `blog-${initialId}` : 'blog-new'

  const [frontmatter, setFrontmatter, removeFrontmatter] = useLocalStorage<BlogFrontmatter>(
    `${storageKey}-frontmatter`,
    initialFrontmatter || defaultFrontmatter,
  )

  const [content, setContent, removeContent, isContentInitialized] = useLocalStorage<string>(
    `${storageKey}-content`,
    initialContent || '',
  )

  const clearDraft = useCallback(() => {
    removeFrontmatter()
    removeContent()
  }, [removeFrontmatter, removeContent])

  const { execute: executeSave, isExecuting: isSaving } = useAction(savePostAction, {
    onSuccess: (res) => {
      if (!res.data?.success) {
        return
      }
      sileo.success({
        title: initialId ? t('notifications.post_updated') : t('notifications.post_created'),
      })
      clearDraft()
      if (frontmatter.published) {
        router.push(`/blog/${res.data.slug}`)
      } else {
        router.push(`/dashboard/posts/${res.data.slug}/edit`)
      }
    },
    onError: ({ error }) => {
      sileo.error({
        title: t('notifications.save_error'),
        description: error.serverError?.description,
      })
    },
  })

  const handleSave = useCallback(() => {
    if (!frontmatter.title || !frontmatter.slug) {
      sileo.error({ title: t('notifications.title_slug_required') })
      return
    }
    executeSave({
      id: initialId,
      title: frontmatter.title,
      slug: frontmatter.slug,
      description: frontmatter.description,
      locale: frontmatter.locale,
      translationGroupId: frontmatter.translationGroupId,
      published: frontmatter.published,
      categories: frontmatter.categories,
      content,
      coverImage: frontmatter.coverImage || null,
    })
  }, [content, executeSave, frontmatter, initialId, t])

  const { executeAsync: executeUpload } = useAction(uploadImageAction)

  const handleImagePaste = useCallback(
    async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      sileo.info({ title: t('notifications.uploading_image') })
      const result = await executeUpload({ formData })
      if (result?.data?.success && result.data.url) {
        sileo.success({ title: t('notifications.image_inserted') })
        return result.data.url
      }
      sileo.error({ title: t('notifications.image_upload_error') })
      return undefined
    },
    [executeUpload, t],
  )

  const handleContentChange = useCallback(
    (markdown: string) => {
      setContent(markdown)
    },
    [setContent],
  )

  const canEdit = mounted && isContentInitialized

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-8 pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                {t('breadcrumb_dashboard')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard/posts" />}>
                {t('breadcrumb_posts')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{initialId ? t('edit_post') : t('new_post')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button onClick={handleSave} disabled={!canEdit || isSaving} className="gap-2">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSaving ? t('saving') : t('save')}
        </Button>
      </div>

      <BlogFrontmatterPanel
        data={frontmatter}
        onChange={setFrontmatter}
        existingCategories={existingCategories}
      />

      {canEdit ? (
        <Editor
          key={storageKey}
          initialContent={content}
          onChange={handleContentChange}
          onImageUpload={handleImagePaste}
        />
      ) : (
        <div className="min-h-150 w-full rounded-xl border border-border bg-background" />
      )}
    </div>
  )
}
