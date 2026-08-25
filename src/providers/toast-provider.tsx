'use client'

import { useTheme } from 'next-themes'
import { Toaster } from 'sileo'

export function ToasterProvider() {
  const { resolvedTheme } = useTheme()
  const invertedTheme = resolvedTheme === 'dark' ? 'light' : 'dark'

  return <Toaster position="bottom-right" offset={24} theme={invertedTheme} />
}
