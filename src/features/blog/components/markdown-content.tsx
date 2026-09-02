'use client'

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Info,
  Lightbulb,
  Siren,
  StickyNote,
  XCircle,
} from 'lucide-react'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively extracts the raw text string from any React node tree.
 * This is necessary because react-markdown wraps blockquote children inside
 * nested <p> elements, so a direct `.join(' ')` on the top-level children
 * would yield "[object Object]" instead of the actual text content.
 */
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
// Copy-to-clipboard button
// ---------------------------------------------------------------------------

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available – fail silently
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy code'}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-mono transition-colors',
        copied
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-zinc-700/60 text-zinc-400 hover:bg-zinc-600/60 hover:text-zinc-200',
      )}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Callout theme maps
// ---------------------------------------------------------------------------

const CALLOUT_STYLES: Record<string, string> = {
  info: 'border-blue-500 bg-blue-500/10 text-blue-950 dark:text-blue-200',
  note: 'border-blue-500 bg-blue-500/10 text-blue-950 dark:text-blue-200',
  warning: 'border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200',
  danger: 'border-red-500 bg-red-500/10 text-red-950 dark:text-red-200',
  error: 'border-red-500 bg-red-500/10 text-red-950 dark:text-red-200',
  tip: 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200',
  success: 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200',
}

const CALLOUT_ICONS: Record<string, React.ReactNode> = {
  info: <Info className="size-5 text-blue-500" />,
  note: <StickyNote className="size-5 text-blue-500" />,
  warning: <AlertTriangle className="size-5 text-amber-500" />,
  danger: <Siren className="size-5 text-red-500" />,
  error: <XCircle className="size-5 text-red-500" />,
  tip: <Lightbulb className="size-5 text-emerald-500" />,
  success: <CheckCircle2 className="size-5 text-emerald-500" />,
}

// ---------------------------------------------------------------------------
// SyntaxHighlighter style overrides
// ---------------------------------------------------------------------------

// We extend oneDark with a few tweaks: transparent background so our own
// container controls the chrome, and consistent font sizing.
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
// MarkdownContent
// ---------------------------------------------------------------------------

interface MarkdownContentProps {
  /** The raw Markdown string to render (frontmatter already stripped). */
  content: string
  className?: string
}

/**
 * Shared Markdown renderer used by both the public blog post page and the
 * admin editor live preview. Keeping a single renderer guarantees that
 * "what you see in the editor is what readers see."
 *
 * Typography is provided by the project's shadcn `typeset` / `typeset-docs`
 * CSS layer. Syntax highlighting is powered by react-syntax-highlighter
 * (Prism) with the oneDark theme.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn('typeset typeset-docs w-full max-w-none break-words', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // ── Code block / inline code ──────────────────────────────────────
          code({
            node: _node,
            className: langClass,
            children,
            ...props
          }: React.ComponentPropsWithoutRef<'code'> & { node?: unknown }) {
            const match = /language-([\w-]+)/.exec(langClass || '')
            const language = match?.[1] ?? ''
            const isBlock = Boolean(match)

            if (isBlock) {
              const codeString = String(children).replace(/\n$/, '')

              return (
                // not-typeset prevents the typeset layer from re-styling
                // the <pre> and <code> inside the highlighter.
                <div className="not-typeset my-5 overflow-hidden rounded-xl border border-zinc-800 bg-[#282c34] shadow-md">
                  {/* ── Header bar: language label + copy button ── */}
                  <div className="flex items-center justify-between border-b border-zinc-700/60 bg-zinc-800/60 px-4 py-2">
                    <span className="select-none font-mono text-[11px] tracking-wide text-zinc-400">
                      {language}
                    </span>
                    <CopyButton code={codeString} />
                  </div>

                  {/* ── Highlighted code ── */}
                  <div className="overflow-x-auto p-4">
                    <SyntaxHighlighter
                      language={language}
                      style={highlighterStyle}
                      // Prevents the library from injecting its own <pre> wrapper
                      // styles that would clash with our container.
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

            // Inline code — let typeset.css handle the background colour.
            return (
              <code className={cn('font-mono', langClass)} {...props}>
                {children}
              </code>
            )
          },

          // ── Blockquote / Obsidian-style Callout ───────────────────────────
          blockquote({ children }) {
            // react-markdown nests blockquote content as: blockquote > p > text
            // We must recurse into the child tree to get the raw text string.
            const text = extractText(children).trim()
            const calloutMatch = /^\[!([\w-]+)\]/.exec(text)

            if (calloutMatch) {
              const type = calloutMatch[1].toLowerCase()
              const cleanText = text.slice(calloutMatch[0].length).trim()
              const styleClass =
                CALLOUT_STYLES[type] ??
                'border-blue-500 bg-blue-500/10 text-blue-950 dark:text-blue-200'
              const icon = CALLOUT_ICONS[type] ?? 'ℹ️'

              return (
                <div
                  className={cn(
                    'not-typeset my-5 flex gap-3 rounded-r-xl border-l-4 p-4',
                    styleClass,
                  )}
                >
                  <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden>
                    {icon}
                  </span>
                  <div className="min-w-0">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest opacity-80">
                      {type}
                    </p>
                    <p className="m-0 text-sm leading-relaxed sm:text-base">{cleanText}</p>
                  </div>
                </div>
              )
            }

            // Regular blockquote — let typeset handle the default styling.
            return <blockquote>{children}</blockquote>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
