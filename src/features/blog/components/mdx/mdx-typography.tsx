import React from 'react'

import { cn } from '@/lib/utils'
import { MdxCallout } from './mdx-callout'

export function MdxH1({ className, ...props }: React.ComponentPropsWithoutRef<'h1'>) {
  return (
    <h1
      className={cn(
        'mt-10 mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function MdxH2({ className, ...props }: React.ComponentPropsWithoutRef<'h2'>) {
  return (
    <h2
      className={cn(
        'mt-10 mb-4 scroll-m-20 border-b border-border/50 pb-2 text-3xl font-bold tracking-tight text-foreground first:mt-0 transition-colors',
        className,
      )}
      {...props}
    />
  )
}

export function MdxH3({ className, ...props }: React.ComponentPropsWithoutRef<'h3'>) {
  return (
    <h3
      className={cn(
        'mt-8 mb-4 scroll-m-20 text-2xl font-semibold tracking-tight text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function MdxH4({ className, ...props }: React.ComponentPropsWithoutRef<'h4'>) {
  return (
    <h4
      className={cn(
        'mt-6 mb-3 scroll-m-20 text-xl font-semibold tracking-tight text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function MdxH5({ className, ...props }: React.ComponentPropsWithoutRef<'h5'>) {
  return (
    <h5
      className={cn(
        'mt-6 mb-2 scroll-m-20 text-lg font-semibold tracking-tight text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function MdxH6({ className, ...props }: React.ComponentPropsWithoutRef<'h6'>) {
  return (
    <h6
      className={cn(
        'mt-6 mb-2 scroll-m-20 text-base font-semibold tracking-tight text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function MdxP({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      className={cn(
        'leading-7 not-first:mt-6 text-foreground/90 dark:text-foreground/80',
        className,
      )}
      {...props}
    />
  )
}

export function MdxA({ href, className, children, ...props }: React.ComponentPropsWithoutRef<'a'>) {
  const isExternal = href?.startsWith('http://') || href?.startsWith('https://')

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={cn(
        'font-medium text-primary underline underline-offset-4 decoration-primary/40 transition-colors hover:decoration-primary',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  )
}

export function MdxHr({ className, ...props }: React.ComponentPropsWithoutRef<'hr'>) {
  return <hr className={cn('my-8 border-border/60', className)} {...props} />
}

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

function stripCalloutMarker(node: React.ReactNode): React.ReactNode {
  let stripped = false

  function clean(child: React.ReactNode): React.ReactNode {
    if (stripped) return child
    if (typeof child === 'string') {
      const match = child.match(/^\s*\[!([a-zA-Z]+)\][^\n]*(?:\n)?/)
      if (match) {
        stripped = true
        const remaining = child.slice(match[0].length)
        return remaining.length > 0 ? remaining : null
      }
      return child
    }
    if (Array.isArray(child)) {
      return React.Children.map(child, clean)
    }
    if (
      React.isValidElement(child) &&
      child.props &&
      typeof child.props === 'object' &&
      'children' in child.props
    ) {
      const cleanedChildren = clean((child.props as { children?: React.ReactNode }).children)
      if (
        cleanedChildren === null ||
        (Array.isArray(cleanedChildren) && cleanedChildren.length === 0)
      ) {
        return null
      }
      return React.cloneElement(child, child.props, cleanedChildren)
    }
    return child
  }

  return clean(node)
}

const CALLOUT_HEADER_REGEX = /^\s*\[!([a-zA-Z]+)\](?:\s*(.*))?/

export function MdxBlockquote({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'blockquote'>) {
  const textContent = extractText(children).trim()
  const match = textContent.match(CALLOUT_HEADER_REGEX)

  if (match) {
    const rawType = match[1].toLowerCase()
    const rawTitle = match[2]?.trim() || undefined
    const cleanedChildren = stripCalloutMarker(children)

    return (
      <MdxCallout type={rawType} title={rawTitle}>
        {cleanedChildren}
      </MdxCallout>
    )
  }

  return (
    <blockquote
      className={cn(
        'my-6 border-l-2 border-border pl-6 italic text-muted-foreground [&>p]:leading-relaxed',
        className,
      )}
      {...props}
    >
      {children}
    </blockquote>
  )
}
