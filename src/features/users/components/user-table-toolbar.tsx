'use client'

import { RotateCcw, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePathname, useRouter } from '@/i18n/navigation'

interface UserTableToolbarProps {
  initialSearch?: string
  initialRole?: string
}

export function UserTableToolbar({ initialSearch = '', initialRole = '' }: UserTableToolbarProps) {
  const t = useTranslations('features.users.management')
  const tRoles = useTranslations('features.users.roles')
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [searchValue, setSearchValue] = useState(initialSearch)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialMount = useRef(true)

  const pushParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()

      if (initialSearch) params.set('q', initialSearch)
      if (initialRole) params.set('role', initialRole)

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }

      // Reset to page 1 on filter changes
      params.delete('page')

      const qs = params.toString()
      startTransition(() => {
        router.push(`${pathname}${qs ? `?${qs}` : ''}`)
      })
    },
    [initialSearch, initialRole, pathname, router],
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

  const handleRoleChange = (value: string | null) => {
    pushParams({ role: !value || value === '_all' ? '' : value })
  }

  const handleReset = () => {
    setSearchValue('')
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasActiveFilters = Boolean(initialSearch || initialRole)

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative w-full sm:w-64 lg:w-80">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t('search_placeholder')}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>

      {/* Role Filter */}
      <Select value={initialRole || '_all'} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-full sm:w-36 h-8 text-xs font-medium" size="sm">
          <SelectValue placeholder={t('filter_role')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all" className="text-xs">
            {t('filter_all')}
          </SelectItem>
          <SelectItem value="admin" className="text-xs">
            {tRoles('admin')}
          </SelectItem>
          <SelectItem value="editor" className="text-xs">
            {tRoles('editor')}
          </SelectItem>
          <SelectItem value="user" className="text-xs">
            {tRoles('user')}
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={isPending}
          className="gap-1.5 text-muted-foreground hover:text-foreground shrink-0 h-8 text-xs cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
          <span>{t('reset_filters')}</span>
        </Button>
      )}
    </div>
  )
}
