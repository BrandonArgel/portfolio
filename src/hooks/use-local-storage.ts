import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'

import { useEventCallback } from './use-event-callback'
import { useEventListener } from './use-event-listener'

declare global {
  interface WindowEventMap {
    'local-storage': CustomEvent<{ key: string }>
  }
}

type UseLocalStorageOptions<T> = {
  serializer?: (value: T) => string
  deserializer?: (value: string) => T
  initializeWithValue?: boolean
}

const isServer = typeof window === 'undefined'

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseLocalStorageOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>, () => void, boolean] {
  const {
    serializer: customSerializer,
    deserializer: customDeserializer,
    initializeWithValue = true,
  } = options

  const getInitialValue = useCallback((): T => {
    return initialValue instanceof Function ? initialValue() : initialValue
  }, [initialValue])

  const serializer = useCallback(
    (value: T): string => {
      if (customSerializer) {
        return customSerializer(value)
      }
      if (value === undefined) {
        return 'undefined'
      }
      return JSON.stringify(value)
    },
    [customSerializer],
  )

  const deserializer = useCallback(
    (value: string): T => {
      if (customDeserializer) {
        return customDeserializer(value)
      }

      if (value === 'undefined') {
        return undefined as T
      }

      try {
        return JSON.parse(value) as T
      } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error)
        return getInitialValue()
      }
    },
    [customDeserializer, getInitialValue, key],
  )

  const readValue = useCallback((): T => {
    const fallbackValue = getInitialValue()
    if (isServer) {
      return fallbackValue
    }
    try {
      const rawValue = window.localStorage.getItem(key)
      return rawValue === null ? fallbackValue : deserializer(rawValue)
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return fallbackValue
    }
  }, [getInitialValue, key, deserializer])

  const [storedValue, setStoredValue] = useState<T>(() => {
    return getInitialValue()
  })

  const [isInitialized, setIsInitialized] = useState(!initializeWithValue)

  const setValue: Dispatch<SetStateAction<T>> = useEventCallback((value) => {
    if (isServer) return

    try {
      const newValue = value instanceof Function ? value(readValue()) : value

      window.localStorage.setItem(key, serializer(newValue))
      setStoredValue(newValue)

      window.dispatchEvent(new CustomEvent('local-storage', { detail: { key } }))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  })

  const removeValue = useEventCallback(() => {
    if (isServer) return

    try {
      window.localStorage.removeItem(key)
      const defaultValue = getInitialValue()
      setStoredValue(defaultValue)
      window.dispatchEvent(new CustomEvent('local-storage', { detail: { key } }))
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  })

  useEffect(() => {
    if (!initializeWithValue) {
      setIsInitialized(true)
      return
    }
    setStoredValue(readValue())
    setIsInitialized(true)
  }, [initializeWithValue, readValue])

  const handleStorageChange = useEventCallback(
    (event: StorageEvent | CustomEvent<{ key: string }>) => {
      const eventKey = event instanceof StorageEvent ? event.key : event.detail.key

      if (eventKey !== null && eventKey !== key) return

      setStoredValue(readValue())
    },
  )
  useEventListener('storage', handleStorageChange)
  useEventListener('local-storage', handleStorageChange)

  return [storedValue, setValue, removeValue, isInitialized]
}
