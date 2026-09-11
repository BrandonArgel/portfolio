import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BlogComposer } from '@/features/blog/components/blog-composer'
import { getAllCategoriesAdmin } from '@/features/blog/services/posts.service'

interface NewPostPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: NewPostPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'features.blog.editor' })

  return {
    title: `${t('new_post')} | Brandon Argel`,
  }
}

export default async function NewPostPage() {
  const [, categories] = await getAllCategoriesAdmin()
  const categoriesArray = categories?.map((c) => c.name) ?? []

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <BlogComposer existingCategories={categoriesArray} />
    </div>
  )
}
