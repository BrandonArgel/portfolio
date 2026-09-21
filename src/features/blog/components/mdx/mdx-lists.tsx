import type React from 'react'

import { cn } from '@/lib/utils'

/** Renders a styled unordered MDX list. */
export function MdxUl({ className, ...props }: React.ComponentPropsWithoutRef<'ul'>) {
  return (
    <ul
      className={cn(
        'my-6 ml-6 list-disc [&>li]:mt-2 [&.contains-task-list]:ml-0 [&.contains-task-list]:list-none',
        className,
      )}
      {...props}
    />
  )
}

/** Renders a styled ordered MDX list. */
export function MdxOl({ className, ...props }: React.ComponentPropsWithoutRef<'ol'>) {
  return <ol className={cn('my-6 ml-6 list-decimal [&>li]:mt-2', className)} {...props} />
}

/** Renders a styled MDX list item. */
export function MdxLi({ className, ...props }: React.ComponentPropsWithoutRef<'li'>) {
  return (
    <li
      className={cn(
        'leading-7 [&.task-list-item]:flex [&.task-list-item]:items-start [&.task-list-item]:gap-2.5',
        className,
      )}
      {...props}
    />
  )
}

/** Renders an MDX input with task-checkbox styling. */
export function MdxInput({ type, className, ...props }: React.ComponentPropsWithoutRef<'input'>) {
  if (type === 'checkbox') {
    return (
      <input
        type="checkbox"
        disabled
        className={cn(
          'mt-1.5 size-4 shrink-0 cursor-default rounded border-border accent-primary focus:ring-0',
          className,
        )}
        {...props}
      />
    )
  }

  return <input type={type} className={className} {...props} />
}
