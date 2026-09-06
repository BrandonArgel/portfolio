'use client'

import { ArrowUpRight, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { themeVariants } from '@/components/ui/card-variants'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { getServiceColor } from '../constants/services-data'
import type { ServiceDefinition } from '../types'

interface ServiceCardProps {
  service: ServiceDefinition
  index?: number
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const t = useTranslations('features.services.items')
  const tActions = useTranslations('common.actions')
  const Icon = service.icon
  const tags: string[] = t.raw(`${service.key}.tags`)
  const color = getServiceColor(service.color, index)

  return (
    <Card
      className={cn(
        themeVariants.wrapper({ color }),
        'h-full rounded-2xl justify-between [--card-spacing:--spacing(6)]',
      )}
    >
      <div>
        <CardHeader>
          <div className={cn(themeVariants.iconBox({ color }), 'mb-2 size-12')}>
            <Icon className="size-6" />
          </div>
          <CardTitle className={cn(themeVariants.title({ color }), 'text-xl font-bold')}>
            {t(`${service.key}.title`)}
          </CardTitle>
          <CardDescription className="mt-2 text-base leading-relaxed">
            {t(`${service.key}.description`)}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 dark:bg-slate-900/60 px-2.5 py-1 text-xs font-medium text-foreground/80 transition-colors"
              >
                <Check className={cn(themeVariants.checkIcon({ color }))} />
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </div>

      <CardFooter className="mt-auto border-t-0 bg-transparent pt-2">
        <Link href={service.href ?? '/contact'} className={cn(themeVariants.link({ color }))}>
          <span>{tActions('learn_more')}</span>
          <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </Link>
      </CardFooter>
    </Card>
  )
}
