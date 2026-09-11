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
import { LOCALE_META } from '@/config/locale'
import { usePathname, useRouter } from '@/i18n/navigation'

interface PostTableToolbarProps {
  categories: { id: string; name: string; slug: string }[]
  initialSearch?: string
  initialLocale?: string
  initialCategory?: string
}

export function PostTableToolbar({
  categories,
  initialSearch = '',
  initialLocale = '',
  initialCategory = '',
}: PostTableToolbarProps) {
  const t = useTranslations('features.blog.management')
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [searchValue, setSearchValue] = useState(initialSearch)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialMount = useRef(true)

  const pushParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()

      // Preserve current values as defaults
      if (initialSearch) params.set('q', initialSearch)
      if (initialLocale) params.set('locale', initialLocale)
      if (initialCategory) params.set('category', initialCategory)

      // Apply updates
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
    [initialSearch, initialLocale, initialCategory, pathname, router],
  )

  // Debounced search
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

  const handleLocaleChange = (value: string | null) => {
    pushParams({ locale: !value || value === '_all' ? '' : value })
  }

  const handleCategoryChange = (value: string | null) => {
    pushParams({ category: !value || value === '_all' ? '' : value })
  }

  const handleReset = () => {
    setSearchValue('')
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasActiveFilters = initialSearch || initialLocale || initialCategory

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative w-full sm:w-64 lg:w-80">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t('search_placeholder')}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-8 h-8"
        />
      </div>

      {/* Locale Filter */}
      <Select value={initialLocale || '_all'} onValueChange={handleLocaleChange}>
        <SelectTrigger className="w-full sm:w-32" size="sm">
          <SelectValue placeholder={t('filter_locale')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">{t('filter_all_languages')}</SelectItem>
          {Object.entries(LOCALE_META).map(([loc, meta]) => (
            <SelectItem key={loc} value={loc}>
              {meta.flag} {loc.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Filter */}
      {categories.length > 0 && (
        <Select value={initialCategory || '_all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-40" size="sm">
            <SelectValue placeholder={t('filter_category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t('filter_all_categories')}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={isPending}
          className="gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
        >
          <RotateCcw className="size-3.5" />
          <span>{t('reset_filters')}</span>
        </Button>
      )}
    </div>
  )
}
