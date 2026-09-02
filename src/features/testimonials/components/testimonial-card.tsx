'use client'

import { ExternalLink, Quote } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { TestimonialItem } from '../types'

interface TestimonialCardProps {
  testimonial: TestimonialItem
  className?: string
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  const t = useTranslations('testimonials.items')

  return (
    <Card
      className={cn(
        'select-none group/testimonial relative flex h-full w-full max-w-3xl flex-col justify-between rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm transition-all duration-300',
        '[--card-spacing:--spacing(8)] sm:[--card-spacing:--spacing(10)]',
        className,
      )}
    >
      <Quote
        className="pointer-events-none absolute top-4 right-4 z-0 size-14 select-none text-primary/10 transition-colors duration-300 group-hover/testimonial:text-primary/15 sm:top-5 sm:right-5 sm:size-12"
        aria-hidden="true"
      />

      <CardContent className="relative z-10">
        <blockquote className="text-base font-normal italic leading-relaxed text-foreground/90 sm:text-lg">
          &ldquo;{t(`${testimonial.key}.quote`)}&rdquo;
        </blockquote>
      </CardContent>

      <CardFooter className="relative z-10 mt-auto border-t border-border/40 bg-transparent pt-6">
        <Avatar size="lg" className="mr-3 border border-border/60">
          {testimonial.avatarUrl && (
            <AvatarImage src={testimonial.avatarUrl} alt={t(`${testimonial.key}.name`)} />
          )}
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {testimonial.initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-1.5 text-base font-bold tracking-tight text-foreground">
            {testimonial.linkedInUrl ? (
              <a
                href={testimonial.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/author inline-flex items-center gap-1 transition-colors hover:text-primary"
                title={`${t(`${testimonial.key}.name`)} LinkedIn profile`}
              >
                <span>{t(`${testimonial.key}.name`)}</span>
                <ExternalLink className="size-3.5 opacity-60 transition-opacity group-hover/author:opacity-100" />
              </a>
            ) : (
              <span>{t(`${testimonial.key}.name`)}</span>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {t(`${testimonial.key}.role`)}
            {testimonial.company ? ` • ${testimonial.company}` : ''}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
