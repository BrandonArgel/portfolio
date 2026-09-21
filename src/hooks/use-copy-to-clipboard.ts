'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type CopiedValue = string | null
type CopyError = Error | null

interface UseCopyToClipboardReturn {
  copiedText: CopiedValue
  isCopied: boolean
  error: CopyError
  copy: (text: string) => Promise<boolean>
  clearCopiedText: () => void
}

export function useCopyToClipboard(timeout: number = 2000): UseCopyToClipboardReturn {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null)
  const [error, setError] = useState<CopyError>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = useCallback(
    async (text: string) => {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        setError(new Error('Clipboard API not supported'))
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        setCopiedText(text)
        setError(null)

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          setCopiedText(null)
          timeoutRef.current = null
        }, timeout)

        return true
      } catch (err) {
        if (err instanceof Error) {
          setError(err)
        } else {
          setError(new Error('Failed to copy to clipboard'))
        }
        setCopiedText(null)
        return false
      }
    },
    [timeout],
  )

  const clearCopiedText = useCallback(() => {
    setCopiedText(null)
    setError(null)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    copiedText,
    isCopied: copiedText !== null,
    error,
    copy,
    clearCopiedText,
  }
}
