'use client'

import { Loader2, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
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
import { Editor } from '@/features/editor/components/tiptap-editor'
import { useLocalStorage } from '@/hooks/use-local-storage'
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
  const storageKey = initialId ? `blog-${initialId}` : 'blog-new'
  const [frontmatter, setFrontmatter, removeFrontmatter] = useLocalStorage<BlogFrontmatter>(
    `${storageKey}-frontmatter`,
    initialFrontmatter || defaultFrontmatter,
  )
  const [content, setContent, removeContent] = useLocalStorage<string>(
    `${storageKey}-content`,
    initialContent || '',
  )

  const clearDraft = () => {
    if (removeFrontmatter) removeFrontmatter()
    else window.localStorage.removeItem(`${storageKey}-frontmatter`)

    if (removeContent) removeContent()
    else window.localStorage.removeItem(`${storageKey}-content`)
  }

  const { execute: executeSave, isExecuting: isSaving } = useAction(savePostAction, {
    onSuccess: (res) => {
      if (res.data?.success) {
        sileo.success({
          title: initialId ? t('notifications.post_updated') : t('notifications.post_created'),
        })

        clearDraft()

        if (frontmatter.published) {
          router.push(`/blog/${res.data.slug}`)
        } else {
          router.push(`/dashboard/posts/${res.data.slug}/edit`)
        }
      }
    },
    onError: ({ error }) => {
      sileo.error({
        title: t('notifications.save_error'),
        description: error.serverError?.description,
      })
    },
  })

  const handleSave = () => {
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
      content: content,
      coverImage: frontmatter.coverImage || null,
    })
  }

  const { executeAsync: executeUpload } = useAction(uploadImageAction)

  const handleImagePaste = async (file: File) => {
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
  }

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

        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSaving ? t('saving') : t('save')}
        </Button>
      </div>

      <BlogFrontmatterPanel
        data={frontmatter}
        onChange={setFrontmatter}
        existingCategories={existingCategories}
      />

      {/* El motor solo recibe la información inicial y nos notifica de los cambios */}
      <Editor
        initialContent={content}
        onChange={(markdown) => setContent(markdown)}
        onImageUpload={handleImagePaste}
      />
    </div>
  )
}
