'use client'

import { useEffect } from 'react'
import { sileo } from 'sileo'

export function NetworkNotifier() {
  useEffect(() => {
    const handleOnline = () => {
      sileo.success({
        title: 'Connection Restored',
        description: 'You are back online.',
      })
    }

    const handleOffline = () => {
      sileo.error({
        title: 'No Connection',
        description: 'It seems you have lost your internet connection.',
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return null
}
