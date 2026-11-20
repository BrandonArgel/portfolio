'use client'

import { useEffect, useRef, useState } from 'react'

type CopiedValue = string | null
type CopyError = Error | null
type TimerId = ReturnType<typeof setTimeout> | number

const DEFAULT_TIMEOUT_MS = 2000

export interface UseCopyToClipboardOptions {
  timeout?: number | null
  onSuccess?: (text: string) => void
  onError?: (error: Error) => void
}

interface CopyToClipboardState {
  copiedText: CopiedValue
  error: CopyError
}

interface UseCopyToClipboardReturn {
  copiedText: CopiedValue
  isCopied: boolean
  error: CopyError
  copy: (text: string) => Promise<boolean>
  reset: () => void
}

interface CreateCopyToClipboardControllerParams {
  getOptions: () => UseCopyToClipboardOptions
  onStateChange: (state: CopyToClipboardState) => void
  writeText?: (text: string) => Promise<void>
  scheduleReset?: (callback: () => void, ms: number) => TimerId
  cancelReset?: (id: TimerId) => void
}

interface CopyToClipboardController {
  copy: (text: string) => Promise<boolean>
  reset: () => void
  dispose: () => void
}

async function defaultWriteText(text: string): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    throw new Error('Clipboard API not supported')
  }

  await navigator.clipboard.writeText(text)
}

export function createCopyToClipboardController({
  getOptions,
  onStateChange,
  writeText = defaultWriteText,
  scheduleReset = (callback, ms) => setTimeout(callback, ms),
  cancelReset = (id) => clearTimeout(id),
}: CreateCopyToClipboardControllerParams): CopyToClipboardController {
  let timeoutId: TimerId | null = null
  let isDisposed = false
  let requestId = 0

  const clearTimer = () => {
    if (timeoutId !== null) {
      cancelReset(timeoutId)
      timeoutId = null
    }
  }

  const reset = () => {
    requestId += 1
    clearTimer()

    if (!isDisposed) {
      onStateChange({ copiedText: null, error: null })
    }
  }

  const dispose = () => {
    isDisposed = true
    requestId += 1
    clearTimer()
  }

  const copy = async (text: string): Promise<boolean> => {
    const currentRequestId = ++requestId

    try {
      await writeText(text)

      if (isDisposed || currentRequestId !== requestId) {
        return true
      }

      const { timeout = DEFAULT_TIMEOUT_MS, onSuccess } = getOptions()

      clearTimer()
      onStateChange({ copiedText: text, error: null })
      onSuccess?.(text)

      if (timeout !== null && timeout > 0) {
        timeoutId = scheduleReset(() => {
          timeoutId = null
          if (!isDisposed && currentRequestId === requestId) {
            onStateChange({ copiedText: null, error: null })
          }
        }, timeout)
      }

      return true
    } catch (err) {
      if (isDisposed || currentRequestId !== requestId) {
        return false
      }

      const copyError = err instanceof Error ? err : new Error('Failed to copy to clipboard')

      clearTimer()
      onStateChange({ copiedText: null, error: copyError })
      getOptions().onError?.(copyError)

      return false
    }
  }

  return {
    copy,
    reset,
    dispose,
  }
}

export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn {
  const { timeout, onSuccess, onError } = options
  const [state, setState] = useState<CopyToClipboardState>({
    copiedText: null,
    error: null,
  })

  const optionsRef = useRef<UseCopyToClipboardOptions>({ timeout, onSuccess, onError })
  const controllerRef = useRef<CopyToClipboardController | null>(null)

  useEffect(() => {
    optionsRef.current = { timeout, onSuccess, onError }
  }, [timeout, onSuccess, onError])

  useEffect(() => {
    const controller = createCopyToClipboardController({
      getOptions: () => optionsRef.current,
      onStateChange: setState,
    })
    controllerRef.current = controller

    return () => {
      controller.dispose()
      if (controllerRef.current === controller) {
        controllerRef.current = null
      }
    }
  }, [])

  const copy = async (text: string): Promise<boolean> => {
    const controller = controllerRef.current
    if (!controller) return false
    return controller.copy(text)
  }

  const reset = () => {
    controllerRef.current?.reset()
  }

  return {
    copiedText: state.copiedText,
    isCopied: state.copiedText !== null,
    error: state.error,
    copy,
    reset,
  }
}
