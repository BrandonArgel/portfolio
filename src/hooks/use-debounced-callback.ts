import { useEffect, useMemo, useRef } from 'react'
import { useUnmount } from './use-unmount'

type DebounceOptions = {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

type ControlFunctions = {
  cancel: () => void
  flush: () => void
  isPending: () => boolean
}

export type DebouncedState<T extends (...args: any[]) => any> = ((
  ...args: Parameters<T>
) => ReturnType<T> | undefined) &
  ControlFunctions

export function useDebounceCallback<T extends (...args: any[]) => any>(
  func: T,
  delay = 500,
  options: DebounceOptions = {},
): DebouncedState<T> {
  // Utilizamos ReturnType<typeof setTimeout> para compatibilidad multiplataforma (Browser/Node)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const funcRef = useRef(func)
  const lastArgsRef = useRef<Parameters<T> | null>(null)
  const lastResultRef = useRef<ReturnType<T> | undefined>(undefined)

  // Mantiene la función sincronizada si cambia, sin necesidad de reiniciar temporizadores
  useEffect(() => {
    funcRef.current = func
  }, [func])

  useUnmount(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (maxWaitTimeoutRef.current) clearTimeout(maxWaitTimeoutRef.current)
  })

  const debounced = useMemo(() => {
    const { leading = false, trailing = true, maxWait } = options

    const invoke = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (maxWaitTimeoutRef.current) clearTimeout(maxWaitTimeoutRef.current)

      timeoutRef.current = null
      maxWaitTimeoutRef.current = null

      if (lastArgsRef.current) {
        lastResultRef.current = funcRef.current(...lastArgsRef.current)
        lastArgsRef.current = null
      }

      return lastResultRef.current
    }

    const wrappedFunc = (...args: Parameters<T>): ReturnType<T> | undefined => {
      lastArgsRef.current = args
      const isFirstCall = !timeoutRef.current

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Ejecución inmediata si "leading" está habilitado
      if (isFirstCall && leading) {
        lastResultRef.current = funcRef.current(...args)
        lastArgsRef.current = null
      }

      // Temporizador principal del debounce
      timeoutRef.current = setTimeout(() => {
        if (trailing && lastArgsRef.current) {
          invoke()
        } else {
          timeoutRef.current = null
          maxWaitTimeoutRef.current = null
        }
      }, delay)

      // Control del tiempo máximo de espera
      if (maxWait && !maxWaitTimeoutRef.current) {
        maxWaitTimeoutRef.current = setTimeout(() => {
          if (lastArgsRef.current) invoke()
        }, maxWait)
      }

      return lastResultRef.current
    }

    wrappedFunc.cancel = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (maxWaitTimeoutRef.current) clearTimeout(maxWaitTimeoutRef.current)

      timeoutRef.current = null
      maxWaitTimeoutRef.current = null
      lastArgsRef.current = null
    }

    wrappedFunc.flush = () => {
      if (timeoutRef.current) return invoke()
      return lastResultRef.current
    }

    wrappedFunc.isPending = () => !!timeoutRef.current

    return wrappedFunc as DebouncedState<T>
  }, [delay, options.leading, options.trailing, options.maxWait])

  return debounced
}
