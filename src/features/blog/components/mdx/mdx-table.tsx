import type React from 'react'

import { cn } from '@/lib/utils'

/** Renders a responsive MDX table wrapper. */
export function MdxTable({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="not-prose my-6 w-full overflow-x-auto rounded-xl border border-border shadow-xs">
      <table className={cn('w-full border-collapse text-left text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

/** Renders an MDX table header section. */
export function MdxThead({ className, ...props }: React.ComponentPropsWithoutRef<'thead'>) {
  return (
    <thead className={cn('border-b border-border bg-muted/50 font-medium', className)} {...props} />
  )
}

/** Renders an MDX table body section. */
export function MdxTbody({ className, ...props }: React.ComponentPropsWithoutRef<'tbody'>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

/** Renders a styled MDX table row. */
export function MdxTr({ className, ...props }: React.ComponentPropsWithoutRef<'tr'>) {
  return (
    <tr
      className={cn(
        'border-b border-border/60 transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted',
        className,
      )}
      {...props}
    />
  )
}

/** Renders a styled MDX table header cell. */
export function MdxTh({ className, ...props }: React.ComponentPropsWithoutRef<'th'>) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left font-semibold tracking-tight text-foreground [&[align=center]]:text-center [&[align=right]]:text-right',
        className,
      )}
      {...props}
    />
  )
}

/** Renders a styled MDX table data cell. */
export function MdxTd({ className, ...props }: React.ComponentPropsWithoutRef<'td'>) {
  return (
    <td
      className={cn(
        'px-4 py-3 align-middle text-muted-foreground [&[align=center]]:text-center [&[align=right]]:text-right',
        className,
      )}
      {...props}
    />
  )
}
