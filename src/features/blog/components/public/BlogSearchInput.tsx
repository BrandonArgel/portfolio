'use client'

import { Search, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'

export function BlogSearchInput() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('features.blog.reader')

  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }
    const queryString = params.toString() ? `?${params.toString()}` : ''
    router.push(`${pathname}${queryString}`, { scroll: false })
  }

  const handleClear = () => {
    setQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    params.delete('q')
    const queryString = params.toString() ? `?${params.toString()}` : ''
    router.push(`${pathname}${queryString}`, { scroll: false })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-xl mx-auto flex items-center bg-card hover:bg-card/90 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl p-1.5 transition-all shadow-xs"
    >
      <Search className="size-4 text-muted-foreground ml-3 mr-2 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('search_placeholder')}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none pr-2 py-1"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors mr-1 cursor-pointer"
          aria-label={t('clear_search')}
        >
          <X className="size-3.5" />
        </button>
      )}

      <button
        type="submit"
        className="bg-primary hover:bg-primary/90 active:bg-primary/95 text-primary-foreground font-medium text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-lg transition-all shadow-sm shrink-0 cursor-pointer"
      >
        {t('search_button')}
      </button>
    </form>
  )
}
