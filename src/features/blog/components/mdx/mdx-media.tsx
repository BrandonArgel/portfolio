import type React from 'react'

import { cn } from '@/lib/utils'

export function MdxImage({ src, alt, className, ...props }: React.ComponentPropsWithoutRef<'img'>) {
  if (typeof src !== 'string' || !src) return null

  return (
    <figure className="not-prose not-typeset my-8 flex flex-col items-center">
      {/* biome-ignore lint/performance/noImgElement: Markdown images have dynamic unknown aspect ratios */}
      <img
        src={src}
        alt={alt || 'Blog image'}
        loading="lazy"
        className={cn(
          'block h-auto w-auto max-w-full max-h-[600px] object-contain rounded-lg border border-border shadow-sm',
          className,
        )}
        {...props}
      />
      {alt && (
        <figcaption className="mt-2.5 text-center text-xs text-muted-foreground">{alt}</figcaption>
      )}
    </figure>
  )
}

export function MdxIframe({
  src,
  title = 'Embedded video',
  className,
  ...props
}: React.ComponentPropsWithoutRef<'iframe'>) {
  return (
    <div className="not-prose not-typeset my-6 mx-auto aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-muted/20 shadow-sm">
      <iframe
        src={src}
        title={title}
        className={cn('h-full w-full border-0', className)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        {...props}
      />
    </div>
  )
}

function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  )
  return match ? match[1] : url
}

export function MdxYouTube({
  id,
  url,
  title = 'YouTube video player',
}: {
  id?: string
  url?: string
  title?: string
}) {
  const videoId = id || (url ? extractYouTubeId(url) : '')
  if (!videoId) return null

  return (
    <div className="not-prose not-typeset my-6 mx-auto aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-muted/20 shadow-sm">
      <iframe
        className="h-full w-full border-0"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
