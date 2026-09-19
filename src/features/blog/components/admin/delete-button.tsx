'use client'

import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { sileo } from 'sileo'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { deletePostAction } from '@/features/blog/actions/posts.action'
import { checkAndHandleSessionRevoked } from '@/lib/auth-interceptor'

export function DeletePostButton({ postId }: { postId: string }) {
  const t = useTranslations('features.blog.management')
  const [open, setOpen] = useState(false)

  const { execute, isExecuting } = useAction(deletePostAction, {
    onSuccess: (res) => {
      if (res.data?.success) {
        sileo.success({
          title: t('delete_success'),
        })
        setOpen(false)
      }
    },
    onError: ({ error }) => {
      if (checkAndHandleSessionRevoked(error)) return

      const serverError = error.serverError
      sileo.error({
        title: serverError?.title || t('delete_error'),
        description: serverError?.description,
      })
    },
  })

  const handleDelete = () => {
    execute({ postId })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 cursor-pointer text-xs h-8"
            disabled={isExecuting}
          >
            {isExecuting ? <Spinner className="size-3.5" /> : <Trash2 className="size-3.5" />}
            <span>{isExecuting ? t('deleting') : t('delete')}</span>
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('delete_dialog_title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('delete_dialog_description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExecuting}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isExecuting}>
            {isExecuting ? <Spinner className="size-3.5 animate-spin mr-1.5" /> : null}
            {t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
