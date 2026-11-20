'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'

interface UseUrlTableFiltersOptions {
  initialParams: Record<string, string | undefined>
  initialSearch?: string
}

export function useUrlTableFilters({
  initialParams,
  initialSearch = '',
}: UseUrlTableFiltersOptions) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [searchValue, setSearchValue] = useState(initialSearch)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialMount = useRef(true)

  const pushParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()

      for (const [key, value] of Object.entries(initialParams)) {
        if (value) {
          params.set(key, value)
        }
      }

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }

      // Always reset to page 1 when filters change
      params.delete('page')

      const qs = params.toString()
      startTransition(() => {
        router.push(`${pathname}${qs ? `?${qs}` : ''}`)
      })
    },
    [initialParams, pathname, router],
  )

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      pushParams({ q: searchValue })
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchValue, pushParams])

  const handleReset = useCallback(() => {
    setSearchValue('')
    startTransition(() => {
      router.push(pathname)
    })
  }, [pathname, router])

  return {
    searchValue,
    setSearchValue,
    isPending,
    pushParams,
    handleReset,
  }
}
