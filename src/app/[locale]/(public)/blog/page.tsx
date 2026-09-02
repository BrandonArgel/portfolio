import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Section, SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/section'
import { BlogCard } from '@/features/blog/components/blog-card'
import { BlogFilter } from '@/features/blog/components/blog-filter'
import { constructPageMetadata } from '@/lib/seo'
import { getAllCategories, getPublishedPosts } from '@/services/posts.service'

interface BlogPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.blog' })

  return constructPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    pathname: '/blog',
  })
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const t = await getTranslations('blog')
  const resolvedParams = await searchParams

  const categorySlug =
    typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined
  const searchQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined

  const [[postsErr, postsData], [categoriesErr, categoriesData]] = await Promise.all([
    getPublishedPosts(categorySlug, searchQuery),
    getAllCategories(),
  ])

  const posts = postsErr ? [] : postsData
  const categories = categoriesErr ? [] : categoriesData

  return (
    <Section withGlow>
      <SectionHeader align="left" className="mb-12">
        <SectionTitle as="h1">{t('title')}</SectionTitle>
        <SectionDescription>{t('subtitle')}</SectionDescription>
      </SectionHeader>

      <BlogFilter categories={categories} />

      {postsErr ? (
        <div className="py-20 text-center text-muted-foreground">{t('error_loading_posts')}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.length > 0 ? (
            posts.map((post) => <BlogCard key={post.id} post={post} />)
          ) : (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              {t('no_results')}
            </div>
          )}
        </div>
      )}
    </Section>
  )
}
