'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { type AuthProvider, track } from '@/lib/analytics/events'

export function AuthTracker() {
  const searchParams = useSearchParams()

  const loggedIn = searchParams.get('loggedIn')
  const provider = searchParams.get('provider') as AuthProvider | null

  useEffect(() => {
    if (loggedIn !== 'social' || !provider) return

    track('Login', { provider })

    const cleanUrl = new URL(window.location.href)
    cleanUrl.searchParams.delete('loggedIn')
    cleanUrl.searchParams.delete('provider')
    window.history.replaceState({}, '', cleanUrl.toString())
  }, [loggedIn, provider])

  return null
}
