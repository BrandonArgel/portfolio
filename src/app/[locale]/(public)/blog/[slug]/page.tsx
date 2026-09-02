import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Section } from '@/components/ui/section'
import { BlogPostContent } from '@/features/blog/components/blog-post-content'
import { getPublishedPostBySlug } from '@/services/posts.service'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })

  const [err, post] = await getPublishedPostBySlug(slug)

  if (err || !post) {
    return { title: `${t('post_not_found')} | Brandon Argel` }
  }

  return {
    title: `${post.title} | Brandon Argel`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      authors: [post.authorName || 'Brandon Argel'],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const t = await getTranslations('blog')

  const [err, post] = await getPublishedPostBySlug(slug)

  if (err) {
    if (err.reason === 'NOT_FOUND') {
      return notFound()
    }

    return (
      <Section withGlow containerClassName="max-w-4xl py-20 text-center">
        <h1 className="text-2xl font-bold text-destructive">{t('error_loading_article')}</h1>
        <p className="mt-2 text-muted-foreground">{t('error_loading_article_description')}</p>
      </Section>
    )
  }

  return (
    <Section withGlow containerClassName="max-w-4xl">
      <BlogPostContent post={post} />
    </Section>
  )
}
