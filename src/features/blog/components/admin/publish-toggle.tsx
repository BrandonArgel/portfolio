'use client'

import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { sileo } from 'sileo'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { togglePublishStatusAction } from '@/features/blog/actions/posts.action'
import { checkAndHandleSessionRevoked } from '@/lib/auth-interceptor'

interface PostPublishToggleProps {
  postId: string
  initialPublished: boolean
}

export function PostPublishToggle({ postId, initialPublished }: PostPublishToggleProps) {
  const t = useTranslations('features.blog.management')
  const [published, setPublished] = useState(initialPublished)

  const { execute, isExecuting } = useAction(togglePublishStatusAction, {
    onSuccess: (res) => {
      if (res.data?.success) {
        setPublished(res.data.published)
        sileo.success({
          title: res.data.published ? t('publish_success') : t('unpublish_success'),
        })
      }
    },
    onError: ({ error }) => {
      if (checkAndHandleSessionRevoked(error)) return

      // Revert optimistic state on error
      setPublished(!published)
      const serverError = error.serverError
      sileo.error({
        title: serverError?.title || t('status_update_error'),
        description: serverError?.description,
      })
    },
  })

  const handleCheckedChange = (checked: boolean) => {
    setPublished(checked)
    execute({ postId, published: checked })
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={published}
        onCheckedChange={handleCheckedChange}
        disabled={isExecuting}
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
