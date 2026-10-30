'use client'

import { Save } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useCallback, useEffect } from 'react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { uploadImageAction } from '@/features/blog/actions/image.action'
import { savePostAction } from '@/features/blog/actions/post-actions'
import { Editor } from '@/features/editor/components/editor'
import { TiptapEditor } from '@/features/editor/components/tiptap-editor'
import { useMounted } from '@/hooks/use-mounted'
import { useStoreHydration } from '@/hooks/use-store-hydration'
import { useRouter } from '@/i18n/navigation'
// import { useBlogErrors } from '../hooks/use-blog-errors'
import { type BlogFrontmatter, defaultFrontmatter } from '../schemas/post.schema'
import { blogDraftsActions, useBlogDraftsStore } from '../store/use-blog-drafts-store'
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

  const draftId = initialId || 'new'

  const isHydrated = useStoreHydration(useBlogDraftsStore)

  const draft = useBlogDraftsStore((state) => state.drafts[draftId])

  useEffect(() => {
    if (isHydrated && !draft) {
      blogDraftsActions.initDraft(draftId, initialFrontmatter, initialContent)
    }
  }, [isHydrated, draft, draftId, initialFrontmatter, initialContent])

  const frontmatter = draft?.frontmatter || initialFrontmatter || defaultFrontmatter

  const content = draft?.content ?? (initialContent || '')

  const clearDraft = useCallback(() => {
    blogDraftsActions.clearDraft(draftId)
  }, [draftId])

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

  const handleImageUpload = useCallback(
    async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      sileo.info({ title: t('notifications.uploading_image') })
      console.log('🚀 ~ BlogComposer ~ file:', file)

      try {
        const result = await executeUpload({ formData })
        console.log({ result })

        if (result?.serverError || result?.validationErrors) {
          sileo.error({ title: t('notifications.image_upload_error') })
          return undefined
        }

        if (result?.data?.success && result.data.url) {
          sileo.success({ title: t('notifications.image_inserted') })
          return result.data.url
        }

        sileo.error({ title: t('notifications.image_upload_error') })
        return undefined
      } catch (error) {
        console.error('Error during the image upload:', error)
        sileo.error({ title: t('notifications.image_upload_error') })
        return undefined
      }
    },
    [executeUpload, t],
  )

  const handleContentChange = useCallback(
    (markdown: string) => {
      blogDraftsActions.setContent(draftId, markdown)
    },
    [draftId],
  )

  const handleFrontmatterChange = useCallback(
    (newFrontmatter: BlogFrontmatter) => {
      blogDraftsActions.setFrontmatter(draftId, newFrontmatter)
    },
    [draftId],
  )

  return (
    <div className="h-[calc(100dvh-56px)] h md:h-screen w-full flex flex-col gap-4">
      {/* <BlogFrontmatterPanel
        data={frontmatter}
        onChange={setFrontmatter}
        existingCategories={existingCategories}
      /> */}
      <header className="bg-secondary-background p-4 flex items-center justify-between gap-4 border-b border-border">
        <div>
          <Input
            placeholder="Insertar el título"
            className="border-none focus-visible:ring-0 text-xl font-bold p-0 dark:bg-transparent"
          />
          Time
        </div>
        <div>Buttons</div>
      </header>

      <div className="flex-1 min-h-0 w-full p-4">
        <Editor
          draftId={draftId}
          initialContent={content}
          onChange={handleContentChange}
          onImageUpload={handleImageUpload}
        />
      </div>
    </div>
  )
}
