import { headers } from 'next/headers'
import { unstable_rethrow } from 'next/navigation'
import { cache } from 'react'
import { auth } from './auth'

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>

/**
 * Reads the current session for public/optional auth UI.
 * Deduplicated per request via React `cache`, short-circuits when no `cookie`
 * header is present (e.g. social crawlers), and degrades to `null` on error
 * so non-critical session lookups never break public pages with HTTP 500.
 */
export const getOptionalSession = cache(async (): Promise<AuthSession> => {
  try {
    const requestHeaders = await headers()
    if (!requestHeaders.get('cookie')) {
      return null
    }
    return await auth.api.getSession({ headers: requestHeaders })
  } catch (err) {
    unstable_rethrow(err)
    console.error('Error reading optional session:', err)
    return null
  }
})
