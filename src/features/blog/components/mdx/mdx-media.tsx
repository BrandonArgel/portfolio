import Image from 'next/image'
import type React from 'react'

import { cn } from '@/lib/utils'

export function MdxImage({
  src,
  alt,
  width,
  height,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'img'>) {
  if (typeof src !== 'string' || !src) return null

  const isExternal = src.startsWith('http://') || src.startsWith('https://')

  return (
    <figure className="my-8 overflow-hidden rounded-xl border border-border bg-muted/20 shadow-xs">
      <div className="relative flex w-full justify-center overflow-hidden">
        <Image
          src={src}
          alt={alt || 'Blog image'}
          width={Number(width) || 1200}
          height={Number(height) || 675}
          className={cn(
            'h-auto w-full object-cover transition-transform duration-500 hover:scale-[1.01]',
            className,
          )}
          unoptimized={isExternal}
          {...props}
        />
      </div>
      {alt && (
        <figcaption className="border-t border-border/40 bg-muted/40 px-4 py-2 text-center text-xs text-muted-foreground">
          {alt}
        </figcaption>
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
    <div className="not-prose my-6 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted/20 shadow-xs">
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
    <div className="not-prose my-6 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted/20 shadow-xs">
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
