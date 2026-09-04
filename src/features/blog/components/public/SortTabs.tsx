'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export function SortTabs() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('blog')

  const activeSort = searchParams.get('sort') || 'latest'

  const tabs = [
    { id: 'latest', label: t('sort.latest') },
    { id: 'oldest', label: t('sort.oldest') },
    { id: 'popular', label: t('sort.popular') },
    { id: 'reading_time', label: t('sort.reading_time') },
  ]

  const handleSelect = (sortId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (sortId === 'latest') {
      params.delete('sort')
    } else {
      params.set('sort', sortId)
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    router.push(`${pathname}${query}`, { scroll: false })
  }

  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border text-xs font-medium">
      {tabs.map((tab) => {
        const isActive = activeSort === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleSelect(tab.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap',
              isActive
                ? 'bg-background text-foreground font-medium shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
