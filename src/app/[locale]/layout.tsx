import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { cookies } from 'next/headers'
import { getLocale, getMessages, getTimeZone, getTranslations } from 'next-intl/server'
import NextTopLoader from 'nextjs-toploader'
import { CookieBanner } from '@/components/layout/cookies-banner'
import { getBaseUrl, siteConfig } from '@/config/site'
import { routing } from '@/i18n/routing'
import { constructPageMetadata } from '@/lib/seo'
import { AppProvider } from '@/providers/app-provider'
import 'katex/dist/katex.min.css'
import '../globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta-sans',
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.root' })

  const pageMeta = constructPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(', '),
    pathname: '',
  })

  return {
    ...pageMeta,
    metadataBase: new URL(getBaseUrl()),
    title: {
      default: t('title'),
      template: `%s | ${siteConfig.name}`,
    },
  }
}

export default async function RootLayout({ children }: LayoutProps<'/[locale]'>) {
  const currentLocale = await getLocale()
  const cookieStore = await cookies()
  const hasConsentCookie = cookieStore.has('cookie-consent')
  const messages = await getMessages()
  const timeZone = await getTimeZone()
  return (
    <html
      lang={currentLocale}
      className={`${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex flex-col">
        <NextTopLoader showSpinner={false} color="#1447e6" height={3} />
        <AppProvider locale={currentLocale} messages={messages} timeZone={timeZone}>
          {!hasConsentCookie && <CookieBanner />}
          {children}
        </AppProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
