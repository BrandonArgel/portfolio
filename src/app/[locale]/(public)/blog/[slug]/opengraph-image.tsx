import { ImageResponse } from 'next/og'
import { siteConfig } from '@/config/site'
import { getPublishedPostBySlug } from '@/features/blog/services/posts.service'

export const runtime = 'nodejs'

export const alt = 'Article OpenGraph Cover Image'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

interface ImageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params
  const [err, post] = await getPublishedPostBySlug(slug)

  const isFallback = Boolean(err || !post)
  const title = !isFallback && post ? post.title : 'Engineering Blog & Architecture'
  const authorName = !isFallback && post?.authorName ? post.authorName : siteConfig.author.name
  const tags = !isFallback && post?.tags?.length ? post.tags.slice(0, 3) : []

  return new ImageResponse(
    <div
      tw="flex flex-col w-full h-full justify-between p-16 bg-slate-950 text-white"
      style={{
        backgroundImage:
          'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.15), transparent 45%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.15), transparent 45%)',
      }}
    >
      {/* Top Header */}
      <div tw="flex items-center justify-between w-full">
        <div tw="flex items-center">
          <div tw="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl mr-4 shadow-lg">
            BA
          </div>
          <div tw="flex flex-col">
            <span tw="text-xl font-bold text-slate-100 tracking-tight">{siteConfig.name}</span>
            <span tw="text-sm text-blue-400 font-medium">Full Stack & Architecture</span>
          </div>
        </div>
        <div tw="flex items-center px-4 py-2 rounded-full border border-slate-800 bg-slate-900/80 text-sm text-slate-400">
          brandonargel.com
        </div>
      </div>

      {/* Main Title & Tags */}
      <div tw="flex flex-col my-auto max-w-4xl">
        {tags.length > 0 && (
          <div tw="flex items-center mb-6">
            {tags.map((tag) => (
              <span
                key={tag.id}
                tw="text-sm font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3.5 py-1.5 rounded-md mr-3"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
        <h1 tw="text-5xl font-extrabold tracking-tight text-white leading-tight">{title}</h1>
      </div>

      {/* Bottom Footer */}
      <div tw="flex items-center justify-between w-full pt-6 border-t border-slate-800/80">
        <div tw="flex items-center text-slate-400 text-base">
          <span>Written by</span>
          <span tw="font-semibold text-slate-200 ml-1.5">{authorName}</span>
        </div>
        <div tw="flex items-center text-blue-400 text-sm font-semibold">
          <span>Read on Brandon Argel Blog</span>
          <span tw="ml-2">→</span>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  )
}
