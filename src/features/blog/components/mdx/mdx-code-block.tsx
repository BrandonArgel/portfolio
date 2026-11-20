import { parseCodeDiffNotation } from '@tanstack/highlight/markdown'
import React from 'react'

import { LanguageIcon } from '@/components/shared/language-icon'
import { buildLineDecorations, parseCodeFenceMeta } from '@/lib/code-block-meta'
import { highlighter } from '@/lib/highlighter'
import { cn } from '@/lib/utils'
import { MdxCopyButton } from './mdx-copy-button'
import { extractText } from './mdx-utils'

interface CodeElementProps {
  className?: string
  'data-language'?: string
  'data-meta'?: string
  children?: React.ReactNode
}

function extractCodeElementProps(node: React.ReactNode): CodeElementProps | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = extractCodeElementProps(child)
      if (found) return found
    }
    return undefined
  }

  if (React.isValidElement(node) && node.props && typeof node.props === 'object') {
    const props = node.props as CodeElementProps

    if (
      typeof props['data-language'] === 'string' ||
      typeof props['data-meta'] === 'string' ||
      props.className?.match(/language-([\w+#-]+)/)
    ) {
      return props
    }

    if (props.children) {
      return extractCodeElementProps(props.children)
    }
  }

  return undefined
}

export function MdxPre({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'pre'> & Record<string, unknown>) {
  const rawCode = extractText(children).replace(/\n$/, '')
  const nestedCodeProps = extractCodeElementProps(children)

  const rawLanguage =
    className?.match(/language-([\w+#-]+)/)?.[1] ||
    nestedCodeProps?.['data-language'] ||
    nestedCodeProps?.className?.match(/language-([\w+#-]+)/)?.[1]

  const rawMeta =
    typeof props['data-meta'] === 'string'
      ? props['data-meta']
      : typeof nestedCodeProps?.['data-meta'] === 'string'
        ? nestedCodeProps['data-meta']
        : undefined

  const meta = parseCodeFenceMeta(rawMeta)
  const diffAnnotated = parseCodeDiffNotation(rawCode)
  const decorations = [...diffAnnotated.decorations, ...buildLineDecorations(meta)]

  const { html, lang } = highlighter.highlight(diffAnnotated.code, {
    lang: rawLanguage,
    lineNumbers: meta.lineNumbers,
    decorations,
  })

  const effectiveLanguage = rawLanguage || (lang !== 'plaintext' ? lang : '')
  const displayLanguage = effectiveLanguage || 'text'
  const headerTitle = meta.title || displayLanguage

  return (
    <div className="not-prose group relative my-6 overflow-hidden rounded-xl border border-code-border bg-code-bg shadow-xs">
      <div className="flex items-center justify-between gap-3 border-b border-code-border bg-code-header px-3.5 py-2 font-mono text-xs text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <LanguageIcon language={effectiveLanguage || 'text'} className="size-3.5 shrink-0" />
          <span className="truncate font-medium text-foreground/85">{headerTitle}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {meta.title && (
            <span className="hidden rounded border border-code-border bg-background/50 px-1.5 py-0.5 text-[11px] leading-none text-muted-foreground sm:inline-block">
              {displayLanguage}
            </span>
          )}
          <MdxCopyButton code={diffAnnotated.code} />
        </div>
      </div>
      <div
        className="th-code-container"
        style={
          meta.startLine > 1
            ? ({ '--th-start-line': meta.startLine } as React.CSSProperties)
            : undefined
        }
        // biome-ignore lint/security/noDangerouslySetInnerHtml: @tanstack/highlight escapes all source tokens and attribute values
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function MdxCode({ children, className, ...props }: React.ComponentPropsWithoutRef<'code'>) {
  const isBlock =
    'data-theme' in props ||
    'data-language' in props ||
    'data-meta' in props ||
    Boolean(className && /language-[\w+#-]+/.test(className))

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
