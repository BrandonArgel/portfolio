'use server'

import { cookies } from 'next/headers'
import { serverEnv } from '@/data/server-env'
import { fromPromise, type Result } from '@/utils/result'
import type { CookieConsentError } from '../types/errors'

export async function setCookieConsent(
  consent: boolean,
): Promise<Result<void, CookieConsentError>> {
  return fromPromise(
    async () => {
      const cookieStore = await cookies()
      cookieStore.set('cookie-consent', consent.toString(), {
        maxAge: 31536000,
        path: '/',
        httpOnly: false,
        secure: serverEnv.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    },
    (thrown) => {
      console.error('Error setting cookie consent:', thrown)
      return { reason: 'COOKIE_WRITE_FAILED', details: thrown }
    },
  )
}
