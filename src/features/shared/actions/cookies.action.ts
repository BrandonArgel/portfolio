'use server'

import { cookies } from 'next/headers'
import { serverEnv } from '@/data/serverEnv'

export async function setCookieConsent(consent: boolean) {
  const cookieStore = await cookies()
  cookieStore.set('cookie-consent', consent.toString(), {
    maxAge: 31536000,
    path: '/',
    httpOnly: false,
    secure: serverEnv.NODE_ENV === 'production',
    sameSite: 'lax',
  })
}
