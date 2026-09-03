'use client'

import { PenLine, ShieldCheck, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { sileo } from 'sileo'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateUserRoleAction } from '@/features/users/actions/users.action'
import { cn } from '@/lib/utils'

interface UserRoleSelectProps {
  userId: string
  currentRole: 'admin' | 'editor' | 'user' | string
  userName?: string
  disabled?: boolean
}

const ROLE_ICONS = {
  admin: ShieldCheck,
  editor: PenLine,
  user: User,
} as const

const ROLE_COLORS = {
  admin:
    'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
  editor:
    'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  user: 'text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
} as const

export function UserRoleSelect({
  userId,
  currentRole,
  userName,
  disabled = false,
}: UserRoleSelectProps) {
  const t = useTranslations('dashboard')
  const [role, setRole] = useState<'admin' | 'editor' | 'user'>(
    (currentRole as 'admin' | 'editor' | 'user') || 'user',
  )

  const { execute, isExecuting } = useAction(updateUserRoleAction, {
    onSuccess: (res) => {
      if (res.data?.success && res.data.newRole) {
        setRole(res.data.newRole)
        sileo.success({
          title: t('users_management.role_updated_title'),
          description: t('users_management.role_updated_desc', {
            name: userName || 'User',
            role: t(`roles.${res.data.newRole}`),
          }),
        })
      }
    },
    onError: ({ error }) => {
      const serverError = error.serverError
      sileo.error({
        title: serverError?.title || t('users_management.role_update_error'),
        description: serverError?.description,
      })
    },
  })

  const handleRoleChange = (newRole: string | null) => {
    if (!newRole || newRole === role || isExecuting) return
    const validRole = newRole as 'admin' | 'editor' | 'user'
    execute({ userId, newRole: validRole })
  }

  const CurrentIcon = ROLE_ICONS[role] || User

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={handleRoleChange} disabled={isExecuting || disabled}>
        <SelectTrigger
          className={cn(
            'w-32 h-8 text-xs font-medium cursor-pointer transition-all border',
            ROLE_COLORS[role] || ROLE_COLORS.user,
            isExecuting && 'opacity-60 cursor-wait',
          )}
        >
          <div className="flex items-center gap-1.5 truncate">
            <CurrentIcon className="size-3.5 shrink-0" />
            <SelectValue>{t(`roles.${role}`)}</SelectValue>
          </div>
        </SelectTrigger>

        <SelectContent align="end" className="w-36 p-1">
          <SelectItem value="admin" className="text-xs cursor-pointer gap-2">
            <ShieldCheck className="size-3.5 text-purple-500 shrink-0" />
            <span>{t('roles.admin')}</span>
          </SelectItem>

          <SelectItem value="editor" className="text-xs cursor-pointer gap-2">
            <PenLine className="size-3.5 text-blue-500 shrink-0" />
            <span>{t('roles.editor')}</span>
          </SelectItem>

          <SelectItem value="user" className="text-xs cursor-pointer gap-2">
            <User className="size-3.5 text-zinc-500 shrink-0" />
            <span>{t('roles.user')}</span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
