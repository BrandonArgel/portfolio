'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { sileo } from 'sileo'
import { deletePostAction } from '@/actions/posts.action'
import { Button } from '@/components/ui/button'

export function DeletePostButton({ postId }: { postId: string }) {
  const t = useTranslations('dashboard.posts_management')

  const { execute, isExecuting } = useAction(deletePostAction, {
    onSuccess: (res) => {
      if (res.data?.success) {
        sileo.success({
          title: t('delete_success'),
        })
      }
    },
    onError: ({ error }) => {
      const serverError = error.serverError
      sileo.error({
        title: serverError?.title || t('delete_error'),
        description: serverError?.description,
      })
    },
  })

  const handleDelete = () => {
    if (!window.confirm(t('delete_confirm'))) return
    execute({ postId })
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      className="gap-1.5 cursor-pointer text-xs h-8"
      onClick={handleDelete}
      disabled={isExecuting}
    >
      {isExecuting ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" />
      )}
      <span>{isExecuting ? t('deleting') : t('delete')}</span>
    </Button>
  )
}
