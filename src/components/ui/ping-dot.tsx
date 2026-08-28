import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

interface PingDotProps extends ComponentPropsWithoutRef<'span'> {
  dotClassName?: string
  pingClassName?: string
}

export function PingDot({ className, dotClassName, pingClassName, ...props }: PingDotProps) {
  return (
    <span className={cn('relative flex size-3 shrink-0', className)} aria-hidden="true" {...props}>
      <span
        className={cn(
          'absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75',
          pingClassName,
        )}
      />
      <span
        className={cn('relative inline-flex h-full w-full rounded-full bg-current', dotClassName)}
      />
    </span>
  )
}
