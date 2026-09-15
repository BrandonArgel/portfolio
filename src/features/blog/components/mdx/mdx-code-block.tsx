import React from 'react'

import { cn } from '@/lib/utils'
import { MdxCopyButton } from './mdx-copy-button'

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('')
  }
  if (
    React.isValidElement(node) &&
    node.props &&
    typeof node.props === 'object' &&
    'children' in node.props
  ) {
    return extractText((node.props as { children?: React.ReactNode }).children)
  }
  return ''
}

export function MdxPre({ children, className, ...props }: React.ComponentPropsWithoutRef<'pre'>) {
  const codeString = extractText(children).replace(/\n$/, '')
  const language =
    ((props as Record<string, unknown>)['data-language'] as string | undefined) ||
    className?.match(/language-([\w-]+)/)?.[1]

  return (
    <div className="not-prose group relative my-6 overflow-hidden rounded-xl border border-code-border bg-code-bg shadow-xs">
      <div className="flex items-center justify-between border-b border-code-border bg-code-header px-4 py-2 font-mono text-xs text-muted-foreground">
        <span className="select-none font-medium">{language || 'code'}</span>
        <MdxCopyButton code={codeString} />
      </div>
      <pre
        className={cn(
          'overflow-x-auto p-4 font-mono text-sm leading-relaxed focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}

export function MdxCode({ children, className, ...props }: React.ComponentPropsWithoutRef<'code'>) {
  const isBlock = 'data-theme' in props || 'data-language' in props

  if (!isBlock) {
    return (
      <code
        className={cn(
          'relative rounded-md border border-border/40 bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground/90',
          className,
        )}
        {...props}
      >
        {children}
      </code>
    )
  }

  return (
    <code className={cn('font-mono text-sm', className)} {...props}>
      {children}
    </code>
  )
}
