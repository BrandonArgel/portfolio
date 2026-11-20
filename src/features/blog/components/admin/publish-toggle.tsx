'use client'

import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { sileo } from 'sileo'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { togglePublishStatusAction } from '@/features/blog/actions/post-actions'
import { usePostErrors } from '@/features/blog/hooks/use-post-errors'
import { useRouter } from '@/i18n/navigation'

interface PostPublishToggleProps {
  postId: string
  initialPublished: boolean
}

export function PostPublishToggle({ postId, initialPublished }: PostPublishToggleProps) {
  const t = useTranslations('features.blog.management')
  const router = useRouter()
  const { handlePostError } = usePostErrors()
  const [published, setPublished] = useState(initialPublished)
  const [isPending, startTransition] = useTransition()

  const handleCheckedChange = (checked: boolean) => {
    setPublished(checked)

    startTransition(async () => {
      const [err, result] = await togglePublishStatusAction({ postId, published: checked })

      if (err) {
        setPublished(!checked)
        handlePostError(err)
        return
      }

      setPublished(result.published)
      sileo.success({
        title: result.published ? t('publish_success') : t('unpublish_success'),
      })
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={published}
        onCheckedChange={handleCheckedChange}
        disabled={isPending}
        aria-label={t('publish_toggle')}
      />
      {published ? (
        <Badge variant="softGreen" className="text-xs">
          {t('published')}
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs">
          {t('draft')}
        </Badge>
      )}
    </div>
  )
}
