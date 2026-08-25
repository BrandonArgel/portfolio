'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { NetworkNotifier } from './network-notifier'
import { ThemeProvider } from './theme-provider'
import { ToasterProvider } from './toast-provider'

interface AppProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
      <ToasterProvider />
      <NetworkNotifier />
      <TooltipProvider delay={0}>{children}</TooltipProvider>
    </ThemeProvider>
  )
}
