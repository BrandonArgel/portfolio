'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { HeroFeatureConfig } from '../types'

interface FeatureCardProps {
  feature: HeroFeatureConfig
  isActive: boolean
  onClick: () => void
}

export function FeatureCard({ feature, isActive, onClick }: FeatureCardProps) {
  const t = useTranslations('features.hero.features')
  const Icon = feature.icon

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'w-65 cursor-pointer rounded-xl text-left appearance-none outline-none transition-all duration-700 ease-out',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        feature.position,
        isActive
          ? 'z-20 scale-105 opacity-100 shadow-lg'
          : cn(
              'z-0 scale-95 opacity-40 hover:opacity-70',
              'focus-visible:z-10 focus-visible:opacity-100',
            ),
      )}
    >
      <Card className="h-full w-full border border-border backdrop-blur-md">
        <CardHeader>
          <div
            className={cn(
              'mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/5',
              feature.colors.iconBg,
            )}
          >
            <Icon className={cn('h-6 w-6', feature.colors.iconText)} />
          </div>

          <CardTitle className="text-xl font-bold tracking-wide text-foreground">
            {t(`${feature.key}.title`)}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          {t(`${feature.key}.description`)}
        </CardContent>
      </Card>
    </button>
  )
}
