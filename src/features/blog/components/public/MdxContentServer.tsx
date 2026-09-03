import { MDXRemote } from 'next-mdx-remote/rsc'
import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Alert, CALLOUT_ICONS, CALLOUT_STYLES, YoutubeEmbed } from '../shared/mdx-ui'
import { CodeCopyButton } from './CodeCopyButton'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (!node) return ''
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    return extractText(el.props.children)
  }
  return ''
}

// ---------------------------------------------------------------------------
// SyntaxHighlighter style overrides
// ---------------------------------------------------------------------------

const highlighterStyle: Record<string, React.CSSProperties> = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...((oneDark as Record<string, React.CSSProperties>)['pre[class*="language-"]'] ?? {}),
    background: 'transparent',
    margin: 0,
    padding: 0,
    fontSize: '0.875rem',
    lineHeight: '1.7',
  },
  'code[class*="language-"]': {
    ...((oneDark as Record<string, React.CSSProperties>)['code[class*="language-"]'] ?? {}),
    background: 'transparent',
    fontSize: '0.875rem',
    lineHeight: '1.7',
  },
}

// ---------------------------------------------------------------------------
// MDX Components Map
// ---------------------------------------------------------------------------

const mdxComponents = {
  // Custom interactive/demo components
  YoutubeEmbed,
  Alert,

  // ── Code blocks (fenced) ───────────────────────────────────────────────
  pre({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) {
    // In MDX, a fenced code block renders as <pre><code className="language-xyz">...</code></pre>
    if (React.isValidElement(children)) {
      const codeProps = children.props as {
        className?: string
        children?: React.ReactNode
      }
      const match = /language-([\w-]+)/.exec(codeProps.className || '')
      const language = match?.[1] ?? ''
      const codeString = extractText(codeProps.children).replace(/\n$/, '')

      return (
        <div className="not-typeset my-5 overflow-hidden rounded-xl border border-zinc-800 bg-[#282c34] shadow-md">
          {/* Header bar: language label + copy button */}
          <div className="flex items-center justify-between border-b border-zinc-700/60 bg-zinc-800/60 px-4 py-2">
            <span className="select-none font-mono text-[11px] tracking-wide text-zinc-400">
              {language || 'text'}
            </span>
            <CodeCopyButton code={codeString} />
          </div>

          {/* Highlighted code */}
          <div className="overflow-x-auto p-4" suppressHydrationWarning>
            <SyntaxHighlighter
              language={language || 'text'}
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
          </div>
        </div>
      )
    }

    return <pre {...props}>{children}</pre>
  },

  // ── Inline code ────────────────────────────────────────────────────────
  code({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) {
    return (
      <code className={cn('font-mono', className)} {...props}>
        {children}
      </code>
    )
  },

  // ── Blockquote / Obsidian-style Callouts ───────────────────────────────
  blockquote({ children }: React.ComponentPropsWithoutRef<'blockquote'>) {
    const text = extractText(children).trim()
    // Capture the type (group 1) and the optional custom title on the same line (group 2)
    const calloutMatch = /^\[!([\w-]+)\]([^\n]*)/.exec(text)

    if (calloutMatch) {
      const type = calloutMatch[1].toLowerCase()
      const customTitle = calloutMatch[2].trim()
      const title = customTitle || type // Fallback to the type if no custom title is provided
      const cleanText = text.slice(calloutMatch[0].length).trim()
      const styleClass =
        CALLOUT_STYLES[type] ?? 'border-blue-500 bg-blue-500/10 text-blue-950 dark:text-blue-200'
      const icon = CALLOUT_ICONS[type] ?? 'ℹ️'

      return (
        <div className={cn('not-typeset my-5 flex gap-3 rounded-r-xl border-l-4 p-4', styleClass)}>
          <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden>
            {icon}
          </span>
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest opacity-80">
              {title}
            </p>
            <p className="m-0 text-sm leading-relaxed sm:text-base">{cleanText}</p>
          </div>
        </div>
      )
    }

    return <blockquote>{children}</blockquote>
  },
}

// ---------------------------------------------------------------------------
// Server Component
// ---------------------------------------------------------------------------

interface MdxContentServerProps {
  content: string
  className?: string
}

export function MdxContentServer({ content, className }: MdxContentServerProps) {
  return (
    <div className={cn('typeset typeset-docs w-full max-w-none break-words', className)}>
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
      />
    </div>
  )
}
