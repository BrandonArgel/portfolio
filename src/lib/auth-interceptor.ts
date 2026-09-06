'use client'

import { authClient } from '@/lib/auth/auth-client'

export const AUTH_REVOKED_EVENT = 'auth:session_revoked'

/**
 * Perform an immediate hard sign-out and redirect to the login page.
 */
export function handleSessionRevoked(locale?: string) {
  if (typeof window === 'undefined') return

  let resolvedLocale = locale
  if (!resolvedLocale) {
    const firstSegment = window.location.pathname.split('/').filter(Boolean)[0]
    resolvedLocale = ['en', 'es', 'fr'].includes(firstSegment) ? firstSegment : 'en'
  }

  authClient
    .signOut()
    .catch((err) => {
      console.error('Error signing out during session revocation:', err)
    })
    .finally(() => {
      window.location.href = `/${resolvedLocale}/login`
    })
}

/**
 * Dispatch a custom event to notify all active guards of session revocation.
 */
export function dispatchSessionRevoked() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(AUTH_REVOKED_EVENT))
}

/**
 * Helper to check if a server action error represents a revoked or banned session.
 */
export function isSessionRevokedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const err = error as {
    serverError?: { title?: string; description?: string } | string
    title?: string
  }

  if (typeof err.serverError === 'string') {
    return err.serverError === 'SESSION_REVOKED'
  }

  if (err.serverError?.title === 'SESSION_REVOKED') {
    return true
  }

  return err.title === 'SESSION_REVOKED'
}

/**
 * Convenience helper to inspect an action error, and if it's SESSION_REVOKED,
 * trigger the instant client kick and return true.
 */
export function checkAndHandleSessionRevoked(error: unknown, locale?: string): boolean {
  if (isSessionRevokedError(error)) {
    dispatchSessionRevoked()
    handleSessionRevoked(locale)
    return true
  }
  return false
}
