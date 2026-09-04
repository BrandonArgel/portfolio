'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import type { BlogCategory } from '../../types'

interface CategoryFilterProps {
  categories: BlogCategory[]
  totalCount?: number
  categoryCounts?: Record<string, number>
}

export function CategoryFilter({
  categories,
  totalCount = 0,
  categoryCounts = {},
}: CategoryFilterProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('blog')

  const currentCategory = searchParams.get('category') || 'all'

  const handleSelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (!slug || slug === 'all') {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    router.push(`${pathname}${query}`, { scroll: false })
  }

  const getCategoryLabel = (cat: BlogCategory) => {
    const key = `categories.${cat.slug}`
    if (t.has(key)) return t(key)
    return cat.name
  }

  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-sm">
      <h3 className="text-base font-semibold text-foreground mb-3.5 tracking-tight">
        {t('sidebar_categories')}
      </h3>

      <div className="space-y-1">
        {/* 'All' option */}
        <button
          type="button"
          onClick={() => handleSelect('all')}
          className={cn(
            'w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer font-medium',
            currentCategory === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
          )}
        >
          <span>{t('categories.all')}</span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-md text-xs font-semibold',
              currentCategory === 'all'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'text-muted-foreground bg-muted/80 border border-border',
            )}
          >
            {totalCount}
          </span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug
          const count = categoryCounts[cat.slug] ?? categoryCounts[cat.id] ?? 0

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.slug)}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              <span className="capitalize">{getCategoryLabel(cat)}</span>
              {count > 0 && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-md text-xs font-semibold',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'text-muted-foreground bg-muted/80 border border-border',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
