'use client'

import { cva } from 'class-variance-authority'
import { ArrowUpRight, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { getServiceColor } from '../constants/services-data'
import type { ServiceDefinition } from '../types'

const cardVariants = cva(
  'group/card relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-card/90 hover:shadow-xl hover:-translate-y-0.5',
  {
    variants: {
      color: {
        blue: 'hover:border-blue-500/40 hover:shadow-blue-500/5',
        purple: 'hover:border-purple-500/40 hover:shadow-purple-500/5',
        emerald: 'hover:border-emerald-500/40 hover:shadow-emerald-500/5',
        amber: 'hover:border-amber-500/40 hover:shadow-amber-500/5',
        rose: 'hover:border-rose-500/40 hover:shadow-rose-500/5',
        cyan: 'hover:border-cyan-500/40 hover:shadow-cyan-500/5',
      },
    },
    defaultVariants: {
      color: 'blue',
    },
  },
)

const iconContainerVariants = cva(
  'mb-4 flex size-12 items-center justify-center rounded-xl border transition-transform duration-300 group-hover/card:scale-105',
  {
    variants: {
      color: {
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      },
    },
    defaultVariants: {
      color: 'blue',
    },
  },
)

const titleVariants = cva(
  'mb-2 text-xl font-bold tracking-tight text-foreground transition-colors',
  {
    variants: {
      color: {
        blue: 'group-hover/card:text-blue-400',
        purple: 'group-hover/card:text-purple-400',
        emerald: 'group-hover/card:text-emerald-400',
        amber: 'group-hover/card:text-amber-400',
        rose: 'group-hover/card:text-rose-400',
        cyan: 'group-hover/card:text-cyan-400',
      },
    },
    defaultVariants: {
      color: 'blue',
    },
  },
)

const checkIconVariants = cva('size-3.5 shrink-0 stroke-[2.5]', {
  variants: {
    color: {
      blue: 'text-blue-400',
      purple: 'text-purple-400',
      emerald: 'text-emerald-400',
      amber: 'text-amber-400',
      rose: 'text-rose-400',
      cyan: 'text-cyan-400',
    },
  },
  defaultVariants: {
    color: 'blue',
  },
})

const linkVariants = cva(
  'group/link inline-flex items-center gap-1 text-sm font-medium transition-colors',
  {
    variants: {
      color: {
        blue: 'text-blue-400 hover:text-blue-300',
        purple: 'text-purple-400 hover:text-purple-300',
        emerald: 'text-emerald-400 hover:text-emerald-300',
        amber: 'text-amber-400 hover:text-amber-300',
        rose: 'text-rose-400 hover:text-rose-300',
        cyan: 'text-cyan-400 hover:text-cyan-300',
      },
    },
    defaultVariants: {
      color: 'blue',
    },
  },
)

interface ServiceCardProps {
  service: ServiceDefinition
  index?: number
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const t = useTranslations('services.items')
  const tActions = useTranslations('common.actions')
  const Icon = service.icon
  const tags: string[] = t.raw(`${service.key}.tags`)
  const color = getServiceColor(service.color, index)

  return (
    <article className={cn(cardVariants({ color }))}>
      <div>
        <div className={cn(iconContainerVariants({ color }))}>
          <Icon className="size-6" />
        </div>

        <h3 className={cn(titleVariants({ color }))}>{t(`${service.key}.title`)}</h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t(`${service.key}.description`)}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 dark:bg-slate-900/60 px-2.5 py-1 text-xs font-medium text-foreground/80 transition-colors"
            >
              <Check className={cn(checkIconVariants({ color }))} />
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-2">
        <Link href={service.href ?? '/contact'} className={cn(linkVariants({ color }))}>
          <span>{tActions('learn_more')}</span>
          <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  )
}
