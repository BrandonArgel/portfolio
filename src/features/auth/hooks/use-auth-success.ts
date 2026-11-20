'use client'

import { sileo } from 'sileo'
import { getSafeCallbackUrlFromLocation } from '@/features/auth/utils/callback-url'
import { useRouter } from '@/i18n/navigation'
import { track } from '@/lib/analytics/events'
import type { User } from '@/lib/auth/auth-client'

interface AuthSuccessOptions {
  event: 'Login' | 'Signup'
  title: string
  description?: string
  user: User
}

export function useAuthSuccess() {
  const router = useRouter()

  const handleAuthSuccess = ({ event, title, description, user }: AuthSuccessOptions) => {
    track(event, { provider: 'credentials' })

    sileo.success({ title, description })

    const safeCallbackUrl = getSafeCallbackUrlFromLocation()

    if (safeCallbackUrl) {
      router.push(safeCallbackUrl)
    } else if (user.role === 'admin') {
      router.push('/dashboard')
    } else {
      router.push('/')
    }

    router.refresh()
  }

  return { handleAuthSuccess }
}
