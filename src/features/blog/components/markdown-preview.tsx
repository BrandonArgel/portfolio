'use client'

import matter from 'gray-matter'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { MarkdownContent } from './markdown-content'

interface MarkdownPreviewProps {
  rawContent: string
}

/**
 * Admin editor live preview panel.
 *
 * It parses the raw Markdown (including YAML frontmatter) written inside the
 * Monaco editor, displays the frontmatter as a JSON inspector, and then
 * renders the body through <MarkdownContent> — the same component used on the
 * public blog post page — so the preview is pixel-perfect.
 */
export function MarkdownPreview({ rawContent }: MarkdownPreviewProps) {
  const t = useTranslations('features.blog.editor')

  // Parse frontmatter in real-time; fall back gracefully on invalid YAML.
  const { data: frontmatter, content } = useMemo(() => {
    try {
      return matter(rawContent)
    } catch {
      return { data: {}, content: rawContent }
    }
  }, [rawContent])

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto bg-background p-6 sm:p-8">
      {/* Frontmatter inspector */}
      {Object.keys(frontmatter).length > 0 && (
        <div className="rounded-xl border border-border/80 bg-muted/40 p-4 text-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('frontmatter_detected')}
          </h3>
          <pre className="overflow-x-auto font-mono text-xs text-foreground/85">
            {JSON.stringify(frontmatter, null, 2)}
          </pre>
        </div>
      )}

      {/* Markdown preview — identical to the public page */}
      {content.trim() ? (
        <MarkdownContent content={content} />
      ) : (
        <div className="py-12 text-center text-sm italic text-muted-foreground">
          {t('preview_empty')}
        </div>
      )}
    </div>
  )
}
