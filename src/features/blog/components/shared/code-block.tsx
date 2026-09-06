'use client'

import { useTheme } from '@teispace/next-themes'
import React, { useEffect, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { CodeCopyButton } from '@/features/blog/components/public/CodeCopyButton'
import { extractText } from '@/features/blog/utils/extract-text'

export function CodeBlockWrapper({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!React.isValidElement(children)) {
    return <pre {...props}>{children}</pre>
  }

  const codeProps = children.props as { className?: string; children?: React.ReactNode }
  const match = /language-([\w-]+)/.exec(codeProps.className || '')
  const language = match?.[1] ?? 'text'
  const isBlock = Boolean(match)

  if (!isBlock) {
    return <pre {...props}>{children}</pre>
  }

  const codeString = extractText(codeProps.children).replace(/\n$/, '')
  const currentThemeStyle = resolvedTheme === 'dark' ? oneDark : oneLight

  const highlighterStyle: Record<string, React.CSSProperties> = {
    ...currentThemeStyle,
    'pre[class*="language-"]': {
      ...((currentThemeStyle as Record<string, React.CSSProperties>)['pre[class*="language-"]'] ??
        {}),
      background: 'transparent',
      margin: 0,
      padding: 0,
      fontSize: '0.875rem',
      lineHeight: '1.7',
    },
    'code[class*="language-"]': {
      ...((currentThemeStyle as Record<string, React.CSSProperties>)['code[class*="language-"]'] ??
        {}),
      background: 'transparent',
      fontSize: '0.875rem',
      lineHeight: '1.7',
    },
  }

  return (
    <div className="not-typeset my-5 overflow-hidden rounded-xl border border-code-border bg-code-bg shadow-md">
      <div className="flex items-center justify-between border-b border-code-border bg-code-header px-4 py-2">
        <span className="select-none font-mono text-[11px] tracking-wide text-muted-foreground">
          {language}
        </span>
        <CodeCopyButton code={codeString} />
      </div>

      <div className="overflow-x-auto p-4">
        {mounted ? (
          <SyntaxHighlighter
            language={language}
            style={highlighterStyle}
            customStyle={{
              background: 'transparent',
              margin: 0,
              padding: 0,
              overflowX: 'auto',
            }}
            codeTagProps={{
              style: { fontFamily: 'var(--font-mono, monospace)' },
            }}
            wrapLongLines={false}
          >
            {codeString}
          </SyntaxHighlighter>
        ) : (
          <pre className="m-0 bg-transparent p-0 text-[0.875rem] leading-[1.7] opacity-0">
            {codeString}
          </pre>
        )}
      </div>
    </div>
  )
}
