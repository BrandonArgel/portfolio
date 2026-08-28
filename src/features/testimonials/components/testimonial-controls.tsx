'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TestimonialControlsProps {
  total: number
  activeIndex: number
  onPrev: () => void
  onNext: () => void
  onSelect: (index: number) => void
  className?: string
}

export function TestimonialControls({
  total,
  activeIndex,
  onPrev,
  onNext,
  onSelect,
  className,
}: TestimonialControlsProps) {
  return (
    <nav
      className={cn('flex items-center justify-center gap-4 select-none', className)}
      aria-label="Testimonial carousel navigation"
    >
      {/* Previous button */}
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous testimonial"
        className={cn(
          'flex size-9 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-card/60 text-muted-foreground backdrop-blur-sm transition-all duration-200 outline-none',
          'hover:border-primary/40 hover:bg-card hover:text-foreground hover:shadow-md',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'active:scale-95',
        )}
      >
        <ChevronLeft className="size-4.5" />
      </button>

      {/* Pagination indicator dots */}
      <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial slides">
        {Array.from({ length: total }).map((_, index) => {
          const isActive = activeIndex === index
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to testimonial slide ${index + 1}`}
              onClick={() => onSelect(index)}
              className={cn(
                'cursor-pointer transition-all duration-300 outline-none select-none rounded-full',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isActive
                  ? 'h-2 w-6 bg-primary shadow-sm shadow-primary/30'
                  : 'size-2 bg-muted-foreground/30 hover:bg-muted-foreground/60',
              )}
            />
          )
        })}
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Next testimonial"
        className={cn(
          'flex size-9 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-card/60 text-muted-foreground backdrop-blur-sm transition-all duration-200 outline-none',
          'hover:border-primary/40 hover:bg-card hover:text-foreground hover:shadow-md',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'active:scale-95',
        )}
      >
        <ChevronRight className="size-4.5" />
      </button>
    </nav>
  )
}
