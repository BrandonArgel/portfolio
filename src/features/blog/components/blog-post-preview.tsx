'use client'

import { Eye } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { compileMDX } from 'next-mdx-remote/rsc'
import { type ReactElement, useEffect, useMemo, useState } from 'react'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkUnwrapImages from 'remark-unwrap-images'

import { Spinner } from '@/components/ui/spinner'
import { useMounted } from '@/hooks/use-mounted'
import { normalizeCategorySlug } from '../schemas/category-schema'
import type { BlogFrontmatter } from '../schemas/post-schema'
import type { BlogCategory } from '../types'
import { calculateReadTime } from '../utils/calculate-read-time'
import { preprocessMdxContent } from '../utils/preprocess-mdx'
import { rehypeCodeMeta } from '../utils/rehype-code-meta'
import { ArticlePostHeader } from './article-post-header'
import { mdxComponents } from './mdx'

export interface BlogPostPreviewProps {
  frontmatter: BlogFrontmatter
  content: string
  authorName: string
  authorImage?: string | null
  authorEmailVerified?: boolean
  viewsCount?: number
  updatedAt?: Date | number | string | null
}

export function BlogPostPreview({
  frontmatter,
  content,
  authorName,
  authorImage,
  authorEmailVerified = false,
  viewsCount = 0,
  updatedAt,
}: BlogPostPreviewProps) {
  const tReader = useTranslations('features.blog.reader')
  const tBlog = useTranslations('features.blog')
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
          rehypePlugins: [rehypeCodeMeta, rehypeKatex],
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
  const previewCategories: BlogCategory[] = frontmatter.categories.map((name) => {
    const slug = normalizeCategorySlug(name) || name
    return { id: slug, name, slug }
  })

  return (
    <div className="flex-1 min-h-0 h-full w-full overflow-y-auto rounded-lg">
      <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10">
        <article className="w-full">
          <ArticlePostHeader
            title={displayTitle}
            categories={previewCategories}
            interactiveCategories={false}
            authorName={authorName}
            authorImage={authorImage}
            authorEmailVerified={authorEmailVerified}
            authorSubtitle={tBlog('author_subtitle')}
            verifiedAuthorLabel={tBlog('verified_author')}
            formattedDate={formattedDate}
            dateTimeIso={parsedDate.toISOString()}
            readTimeMinutes={readTimeMinutes}
            readTimeSuffix={tReader('read_time_suffix')}
            viewsCount={viewsCount}
            viewsCountLabel={tReader('views_count', {
              count: viewsCount,
              formattedCount: format.number(viewsCount),
            })}
            coverImage={frontmatter.coverImage}
            coverImageAlt={frontmatter.coverImageAlt}
          />

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
