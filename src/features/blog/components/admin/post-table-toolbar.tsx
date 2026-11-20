'use client'

import { RotateCcw, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
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
import { ADMIN_POST_SORT_OPTIONS, type AdminPostSort } from '@/features/blog/constants/blog'
import { useUrlTableFilters } from '@/hooks/use-url-table-filters'

interface PostTableToolbarProps {
  categories: { id: string; name: string; slug: string }[]
  initialSearch?: string
  initialLocale?: string
  initialCategory?: string
  initialSort?: AdminPostSort
}

export function PostTableToolbar({
  categories,
  initialSearch = '',
  initialLocale = '',
  initialCategory = '',
  initialSort = 'latest',
}: PostTableToolbarProps) {
  const t = useTranslations('features.blog.management')

  const initialParams = useMemo(
    () => ({
      q: initialSearch,
      locale: initialLocale,
      category: initialCategory,
      sort: initialSort === 'latest' ? '' : initialSort,
    }),
    [initialSearch, initialLocale, initialCategory, initialSort],
  )

  const { searchValue, setSearchValue, isPending, pushParams, handleReset } = useUrlTableFilters({
    initialParams,
    initialSearch,
  })

  const handleLocaleChange = (value: string | null) => {
    pushParams({ locale: value || '' })
  }

  const handleCategoryChange = (value: string | null) => {
    pushParams({ category: value || '' })
  }

  const handleSortChange = (value: string | null) => {
    pushParams({ sort: value && value !== 'latest' ? value : '' })
  }

  const sortLabels: Record<AdminPostSort, string> = {
    latest: t('sort_latest'),
    oldest: t('sort_oldest'),
    views_desc: t('sort_most_viewed'),
    views_asc: t('sort_least_viewed'),
  }

  const hasActiveFilters = Boolean(
    initialSearch || initialLocale || initialCategory || initialSort !== 'latest',
  )

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
      <Select value={initialLocale || ''} onValueChange={handleLocaleChange}>
        <SelectTrigger className="w-full sm:w-32" size="sm">
          <SelectValue placeholder={t('all_languages')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{t('all_languages')}</SelectItem>
          {Object.entries(LOCALE_META).map(([loc, meta]) => (
            <SelectItem key={loc} value={loc}>
              {meta.flag} {loc.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Filter */}
      {categories.length > 0 && (
        <Select value={initialCategory || ''} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-40" size="sm">
            <SelectValue placeholder={t('all_categories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('all_categories')}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Sort Order */}
      <Select value={initialSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-full sm:w-44" size="sm">
          <SelectValue>{sortLabels[initialSort]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {ADMIN_POST_SORT_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {sortLabels[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
