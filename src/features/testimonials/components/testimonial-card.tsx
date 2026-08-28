'use client'

import { ExternalLink, Quote } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { TestimonialItem } from '../types'

interface TestimonialCardProps {
  testimonial: TestimonialItem
  className?: string
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  const t = useTranslations('testimonials.items')

  return (
    <article
      className={cn(
        'group/testimonial relative flex w-full max-w-3xl flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-8 shadow-xl backdrop-blur-sm transition-all duration-300 sm:p-10',
        className,
      )}
    >
      {/* Decorative background quote watermark */}
      <Quote
        className="pointer-events-none absolute top-6 right-6 size-14 select-none text-primary/10 transition-colors duration-300 group-hover/testimonial:text-primary/15 sm:top-8 sm:right-8 sm:size-16"
        aria-hidden="true"
      />

      {/* Quote body */}
      <div className="relative z-10">
        <blockquote className="text-base font-normal leading-relaxed text-foreground/90 italic sm:text-lg">
          &ldquo;{t(`${testimonial.key}.quote`)}&rdquo;
        </blockquote>
      </div>

      {/* Author information */}
      <footer className="relative z-10 mt-8 flex items-center gap-3.5 border-t border-border/40 pt-6">
        <Avatar size="lg" className="border border-border/60">
          {testimonial.avatarUrl && (
            <AvatarImage src={testimonial.avatarUrl} alt={t(`${testimonial.key}.name`)} />
          )}
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {testimonial.initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-base text-foreground tracking-tight">
            {testimonial.linkedInUrl ? (
              <a
                href={testimonial.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/author inline-flex items-center gap-1 hover:text-primary transition-colors"
                title={`${t(`${testimonial.key}.name`)} LinkedIn profile`}
              >
                <span>{t(`${testimonial.key}.name`)}</span>
                <ExternalLink className="size-3.5 opacity-60 transition-opacity group-hover/author:opacity-100" />
              </a>
            ) : (
              <span>{t(`${testimonial.key}.name`)}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {t(`${testimonial.key}.role`)}
            {testimonial.company ? ` • ${testimonial.company}` : ''}
          </p>
        </div>
      </footer>
    </article>
  )
}
