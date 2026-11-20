'use client'

import { Ban, Copy, MoreHorizontal, UserCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { unbanUserAction } from '@/features/users/actions/users-action'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { useUserErrors } from '../hooks/use-user-errors'
import { BanUserDialog } from './ban-user-dialog'

interface UserActionsMenuProps {
  userId: string
  userName: string
  userEmail: string
  isBanned: boolean
  isSelf: boolean
}

export function UserActionsMenu({
  userId,
  userName,
  userEmail,
  isBanned,
  isSelf,
}: UserActionsMenuProps) {
  const t = useTranslations('features.users.management')
  const { handleUserError } = useUserErrors()
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [isUnbanning, startUnbanTransition] = useTransition()
  const { copy } = useCopyToClipboard({
    timeout: null,
    onSuccess: (value) => {
      sileo.success({
        title: t('id_copied'),
        description: value,
      })
    },
    onError: () => {
      sileo.error({
        title: t('copy_id_error'),
      })
    },
  })

  const handleUnban = () => {
    if (isSelf || isUnbanning) return
    startUnbanTransition(async () => {
      const [err] = await unbanUserAction({ userId })
      if (err) {
        handleUserError(err)
        return
      }

      sileo.success({
        title: t('user_unbanned_success'),
        description: userName || userEmail,
      })
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={t('actions')}
            />
          }
        >
          {isUnbanning ? (
            <Spinner className="size-4 text-primary" />
          ) : (
            <MoreHorizontal className="size-4" />
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44 p-1">
          <DropdownMenuItem
            onClick={() => void copy(userId)}
            className="text-xs cursor-pointer gap-2"
          >
            <Copy className="size-3.5 text-muted-foreground" />
            <span>{t('copy_id')}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {isBanned ? (
            <DropdownMenuItem
              onClick={handleUnban}
              disabled={isSelf || isUnbanning}
              className="text-xs cursor-pointer gap-2 text-emerald-600 dark:text-emerald-400 focus:text-emerald-700"
            >
              <UserCheck className="size-3.5" />
              <span>{t('unban_user')}</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setBanDialogOpen(true)}
              disabled={isSelf}
              variant="destructive"
              className="text-xs cursor-pointer gap-2 text-destructive focus:text-destructive"
            >
              <Ban className="size-3.5" />
              <span>{t('ban_user')}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <BanUserDialog
        userId={userId}
        userName={userName}
        userEmail={userEmail}
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
      />
    </>
  )
}
