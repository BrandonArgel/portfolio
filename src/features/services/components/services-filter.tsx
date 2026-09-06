'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SERVICE_CATEGORIES } from '../constants/services-data'
import { useServicesFilter } from '../hooks/use-services-filter'
import { ServiceCard } from './service-card'

export function ServicesFilter() {
  const t = useTranslations('features.services.categories')
  const { activeCategory, setActiveCategory, filteredServices } = useServicesFilter()

  const isFewItems = filteredServices.length <= 3

  return (
    <div className="flex w-full flex-col items-center">
      {/* Category filter tabs */}
      <div
        role="tablist"
        aria-label="Filter services by category"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {SERVICE_CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id

          return (
            <Button
              key={category.id}
              variant={isActive ? 'default' : 'outline'}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={(e) => {
                e.preventDefault()
                setActiveCategory(category.id)
              }}
            >
              {t(category.id)}
            </Button>
          )
        })}
      </div>

      <div
        className={cn(
          'mt-10 w-full gap-6',
          isFewItems
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'columns-1 md:columns-2 lg:columns-3',
        )}
      >
        {filteredServices.map((service, index) => (
          <div
            key={`${activeCategory}-${service.key}`}
            className={cn(
              'w-full',
              'animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both',
              !isFewItems && 'mb-6 break-inside-avoid inline-block',
              isFewItems && 'h-full',
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ServiceCard service={service} index={index} />
          </div>
        ))}
      </div>
    </div>
  )
}
