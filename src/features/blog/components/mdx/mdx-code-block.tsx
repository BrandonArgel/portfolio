import React from 'react'

import { highlighter } from '@/lib/highlighter'
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

function extractLanguageFromNode(node: React.ReactNode): string | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = extractLanguageFromNode(child)
      if (found) return found
    }
    return undefined
  }

  if (React.isValidElement(node) && node.props && typeof node.props === 'object') {
    const props = node.props as {
      className?: string
      'data-language'?: string
      children?: React.ReactNode
    }

    if (typeof props['data-language'] === 'string' && props['data-language']) {
      return props['data-language']
    }

    const match = props.className?.match(/language-([\w+#-]+)/)
    if (match?.[1]) {
      return match[1]
    }

    if (props.children) {
      return extractLanguageFromNode(props.children)
    }
  }

  return undefined
}

export function MdxPre({
  children,
  className,
}: React.ComponentPropsWithoutRef<'pre'> & Record<string, unknown>) {
  const codeString = extractText(children).replace(/\n$/, '')
  const rawLanguage =
    className?.match(/language-([\w+#-]+)/)?.[1] || extractLanguageFromNode(children)

  const { html, lang } = highlighter.highlight(codeString, {
    lang: rawLanguage,
    lineNumbers: true,
  })

  const displayLanguage = rawLanguage || (lang !== 'plaintext' ? lang : 'text')

  return (
    <div className="not-prose group relative my-6 overflow-hidden rounded-xl border border-code-border bg-code-bg shadow-xs">
      <div className="flex items-center justify-between border-b border-code-border bg-code-header px-4 py-2 font-mono text-xs text-muted-foreground">
        <span className="select-none font-medium">{displayLanguage}</span>
        <MdxCopyButton code={codeString} />
      </div>
      <div
        className="th-code-container"
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
