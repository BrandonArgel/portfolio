'use client'

import { useTheme } from '@teispace/next-themes'
import { Check, Copy } from 'lucide-react'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Alert, CALLOUT_ICONS, CALLOUT_STYLES, YoutubeEmbed } from './shared/mdx-ui'

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
          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
          : 'bg-zinc-300/60 text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900 dark:bg-zinc-700/60 dark:text-zinc-400 dark:hover:bg-zinc-600/60 dark:hover:text-zinc-200',
      )}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
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
 * (Prism) with oneDark / oneLight adapting to the active theme.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const { resolvedTheme } = useTheme()

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

  // Convert self-closing JSX tags (e.g., <YoutubeEmbed />) to HTML-compliant
  // closed tags (<YoutubeEmbed></YoutubeEmbed>). rehype-raw uses a standard
  // HTML5 parser that doesn't support JSX self-closing syntax for custom
  // elements — it treats them as unclosed and swallows subsequent content.
  const processedContent = content.replace(/<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)\/>/g, '<$1 $2></$1>')

  return (
    <div className={cn('typeset typeset-docs w-full max-w-none break-words', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={
          {
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
                  <div className="not-typeset my-5 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-md dark:border-zinc-800 dark:bg-[#282c34]">
                    {/* ── Header bar: language label + copy button ── */}
                    <div className="flex items-center justify-between border-b border-zinc-200/80 bg-zinc-200/60 px-4 py-2 dark:border-zinc-700/60 dark:bg-zinc-800/60">
                      <span className="select-none font-mono text-[11px] tracking-wide text-zinc-500 dark:text-zinc-400">
                        {language}
                      </span>
                      <CopyButton code={codeString} />
                    </div>

                    {/* ── Highlighted code ── */}
                    <div className="overflow-x-auto p-4" suppressHydrationWarning>
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
            blockquote({ children }: { children?: React.ReactNode }) {
              // react-markdown nests blockquote content as: blockquote > p > text
              // We must recurse into the child tree to get the raw text string.
              const text = extractText(children).trim()
              // Capture the type (group 1) and the optional custom title on the same line (group 2)
              const calloutMatch = /^\[!([\w-]+)\]([^\n]*)/.exec(text)

              if (calloutMatch) {
                const type = calloutMatch[1].toLowerCase()
                const customTitle = calloutMatch[2].trim()
                const title = customTitle || type // Fallback to the type if no custom title is provided
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
                        {title}
                      </p>
                      <p className="m-0 text-sm leading-relaxed sm:text-base">{cleanText}</p>
                    </div>
                  </div>
                )
              }

              // Regular blockquote — let typeset handle the default styling.
              return <blockquote>{children}</blockquote>
            },

            // ── Paragraph / unwrapping block custom components ───────────────
            p({ node, children, ...props }: any) {
              // Check if the paragraph contains our custom block-level elements
              const containsCustomBlock = node?.children?.some(
                (child: any) =>
                  child.type === 'element' && ['youtubeembed', 'alert'].includes(child.tagName),
              )

              // If it contains a block element, render as a fragment to avoid <p><div> hydration errors
              if (containsCustomBlock) {
                return <>{children}</>
              }

              // Otherwise, render a normal paragraph
              return <p {...props}>{children}</p>
            },

            // ── Custom MDX components (lowercased by HTML parser) ────────────
            // rehype-raw parses <YoutubeEmbed id="..." /> as <youtubeembed id="..." />
            youtubeembed: ({ node: _node, ...props }: any) => (
              <YoutubeEmbed id={props.id} title={props.title} />
            ),
            alert: ({ node: _node, children, ...props }: any) => (
              <Alert variant={props.variant} title={props.title}>
                {children}
              </Alert>
            ),
          } as any
        }
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
