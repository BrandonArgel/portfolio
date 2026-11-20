'use client'

import { PenLine, ShieldCheck, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { sileo } from 'sileo'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateUserRoleAction } from '@/features/users/actions/users-action'
import type { UserRole } from '@/features/users/services/users-service'
import { cn } from '@/lib/utils'
import { useUserErrors } from '../hooks/use-user-errors'

interface UserRoleSelectProps {
  userId: string
  currentRole: UserRole | string
  userName?: string
  disabled?: boolean
}

const ROLE_ICONS = {
  admin: ShieldCheck,
  editor: PenLine,
  user: User,
} as const satisfies Record<UserRole, typeof User>

const ROLE_COLORS = {
  admin:
    'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
  editor:
    'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  user: 'text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
} as const satisfies Record<UserRole, string>

function toUserRole(value: string): UserRole {
  if (value === 'admin' || value === 'editor' || value === 'user') {
    return value
  }
  return 'user'
}

export function UserRoleSelect({
  userId,
  currentRole,
  userName,
  disabled = false,
}: UserRoleSelectProps) {
  const t = useTranslations('features.users')
  const { handleUserError } = useUserErrors()
  const [role, setRole] = useState<UserRole>(() => toUserRole(currentRole))
  const [isExecuting, startTransition] = useTransition()

  const handleRoleChange = (nextRole: string | null) => {
    if (!nextRole || isExecuting) return
    const validRole = toUserRole(nextRole)
    if (validRole === role) return

    startTransition(async () => {
      const [err, res] = await updateUserRoleAction({ userId, newRole: validRole })

      if (err) {
        handleUserError(err)
        return
      }

      setRole(res.newRole)
      sileo.success({
        title: t('management.role_updated_title'),
        description: t('management.role_updated_desc', {
          name: userName || t('roles.user'),
          role: t(`roles.${res.newRole}`),
        }),
      })
    })
  }

  const CurrentIcon = ROLE_ICONS[role]

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={handleRoleChange} disabled={isExecuting || disabled}>
        <SelectTrigger
          className={cn(
            'w-32 h-8 text-xs font-medium cursor-pointer transition-all border',
            ROLE_COLORS[role],
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
