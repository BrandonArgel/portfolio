'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { banUserAction } from '@/features/users/actions/users.action'
import { checkAndHandleSessionRevoked } from '@/lib/auth-interceptor'

interface BanUserDialogProps {
  userId: string
  userName: string
  userEmail: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BanUserDialog({
  userId,
  userName,
  userEmail,
  open,
  onOpenChange,
}: BanUserDialogProps) {
  const t = useTranslations('features.users.management')
  const [duration, setDuration] = useState<string>('7')
  const [reason, setReason] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const { execute, isExecuting } = useAction(banUserAction, {
    onSuccess: (res) => {
      if (res.data?.success) {
        sileo.success({
          title: t('user_banned_success'),
          description: `${userName || userEmail}`,
        })
        onOpenChange(false)
        setReason('')
        setDuration('7')
        setValidationError(null)
      }
    },
    onError: ({ error }) => {
      if (checkAndHandleSessionRevoked(error)) return
      sileo.error({
        title: error.serverError?.title || 'Error',
        description: error.serverError?.description,
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      setValidationError(t('ban_reason_required'))
      return
    }

    setValidationError(null)
    const durationInDays = duration === 'permanent' ? 'permanent' : Number(duration)
    execute({
      userId,
      reason: reason.trim(),
      durationInDays,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <DialogTitle className="text-destructive font-semibold">
                {t('ban_dialog_title')}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              {t('ban_dialog_desc')}
            </DialogDescription>
          </DialogHeader>

          {/* User info box */}
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs space-y-0.5">
            <p className="font-semibold text-foreground">{userName}</p>
            <p className="font-mono text-muted-foreground">{userEmail}</p>
          </div>

          {/* Duration Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="ban-duration" className="text-xs font-medium">
              {t('ban_duration_label')}
            </Label>
            <Select value={duration} onValueChange={(val) => val && setDuration(val)}>
              <SelectTrigger id="ban-duration" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1" className="text-xs">
                  {t('duration_24h')}
                </SelectItem>
                <SelectItem value="7" className="text-xs">
                  {t('duration_7d')}
                </SelectItem>
                <SelectItem value="30" className="text-xs">
                  {t('duration_30d')}
                </SelectItem>
                <SelectItem value="permanent" className="text-xs font-medium text-destructive">
                  {t('duration_permanent')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason Textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="ban-reason" className="text-xs font-medium">
              {t('ban_reason_label')}
            </Label>
            <Textarea
              id="ban-reason"
              placeholder={t('ban_reason_placeholder')}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (validationError) setValidationError(null)
              }}
              rows={3}
              className="text-xs resize-none"
              disabled={isExecuting}
            />
            {validationError && (
              <p className="text-[11px] text-destructive font-medium">{validationError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isExecuting}
              className="text-xs"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isExecuting}
              className="text-xs gap-1.5"
            >
              {isExecuting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <AlertTriangle className="size-3.5" />
              )}
              <span>{t('confirm_ban')}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
