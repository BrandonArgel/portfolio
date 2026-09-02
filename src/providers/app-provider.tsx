'use client'

import type { Locale, Messages, Timezone } from 'next-intl'
import { NextIntlClientProvider } from 'next-intl'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NetworkNotifier } from './network-notifier'
import { ThemeProvider } from './theme-provider'
import { ToasterProvider } from './toast-provider'

interface AppProviderProps {
  children: React.ReactNode
  locale: Locale
  messages: Messages
  timeZone: Timezone
}

export function AppProvider({ children, locale, messages, timeZone }: AppProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToasterProvider />
        <NetworkNotifier />
        <TooltipProvider delay={0}>{children}</TooltipProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
