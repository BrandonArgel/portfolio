'use client'

import { useEffect, useState } from 'react'

export function useIsMac(): boolean {
  const [isMac, setIsMac] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMac = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)
      setIsMac(checkMac)
    }
  }, [])

  return isMac
}
