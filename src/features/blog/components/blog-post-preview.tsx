'use client'

import { Calendar, Clock, Eye, User } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { compileMDX } from 'next-mdx-remote/rsc'
import { type ReactElement, useEffect, useMemo, useState } from 'react'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkUnwrapImages from 'remark-unwrap-images'

import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { useMounted } from '@/hooks/use-mounted'
import type { BlogFrontmatter } from '../schemas/post.schema'
import { calculateReadTime } from '../utils/calculate-read-time'
import { preprocessMdxContent } from '../utils/preprocess-mdx'
import { mdxComponents } from './mdx'

export interface BlogPostPreviewProps {
  frontmatter: BlogFrontmatter
  content: string
  authorName: string
  updatedAt?: Date | number | string | null
}

export function BlogPostPreview({
  frontmatter,
  content,
  authorName,
  updatedAt,
}: BlogPostPreviewProps) {
  const tReader = useTranslations('features.blog.reader')
  const tComposer = useTranslations('features.blog.composer')
  const format = useFormatter()
  const isMounted = useMounted()

  const [compiledBody, setCompiledBody] = useState<ReactElement | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [compileError, setCompileError] = useState<string | null>(null)

  const readTimeMinutes = useMemo(() => calculateReadTime(content), [content])

  const parsedDate = useMemo(() => {
    if (!updatedAt) return new Date()
    const candidate = updatedAt instanceof Date ? updatedAt : new Date(updatedAt)
    return Number.isNaN(candidate.getTime()) ? new Date() : candidate
  }, [updatedAt])

  const formattedDate = isMounted ? format.dateTime(parsedDate, 'short') : ''

  useEffect(() => {
    const trimmed = content.trim()
    if (!trimmed) {
      setCompiledBody(null)
      setCompileError(null)
      setIsCompiling(false)
      return
    }

    let cancelled = false
    setIsCompiling(true)

    const safeContent = preprocessMdxContent(content)

    compileMDX({
      source: safeContent,
      components: mdxComponents,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkUnwrapImages, remarkMath],
          rehypePlugins: [rehypeKatex],
        },
      },
    })
      .then(({ content: mdxElement }) => {
        if (cancelled) return
        setCompiledBody(mdxElement)
        setCompileError(null)
        setIsCompiling(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setCompileError(err instanceof Error ? err.message : String(err))
        setIsCompiling(false)
      })

    return () => {
      cancelled = true
    }
  }, [content])

  const displayTitle = frontmatter.title.trim() || tComposer('header.untitled_post')

  return (
    <div className="h-full w-full overflow-y-auto rounded-lg border border-border bg-secondary-background shadow-sm">
      <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10">
        <article className="w-full">
          <header className="mb-10 flex flex-col items-start gap-6 border-b border-border pb-10">
            {frontmatter.categories && frontmatter.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {frontmatter.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {displayTitle}
            </h1>

            {frontmatter.description.trim() && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {frontmatter.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {authorName && (
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  <span>{authorName}</span>
                </div>
              )}
              {formattedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <time dateTime={parsedDate.toISOString()}>{formattedDate}</time>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                <span>
                  {readTimeMinutes} {tReader('read_time_suffix')}
                </span>
              </div>
            </div>

            {frontmatter.coverImage && (
              <div className="relative aspect-video sm:aspect-21/9 w-full overflow-hidden rounded-2xl border border-border shadow-md mt-2">
                {/* biome-ignore lint/performance/noImgElement: Live preview supports arbitrary uploaded/external URLs */}
                <img
                  src={frontmatter.coverImage}
                  alt={displayTitle}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </header>

          {!content.trim() ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/20 py-16 px-6 text-center text-muted-foreground">
              <Eye className="size-8 opacity-40" />
              <p className="text-sm max-w-md">{tComposer('header.preview_empty')}</p>
            </div>
          ) : isCompiling && !compiledBody ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="size-6 text-muted-foreground" />
            </div>
          ) : compileError && !compiledBody ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <pre className="whitespace-pre-wrap font-mono text-xs">{compileError}</pre>
            </div>
          ) : (
            <div className="typeset typeset-docs prose prose-neutral dark:prose-invert max-w-none w-full pb-20">
              {compiledBody}
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
