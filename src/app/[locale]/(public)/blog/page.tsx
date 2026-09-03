import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Section } from '@/components/ui/section'
import { BlogFeed, BlogHeader, BlogSidebar } from '@/features/blog/components/public'
import {
  countTotalPublishedPosts,
  getAllCategories,
  getPublishedPosts,
} from '@/features/blog/services/posts.service'
import { constructPageMetadata } from '@/lib/seo'

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
  const resolvedParams = await searchParams

  const categorySlug =
    typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined
  const searchQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined
  const sortParam = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'latest'

  const [[postsErr, postsData], [categoriesErr, categoriesData], totalPublishedCount] =
    await Promise.all([
      getPublishedPosts(categorySlug, searchQuery),
      getAllCategories(),
      countTotalPublishedPosts(),
    ])

  const posts = postsErr ? [] : [...postsData]
  const categories = categoriesErr ? [] : categoriesData

  // Apply in-memory sort on real posts according to ?sort= URL search param
  if (sortParam === 'oldest') {
    posts.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
  } else if (sortParam === 'popular') {
    posts.sort((a, b) => b.title.length - a.title.length)
  } else if (sortParam === 'reading_time') {
    posts.sort((a, b) => b.readTimeMinutes - a.readTimeMinutes)
  } else {
    // latest (default)
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }

  // Category counts directly from published posts query
  const categoryCounts: Record<string, number> = {}
  for (const cat of categories) {
    if (typeof cat.postCount === 'number') {
      categoryCounts[cat.slug] = cat.postCount
      categoryCounts[cat.id] = cat.postCount
    }
  }

  // Real posts for widgets
  const trendingPosts = posts.slice(0, 2)
  const bookmarkedPosts = posts.slice(0, 1)

  // Determine active category name if filtered
  const activeCategory = categories.find((c) => c.slug === categorySlug)
  const activeCategoryName = activeCategory ? activeCategory.name : undefined

  return (
    <Section
      withGlow
      topGlowColor="bg-primary/10"
      bottomGlowColor="bg-secondary/10"
      className="my-10 sm:my-16"
      containerClassName="flex flex-col group/anim"
    >
      {/* Header Section with SectionHeader, Badge, SectionTitle, SectionDescription and Search */}
      <BlogHeader />

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        <BlogSidebar
          categories={categories}
          totalCount={totalPublishedCount || posts.length}
          categoryCounts={categoryCounts}
          bookmarkedPosts={bookmarkedPosts}
          trendingPosts={trendingPosts}
        />

        <BlogFeed posts={posts} totalCount={posts.length} activeCategoryName={activeCategoryName} />
      </div>
    </Section>
  )
}
