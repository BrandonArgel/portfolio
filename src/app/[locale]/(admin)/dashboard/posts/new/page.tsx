import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { BlogComposer } from '@/features/blog/components/blog-composer'
import { getAllCategoriesAdmin } from '@/features/blog/services/posts-service'
import { auth } from '@/lib/auth/auth'

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
  const [session, [, categories]] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getAllCategoriesAdmin(),
  ])
  const categoriesArray = categories?.map((c) => c.name) ?? []

  return <BlogComposer existingCategories={categoriesArray} currentUserName={session?.user?.name} />
}
