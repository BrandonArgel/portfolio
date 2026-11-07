import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { siteConfig } from '@/config/site'
import { getPublishedPostBySlug } from '@/features/blog/services/posts-service'
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, truncateText } from '@/features/blog/utils/post-seo'
import { LOCALES, type Locale, routing } from '@/i18n/routing'

export const runtime = 'nodejs'

const MAX_TITLE_LENGTH = 120
const MAX_CATEGORIES = 3
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'

function resolveLocale(value: string | null): Locale {
  return (LOCALES as readonly string[]).includes(value ?? '')
    ? (value as Locale)
    : routing.defaultLocale
}

/** Scales the headline so long titles still fit inside the card. */
function getTitleFontSize(title: string): number {
  if (title.length > 90) return 52
  if (title.length > 60) return 60
  return 72
}

/**
 * Dynamic fallback social card for posts without a cover image.
 * Only reads data from the database (never from arbitrary query params) so it cannot be abused
 * to render spoofed cards, and it only serves published posts.
 *
 * GET /api/og?slug=<post-slug>&locale=<en|es|fr>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const slug = searchParams.get('slug')
  const locale = resolveLocale(searchParams.get('locale'))

  if (!slug) {
    return new Response('Missing "slug" query parameter', { status: 400 })
  }

  const [err, post] = await getPublishedPostBySlug(slug, locale)

  if (err || !post) {
    return new Response('Post not found', {
      status: err?.reason === 'DATABASE_ERROR' ? 500 : 404,
    })
  }

  const t = await getTranslations({ locale: post.locale, namespace: 'features.blog.og' })

  const title = truncateText(post.title, MAX_TITLE_LENGTH)
  const authorName = post.authorName || siteConfig.author.name
  const categoryNames = post.categories.slice(0, MAX_CATEGORIES).map((category) => category.name)
  const formattedDate = new Intl.DateTimeFormat(post.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(post.createdAt)
  const readTime = t('min_read', { minutes: post.readTimeMinutes })
  const domain = new URL(siteConfig.url).host

  return new ImageResponse(
    <div
      tw="flex flex-col w-full h-full justify-between p-16 bg-slate-950 text-white"
      style={{
        backgroundImage:
          'radial-gradient(circle at 20% 15%, rgba(59, 130, 246, 0.22), transparent 45%), radial-gradient(circle at 85% 85%, rgba(99, 102, 241, 0.20), transparent 45%)',
      }}
    >
      <div tw="flex items-center justify-between w-full">
        <div tw="flex items-center">
          <div tw="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-2xl mr-4">
            BA
          </div>
          <div tw="flex flex-col">
            <span tw="text-2xl font-bold text-slate-100">{siteConfig.name}</span>
            <span tw="text-base text-blue-400">{t('tagline')}</span>
          </div>
        </div>
        <div tw="flex items-center px-5 py-2 rounded-full border border-slate-700 bg-slate-900 text-lg text-slate-300">
          {domain}
        </div>
      </div>

      <div tw="flex flex-col w-full">
        {categoryNames.length > 0 && (
          <div tw="flex items-center mb-6">
            {categoryNames.map((name) => (
              <span
                key={name}
                tw="text-xl font-semibold text-blue-300 bg-blue-950 border border-blue-800 px-4 py-2 rounded-lg mr-3"
              >
                {`#${name}`}
              </span>
            ))}
          </div>
        )}
        <div
          tw="font-extrabold text-white"
          style={{ fontSize: getTitleFontSize(title), lineHeight: 1.15 }}
        >
          {title}
        </div>
      </div>

      <div tw="flex items-center justify-between w-full pt-6 border-t border-slate-800">
        <div tw="flex items-center text-xl text-slate-400">
          <span>{t('written_by')}</span>
          <span tw="font-semibold text-slate-100 ml-2">{authorName}</span>
        </div>
        <div tw="flex items-center text-xl text-slate-400">
          <span>{formattedDate}</span>
          <span tw="mx-3 text-slate-600">•</span>
          <span>{readTime}</span>
        </div>
      </div>
    </div>,
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      headers: { 'Cache-Control': CACHE_CONTROL },
    },
  )
}
