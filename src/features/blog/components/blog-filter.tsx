'use client'

import { Search, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePathname, useRouter } from '@/i18n/navigation'
import type { BlogCategory } from '../types'

interface BlogFilterProps {
  categories: BlogCategory[]
}

export function BlogFilter({ categories }: BlogFilterProps) {
  const t = useTranslations('features.blog.reader')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category')
  const currentQuery = searchParams.get('q') || ''

  const [searchTerm, setSearchTerm] = useState(currentQuery)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams],
  )

  // Debounce: Wait 500ms after user stops typing to update URL
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== currentQuery) {
        const queryString = createQueryString('q', searchTerm)
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname
        router.replace(newUrl, { scroll: false })
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, pathname, router, createQueryString, currentQuery])

  const handleCategoryChange = (slug: string) => {
    const newValue = currentCategory === slug ? '' : slug
    const queryString = createQueryString('category', newValue)
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(newUrl, { scroll: false })
  }

  const clearFilters = () => {
    setSearchTerm('')
    router.replace(pathname, { scroll: false })
  }

  const hasActiveFilters = currentCategory || currentQuery

  return (
    <div className="mb-10 flex flex-col gap-6">
      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('search_placeholder')}
          className="pr-10 pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
            onClick={() => setSearchTerm('')}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={!currentCategory ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          onClick={() => handleCategoryChange('')}
        >
          {t('all_topics')}
        </Button>

        {categories.map((category) => (
          <Button
            key={category.id}
            variant={currentCategory === category.slug ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => handleCategoryChange(category.slug)}
          >
            {category.name}
          </Button>
        ))}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-muted-foreground hover:text-destructive"
            onClick={clearFilters}
          >
            {t('clear_filters')}
          </Button>
        )}
      </div>
    </div>
  )
}
