import type React from 'react'

import { cn } from '@/lib/utils'

export function MdxTable({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="not-prose not-typeset my-6 w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-left text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function MdxThead({ className, ...props }: React.ComponentPropsWithoutRef<'thead'>) {
  return <thead className={cn('bg-muted/50 font-semibold', className)} {...props} />
}

export function MdxTbody({ className, ...props }: React.ComponentPropsWithoutRef<'tbody'>) {
  return <tbody className={cn(className)} {...props} />
}

export function MdxTr({ className, ...props }: React.ComponentPropsWithoutRef<'tr'>) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted',
        className,
      )}
      {...props}
    />
  )
}

export function MdxTh({ className, ...props }: React.ComponentPropsWithoutRef<'th'>) {
  return (
    <th
      className={cn(
        'border border-border bg-muted/50 px-3 py-2 text-left font-semibold tracking-tight text-foreground [&[align=center]]:text-center [&[align=right]]:text-right',
        className,
      )}
      {...props}
    />
  )
}

export function MdxTd({ className, ...props }: React.ComponentPropsWithoutRef<'td'>) {
  return (
    <td
      className={cn(
        'border border-border px-3 py-2 align-top text-foreground/90 [&[align=center]]:text-center [&[align=right]]:text-right',
        className,
      )}
      {...props}
    />
  )
}
